// Interfaces para interacción entre módulos
// Estas interfaces definen los contratos, pero cada módulo maneja sus propios datos

// Interface para acceder a productos - solo define el contrato
const ProductsInterface = {
  getAll: null, // Será implementado por el módulo products
  getById: null // Será implementado por el módulo products
};

// Interface para acceder a clientes - solo define el contrato
const ClientsInterface = {
  getAll: null, // Será implementado por el módulo clients
  getById: null // Será implementado por el módulo clients
};

// Interface para acceder a órdenes - solo define el contrato
const OrdersInterface = {
  getAll: null, // Será implementado por el módulo orders
  getById: null // Será implementado por el módulo orders
};

module.exports = { ProductsInterface, ClientsInterface, OrdersInterface };
