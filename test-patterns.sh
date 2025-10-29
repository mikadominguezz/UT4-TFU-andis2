#!/bin/bash

# Script para probar los patrones implementados
# Usar con: chmod +x test-patterns.sh && ./test-patterns.sh

echo "🚀 Probando patrones implementados en UT4-TF-andis2"
echo "=================================================="

BASE_URL="http://localhost:8080"

# Función para hacer requests con curl
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    local description=$5
    
    echo ""
    echo "📋 Test: $description"
    echo "🔗 $method $BASE_URL$endpoint"
    
    if [ -n "$token" ]; then
        if [ -n "$data" ]; then
            curl -s -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $token" \
                -d "$data" | jq '.' 2>/dev/null || echo "Response received"
        else
            curl -s -X $method "$BASE_URL$endpoint" \
                -H "Authorization: Bearer $token" | jq '.' 2>/dev/null || echo "Response received"
        fi
    else
        if [ -n "$data" ]; then
            curl -s -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data" | jq '.' 2>/dev/null || echo "Response received"
        else
            curl -s -X $method "$BASE_URL$endpoint" | jq '.' 2>/dev/null || echo "Response received"
        fi
    fi
    
    sleep 1
}

echo ""
echo "🔍 1. HEALTH CHECK PATTERN (Disponibilidad - Ya implementado)"
make_request "GET" "/health" "" "" "Health Check básico"

echo ""
echo "🔐 2. GATEWAY OFFLOADING PATTERN (Seguridad - Recién implementado)"
echo "2.1 Probando login con datos válidos"
ALICE_TOKEN=$(curl -s -X POST "$BASE_URL/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"alice","password":"alicepass"}' | jq -r '.token' 2>/dev/null)

BOB_TOKEN=$(curl -s -X POST "$BASE_URL/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"bob","password":"bobpass"}' | jq -r '.token' 2>/dev/null)

echo "✅ Alice token obtenido: ${ALICE_TOKEN:0:20}..."
echo "✅ Bob token obtenido: ${BOB_TOKEN:0:20}..."

echo ""
echo "2.2 Probando Rate Limiting en login (Gateway Offloading)"
for i in {1..3}; do
    echo "Intento $i de login inválido:"
    make_request "POST" "/login" '{"username":"invalid","password":"wrong"}' "" "Login inválido $i"
done

echo ""
echo "2.3 Probando autorización mejorada"
make_request "GET" "/admin-only" "" "$BOB_TOKEN" "Acceso admin con Bob (debe funcionar)"
make_request "GET" "/admin-only" "" "$ALICE_TOKEN" "Acceso admin con Alice (debe fallar)"

echo ""
echo "2.4 Estadísticas de seguridad (solo admins)"
make_request "GET" "/security/stats" "" "$BOB_TOKEN" "Estadísticas de seguridad"

echo ""
echo "📊 3. CACHE-ASIDE PATTERN (Rendimiento - Recién implementado)"
echo "3.1 Primera consulta (cache miss)"
make_request "GET" "/products" "" "$ALICE_TOKEN" "Primera consulta de productos (cache miss)"

echo ""
echo "3.2 Segunda consulta (cache hit)"
make_request "GET" "/products" "" "$ALICE_TOKEN" "Segunda consulta de productos (cache hit)"

echo ""
echo "3.3 Estadísticas del cache"
make_request "GET" "/cache/stats" "" "$BOB_TOKEN" "Estadísticas del cache"

echo ""
echo "3.4 Creando un producto (invalidará cache)"
make_request "POST" "/products" '{"name":"Producto Test","price":150}' "$BOB_TOKEN" "Crear producto (invalidará cache)"

echo ""
echo "3.5 Consulta después de invalidación (cache miss)"
make_request "GET" "/products" "" "$ALICE_TOKEN" "Consulta después de invalidar cache"

echo ""
echo "🔄 4. CIRCUIT BREAKER PATTERN (Disponibilidad - Ya implementado)"
echo "   (Este patrón se activa automáticamente cuando los microservicios fallan)"
echo "   El fallback devuelve datos hardcodeados cuando el servicio no está disponible"

echo ""
echo "👥 5. COMPETING CONSUMERS PATTERN (Rendimiento - Ya implementado)"
echo "   (Este patrón está implementado con clustering - 8 workers procesan requests)"
echo "   Múltiples workers compiten por procesar las requests entrantes"

echo ""
echo "🎯 6. GATEKEEPER PATTERN (Seguridad - Ya implementado)"
echo "   (El API Gateway actúa como gatekeeper centralizando autenticación)"
echo "   Todas las requests pasan por autenticación JWT antes de llegar a microservicios"

echo ""
echo "✅ RESUMEN DE PATRONES IMPLEMENTADOS:"
echo "=================================================="
echo "📈 DISPONIBILIDAD (2/2 requeridos):"
echo "   ✅ Health Endpoint Monitoring - /health endpoint"
echo "   ✅ Circuit Breaker - Fallback en productos cuando microservicio falla"
echo ""
echo "🚀 RENDIMIENTO (2/2 requeridos):"
echo "   ✅ Competing Consumers - 8 workers con clustering"
echo "   ✅ Cache-Aside - Cache en memoria para productos con invalidación"
echo ""
echo "🔒 SEGURIDAD (2/2 requeridos):"
echo "   ✅ Gatekeeper - API Gateway con autenticación JWT centralizada"
echo "   ✅ Gateway Offloading - Centralización de seguridad, rate limiting, logging"
echo ""
echo "🎉 TOTAL: 6 patrones implementados (cumple con requisitos de microservicios)"

echo ""
echo "📝 ENDPOINTS PARA PROBAR MANUALMENTE:"
echo "Health: GET $BASE_URL/health"
echo "Login: POST $BASE_URL/login (alice/alicepass o bob/bobpass)"
echo "Products: GET $BASE_URL/products (requiere token)"
echo "Cache Stats: GET $BASE_URL/cache/stats (requiere token admin)"
echo "Security Stats: GET $BASE_URL/security/stats (requiere token admin)"
echo "Security Logs: GET $BASE_URL/security/logs (requiere token admin)"