import { createContext, useState, useContext, useEffect } from "react";
import { loginService, logoutService, registerService, fetchProfile } from '../services'

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restaurar sessão ao carregar a página (o browser envia o cookie automaticamente)
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const userData = await fetchProfile();
                setUser(userData);
            } catch {
                setUser(null);
            }
            setLoading(false);
        };

        restoreSession();
    }, []);

    const login = async (credentials) => {
        const userData = await loginService(credentials);
        setUser(userData);
    };

    const register = async (credentials) => {
        await registerService(credentials);
    };

    const logout = async () => {
        setUser(null);
        await logoutService();
    };

    const isAdmin = user?.role === 'COMPANY_ADMIN' || user?.role === 'SUPER_ADMIN';
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    return (
        <AuthContext.Provider value={{ 
            user, 
            login, 
            register, 
            logout, 
            isAuthenticated: !!user, 
            isAdmin,
            isSuperAdmin,
            loading 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};