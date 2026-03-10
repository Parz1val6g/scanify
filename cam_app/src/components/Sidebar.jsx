import styles from './Sidebar.module.css';
import { Users, Mail, LogOut } from 'lucide-react'; // already destructured, tree shaking enabled
import { Link } from 'react-router-dom';
import React, { useRef } from 'react';
import { useAuth } from '../context/';

const SidebarComponent = () => {
    const sidebarRef = useRef(null);
    const { logout } = useAuth();
    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };
    return (
        <nav
            id={styles.sidebar}
            ref={sidebarRef}
        >
            <div id={styles.logo}>
                <h2><Link to='/'>{import.meta.env.VITE_APP_NAME || 'Cam App'}</Link></h2>
            </div>
            <div id={styles.options}>
                <Link to='/invoices' className={styles.option}>
                    <Mail />
                    <span>Faturas</span>
                </Link>
                <Link to='/users' className={styles.option}>
                    <Users />
                    <span>Utilizadores</span>
                </Link>
            </div>
            <div id={styles.footer}>
                <div className={styles.logoutBtn} onClick={handleLogout}>
                    <LogOut size={20} />
                    <span>Terminar Sessão</span>
                </div>
            </div>
        </nav>
    );
};

export const Sidebar = React.memo(SidebarComponent);