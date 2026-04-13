import api from './axios';

const systemService = {
    getHealth: async () => {
        try {
            const response = await api.get('/system/health');
            return response.data;
        } catch (error) {
            console.error("Error fetching system health:", error);
            throw error;
        }
    },

    toggleMaintenance: async (enabled) => {
        try {
            const response = await api.post('/system/maintenance', { enabled });
            return response.data;
        } catch (error) {
            console.error("Error toggling maintenance mode:", error);
            throw error;
        }
    },

    clearCache: async () => {
        try {
            const response = await api.post('/system/clear-cache');
            return response.data;
        } catch (error) {
            console.error("Error clearing system cache:", error);
            throw error;
        }
    }
};

export default systemService;
