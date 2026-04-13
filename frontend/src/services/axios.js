import axios from 'axios';

// Instância base configurada para enviar cookies automaticamente
const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para gerir respostas globalmente
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        // 401 Unauthorized — sessão expirada ou token inválido
        if (status === 401) {
            if (!window.location.pathname.includes('/login')) {
                // Força redirect para login com query param para mostrar mensagem
                window.location.href = '/login?expired=true';
            }
        }

        // 403 Forbidden — utilizador autenticado mas sem permissão
        if (status === 403) {
            // Despachar evento global para que o UI reaja (toast, redirect, etc.)
            window.dispatchEvent(new CustomEvent('app:forbidden', {
                detail: {
                    message: error.response?.data?.error || 'Acesso negado. Não tem permissão para esta ação.'
                }
            }));
        }

        return Promise.reject(error);
    }
);

export default api;
