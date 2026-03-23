import React from 'react';
import styles from './Sidebar.module.css';
import { Users, FileText, LayoutDashboard, ShieldCheck, X, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/Auth';
import { motion } from 'framer-motion';

export const Sidebar = ({ isOpen, onClose, mobile }) => {
    const { isAdmin, logout } = useAuth();
    const location = useLocation();

    const menuItems = [
        { path: '/', icon: LayoutDashboard, label: 'Painel Principal' },
        { path: '/invoices', icon: FileText, label: 'Faturas' },
        ...(isAdmin ? [{ path: '/users', icon: Users, label: 'Utilizadores' }] : [])
    ];

    const handleLogout = async () => {
        await logout();
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
                        onClick={mobile ? onClose : undefined}
                    >
                        <item.icon size={20} />
                        {item.label}
                    </Link>
                ))}
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