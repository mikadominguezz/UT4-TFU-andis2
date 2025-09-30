const Client = require('../schemas/ClientSchema');
const IClientsService = require('../interfaces/IClientsService');

class ClientsService extends IClientsService {
  constructor() {
    super();
  }

  async getAll() {
    try {
      const clients = await Client.find({ isActive: true })
        .sort({ createdAt: -1 })
        .lean();
      return clients.map(c => ({ ...c, id: c._id.toString() }));
    } catch (error) {
      console.error('Error getting clients:', error);
      return [];
    }
  }

  async getById(id) {
    try {
      const client = await Client.findById(id).lean();
      if (client && client.isActive) {
        return { ...client, id: client._id.toString() };
      }
      return null;
    } catch (error) {
      console.error('Error getting client by id:', error);
      return null;
    }
  }

  async create(data) {
    try {
      const clientData = {
        name: data.name,
        email: data.email.toLowerCase(),
        username: data.username,
        phone: data.phone || '',
        address: data.address || {}
      };

      const client = new Client(clientData);
      const saved = await client.save();
      return { ...saved.toObject(), id: saved._id.toString() };
    } catch (error) {
      console.error('Error creating client:', error);
      throw new Error('Error creating client');
    }
  }

  async update(id, data) {
    try {
      const updated = await Client.findByIdAndUpdate(
        id,
        { ...data, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).lean();
      
      if (updated) {
        return { ...updated, id: updated._id.toString() };
      }
      return null;
    } catch (error) {
      console.error('Error updating client:', error);
      throw new Error('Error updating client');
    }
  }

  async delete(id) {
    try {
      const result = await Client.findByIdAndUpdate(
        id,
        { isActive: false, deletedAt: new Date() }
      );
      return !!result;
    } catch (error) {
      console.error('Error deleting client:', error);
      return false;
    }
  }

  async getByName(name) {
    try {
      if (!name || typeof name !== 'string') {
        return [];
      }

      const clients = await Client.find({
        name: new RegExp(name, 'i'),
        isActive: true
      }).lean();

      return clients.map(c => ({ ...c, id: c._id.toString() }));
    } catch (error) {
      console.error('Error getting clients by name:', error);
      return [];
    }
  }

  async getByEmail(email) {
    try {
      if (!email || typeof email !== 'string') {
        return null;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('ValidationError: Formato de email inválido');
      }

      const client = await Client.findOne({
        email: email.toLowerCase(),
        isActive: true
      }).lean();

      if (client) {
        return { ...client, id: client._id.toString() };
      }
      return null;
    } catch (error) {
      console.error('Error getting client by email:', error);
      return null;
    }
  }

  async searchClients(searchTerm) {
    try {
      if (!searchTerm || typeof searchTerm !== 'string') {
        return [];
      }

      const clients = await Client.find({
        $and: [
          { isActive: true },
          {
            $or: [
              { name: new RegExp(searchTerm, 'i') },
              { email: new RegExp(searchTerm, 'i') },
              { username: new RegExp(searchTerm, 'i') }
            ]
          }
        ]
      }).lean();

      return clients.map(c => ({ ...c, id: c._id.toString() }));
    } catch (error) {
      console.error('Error searching clients:', error);
      return [];
    }
  }

  async getActiveClients() {
    try {
      const clients = await Client.find({ isActive: true }).lean();
      return clients.map(c => ({ ...c, id: c._id.toString() }));
    } catch (error) {
      console.error('Error getting active clients:', error);
      return [];
    }
  }

  async count() {
    try {
      return await Client.countDocuments({ isActive: true });
    } catch (error) {
      console.error('Error counting clients:', error);
      return 0;
    }
  }

  async exists(id) {
    try {
      const client = await Client.findById(id);
      return !!client && client.isActive;
    } catch (error) {
      console.error('Error checking client existence:', error);
      return false;
    }
  }

  validateForCreate(client) {
    if (!client.name || typeof client.name !== 'string' || client.name.trim().length < 2) {
      throw new Error('ValidationError: Nombre es requerido y debe tener al menos 2 caracteres');
    }

    if (!client.email || typeof client.email !== 'string') {
      throw new Error('ValidationError: Email es requerido');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(client.email)) {
      throw new Error('ValidationError: Formato de email inválido');
    }

    return true;
  }

  validateForUpdate(client) {
    return this.validateForCreate(client);
  }
}

const clientsServiceInstance = new ClientsService();

module.exports = clientsServiceInstance;
module.exports.ClientsService = clientsServiceInstance;
module.exports.ClientsServiceClass = ClientsService;
