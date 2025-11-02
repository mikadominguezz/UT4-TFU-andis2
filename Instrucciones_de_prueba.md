# UT4-TFU - Patrones de Arquitectura
## Implementación de Patrones de Disponibilidad, Rendimiento y Seguridad
## 🧪 Instrucciones de Prueba

### Prerequisitos
```bash
# Instalar dependencias
npm install

# Construir y ejecutar con Docker
docker compose up --build
```

### Ejecutar Script de Pruebas Automatizado
```bash
./test-patterns.sh
```

### Pruebas Manuales con curl

#### 1. Health Check Pattern
```bash
curl http://localhost:8080/health
```

#### 2. Login y Autenticación (Gateway Offloading)
```bash
# Login válido
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"alicepass"}'

# Guardar token
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Login inválido (test rate limiting)
for i in {1..6}; do
  curl -X POST http://localhost:8080/login \
    -H "Content-Type: application/json" \
    -d '{"username":"invalid","password":"wrong"}'
done
```

#### 3. Cache-Aside Pattern
```bash
# Primera consulta (cache miss)
time curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/products

# Segunda consulta (cache hit)
time curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/products

# Ver estadísticas del cache
curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:8080/cache/stats
```

#### 4. Gateway Offloading - Security Features
```bash
# Test autorización por roles
curl -H "Authorization: Bearer $USER_TOKEN" http://localhost:8080/admin-only
# Debe retornar 403

curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:8080/admin-only  
# Debe retornar 200

# Ver logs de seguridad
curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:8080/security/logs

# Ver estadísticas de seguridad
curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:8080/security/stats
```

---

## 📊 Métricas de Rendimiento y Disponibilidad

### Cache-Aside Pattern
- **Hit Rate**: Porcentaje de consultas que encuentran datos en cache
- **Response Time**: Comparación entre cache hit vs cache miss
- **Memory Usage**: Uso de memoria del cache

### Gateway Offloading Pattern  
- **Security Events**: Número y tipos de eventos de seguridad
- **Rate Limit Hits**: Requests bloqueadas por rate limiting
- **Failed Auth Attempts**: Intentos de autenticación fallidos

### Health Check Pattern
- **Uptime**: Porcentaje de tiempo que el servicio responde correctamente
- **Response Time**: Tiempo de respuesta del health check

### Circuit Breaker Pattern
- **Fallback Activations**: Número de veces que se activa el fallback
- **Service Recovery**: Tiempo de recuperación del servicio

---

## ✅ Cumplimiento de Requisitos

| Grupo | Patrón | Estado | Beneficio Principal |
|-------|--------|--------|-------------------|
| **Disponibilidad** | Health Endpoint Monitoring | ✅ | Monitoreo automático |
| **Disponibilidad** | Circuit Breaker | ✅ | Previene fallos en cascada |
| **Rendimiento** | Competing Consumers | ✅ | Procesamiento paralelo |
| **Rendimiento** | Cache-Aside | ✅ | Reduce latencia |
| **Seguridad** | Gatekeeper | ✅ | Autenticación centralizada |
| **Seguridad** | Gateway Offloading | ✅ | Seguridad centralizada |

**Total**: 6 patrones implementados ✅ (cumple requisitos para microservicios)

---

## 🔧 Configuración

### Variables de Entorno
```bash
JWT_SECRET=your-secret-key
WEB_CONCURRENCY=8
MONGODB_URI=mongodb://admin:techmart2025@mongodb:27017/techmart?authSource=admin
```

### Docker Compose
El sistema se despliega completamente con:
```bash
docker compose up --build
```

### Endpoints Principales
- `GET /health` - Health check
- `POST /login` - Autenticación
- `GET /products` - Lista productos (con cache)
- `GET /cache/stats` - Estadísticas de cache
- `GET /security/stats` - Estadísticas de seguridad
- `GET /security/logs` - Logs de seguridad
