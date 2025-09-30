const { ClientsServiceClass } = require('./clientsService');

class AdminService extends ClientsServiceClass {
  constructor() {
    super();
  }

  createClientAsAdmin(data) {
    try {
      const adminData = {
        ...data,
        createdBy: 'admin',
        adminCreated: true,
        active: true,
        adminMetadata: {
          createdAt: new Date().toISOString(),
          source: 'admin-panel'
        }
      };

      const newClient = this.create(adminData);

      this.emitEvent('admin-client-created', {
        clientId: newClient.id,
        adminAction: 'create',
        timestamp: new Date().toISOString()
      });

      return newClient;
    } catch (error) {
      this.lastOperationStatus = {
        success: false,
        operation: 'createClientAsAdmin',
        error: error.message
      };
      throw error;
    }
  }

  updateClientAsAdmin(id, data) {
    try {
      const adminData = {
        ...data,
        updatedBy: 'admin',
        adminUpdated: true,
        lastAdminUpdate: new Date().toISOString()
      };

      const updatedClient = this.update(id, adminData);

      this.emitEvent('admin-client-updated', {
        clientId: parseInt(id),
        adminAction: 'update',
        changes: Object.keys(data),
        timestamp: new Date().toISOString()
      });

      return updatedClient;
    } catch (error) {
      this.lastOperationStatus = {
        success: false,
        operation: 'updateClientAsAdmin',
        error: error.message
      };
      throw error;
    }
  }

  toggleClientStatus(id, active = false) {
    const client = this.getById(id);
    return this.update(id, { ...client, active, statusChangedAt: new Date().toISOString(), statusChangedBy: 'admin' });
  }

  getAllClientsWithDetails() {
    return this.getAll().map(client => ({
      ...client,
      orderCount: this.getClientOrderCount ? this.getClientOrderCount(client.id) : 0,
      status: client.active !== false ? 'activo' : 'inactivo',
      adminManaged: client.adminCreated || client.adminUpdated || false
    }));
  }

  

  getAdminStats() {
    try {
      const clientStats = this.getClientStats();
      const adminStats = {
        ...clientStats,
        adminCreatedClients: this.getAll().filter(c => c.adminCreated).length,
        adminUpdatedClients: this.getAll().filter(c => c.adminUpdated).length,
        recentActivity: this.getRecentAdminActivity(),
        systemStatus: 'operational',
        lastStatsUpdate: new Date().toISOString()
      };

      return adminStats;
    } catch (error) {
      console.error('Error getting admin stats:', error.message);
      return { error: 'Failed to generate admin stats' };
    }
  }

  advancedClientSearch(criteria) {
    try {
      if (!criteria || typeof criteria !== 'object') {
        return this.getAll();
      }

      let results = this.getAll();

      
      if (criteria.name) {
        results = results.filter(client =>
          client.name && client.name.toLowerCase().includes(criteria.name.toLowerCase())
        );
      }

      
      if (criteria.email) {
        results = results.filter(client =>
          client.email && client.email.toLowerCase().includes(criteria.email.toLowerCase())
        );
      }

      
      if (criteria.active !== undefined) {
        results = results.filter(client => client.active === criteria.active);
      }

      
      if (criteria.startDate && criteria.endDate) {
        results = this.getClientsByDateRange(criteria.startDate, criteria.endDate);
      }

      
      if (criteria.adminManaged === true) {
        results = results.filter(client => client.adminCreated || client.adminUpdated);
      }

      return results;
    } catch (error) {
      console.error('Error in advanced client search:', error.message);
      return [];
    }
  }

  generateClientReport() {
    try {
      const allClients = this.getAll();
      const stats = this.getClientStats();

      const report = {
        summary: stats,
        distribution: {
          byActivity: {
            active: allClients.filter(c => c.active !== false),
            inactive: allClients.filter(c => c.active === false)
          },
          bySource: {
            adminCreated: allClients.filter(c => c.adminCreated),
            systemCreated: allClients.filter(c => !c.adminCreated)
          }
        },
        recentClients: allClients
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          .slice(0, 10),
        reportGenerated: new Date().toISOString(),
        reportType: 'comprehensive-client-analysis'
      };

      return report;
    } catch (error) {
      console.error('Error generating client report:', error.message);
      return { error: 'Failed to generate report' };
    }
  }

  bulkUpdateClients(clientIds, updateData) {
    try {
      if (!Array.isArray(clientIds) || clientIds.length === 0) {
        throw new Error('ClientIds debe ser un array no vacío');
      }

      if (!updateData || typeof updateData !== 'object') {
        throw new Error('UpdateData debe ser un objeto válido');
      }

      const results = {
        successful: [],
        failed: [],
        summary: {
          totalRequested: clientIds.length,
          successful: 0,
          failed: 0
        }
      };

      clientIds.forEach(clientId => {
        try {
          const updatedClient = this.updateClientAsAdmin(clientId, updateData);
          results.successful.push({
            clientId: parseInt(clientId),
            client: updatedClient,
            status: 'updated'
          });
          results.summary.successful++;
        } catch (error) {
          results.failed.push({
            clientId: parseInt(clientId),
            error: error.message,
            status: 'failed'
          });
          results.summary.failed++;
        }
      });

      results.bulkUpdateCompleted = new Date().toISOString();
      return results;
    } catch (error) {
      console.error('Error in bulk update:', error.message);
      throw error;
    }
  }

  getRecentAdminActivity() {
    try {

      const recentActivity = [
        {
          action: 'client-created',
          timestamp: new Date(Date.now() - 60000).toISOString(),
          details: 'Nuevo cliente creado por admin'
        },
        {
          action: 'client-updated',
          timestamp: new Date(Date.now() - 120000).toISOString(),
          details: 'Cliente actualizado por admin'
        },
        {
          action: 'status-changed',
          timestamp: new Date(Date.now() - 180000).toISOString(),
          details: 'Estado de cliente modificado'
        }
      ];

      return recentActivity;
    } catch (error) {
      console.error('Error getting recent admin activity:', error.message);
      return [];
    }
  }

  getClientOrderCount(clientId) {
    try {

      const mockOrderCounts = { 1: 3, 2: 1, 3: 5, 4: 0 };
      return mockOrderCounts[clientId] || 0;
    } catch (error) {
      console.error('Error getting client order count:', error.message);
      return 0;
    }
  }
}

const adminServiceInstance = new AdminService();
module.exports = adminServiceInstance;
module.exports.AdminService = adminServiceInstance;
module.exports.AdminServiceClass = AdminService;
