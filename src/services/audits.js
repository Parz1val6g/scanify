import api from './axios';

const auditService = {
    getLogs: async (params = {}) => {
        try {
            const response = await api.get('/audits', { params });
            return response.data;
        } catch (error) {
            console.error("Error fetching audit logs:", error);
            throw error;
        }
    }
};

export default auditService;
