import api from './axios';

export const invoiceService = {
    /**
     * Lista todas as faturas acessíveis ao utilizador
     */
    getAll: async () => {
        const res = await api.get('/invoices');
        return res.data;
    },

    /**
     * Obtém detalhes de uma fatura específica
     */
    getById: async (id) => {
        const res = await api.get(`/invoices/${id}`);
        return res.data;
    },

    /**
     * Faz o upload de uma nova fatura (imagem/pdf)
     */
    upload: async (formData) => {
        const res = await api.post('/invoices', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return res.data;
    },

    /**
     * Atualiza dados de uma fatura
     */
    update: async (id, data) => {
        const res = await api.put(`/invoices/${id}`, data);
        return res.data;
    },

    /**
     * Elimina uma fatura
     */
    delete: async (id) => {
        const res = await api.delete(`/invoices/${id}`);
        return res.data;
    },

    /**
     * Partilha uma fatura com outro utilizador
     */
    share: async (id, email) => {
        const res = await api.post(`/invoices/${id}/share`, { email });
        return res.data;
    },

    /**
     * Obtém URL (ou blob) para download da imagem da fatura
     */
    getDownloadUrl: (id) => `/api/invoices/${id}/download-image`
};

export default invoiceService;
