import styles from './Dashboard.module.css';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context';
import { Users, FileText, CheckCircle, AlertCircle, TrendingUp, Plus } from 'lucide-react';
import { invoiceService, userService } from '../../services';

const StatCard = ({ title, value, icon: Icon, color, loading }) => (
    <div className={`${styles.statCard} ${styles[color]}`}>
        <div className={styles.statInfo}>
            <span className={styles.statTitle}>{title}</span>
            <h2 className={styles.statValue}>{loading ? '...' : value}</h2>
        </div>
        <div className={styles.statIcon}>
            <Icon size={24} />
        </div>
    </div>
);

const CompanyAdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalInvoices: 0,
        pendingInvoices: 0,
        activeUsers: 0
    });
    const [teamActivity, setTeamActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [users, invoices] = await Promise.all([
                    userService.getAll(),
                    invoiceService.getAll()
                ]);

                setStats({
                    totalUsers: users.length,
                    activeUsers: users.filter(u => u.status === 'ACTIVE').length,
                    totalInvoices: invoices.length,
                    pendingInvoices: invoices.filter(i => i.status === 'PENDING').length
                });

                // Sort and take latest 5 for team activity
                const sorted = [...invoices].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setTeamActivity(sorted.slice(0, 5));
            } catch (err) {
                console.error("Erro ao carregar stats do admin:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.dashboardHeader}>
                <h1>Gestão de Empresa</h1>
                <p>Gestão total da empresa {user?.company?.name || 'Scanify'} e dos seus membros.</p>
            </header>

            <div className={styles.statsGrid}>
                <StatCard 
                    title="Utilizadores" 
                    value={stats.totalUsers} 
                    icon={Users} 
                    color="blue" 
                    loading={loading}
                />
                <StatCard 
                    title="Contas Ativas" 
                    value={stats.activeUsers} 
                    icon={CheckCircle} 
                    color="green" 
                    loading={loading}
                />
                <StatCard 
                    title="Volume Faturas" 
                    value={stats.totalInvoices} 
                    icon={FileText} 
                    color="purple" 
                    loading={loading}
                />
                <StatCard 
                    title="Pendentes" 
                    value={stats.pendingInvoices} 
                    icon={AlertCircle} 
                    color="orange" 
                    loading={loading}
                />
            </div>

            <div className={styles.contentGrid}>
                <div className={styles.sectionCard}>
                    <div className={styles.activityList}>
                        {teamActivity.length > 0 ? (
                            teamActivity.map(item => (
                                <div key={item.id} className={styles.activityItem}>
                                    <div className={styles.activityIcon}>
                                        <FileText size={16} />
                                    </div>
                                    <div className={styles.activityContent}>
                                        <span className={styles.activityTitle}>
                                            {item.user?.firstName} carregou uma fatura
                                        </span>
                                        <span className={styles.activityDate}>
                                            {new Date(item.createdAt).toLocaleDateString('pt-PT')} - {item.description || "Fatura"}
                                        </span>
                                    </div>
                                    <span className={`${styles.statusBadge} ${styles[item.status?.toLowerCase()]}`}>
                                        {item.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className={styles.emptyState}>
                                <p>Sem atividade recente na equipa.</p>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        <Users size={20} />
                        <h3>Gestão de Membros</h3>
                    </div>
                    <div className={styles.actionGrid}>
                        <button className={styles.actionBtn} onClick={() => window.location.href = '/users'}>
                            <Plus size={18} />
                            Convidar Colaborador
                        </button>
                        <button className={styles.actionBtnSecondary} onClick={() => window.location.href = '/users'}>
                            Listar Todos os Membros
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyAdminDashboard;