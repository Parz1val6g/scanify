import styles from './Dashboard.module.css';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context';
import { FileText, Clock, CheckCircle, Upload, Plus } from 'lucide-react';
import { invoiceService } from '../../services';

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

const UserDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        processed: 0
    });
    const [recentInvoices, setRecentInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const invoices = await invoiceService.getAll();
                setStats({
                    total: invoices.length,
                    pending: invoices.filter(i => i.status === 'PENDING').length,
                    processed: invoices.filter(i => i.status === 'PROCESSED').length
                });
                // Sort by date and take latest 5
                const sorted = [...invoices].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setRecentInvoices(sorted.slice(0, 5));
            } catch (err) {
                console.error("Erro ao carregar stats do utilizador:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.dashboardHeader}>
                <h1>O meu Resumo</h1>
                <p>Bem-vindo ao seu acesso individual. Acompanhe as suas faturas e atividade pessoal.</p>
            </header>

            <div className={styles.statsGrid}>
                <StatCard 
                    title="Minhas Faturas" 
                    value={stats.total} 
                    icon={FileText} 
                    color="blue" 
                    loading={loading}
                />
                <StatCard 
                    title="Em Processamento" 
                    value={stats.pending} 
                    icon={Clock} 
                    color="orange" 
                    loading={loading}
                />
                <StatCard 
                    title="Concluídas" 
                    value={stats.processed} 
                    icon={CheckCircle} 
                    color="green" 
                    loading={loading}
                />
            </div>

            <div className={styles.contentGrid}>
                <div className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        <FileText size={20} />
                        <h3>Faturas Recentes</h3>
                    </div>
                    <div className={styles.activityList}>
                        {recentInvoices.length > 0 ? (
                            recentInvoices.map(inv => (
                                <div key={inv.id} className={styles.activityItem}>
                                    <div className={styles.activityIcon}>
                                        <FileText size={16} />
                                    </div>
                                    <div className={styles.activityContent}>
                                        <span className={styles.activityTitle}>{inv.description || "Fatura sem descrição"}</span>
                                        <span className={styles.activityDate}>
                                            {new Date(inv.createdAt).toLocaleDateString('pt-PT')}
                                        </span>
                                    </div>
                                    <span className={`${styles.statusBadge} ${styles[inv.status?.toLowerCase()]}`}>
                                        {({
                                            'PENDING': 'Pendente',
                                            'PAID': 'Pago',
                                            'CANCELLED': 'Cancelado',
                                            'REJECTED': 'Rejeitado',
                                            'PROCESSED': 'Processado'
                                        })[inv.status] || inv.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className={styles.emptyState}>
                                <p>Ainda não carregaste faturas hoje.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        <Plus size={20} />
                        <h3>Ações Rápidas</h3>
                    </div>
                    <button className={styles.actionBtn} onClick={() => window.location.href = '/invoices'}>
                        <Upload size={18} />
                        Carregar Nova Fatura
                    </button>
                    <p className={styles.actionTip}>
                        Formatos suportados: JPG, PNG, PDF
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;