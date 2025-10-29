# UT4-TFU - Patrones de Arquitectura
## Implementación de Patrones de Disponibilidad, Rendimiento y Seguridad

### Resumen Ejecutivo

Este proyecto implementa **6 patrones de arquitectura** distribuidos en 3 grupos:

- **🔧 Disponibilidad**: 2 patrones
- **🚀 Rendimiento**: 2 patrones  
- **🔒 Seguridad**: 2 patrones

Al tratarse de una arquitectura de microservicios, no se requieren patrones de facilidad de modificación y despliegue según las especificaciones del PDF.

---

## 📋 Patrones Implementados

### 🔧 GRUPO DE DISPONIBILIDAD

#### 1. Health Endpoint Monitoring ✅
**Ubicación**: `src/app.js` - endpoint `/health`
**Estado**: Ya implementado previamente

**Descripción**: Proporciona un endpoint HTTP que permite verificar el estado de la aplicación y sus dependencias.

**Implementación**:
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'App is running' });
});
```

**Cómo logra disponibilidad**:
- Permite monitoreo automático por herramientas externas
- Detecta rápidamente cuando la aplicación no responde
- Facilita la implementación de health checks en orquestadores (Docker, Kubernetes)

**Pruebas empíricas**:
```bash
curl http://localhost:8080/health
# Respuesta esperada: {"status":"App is running"}
```

#### 2. Circuit Breaker ✅
**Ubicación**: `src/app.js` - ruta `/products`
**Estado**: Ya implementado previamente

**Descripción**: Protege la aplicación de fallos en cascada proporcionando un mecanismo de fallback cuando los servicios dependientes fallan.

**Implementación**:
```javascript
app.get('/products', authenticateJWT(process.env.JWT_SECRET), async (req, res) => {
  try {
    const response = await axios.get('http://products-api:3003/products', {
      headers: { 'Authorization': req.headers['authorization'] }
    });
    res.json(response.data);
  } catch (err) {
    console.error('❌ Error al obtener productos:', err.message);
    // Circuit Breaker: datos hardcodeados como fallback
    const fallbackProducts = [
      { id: 1, name: 'Product A (Fallback)', price: 100 },
      { id: 2, name: 'Product B (Fallback)', price: 200 }
    ];
    res.status(200).json(fallbackProducts);
  }
});
```

**Cómo logra disponibilidad**:
- Evita que fallos en microservicios propaguen errores al cliente
- Mantiene la funcionalidad básica incluso cuando servicios dependientes fallan
- Reduce el tiempo de respuesta en caso de fallos

**Pruebas empíricas**:
1. Con microservicio funcionando: respuesta normal
2. Con microservicio caído: respuesta con datos fallback
3. Tiempo de respuesta consistente en ambos casos

---

### 🚀 GRUPO DE RENDIMIENTO

#### 3. Competing Consumers ✅
**Ubicación**: `index.js` - clustering con workers
**Estado**: Ya implementado previamente

**Descripción**: Múltiples workers compiten por procesar mensajes/requests de una cola común, distribuyendo la carga de trabajo.

**Implementación**:
```javascript
if (cluster.isMaster || cluster.isPrimary) {
  const workers = parseInt(process.env.WEB_CONCURRENCY) || 2;
  console.log(`🎯 Master PID ${process.pid} iniciando ${workers} workers`);

  for (let i = 0; i < workers; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`⚠️  Worker ${worker.process.pid} terminó. Reiniciando...`);
    cluster.fork();
  });
}
```

**Cómo logra rendimiento**:
- Distribuye carga entre múltiples procesos worker (8 por defecto)
- Permite procesamiento paralelo de requests
- Mejora throughput y reduce latencia

**Pruebas empíricas**:
- Test de carga con herramientas como `ab` o `wrk`
- Monitoreo de CPU utilization con múltiples workers
- Comparación de throughput con/sin clustering

#### 4. Cache-Aside 🆕
**Ubicación**: `src/utils/cacheAside.js` y `src/app.js`
**Estado**: **RECIÉN IMPLEMENTADO**

**Descripción**: La aplicación maneja directamente el cache, consultándolo primero y actualizándolo cuando es necesario.

**Implementación**:
```javascript
// Cache implementation
class CacheAside {
  async getOrFetch(key, fetchFunction, customTtl = null) {
    // 1. Try cache first
    let data = this.get(key);
    if (data !== null) {
      console.log(`🟢 Cache HIT para key: ${key}`);
      return data;
    }

    // 2. Cache miss - fetch from source
    console.log(`🔴 Cache MISS para key: ${key}`);
    data = await fetchFunction();
    
    // 3. Store in cache
    this.set(key, data, customTtl);
    return data;
  }
}

// Usage in API Gateway
app.get('/products', authenticateJWT(process.env.JWT_SECRET), async (req, res) => {
  const cacheKey = 'products:all';
  const products = await globalCache.getOrFetch(
    cacheKey,
    async () => {
      const response = await axios.get('http://products-api:3003/products', {
        headers: { 'Authorization': req.headers['authorization'] },
        timeout: 5000
      });
      return response.data;
    },
    180000 // 3 minutes cache
  );
  res.json(products);
});
```

**Cómo logra rendimiento**:
- Reduce llamadas a microservicios externos
- Mejora tiempo de respuesta para datos frecuentemente accedidos
- Reduce carga en base de datos y servicios backend

**Pruebas empíricas**:
```bash
# Primera consulta (cache miss)
time curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/products

# Segunda consulta (cache hit) - debe ser más rápida
time curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/products

# Ver estadísticas
curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:8080/cache/stats
```

---

### 🔒 GRUPO DE SEGURIDAD

#### 5. Gatekeeper ✅
**Ubicación**: `src/app.js` - API Gateway con JWT
**Estado**: Ya implementado previamente

**Descripción**: Centraliza la autenticación y autorización en un punto de entrada único antes de permitir acceso a recursos protegidos.

**Implementación**:
```javascript
// JWT Authentication middleware
function authenticateJWT(secret) {
  return (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, secret, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };
}

// Protected routes
app.get('/products', authenticateJWT(process.env.JWT_SECRET), async (req, res) => {
  // Route logic...
});
```

**Cómo logra seguridad**:
- Centraliza autenticación en un solo punto
- Previene acceso no autorizado a microservicios
- Simplifica gestión de credenciales y tokens

**Pruebas empíricas**:
- Request sin token: debe retornar 401
- Request con token inválido: debe retornar 403  
- Request con token válido: debe permitir acceso

#### 6. Gateway Offloading 🆕
**Ubicación**: `src/utils/gatewayOffloading.js` y `src/app.js`
**Estado**: **RECIÉN IMPLEMENTADO**

**Descripción**: Descarga responsabilidades de seguridad comunes del backend hacia el API Gateway, incluyendo autenticación, autorización, validación, rate limiting y logging.

**Implementación**:
```javascript
class GatewayOffloading {
  // Security headers
  securityHeaders() {
    return helmet({
      contentSecurityPolicy: { /* ... */ },
      hsts: { maxAge: 31536000, includeSubDomains: true }
    });
  }

  // Rate limiting
  createRateLimiter(options = {}) {
    return rateLimit({
      windowMs: options.windowMs || 15 * 60 * 1000,
      max: options.max || 100,
      handler: (req, res) => {
        this.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
          ip: req.ip, path: req.path
        });
        res.status(429).json({ error: 'Too many requests' });
      }
    });
  }

  // Enhanced authorization
  authorizeRoles(requiredRoles = []) {
    return (req, res, next) => {
      const userRoles = req.user.roles || [];
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
      
      if (requiredRoles.length > 0 && !hasRequiredRole) {
        this.logSecurityEvent('INSUFFICIENT_PRIVILEGES', {
          user: req.user.username, requiredRoles, path: req.path
        });
        return res.status(403).json({ error: 'Insufficient privileges' });
      }
      next();
    };
  }
}

// Applied to all routes
app.use(gatewayOffloading.securityHeaders());
app.use(gatewayOffloading.validateInput());
app.use('/login', authRateLimit); // 5 attempts per 15 min
app.use(generalRateLimit); // 100 requests per 15 min

// Enhanced route protection
app.get('/admin-only', 
  authenticateJWT(process.env.JWT_SECRET),
  gatewayOffloading.authorizeRoles(['admin']),
  (req, res) => { /* ... */ }
);
```

**Cómo logra seguridad**:
- **Centralización**: Todas las políticas de seguridad en un lugar
- **Rate Limiting**: Previene ataques de fuerza bruta y DDoS
- **Security Headers**: Protege contra XSS, clickjacking, etc.
- **Input Validation**: Valida entrada antes de llegar a microservicios
- **Audit Logging**: Registra eventos de seguridad para análisis
- **Authorization**: Control granular basado en roles

**Pruebas empíricas**:
```bash
# Test rate limiting
for i in {1..10}; do 
  curl -X POST http://localhost:8080/login -d '{"username":"invalid","password":"wrong"}'
done

# Test authorization
curl -H "Authorization: Bearer $USER_TOKEN" http://localhost:8080/admin-only
# Should return 403

curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:8080/admin-only  
# Should return 200

# Security stats
curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:8080/security/stats
```

---

## 🏗️ Diagramas UML

### Diagrama de Componentes - Cache-Aside Pattern

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   API Gateway   │    │   Cache-Aside    │    │ Products-API    │
│                 │    │    Component     │    │                 │
│  GET /products  │───▶│                  │    │                 │
│                 │    │ 1. Check cache   │    │                 │
│                 │    │ 2. Cache miss?   │    │                 │
│                 │    │ 3. Fetch data    │───▶│ GET /products   │
│                 │    │ 4. Store cache   │◄───│                 │
│                 │◄───│ 5. Return data   │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Diagrama de Secuencia - Gateway Offloading Pattern

```
Client          API Gateway       Security Module      Microservice
  │                  │                   │                  │
  │ POST /products   │                   │                  │
  ├─────────────────▶│                   │                  │
  │                  │ validateInput()   │                  │
  │                  ├──────────────────▶│                  │
  │                  │ checkRateLimit()  │                  │
  │                  ├──────────────────▶│                  │
  │                  │ authenticateJWT() │                  │
  │                  ├──────────────────▶│                  │
  │                  │ authorizeRoles()  │                  │
  │                  ├──────────────────▶│                  │
  │                  │ logSecurityEvent()│                  │
  │                  ├──────────────────▶│                  │
  │                  │                   │ POST /products   │
  │                  │                   ├─────────────────▶│
  │                  │                   │                  │
  │    Response      │                   │    Response      │
  │◄─────────────────│                   │◄─────────────────│
```

### Diagrama de Despliegue

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Host                              │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐│
│  │ API Gateway  │  │   MongoDB    │  │   Microservices     ││
│  │ Port: 8080   │  │ Port: 27017  │  │   - Products: 3003  ││
│  │              │  │              │  │   - Orders: 3004    ││
│  │ Patterns:    │  │              │  │   - Clients: 3002   ││
│  │ - Gatekeeper │  │              │  │   - Admin: 3001     ││
│  │ - Gateway    │  │              │  │                     ││
│  │   Offloading │  │              │  │                     ││
│  │ - Cache-Aside│  │              │  │                     ││
│  │ - Circuit    │  │              │  │                     ││
│  │   Breaker    │  │              │  │                     ││
│  │ - Health     │  │              │  │                     ││
│  │   Check      │  │              │  │                     ││
│  └──────────────┘  └──────────────┘  └─────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

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

---

*Implementación realizada para UT4-TFU - Patrones de Arquitectura*