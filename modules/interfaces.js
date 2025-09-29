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
  getAll: () => [
    { 
      id: 1, 
      clientId: 1, 
      productIds: [1, 2], 
      date: '2024-09-01T10:30:00Z',
      total: 300
    },
    { 
      id: 2, 
      clientId: 2, 
      productIds: [1], 
      date: '2024-09-15T14:45:00Z',
      total: 100
    }
  ],
  getById: (id) => ({ id, clientId: 1, productIds: [1,2], date: new Date().toISOString(), total: 300 })
};

module.exports = { ProductsInterface, ClientsInterface, OrdersInterface };
