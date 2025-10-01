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



---


### Justificación de partición de primer nivel
La partición se realizó por dominio funcional (productos, clientes, órdenes) para facilitar escalabilidad, mantenimiento y despliegue independiente.

---
### Proceso para encontrar los componentes
Analizamos los requerimientos del dominio e-commerce e identificaron los módulos funcionales principales. Cada módulo expone interfaces para interacción y desacoplamiento.
Elegimos utilizar partición por dominios, decisión que condicionó el resto del diseño, luego definimos las funciones principales y despues meditamos si necesitaban comunicarse entre si.


---
### Contenedores en vez de Máquinas Virtuales
Se eligieron contenedores (Docker) por su ligereza, velocidad de despliegue y facilidad de escalado horizontal. 

**Explicación de como se utilizaría una Maquina Virtual**
Si quisieramos usaran máquinas virtuales, deberíamos crear una cuenta azure en la que crear un grupo de recursos (un contenedor logico). Luego de esto proceder a crear la maquina virtual definiendo "nombre", "imagen de SO", "tamaño de disco", "usuario" y claves SSH.
Azure devuelve la dirección ip publica para poder conectarse.
Se obtiene la ip publica con la CLI (la herramienta con la cual se pueden administrar los servicios de Azure desde la terminal, te permite crear y administrar MV entre otras cosas).
Se accede a la vm por el SSH con el usuario creado.
La imagen de la VM se puede conseguir de Azure Marketplace.
Es importante definir el tamaño de la VM porque define los recursos (deja listar tamaños disponibles en una región).
Es importante entender como funciónan los "Estados de energía", iniciando, en ejecución, detenido, desasignado, etc. (Detenido aún cobra recursos de cómputo, pero Desasignado no.)
Por ultimo queda la administración de la VM por medio de Azure CLI, como obtener las IPs de las VM, iniciarlas, detenerlas o eliminarlas.

Es importante saber que para hacer escalamiento horizontal en Maquinas Virtuales, Azure recomienda y ofrece los VMSS (Virtual Machine Scale Sets). Por CLI se puede crear un scale set que permite que Azure administre automáticamente el número de instancias, distribuir el tráfico entre ellas (usando Load Balancer) y mantener la alta disponibilidad.
No es necesario configurar a mano e instalar las herramientas dentro de cada maquina virtual que se cree. Basta con crear una plantilla y luego cuando el autoscalling del VMSS decida agregar más instancias, Azure generará nuevas VM a partir de esas plantillas.

Al usar maquinas virtuales en vez de contenedores el despliegue sería más pesado y menos eficiente para escalar instancias rápidamente.

---
### ACID vs BASE
La demo utiliza servicios sin estado y simula operaciones BASE, priorizando disponibilidad y escalabilidad. Si se usara ACID, se sacrificaría escalabilidad y velocidad de respuesta por consistencia fuerte y transacciones.

---
### Teorema CAP (Brewer) - Análisis de nuestro sistema

En nuestro sistema hemos elegido **AP (Availability + Partition Tolerance)** del teorema CAP:

#### ✅ **A - Availability (Disponibilidad):**
- **8 workers con clustering**: Si un worker falla, otros siguen funcionando
- **Reinicio automático**: Workers que fallan se reinician automáticamente
- **Servicios sin estado**: No hay dependencia de estado local, cualquier worker puede responder
- **Health checks**: Endpoint `/health` para monitoreo de disponibilidad

#### ✅ **P - Partition Tolerance (Tolerancia a particiones):**
- **Servicios desacoplados**: Módulos independientes que se comunican por interfaces
- **Contenedores**: Cada instancia es independiente y puede ejecutarse en diferentes nodos

#### ❌ **C - Consistency (Consistencia):**
**Sacrificamos consistencia fuerte por las siguientes razones:**
- **Datos hardcodeados**: Productos, clientes y órdenes no persisten entre requests
- **Eventual consistency**: Los datos pueden ser inconsistentes temporalmente

#### **Justificación de la elección AP:**

**¿Por qué elegimos Availability sobre Consistency?**
1. **E-commerce de demo**: Priorizamos que el sistema esté siempre funcionando
2. **Escalabilidad horizontal**: Más importante poder agregar workers que tener consistencia perfecta
3. **Tolerancia a fallos**: Mejor que algunos workers fallen a que todo el sistema sea inconsistente
4. **Experiencia de usuario**: Los usuarios prefieren un sistema disponible aunque tenga datos ligeramente desactualizados

**¿Qué impacto tendría elegir CP (Consistency + Partition tolerance)?**
- Menor disponibilidad: si la DB falla, todo el sistema falla
- Menor escalabilidad: necesitaríamos sincronización entre workers

**¿Qué impacto tendría elegir CA (Consistency + Availability)?**
- No toleraríamos particiones de red
- Sistema monolítico: todos los componentes en un solo nodo
- Sin escalabilidad horizontal
