// Interfaces para interacción entre módulos

// Interface para acceder a productos
const ProductsInterface = {
  getAll: () => [
    { id: 1, name: 'Producto A', price: 100 },
    { id: 2, name: 'Producto B', price: 200 }
  ],
  getById: (id) => ({ id, name: `Producto ${id}`, price: 100 * id })
};

// Interface para acceder a clientes
const ClientsInterface = {
  getAll: () => [
    { id: 1, name: 'Cliente Uno' },
    { id: 2, name: 'Cliente Dos' }
  ],
  getById: (id) => ({ id, name: `Cliente ${id}` })
};

// Interface para acceder a órdenes
const OrdersInterface = {
  getAll: () => [],
  getById: (id) => ({ id, clientId: 1, productIds: [1,2], date: new Date().toISOString() })
};

module.exports = { ProductsInterface, ClientsInterface, OrdersInterface };
