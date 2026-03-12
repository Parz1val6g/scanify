import { createContext, useState, useContext, useEffect } from "react";
import { loginService, logoutService, registerService, fetchProfile } from '../services'

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Função para obter o token
    const getToken = () => localStorage.getItem('token');

    // Restaurar sessão ao carregar a página (busca user via token)
    useEffect(() => {
        const restoreSession = async () => {
            const token = getToken();
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const userData = await fetchProfile(token);
                setUser(userData);
            } catch {
                // Token inválido/expirado - limpar
                localStorage.removeItem('token');
            }
            setLoading(false);
        };

        restoreSession();
    }, []);

    const login = async (credentials) => {
        const data = await loginService(credentials);
        localStorage.setItem('token', data.token);
        setUser(data.user);
    };

    const register = async (credentials) => {
        await registerService(credentials);
    };

    const logout = async () => {
        const token = getToken();
        setUser(null);
        localStorage.removeItem('token');
        await logoutService(token); // Notifica o backend (silent fail)
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, getToken, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);