const ClientsService = require('./clientsService');

class AdminService extends ClientsService {
  constructor() { super(); }

  createClientAsAdmin(data) {
    const newClient = this.create({ ...data, createdBy: 'admin', adminCreated: true, active: true });
    return newClient;
  }

  updateClientAsAdmin(id, data) {
    const updatedClient = this.update(id, { ...data, updatedBy: 'admin', adminUpdated: true });
    return updatedClient;
  }

  toggleClientStatus(id, active = false) {
    const client = this.getById(id);
    return this.update(id, { ...client, active, statusChangedAt: new Date().toISOString(), statusChangedBy: 'admin' });
  }

  getAllClientsWithDetails() {
    return this.getAll().map(client => ({ ...client, orderCount: this.getClientOrderCount ? this.getClientOrderCount(client.id) : 0, status: client.active !== false ? 'activo' : 'inactivo', adminManaged: client.adminCreated || client.adminUpdated || false }));
  }
}

const adminServiceInstance = new AdminService();
module.exports = adminServiceInstance;
module.exports.AdminService = adminServiceInstance;
module.exports.AdminServiceClass = AdminService;
