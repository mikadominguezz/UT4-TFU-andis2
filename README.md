# UT5-TFU Andis II - Estilos de arquitectura

## 🏗️ Arquitectura:
**MICROSERVICES ARCHITECTURE** - Cada servicio tiene su propia base de datos independiente.

## Pasos para correr:
1. npm install
2. docker compose up --build
3. npx serve


## Configuración de Base de Datos:
- **Admin Database**: `mongodb://localhost:27018/admin_db`
- **Clients Database**: `mongodb://localhost:27019/clients_db`
- **Products Database**: `mongodb://localhost:27020/products_db`
- **Orders Database**: `mongodb://localhost:27021/orders_db`

## Configuración:
- Las variables de entorno están en el archivo `.env`
- Los usuarios están definidos en `userService.js`
- **API Gateway** corre en puerto 8080
- **Cada microservicio** tiene su propia base de datos MongoDB
- Configurado para usar exactamente 8 workers (escalabilidad horizontal)

## Permisos:
- **Alice (cliente)**: Puede ver productos, acceder a recursos protegidos, y crear órdenes.
- **Bob (admin)**: Puede crear/modificar productos, gestionar clientes, ver órdenes, pero NO puede crear órdenes (solo los clientes pueden comprar).

## Pasos para el postman:

### GetHealth
GET http://localhost:8080/health

---
### LoginWithAlice
POST http://localhost:8080/login

    {
      "username": "alice",

      "password": "alicepass"
    }

---
### LoginWithBob
POST http://localhost:8080/login

    {
      "username": "bob",

      "password": "bobpass"
    }

---
### ProtectedWithTokenAlice
GET http://localhost:8080/protected

- Key: Authorization
- Value: Bearer {Token id de Alice}

---
### ProtectedWithTokenBob
GET http://localhost:8080/protected

- Key: Authorization
- Value: Bearer {Token id de Bob}

---
### AdminOnly
GET http://localhost:8080/admin-only

- Key: Authorization
- Value: Bearer {Token id de Bob}

---
### ListOfProductsAlice
GET http://localhost:8080/products

- Key: Authorization
- Value: Bearer {Token id de Alice}

---
### CreateProduct
POST http://localhost:8080/products

- Key: Authorization
- Value: Bearer {Token id de Bob}


      {
        "name": "Producto 3",

        "price": 300
      }

---
### ModifyProduct
PUT http://localhost:8080/products/p1

- Key: Authorization
- Value: Bearer {Token id de Bob}

      {
        "name": "Producto 3",

        "price": 300
      }

---
### GetClients (Admin only)
GET http://localhost:8080/clients

- Key: Authorization
- Value: Bearer {Token id de Bob}

---
### CreateClient (Admin only)
POST http://localhost:8080/clients

- Key: Authorization
- Value: Bearer {Token id de Bob}

      {

        "name": "Cliente Nuevo"

      }

---
### GetOrders (Admin only)
GET http://localhost:8080/orders

- Key: Authorization
- Value: Bearer {Token id de Bob}

---
### CreateOrder (Clientes only - NO admin)
POST http://localhost:8080/orders

- Key: Authorization
- Value: Bearer {Token id de Alice}

      {

        "clientId": 1,

        "productIds": [1, 2]

      }

---

## Verificación de Microservicios:

### Health Checks Individuales:
- **Products API**: GET http://localhost:3003/health
- **Admin API**: GET http://localhost:3001/health
- **Clients API**: GET http://localhost:3002/health
- **Orders API**: GET http://localhost:3004/health

### Database Connections:
```bash
# Verificar conexiones a cada base de datos
mongosh "mongodb://admin:techmart2025@localhost:27018/admin_db?authSource=admin"
mongosh "mongodb://admin:techmart2025@localhost:27019/clients_db?authSource=admin"
mongosh "mongodb://admin:techmart2025@localhost:27020/products_db?authSource=admin"
mongosh "mongodb://admin:techmart2025@localhost:27021/orders_db?authSource=admin"
```

## Troubleshooting:
- Para reiniciar completamente: `docker-compose down -v && docker-compose up --build`
- Logs de servicios: `docker-compose logs [service-name]`
