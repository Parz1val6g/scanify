import styles from './Dashboard.module.css';
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context';
import { FileText, Clock, CheckCircle, XCircle, Upload, TrendingUp, AlertTriangle } from 'lucide-react';
import { invoiceService } from '../../services';
import { useNavigate } from 'react-router-dom';

const STATUS_LABELS = {
    PENDING:  'Pendente',
    PAID:     'Pago',
    REJECTED: 'Rejeitado',
    CANCELLED:'Cancelado'
};

const STATUS_COLOR = {
    PENDING:  'orange',
    PAID:     'green',
    REJECTED: 'red',
    CANCELLED:'gray'
};

const StatCard = ({ title, value, icon: Icon, color, loading, sub }) => (
    <div className={`${styles.statCard} ${styles[color]}`}>
        <div className={styles.statInfo}>
            <span className={styles.statTitle}>{title}</span>
            <h2 className={styles.statValue}>{loading ? '—' : value}</h2>
            {sub && <span className={styles.statSub}>{sub}</span>}
        </div>
        <div className={styles.statIcon}>
            <Icon size={22} />
        </div>
    </div>
);

const UserDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchStats = async () => {
            try {
                const data = await invoiceService.getAll();
                setInvoices(data);
            } catch (err) {
                console.error('Erro ao carregar faturas:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [user]);

    const stats = useMemo(() => ({
        total:    invoices.length,
        pending:  invoices.filter(i => i.status === 'PENDING').length,
        paid:     invoices.filter(i => i.status === 'PAID').length,
        rejected: invoices.filter(i => i.status === 'REJECTED').length,
    }), [invoices]);

    // Most recent 5 invoices for the activity table to save space
    const recentInvoices = useMemo(() =>
        [...invoices]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5),
        [invoices]
    );

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.dashboardHeaderCompact}>
                <div className={styles.headerTextWrap}>
                    <h1>O Meu Painel</h1>
                    <p>Bem-vindo, <strong>{user?.firstName}</strong> — acompanha as tuas faturas eletrónicas.</p>
                </div>
                <button className={styles.headerBtn} onClick={() => navigate('/invoices')}>
                    <Upload size={16} /> Nova Fatura
                </button>
            </header>

            <div className={styles.zeroScrollGrid}>
                {/* ── Left Column (2fr) ── */}
                <aside className={styles.gridLeft}>
                    {/* Compact stat cards */}
                    <div className={styles.statsGridCompact}>
                        <StatCard title="As Minhas Faturas"      value={stats.total}    icon={FileText}    color="blue"   loading={loading} />
                        <StatCard title="Pendentes de Validação" value={stats.pending}  icon={Clock}       color="orange" loading={loading} sub={stats.pending > 0 ? 'requer atenção' : 'em dia'} />
                        <StatCard title="Aprovadas"            value={stats.paid}     icon={CheckCircle} color="green"  loading={loading} />
                        <StatCard title="Rejeitadas"           value={stats.rejected} icon={XCircle}     color="red"    loading={loading} />
                    </div>

                    {/* Table matches width of cards above it */ }
                    <div className={styles.sectionCardFlex}>
                        <div className={styles.sectionHeaderCompact}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FileText size={16} />
                                <h3>Faturas Recentes</h3>
                            </div>
                            <button className={styles.sectionLink} onClick={() => navigate('/invoices')}>
                                Ver todas →
                            </button>
                        </div>

                        {recentInvoices.length > 0 ? (
                            <div className={styles.invoiceTableCompact}>
                                <div className={styles.tableHeaderCompact}>
                                    <span>Descrição</span>
                                    <span>Data</span>
                                    <span style={{ textAlign: 'center' }}>Estado</span>
                                </div>
                                {recentInvoices.map(inv => (
                                    <div key={inv.id} className={styles.tableRowClickable} style={{ padding: '7px 12px' }} onClick={() => navigate(`/invoices?status=${inv.status}`)}>
                                        <span className={styles.tableCell}>{inv.description || 'Fatura sem descrição'}</span>
                                        <span className={styles.tableMeta}>
                                            {new Date(inv.createdAt).toLocaleDateString('pt-PT')}
                                        </span>
                                        <span style={{ textAlign: 'center' }} className={`${styles.statusBadge} ${styles[STATUS_COLOR[inv.status] || 'gray']}`}>
                                            {STATUS_LABELS[inv.status] || inv.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.emptyStateCompact}>
                                <p>Nenhuma fatura submetida. Usa o botão acima para carregar.</p>
                            </div>
                        )}
                    </div>
                </aside>

                {/* ── Right Column (1fr) ── */}
                <aside className={styles.gridRight}>
                    {/* Quick actions */}
                    <div className={styles.sectionCardCompact}>
                        <div className={styles.sectionHeaderCompact}>
                            <TrendingUp size={16} />
                            <h3>Ações Rápidas</h3>
                        </div>
                        <div className={styles.actionGridCompact}>
                            <button className={styles.actionBtn} style={{ padding: '10px' }} onClick={() => navigate('/invoices')}>
                                <Upload size={15} /> Carregar Nova Fatura
                            </button>
                            {stats.pending > 0 && (
                                <button className={`${styles.actionBtn} ${styles.actionBtnWarning}`} style={{ padding: '10px' }} onClick={() => navigate('/invoices?status=PENDING')}>
                                    <AlertTriangle size={15} /> {stats.pending} Pendente{stats.pending !== 1 ? 's' : ''}
                                </button>
                            )}
                            <p className={styles.actionTip}>Formatos permitidos: JPG, PNG, PDF</p>
                        </div>
                    </div>

                    {/* OCR Information Widget directly stacked */}
                    <div className={styles.ocrInfoWidget}>
                        <div className={styles.ocrInfoHeader}>
                            <CheckCircle size={15} color="var(--color-primary)" />
                            <h4>Status de Submissão</h4>
                        </div>
                        <p className={styles.ocrInfoText}>
                            As suas faturas submetidas são triadas automaticamente pelo nosso motor <strong>OCR</strong> (Reconhecimento Ótico). Elas permanecerão no estado <em>Pendente</em> até aprovação humana final.
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default UserDashboard;