const Client = require('../schema/ClientSchema');

class ClientsRepository {
    
    async getClients() {
        try {
            return await Client.find({ isActive: true }).sort({ createdAt: -1 });
        } catch (error) {
            console.error('Repository Error - getClients:', error);
            throw error;
        }
    }

    async getClientById(id) {
        try {
            return await Client.findOne({ _id: id, isActive: true });
        } catch (error) {
            console.error('Repository Error - getClientById:', error);
            throw error;
        }
    }

    async getClientByEmail(email) {
        try {
            return await Client.findOne({ email: email, isActive: true });
        } catch (error) {
            console.error('Repository Error - getClientByEmail:', error);
            throw error;
        }
    }

    async getClientsByName(name) {
        try {
            const regex = new RegExp(name, 'i'); // Case insensitive search
            return await Client.find({ 
                name: regex, 
                isActive: true 
            }).sort({ name: 1 });
        } catch (error) {
            console.error('Repository Error - getClientsByName:', error);
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

    async saveClient(clientData) {
        try {
            const client = new Client({
                ...clientData,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            return await client.save();
        } catch (error) {
            console.error('Repository Error - saveClient:', error);
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
            const totalClients = await Client.countDocuments({ isActive: true });
            const totalInactive = await Client.countDocuments({ isActive: false });
            
            return {
                active: totalClients,
                inactive: totalInactive,
                total: totalClients + totalInactive,
                timestamp: new Date()
            };
        } catch (error) {
            console.error('Repository Error - getClientStats:', error);
            throw error;
        }
    }
}

module.exports = new ClientsRepository();