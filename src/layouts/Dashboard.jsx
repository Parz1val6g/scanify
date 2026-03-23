
import React, { useState } from 'react';
import styles from './Dashboard.module.css';
import { Sidebar } from '../components/Sidebar';
import { TopHeader } from '../components/TopHeader';
import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

export const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen((open) => !open);

    return (
        <div className={styles.dashboardRoot}>
            {/* Sidebar Desktop & Drawer Mobile */}
            <AnimatePresence>
                {(sidebarOpen || window.innerWidth >= 1024) && (
                    <Sidebar
                        isOpen={sidebarOpen || window.innerWidth >= 1024}
                        onClose={toggleSidebar}
                        mobile={window.innerWidth < 1024}
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