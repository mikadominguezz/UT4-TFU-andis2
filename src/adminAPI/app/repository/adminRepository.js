const Client = require('../schema/ClientSchema');

class AdminRepository {

    async getAllClients() {
        try {
            return await Client.find({}).sort({ createdAt: -1 });
        } catch (error) {
            console.error('Repository Error - getAllClients:', error);
            throw error;
        }
    }

    async getClientById(id) {
        try {
            return await Client.findById(id);
        } catch (error) {
            console.error('Repository Error - getClientById:', error);
            throw error;
        }
    }

    async createClientAsAdmin(clientData) {
        try {
            const client = new Client({
                ...clientData,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: 'admin'
            });
            return await client.save();
        } catch (error) {
            console.error('Repository Error - createClientAsAdmin:', error);
            throw error;
        }
    }

    async updateClient(id, updateData) {
        try {
            return await Client.findByIdAndUpdate(
                id,
                { ...updateData, updatedAt: new Date() },
                { new: true }
            );
        } catch (error) {
            console.error('Repository Error - updateClient:', error);
            throw error;
        }
    }
}

module.exports = new AdminRepository();