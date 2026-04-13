import React from 'react';
import styles from './Sidebar.module.css';
import { Users, FileText, LayoutDashboard, ShieldCheck, X, LogOut, UserCircle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/Auth';
import { useTheme } from '../context/Theme';
import { motion } from 'framer-motion';

export const Sidebar = ({ isOpen, onClose, mobile }) => {
    const { isAdmin, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { path: '/',         icon: LayoutDashboard, label: 'Painel Principal' },
        { path: '/invoices', icon: FileText,         label: 'Faturas' },
        ...(isAdmin ? [{ path: '/users', icon: Users, label: 'Utilizadores' }] : []),
        { path: '/profile',  icon: UserCircle,       label: 'O Meu Perfil' },
    ];

    const handleLogout = async () => {
        await logout();          // Auth.jsx clears state after server call
        navigate('/login', { replace: true }); // Explicit redirect — no race condition
        if (onClose) onClose();
    };

    return (
        <motion.nav
            className={styles.sidebar}
            initial={{ x: mobile ? '-100%' : 0 }}
            animate={{ x: isOpen ? 0 : '-100%' }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            {mobile && (
                <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar menu">
                    <X size={28} />
                </button>
            )}
            <div className={styles.logo}>
                <Link to="/">
                    <ShieldCheck size={28} />
                    {import.meta.env.VITE_APP_NAME || 'Scanify'}
                </Link>
            </div>
            <div className={styles.options}>
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`${styles.option} ${
                            location.pathname === item.path ? styles.activeOption : ''
                        }`}
                        onClick={() => { if (mobile && onClose) onClose(); }}
                    >
                        <item.icon size={20} />
                        {item.label}
                    </Link>
                ))}
                
                {mobile && (
                    <button 
                        className={styles.option} 
                        onClick={toggleTheme} 
                        style={{ border: 'none', background: 'transparent', width: '100%', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        Alternar Tema ({theme === 'dark' ? 'Claro' : 'Escuro'})
                    </button>
                )}
            </div>
            <div className={styles.footer}>
                <button className={styles.logoutBtn} onClick={handleLogout}>
                    <LogOut size={20} />
                    <span>Terminar Sessão</span>
                </button>
            </div>
        </motion.nav>
    );
};