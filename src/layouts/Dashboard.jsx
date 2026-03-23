
import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import { Sidebar } from '../components/Sidebar';
import { TopHeader } from '../components/TopHeader';
import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

export const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className={styles.dashboardRoot}>
            {/* Sidebar Desktop & Drawer Mobile Backdrop */}
            {isMobile && (
                <div 
                    className={`${styles.sidebarBackdrop} ${sidebarOpen ? styles.backdropOpen : ''}`} 
                    onClick={closeSidebar}
                />
            )}

            <AnimatePresence>
                {(sidebarOpen || !isMobile) && (
                    <Sidebar
                        isOpen={sidebarOpen || !isMobile}
                        onClose={closeSidebar}
                        mobile={isMobile}
                    />
                )}
            </AnimatePresence>
            <div className={styles.mainArea}>
                <TopHeader onMenuClick={toggleSidebar} />
                <main className={styles.contentArea}>
                    <Outlet />
                    <footer className={styles.footerCopyright}>
                        © {new Date().getFullYear()} Joel Martins. Todos os direitos reservados.
                    </footer>
                </main>
            </div>
        </div>
    );
};