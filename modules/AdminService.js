// Componente AdminService - Servicio de gestión administrativa
const ClientsService = require('./ClientsService');

class AdminService extends ClientsService {
  constructor() {
    super();
  }

  // Métodos específicos para administración que requieren permisos especiales
  
  // Crear cliente con validaciones administrativas
  createClientAsAdmin(data) {
    const newClient = this.create({
      ...data,
      createdBy: 'admin',
      adminCreated: true,
      active: true
    });
    return newClient;
  }

  // Actualizar cliente con permisos administrativos
  updateClientAsAdmin(id, data) {
    const updatedClient = this.update(id, {
      ...data,
      updatedBy: 'admin',
      adminUpdated: true
    });
    return updatedClient;
  }

  // Desactivar/activar cliente (solo admins)
  toggleClientStatus(id, active = false) {
    const client = this.getById(id);
    return this.update(id, {
      ...client,
      active,
      statusChangedAt: new Date().toISOString(),
      statusChangedBy: 'admin'
    });
  }

  // Obtener clientes con información administrativa completa
  getAllClientsWithDetails() {
    return this.getAll().map(client => ({
      ...client,
      orderCount: this.getClientOrderCount ? this.getClientOrderCount(client.id) : 0,
      status: client.active !== false ? 'activo' : 'inactivo',
      adminManaged: client.adminCreated || client.adminUpdated || false
    }));
  }
}

// Crear y exportar instancia única del servicio administrativo
const adminServiceInstance = new AdminService();

module.exports = adminServiceInstance;
module.exports.AdminService = adminServiceInstance;
module.exports.AdminServiceClass = AdminService;