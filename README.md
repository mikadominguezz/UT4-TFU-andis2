# UT2-TFU Andis II

## Pasos para correrlo:
1. npm install
2. docker compose up --build
3. npx serve

## Pasos para el postman:

### GetHealth
GET http://localhost:8080/health

### LoginWithAlice
POST http://localhost:8080/login

**Body** <br />
{

  "username": "alice",

  "password": "alicepass"

}

### LoginWithBob
POST http://localhost:8080/login

**Body** <br />
{

  "username": "bob",

  "password": "bobpass"

}

### ProtectedWithTokenAlice
GET http://localhost:8080/protected

**Headers**

- Key: Authorization
- Value: Bearer {Token id de Alice}

### ProtectedWithTokenBob
GET http://localhost:8080/protected

**Headers**

- Key: Authorization
- Value: Bearer {Token id de Bob}

### AdminOnly
GET http://localhost:3001/admin-only

**Headers**

- Key: Authorization
- Value: Bearer {Token id de Bob}

### ListOfProductsAlice
GET http://localhost:8080/products

**Headers**

- Key: Authorization
- Value: Bearer {Token id de Alice}

### CreateProduct
POST http://localhost:8080/products

**Headers**

- Key: Authorization
- Value: Bearer {Token id de Bob}

**Body** <br />
{

  "name": "Producto 3",

  "price": 300

}

### ModifyProduct
PUT http://localhost:8080/products/p1

**Headers**

- Key: Authorization
- Value: Bearer {Token id de Bob}

**Body** <br />
{
    
  "name": "Producto 3",

  "price": 300

}