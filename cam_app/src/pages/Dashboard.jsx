import styles from './Dashboard.module.css';
import { useEffect, useState } from 'react';
import { useAuth } from '../context';
import { SkeletonBlock } from '../components/Skeleton';

function DashboardSkeleton() {
    return (
        <div className={styles.dashboardStats}>
            <SkeletonBlock className="statCard" style={{ height: 80, width: 180, marginRight: 24 }} />
            <SkeletonBlock className="statCard" style={{ height: 80, width: 180 }} />
        </div>
    );
}

export const Dashboard = () => {
    const { getToken, user } = useAuth();
    const [stats, setStats] = useState({ invoice_count: 0, invoice_total: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = getToken();
                const res = await fetch('/api/invoices', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const invoices = await res.json();
                const invoice_count = invoices.length;
                const invoice_total = invoices.filter(inv => inv.status === 'PENDING').length;
                setStats({ invoice_count, invoice_total });
            } catch (err) {
                setStats({ invoice_count: 0, invoice_total: 0 });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [getToken]);

    if (loading) return <DashboardSkeleton />;

    return (
        <div className={styles.dashboardStats}>
            <div className={styles.statCard}>
                <h2>Nº Faturas</h2>
                <span>{stats.invoice_count}</span>
            </div>
            <div className={styles.statCard}>
                <h2>Total Pendente</h2>
                <span>{stats.invoice_total}</span>
            </div>
        </div>
    );
}

export default Dashboard;