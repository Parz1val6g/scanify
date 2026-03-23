import axios from 'axios';

// Instância base configurada para enviar cookies automaticamente
const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para gerir respostas
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Se recebermos 401 (Unauthorized), a sessão expirou ou é inválida
        if (error.response && error.response.status === 401) {
            // Só fazemos logout automático se não estivermos na página de login
            if (!window.location.pathname.includes('/login')) {
                // Removemos o estado local (o AuthContext tratará disto ao recarregar ou via eventos)
                // Usamos uma técnica simples: recarregar para forçar o AuthContext a falhar o restoreSession
                window.location.href = '/login?expired=true';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
