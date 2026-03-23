import api from './axios';

export const userService = {
    /**
     * Lista todos os utilizadores (apenas Admins)
     */
    getAll: async () => {
        const res = await api.get('/users');
        return res.data;
    },

    /**
     * Convida um novo utilizador para a empresa
     */
    invite: async (data) => {
        const res = await api.post('/users/invite', data);
        return res.data;
    },

    /**
     * Obtém perfil do utilizador atual (alternativa ao AuthContext)
     */
    getMe: async () => {
        const res = await api.get('/users/me');
        return res.data;
    },

    /**
     * Atualiza o perfil do utilizador atual
     */
    updateMe: async (data) => {
        const res = await api.put('/users/me', data);
        return res.data;
    },

    /**
     * Altera a password do utilizador atual
     */
    changePasswordMe: async (data) => {
        const res = await api.patch('/me/password', data);
        return res.data;
    },

    /**
     * Atualiza o status de um utilizador (ativo, suspenso, etc)
     */
    updateStatus: async (id, status) => {
        const res = await api.patch(`/users/${id}/status`, { status });
        return res.data;
    },

    /**
     * Elimina um utilizador
     */
    delete: async (id) => {
        const res = await api.delete(`/users/${id}`);
        return res.data;
    }
};

export default userService;
