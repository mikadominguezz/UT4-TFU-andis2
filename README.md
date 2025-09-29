# UT3-TFU Andis II

## Pasos para correrlo:
1. npm install
2. docker compose up --build
3. npx serve

## Configuración:
- Las variables de entorno están en el archivo `.env`
- Los usuarios están definidos en `userService.js`
- La aplicación corre en puerto 3000 (contenedor) y se expone directamente en puerto 8080
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

**Response** incluye: total calculado, información del cliente y productos

**Nota**: Los administradores (Bob) NO pueden crear órdenes, solo los clientes (Alice)

## Justificación de la partición:

### Modelo de Componentes UML

![alt text](/docs/image.png)

Mermaid Code:


    flowchart LR
        API[API REST]
        Productos[Módulo Productos]
        Clientes[Módulo Clientes]
        Ordenes[Módulo Órdenes]
        Interfaces[(Interfaces)]

        API --> Productos
        API --> Clientes
        API --> Ordenes

        Productos ..> Interfaces
        Clientes ..> Interfaces
        Ordenes ..> Interfaces

---
### Descripción de componentes
- API REST: Recibe las peticiones y las envía al módulo correspondiente. Utiliza clustering con 8 workers para escalabilidad horizontal.
- Módulo Productos: Maneja la información de los productos.
- Módulo Clientes: Maneja la información de los clientes.
- Módulo Órdenes: Crea y muestra las órdenes usando datos de productos y clientes.
- Interfaces: Permiten que los módulos se comuniquen entre sí.

---
### Justificación de partición de primer nivel
La partición se realizó por dominio funcional (productos, clientes, órdenes) para facilitar escalabilidad, mantenimiento y despliegue independiente.

---
### Proceso para encontrar los componentes
Se analizaron los requerimientos del dominio e-commerce y se identificaron los módulos funcionales principales. Cada módulo expone interfaces para interacción y desacoplamiento.

---
### Contenedores vs Máquinas Virtuales
Se eligieron contenedores (Docker) por su ligereza, velocidad de despliegue y facilidad de escalado horizontal. Si se usaran máquinas virtuales, el despliegue sería más pesado y menos eficiente para escalar instancias rápidamente.

---
### ACID vs BASE
La demo utiliza servicios sin estado y simula operaciones BASE, priorizando disponibilidad y escalabilidad. Si se usara ACID, se sacrificaría escalabilidad y velocidad de respuesta por consistencia fuerte y transacciones.
