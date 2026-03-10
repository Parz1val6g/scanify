import styles from './Dashboard.module.css';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Sidebar, TopHeader } from '../components';
import { ChevronRight, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export const DashboardLayout = () => {
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



    return (
        <div id={styles.dashboard}>
            <Sidebar />
            <div id={styles.main}>
                <TopHeader />
                <div id={styles.content}>
                    {/* Se houver imagens, garantir loading="lazy" */}
                    {/* Exemplo: <img src="/src/assets/bg.png" alt="Background" loading="lazy" /> */}
                    <Outlet />
                    <footer className={styles.footerCopyright}>
                        © {new Date().getFullYear()} Joel Martins. Todos os direitos reservados.
                    </footer>
                </div>
            </div>
        </div>
    );
}