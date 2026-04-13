import api from './axios';

export const userService = {
    /**
     * Lista todos os utilizadores (apenas Admins — backend filtra por empresa para COMPANY_ADMIN)
     */
    getAll: async () => {
        const res = await api.get('/users');
        return res.data;
    },

    /**
     * Convida um novo utilizador para a empresa
     * @param {{ email: string, firstName: string, lastName: string }} data
     */
    invite: async (data) => {
        const res = await api.post('/users/invite', data);
        return res.data;
    },

    /**
     * Obtém perfil do utilizador atual
     */
    getMe: async () => {
        const res = await api.get('/users/me');
        return res.data;
    },

    /**
     * Atualiza o perfil do utilizador atual (firstName, lastName, email)
     */
    updateMe: async (data) => {
        const res = await api.put('/users/me', data);
        return res.data;
    },

    /**
     * Altera a password do utilizador atual
     * @param {{ currentPassword: string, newPassword: string }} data
     * FIXED: was incorrectly pointing to /me/password — correct route is /users/me/password
     */
    changePasswordMe: async (data) => {
        const res = await api.patch('/users/me/password', data);
        return res.data;
    },

    /**
     * Atualiza dados de qualquer utilizador por ID (apenas Admins)
     * @param {string} id
     * @param {{ firstName?: string, lastName?: string, role?: string, email?: string }} data
     */
    updateById: async (id, data) => {
        const res = await api.put(`/users/${id}`, data);
        return res.data;
    },

    /**
     * Atualiza o status de um utilizador (apenas Admins)
     * @param {string} id
     * @param {string} status — ACTIVE | INACTIVE | SUSPENDED | BLOCKED | DELETED | BANNED
     */
    updateStatus: async (id, status) => {
        const res = await api.patch(`/users/${id}/status`, { status });
        return res.data;
    },

    /**
     * Elimina um utilizador (apenas Admins)
     */
    delete: async (id) => {
        const res = await api.delete(`/users/${id}`);
        return res.data;
    }
};

export default userService;
