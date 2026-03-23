import React from 'react';
import styles from './TopHeader.module.css';
import { Sun, Moon, Menu } from 'lucide-react';
import { useAuth } from '../context/Auth';
import { useTheme } from '../context/Theme';

export const TopHeader = ({ onMenuClick }) => {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();

    // Responsividade: mostra só o primeiro nome ou inicial em mobile
    const getDisplayName = () => {
        if (!user) return '';
        if (window.innerWidth < 600) {
            return user.firstName ? user.firstName.charAt(0) : (user.email ? user.email.charAt(0) : '');
        }
        return user.firstName || user.email || '';
    };

    return (
        <header className={styles.topHeader}>
            {/* Botão de menu mobile */}
            <button className={styles.menuBtn} onClick={onMenuClick} aria-label="Abrir menu">
                <Menu size={28} />
            </button>
            {user?.company?.name && (
                <div className={styles.mobileCompanyName}>
                    {user.company.name}
                </div>
            )}
            <div className={styles.spacer} />
            <div className={styles.eliteProfile}>
                <div className={styles.profileInfo}>
                    <span className={styles.greeting}>Olá,</span>
                    <span className={styles.userName}>{getDisplayName()}</span>
                </div>
                <div className={styles.avatarMini}>
                    {getDisplayName().charAt(0).toUpperCase()}
                </div>
                <button
                    className={styles.themeToggle}
                    onClick={toggleTheme}
                    aria-label="Alternar tema"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>
        </header>
    );
};