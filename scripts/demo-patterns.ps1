<#
Usage: Open PowerShell in repo root and run:
  .\scripts\demo-patterns.ps1
or with explicit BaseUrl:
  .\scripts\demo-patterns.ps1 -BaseUrl 'http://localhost:8080'
#>

param(
    [string]$BaseUrl = 'http://localhost:8080'
)

function Write-Title($text) {
    Write-Host "`n$text`n" -ForegroundColor Cyan
}

function Make-Request($method, $endpoint, $body, $token, $description) {
    Write-Host "`n[Test] $description"
    Write-Host "[Request] $method $BaseUrl$endpoint"

    $headers = @{}
    if ($token) { $headers['Authorization'] = "Bearer $token" }

    try {
        if ($body) {
            $jsonBody = $body | ConvertTo-Json -Depth 10
            $resp = Invoke-RestMethod -Method $method -Uri "$BaseUrl$endpoint" -Headers $headers -Body $jsonBody -ContentType 'application/json' -ErrorAction Stop -TimeoutSec 30
        } else {
            $resp = Invoke-RestMethod -Method $method -Uri "$BaseUrl$endpoint" -Headers $headers -ErrorAction Stop -TimeoutSec 30
        }
        $resp | ConvertTo-Json -Depth 5 | Write-Host
        Start-Sleep -Seconds 1
        return $resp
    } catch {
        Write-Host "Response received or error: $($_.Exception.Message)" -ForegroundColor Yellow
        Start-Sleep -Seconds 1
        return @{ __error = $_.Exception.Message }
    }
}

# Start
Write-Host "Probando patrones implementados en UT4-TF-andis2" -ForegroundColor Green
Write-Host "==================================================`n"

# 1. Health
Write-Title "1. HEALTH CHECK PATTERN (Disponibilidad - Ya implementado)"
Make-Request -method 'GET' -endpoint '/health' -body $null -token $null -description 'Health Check basico'

# 2. Gateway Offloading / Gatekeeper
Write-Title "2. GATEWAY OFFLOADING PATTERN (Seguridad - Recien implementado)"
Write-Host "2.1 Probando login con datos validos"
$aliceResp = $null
$bobResp = $null
try {
    $aliceResp = Invoke-RestMethod -Method POST -Uri "$BaseUrl/login" -Body (ConvertTo-Json @{ username='alice'; password='alicepass' }) -ContentType 'application/json' -ErrorAction Stop -TimeoutSec 30
} catch { $aliceResp = @{ __error = $_.Exception.Message } }
try {
    $bobResp = Invoke-RestMethod -Method POST -Uri "$BaseUrl/login" -Body (ConvertTo-Json @{ username='bob'; password='bobpass' }) -ContentType 'application/json' -ErrorAction Stop -TimeoutSec 30
} catch { $bobResp = @{ __error = $_.Exception.Message } }

$ALICE_TOKEN = $null
$BOB_TOKEN = $null
if ($aliceResp -is [hashtable] -and $aliceResp.__error) { Write-Host "Alice login error: $($aliceResp.__error)" -ForegroundColor Yellow } else { $ALICE_TOKEN = $aliceResp.token; if ($ALICE_TOKEN) { Write-Host "Alice token obtenido: $($ALICE_TOKEN.Substring(0,[Math]::Min(20,$ALICE_TOKEN.Length)))..." } }
if ($bobResp -is [hashtable] -and $bobResp.__error) { Write-Host "Bob login error: $($bobResp.__error)" -ForegroundColor Yellow } else { $BOB_TOKEN = $bobResp.token; if ($BOB_TOKEN) { Write-Host "Bob token obtenido: $($BOB_TOKEN.Substring(0,[Math]::Min(20,$BOB_TOKEN.Length)))..." } }

# 2.2 Rate limiting (3 invalid attempts)
Write-Title "2.2 Probando Rate Limiting en login (Gateway Offloading)"
for ($i=1; $i -le 3; $i++) {
    Write-Host "Intento $i de login invalido:"
    Make-Request -method 'POST' -endpoint '/login' -body @{ username='invalid'; password='wrong' } -token $null -description "Login invalido $i"
}

# 2.3 Authorization
Write-Title "2.3 Probando autorizacion mejorada"
Make-Request -method 'GET' -endpoint '/admin-only' -body $null -token $BOB_TOKEN -description 'Acceso admin con Bob (debe funcionar)'
Make-Request -method 'GET' -endpoint '/admin-only' -body $null -token $ALICE_TOKEN -description 'Acceso admin con Alice (debe fallar)'

# 2.4 Security stats
Write-Title "2.4 Estadisticas de seguridad (solo admins)"
Make-Request -method 'GET' -endpoint '/security/stats' -body $null -token $BOB_TOKEN -description 'Estadisticas de seguridad'

# 3. Cache-Aside
Write-Title "3. CACHE-ASIDE PATTERN (Rendimiento - Recien implementado)"
Write-Host "3.1 Primera consulta (cache miss)"
$p1 = Make-Request -method 'GET' -endpoint '/products' -body $null -token $ALICE_TOKEN -description 'Primera consulta de productos (cache miss)'
Write-Host "3.2 Segunda consulta (cache hit)"
$p2 = Make-Request -method 'GET' -endpoint '/products' -body $null -token $ALICE_TOKEN -description 'Segunda consulta de productos (cache hit)'

Write-Title "3.3 Estadisticas del cache"
Make-Request -method 'GET' -endpoint '/cache/stats' -body $null -token $BOB_TOKEN -description 'Estadisticas del cache'

Write-Host "3.4 Creando un producto (invalidara cache)"
$newProd = @{ name = 'Producto Test'; price = 150 }
Make-Request -method 'POST' -endpoint '/products' -body $newProd -token $BOB_TOKEN -description 'Crear producto (invalidara cache)'

Write-Host "3.5 Consulta despues de invalidacion (cache miss)"
Make-Request -method 'GET' -endpoint '/products' -body $null -token $ALICE_TOKEN -description 'Consulta despues de invalidar cache'

# 4. Circuit Breaker (info)
Write-Title "4. CIRCUIT BREAKER PATTERN (Disponibilidad - Ya implementado)"
Write-Host "(Este patron se activa automaticamente cuando los microservicios fallan)"
Write-Host "El fallback devuelve datos hardcodeados cuando el servicio no esta disponible"

# 5. Competing Consumers (info)
Write-Title "5. COMPETING CONSUMERS PATTERN (Rendimiento - Ya implementado)"
Write-Host "(Este patron esta implementado con clustering - 8 workers procesan requests)"
Write-Host "Múltiples workers compiten por procesar las requests entrantes"

# 6. Gatekeeper info
Write-Title "6. GATEKEEPER PATTERN (Seguridad - Ya implementado)"
Write-Host "(El API Gateway actua como gatekeeper centralizando autenticacion)"
Write-Host "Todas las requests pasan por autenticacion JWT antes de llegar a microservicios"


Write-Host "ENDPOINTS PARA PROBAR MANUALMENTE:`nHealth: GET $BaseUrl/health`nLogin: POST $BaseUrl/login (alice/alicepass o bob/bobpass)`nProducts: GET $BaseUrl/products (requiere token)`nCache Stats: GET $BaseUrl/cache/stats (requiere token admin)`nSecurity Stats: GET $BaseUrl/security/stats (requiere token admin)`nSecurity Logs: GET $BaseUrl/security/logs (requiere token admin)"
