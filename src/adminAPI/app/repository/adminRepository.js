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

    async getActiveClients() {
        try {
            return await Client.find({ isActive: true }).sort({ name: 1 });
        } catch (error) {
            console.error('Repository Error - getActiveClients:', error);
            throw error;
        }
    }

    async getInactiveClients() {
        try {
            return await Client.find({ isActive: false }).sort({ name: 1 });
        } catch (error) {
            console.error('Repository Error - getInactiveClients:', error);
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

    async activateClient(id) {
        try {
            return await Client.findByIdAndUpdate(
                id,
                { isActive: true, updatedAt: new Date() },
                { new: true }
            );
        } catch (error) {
            console.error('Repository Error - activateClient:', error);
            throw error;
        }
    }

    async deactivateClient(id) {
        try {
            return await Client.findByIdAndUpdate(
                id,
                { isActive: false, updatedAt: new Date() },
                { new: true }
            );
        } catch (error) {
            console.error('Repository Error - deactivateClient:', error);
            throw error;
        }
    }

    async getClientStats() {
        try {
            const totalClients = await Client.countDocuments({});
            const activeClients = await Client.countDocuments({ isActive: true });
            const inactiveClients = await Client.countDocuments({ isActive: false });
            
            return {
                total: totalClients,
                active: activeClients,
                inactive: inactiveClients,
                timestamp: new Date()
            };
        } catch (error) {
            console.error('Repository Error - getClientStats:', error);
            throw error;
        }
    }

    async searchClients(searchTerm) {
        try {
            const regex = new RegExp(searchTerm, 'i');
            return await Client.find({
                $or: [
                    { name: regex },
                    { email: regex },
                    { username: regex }
                ]
            }).sort({ name: 1 });
        } catch (error) {
            console.error('Repository Error - searchClients:', error);
            throw error;
        }
    }
}

module.exports = new AdminRepository();