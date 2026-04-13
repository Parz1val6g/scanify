import { useEffect, useState } from 'react';
import { FileText, Clock, CheckCircle, Upload, Plus, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Dashboard.module.css';
import { invoiceService } from '../services';

// --- Elite Reusable Components (Local for now, could be extracted) ---

const SkeletonLoader = ({ type }) => (
    <div className={`${type === 'metric' ? styles.statCard : styles.activityItem} ${styles.skeleton}`} 
         style={{ height: type === 'metric' ? '90px' : '60px', width: '100%', marginBottom: type === 'audit' ? '8px' : '0' }} 
    />
);

const MetricCard = ({ title, value, icon: Icon, color, loading, unit = '' }) => (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        className={`${styles.statCard} ${styles[color]}`}
    >
        <div className={styles.statInfo}>
            <span className={styles.statTitle}>{title}</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <h2 className={styles.statValue}>{loading ? '...' : value}</h2>
                {!loading && <span className={styles.statUnit}>{unit}</span>}
            </div>
        </div>
        <div className={styles.statIcon}>
            <Icon size={20} />
        </div>
    </motion.div>
);

export const UserDashboard = () => {
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        processed: 0
    });
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
            } catch (err) {
                console.error("Elite User Dashboard: Fetch Error", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className={styles.dashboardContainer}>
            <motion.header 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={styles.dashboardHeader}
            >
                <h1>O meu Resumo</h1>
                <p>Acompanha as tuas faturas e carregamentos recentes no ecossistema Scanify.</p>
            </motion.header>

            <div className={styles.statsGrid}>
                {loading ? (
                    Array(3).fill(0).map((_, i) => <SkeletonLoader key={i} type="metric" />)
                ) : (
                    <>
                        <MetricCard 
                            title="Minhas Faturas" 
                            value={stats.total} 
                            icon={FileText} 
                            color="blue" 
                            unit="Items"
                        />
                        <MetricCard 
                            title="Em Processamento" 
                            value={stats.pending} 
                            icon={Clock} 
                            color="orange"
                            unit="Fila"
                        />
                        <MetricCard 
                            title="Concluídas" 
                            value={stats.processed} 
                            icon={CheckCircle} 
                            color="green" 
                            unit="OK"
                        />
                    </>
                )}
            </div>

            <div className={styles.contentGrid}>
                <div className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        <History size={18} />
                        <h3>Faturas Recentes</h3>
                    </div>
                    <div className={styles.activityList}>
                        <AnimatePresence>
                            {loading ? (
                                Array(3).fill(0).map((_, i) => <SkeletonLoader key={i} type="audit" />)
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className={styles.emptyState}
                                >
                                    <p>Ainda não carregaste faturas hoje.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className={styles.actionGrid}>
                    <div className={styles.sectionCard}>
                        <div className={styles.sectionHeader}>
                            <Plus size={18} />
                            <h3>Ações Rápidas</h3>
                        </div>
                        <motion.button 
                            className={styles.actionBtn} 
                            onClick={() => window.location.href = '/invoices'}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Upload size={18} />
                            Carregar Nova Fatura
                        </motion.button>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1.5rem', textAlign: 'center' }}>
                            Formatos suportados: JPG, PNG, PDF.<br/>
                            Limite: 5MB por ficheiro.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
