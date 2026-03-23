import styles from './Dashboard.module.css';
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context';
import { Users, FileText, CheckCircle, AlertCircle, TrendingUp, Plus, Clock } from 'lucide-react';
import { invoiceService, userService } from '../../services';
import { useNavigate } from 'react-router-dom';

const STATUS_LABELS = { PENDING: 'Pendente', PAID: 'Pago', REJECTED: 'Rejeitado', CANCELLED: 'Cancelado' };
const STATUS_COLOR  = { PENDING: 'orange', PAID: 'green', REJECTED: 'red', CANCELLED: 'gray' };

const StatCard = ({ title, value, icon: Icon, color, loading, sub }) => (
    <div className={`${styles.statCard} ${styles[color]}`}>
        <div className={styles.statInfo}>
            <span className={styles.statTitle}>{title}</span>
            <h2 className={styles.statValue}>{loading ? '...' : value}</h2>
            {sub && <span className={styles.statSub}>{sub}</span>}
        </div>
        <div className={styles.statIcon}>
            <Icon size={22} />
        </div>
    </div>
);

const CompanyAdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchStats = async () => {
            try {
                const [u, inv] = await Promise.all([
                    userService.getAll(),
                    invoiceService.getAll()
                ]);
                setUsers(u);
                setInvoices(inv);
            } catch (err) {
                console.error('Erro ao carregar stats do admin:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [user]);

    const stats = useMemo(() => ({
        totalUsers:      users.length,
        activeUsers:     users.filter(u => u.status === 'ACTIVE').length,
        totalInvoices:   invoices.length,
        pendingInvoices: invoices.filter(i => i.status === 'PENDING').length,
        paidInvoices:    invoices.filter(i => i.status === 'PAID').length,
        rejectedInvoices: invoices.filter(i => i.status === 'REJECTED').length,
    }), [users, invoices]);

    // Bar chart data — invoice volume by status
    const chartData = useMemo(() => {
        const total = stats.totalInvoices || 1;
        return [
            { label: 'Pendentes',  count: stats.pendingInvoices,  pct: (stats.pendingInvoices / total) * 100,  color: '#f59e0b' },
            { label: 'Pagas',      count: stats.paidInvoices,     pct: (stats.paidInvoices / total) * 100,     color: '#22c55e' },
            { label: 'Rejeitadas', count: stats.rejectedInvoices, pct: (stats.rejectedInvoices / total) * 100, color: '#ef4444' },
        ];
    }, [stats]);

    // Recent team activity (latest 6 invoices)
    const recentActivity = useMemo(() =>
        [...invoices]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 6),
        [invoices]
    );

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.dashboardHeader}>
                <div>
                    <h1>Gestão de Empresa</h1>
                    <p>Bem-vindo ao painel da <strong>{user?.company?.name || 'sua empresa'}</strong>, {user?.firstName}</p>
                </div>
                <button className={styles.headerBtn} onClick={() => navigate('/invoices')}>
                    <FileText size={16} /> Nova Fatura
                </button>
            </header>

            {/* Stat cards */}
            <div className={styles.statsGrid}>
                <StatCard title="Utilizadores"     value={stats.totalUsers}      icon={Users}       color="blue"   loading={loading} sub={`${stats.activeUsers} ativos`} />
                <StatCard title="Volume Total"      value={stats.totalInvoices}   icon={FileText}    color="purple" loading={loading} />
                <StatCard title="Pendentes"         value={stats.pendingInvoices} icon={Clock}       color="orange" loading={loading} />
                <StatCard title="Aprovadas (Pagas)" value={stats.paidInvoices}    icon={CheckCircle} color="green"  loading={loading} />
            </div>

            <div className={styles.contentGrid}>
                {/* Invoice Volume Bar Chart */}
                <div className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        <TrendingUp size={18} />
                        <h3>Volume de Faturas por Estado</h3>
                    </div>
                    <div className={styles.barChartWrap}>
                        {chartData.map(bar => (
                            <div key={bar.label} className={styles.barRow}>
                                <span className={styles.barLabel}>{bar.label}</span>
                                <div className={styles.barTrack}>
                                    <div
                                        className={styles.barFill}
                                        style={{
                                            width: loading ? '0%' : `${Math.max(bar.pct, bar.count > 0 ? 2 : 0)}%`,
                                            background: bar.color,
                                            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                    />
                                </div>
                                <span className={styles.barCount}>{loading ? '—' : bar.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent team activity */}
                <div className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        <AlertCircle size={18} />
                        <h3>Atividade Recente da Equipa</h3>
                    </div>
                    <div className={styles.activityList}>
                        {recentActivity.length > 0 ? recentActivity.map(item => (
                            <div key={item.id} className={styles.activityItem} onClick={() => navigate(`/invoices?status=${item.status}`)}>
                                <div className={styles.activityIcon}><FileText size={14} /></div>
                                <div className={styles.activityContent}>
                                    <span className={styles.activityTitle}>
                                        {item.user?.firstName ?? 'Utilizador'} · {item.description || 'Fatura'}
                                    </span>
                                    <span className={styles.activityDate}>
                                        {new Date(item.createdAt).toLocaleDateString('pt-PT')}
                                    </span>
                                </div>
                                <span
                                    className={`${styles.statusBadge} ${styles[STATUS_COLOR[item.status] || 'gray']}`}
                                    style={{ fontSize: 10 }}
                                >
                                    {STATUS_LABELS[item.status] || item.status}
                                </span>
                            </div>
                        )) : (
                            <div className={styles.emptyState}><p>Sem atividade recente.</p></div>
                        )}
                    </div>
                </div>

                {/* Actions card */}
                <div className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        <Plus size={18} />
                        <h3>Ações Rápidas</h3>
                    </div>
                    <div className={styles.actionGrid}>
                        <button className={styles.actionBtn} onClick={() => navigate('/users')}>
                            <Users size={16} /> Convidar Colaborador
                        </button>
                        <button className={styles.actionBtnSecondary} onClick={() => navigate('/users')}>
                            Ver Todos os Membros
                        </button>
                        <button className={styles.actionBtnSecondary} onClick={() => navigate('/invoices')}>
                            Gerir Faturas Pendentes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyAdminDashboard;