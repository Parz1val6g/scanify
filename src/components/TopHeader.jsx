import styles from './TopHeader.module.css';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Moon, Sun } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/';

// Helper para capitalizar
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const TopHeaderComponent = () => {
    const { user } = useAuth();

    // Detect system theme
    const getSystemTheme = () => {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    };
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved || getSystemTheme();
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const handler = (e) => {
            if (!localStorage.getItem('theme')) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        };
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handler);
        return () => {
            window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handler);
        };
    }, []);
    const toggleTheme = () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    const location = useLocation();
    const pathname = location.pathname;
    // Divide e filtra segmentos
    const segments = pathname.split('/').filter(Boolean);

    // Breadcrumbs dinâmicos
    let breadcrumbs = null;
    if (segments.length === 0) {
        // Raiz: não renderiza
        breadcrumbs = null;
    } else if (segments.length === 1) {
        // Exemplo: /invoices
        breadcrumbs = (
            <span>{capitalize(segments[0])}</span>
        );
    } else {
        // Exemplo: /invoices/create
        breadcrumbs = segments.map((seg, idx) => {
            const to = '/' + segments.slice(0, idx + 1).join('/');
            const isLast = idx === segments.length - 1;
            return isLast ? (
                <span key={to}>{capitalize(seg)}</span>
            ) : (
                <>
                    <Link key={to} to={to}>{capitalize(seg)}</Link>
                    <ChevronRight key={to + '-chevron'} />
                </>
            );
        });
    }

    return (
        <div id={styles.topHeader}>
            <div id={styles.breadcrumbs}>
                {breadcrumbs}
            </div>
            <div id={styles.actions}>
                <div id={styles.toggleTheme} onClick={toggleTheme}>
                    {theme === 'dark' ? <Moon /> : <Sun />}
                </div>
                <Link id={styles.profile} to='/profile'>
                    Olá, {user?.firstName ?? 'Utilizador'}!
                </Link>
            </div>
        </div>
    );
};

export const TopHeader = React.memo(TopHeaderComponent);