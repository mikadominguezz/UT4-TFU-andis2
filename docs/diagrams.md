# Diagramas — Patrones implementados


---

## 1) Diagrama de secuencia — flujo GET /products (Cache-Aside + Gatekeeper + Circuit Breaker)

```mermaid
sequenceDiagram
  participant Client
  participant APIGW as API Gateway (Gatekeeper + GatewayOffloading)
  participant Cache as Cache-Aside (globalCache)
  participant Products as Products API
  participant Worker as Worker / Retry (conceptual)

  Client->>APIGW: GET /products (Authorization: Bearer ...)
  APIGW->>APIGW: authenticateJWT (Gatekeeper)
  APIGW->>APIGW: validateInput + rateLimit (GatewayOffloading)
  APIGW->>Cache: getOrFetch('products:all')
  alt Cache Hit
    Cache-->>APIGW: cached products
    APIGW-->>Client: 200 OK (cache result)
  else Cache Miss
    APIGW->>Products: axios GET /products (with timeout)
    alt Products OK
      Products-->>APIGW: products data
      APIGW->>Cache: set('products:all', data)
      APIGW-->>Client: 200 OK (fresh data)
    else Products FAIL / timeout
      Products-->>APIGW: error / timeout
      APIGW->>APIGW: Circuit Breaker fallback (hardcoded)
      APIGW-->>Client: 200 OK (fallback products)
    end
  end
```

---

## 2) Diagrama de clases — principales clases que implementan patrones

```mermaid
classDiagram
  class CacheAside {
    - Map cache
    - Number ttl
    - Number maxSize
    - Number hitCount
    - Number missCount
    + get(key)
    + set(key, data, customTtl)
    + delete(key)
    + clear()
    + getStats()
    + getOrFetch(key, fetchFunction, customTtl)
  }

  class GatewayOffloading {
    - Array securityLogs
    - Map requestCounts
    + securityHeaders()
    + createRateLimiter(options)
    + validateInput()
    + securityLogger()
    + authorizeRoles(requiredRoles)
    + logSecurityEvent(type, details)
    + getSecurityLogs(limit)
    + getSecurityStats()
  }

  CacheAside --|> GatewayOffloading : "co-located in<br>API Gateway"
```

---

## 3) Diagrama de despliegue — contenedores y responsabilidades (Docker / K8s)

```mermaid
graph LR
  subgraph DockerHost
    direction TB
    APIGW_Container["API Gateway Container<br>(port 8080)<br>- Gatekeeper<br>- Gateway Offloading<br>- Cache-Aside<br>- /health endpoint"]
    PROD_Container["Products Service<br>(port 3003)"]
    ORD_Container["Orders Service<br>(port 3004)"]
    CLI_Container["Clients Service<br>(port 3002)"]
    ADMIN_Container["Admin Service<br>(port 3001)"]
    MONGO["MongoDB<br>(port 27017)"]
    Worker_Cluster["Workers / Competing Consumers<br>(env WEB_CONCURRENCY)"]
  end

  Internet["Internet / Clients"] -->|HTTPS| APIGW_Container
  APIGW_Container --> PROD_Container
  APIGW_Container --> ORD_Container
  APIGW_Container --> CLI_Container
  APIGW_Container --> ADMIN_Container
  PROD_Container --> MONGO
  ORD_Container --> MONGO
  CLI_Container --> MONGO
  Worker_Cluster --> PROD_Container

  classDef infra fill:#f3f4f6,stroke:#9CA3AF
  class DockerHost infra
```

---
