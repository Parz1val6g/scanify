import styles from './Dashboard.module.css';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context';
import { 
    Shield, Globe, Activity, Database, Server, 
    LogIn, Settings, AlertTriangle, RefreshCw, 
    UserPlus, ShieldAlert, Cpu, HardDrive
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { userService, invoiceService, systemService, auditService } from '../../services';
import { ConfirmationModal } from '../../components';

// --- Sub-components Elite ---

const SkeletonLoader = ({ type }) => {
    if (type === 'metric') return (
        <div className={`${styles.statCard} ${styles.skeleton}`} style={{ height: '90px' }} />
    );
    if (type === 'audit') return (
        <div className={`${styles.activityItem} ${styles.skeleton}`} style={{ height: '60px', width: '100%', marginBottom: '8px' }} />
    );
    return null;
};

const MetricCard = ({ title, value, icon: Icon, unit = '', trend, status }) => {
    const getStatusClass = () => {
        if (!status) return '';
        return styles[status] || '';
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`${styles.statCard} ${getStatusClass()}`}
        >
            <div className={styles.statInfo}>
                <span className={styles.statTitle}>{title}</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <h2 className={styles.statValue}>{value}</h2>
                    <span className={styles.statUnit}>{unit}</span>
                </div>
            </div>
            <div className={`${styles.statIcon} ${styles[`status${status?.charAt(0).toUpperCase() + status?.slice(1)}`]}`}>
                <Icon size={20} />
            </div>
        </motion.div>
    );
};

const AuditBadge = ({ action }) => {
    const config = {
        'LOGIN': { label: 'Auth', class: styles.badgeAuth, icon: LogIn },
        'LOGOUT': { label: 'Auth', class: styles.badgeAuth, icon: LogIn },
        'CREATE': { label: 'User', class: styles.badgeUser, icon: UserPlus },
        'UPDATE': { label: 'User', class: styles.badgeUser, icon: Settings },
        'ERROR': { label: 'System', class: styles.badgeSystem, icon: ShieldAlert },
        'DEFAULT': { label: 'Audit', class: styles.badgeSystem, icon: Activity }
    };

    const item = config[action] || config['DEFAULT'];
    const Icon = item.icon;

    return (
        <span className={`${styles.statusBadge} ${item.class}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Icon size={10} />
            {item.label}
        </span>
    );
};

const ResourceMeter = ({ label, value, icon: Icon }) => {
    // Lógica Semântica Elite: <70% (Success), 70-89% (Warning), >=90% (Critical)
    const getLevel = (val) => {
        if (!val || val < 70) return 'success';
        if (val < 90) return 'warning';
        return 'critical';
    };

    const level = getLevel(value);
    
    return (
        <div style={{ background: 'var(--bg-hover)', padding: '10px', borderRadius: '10px', textAlign: 'center', transition: 'all 0.5s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
                <span className={`${styles.indicatorDot} ${styles[`indicator${level.charAt(0).toUpperCase() + level.slice(1)}`]}`} />
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
            </div>
            <motion.div 
                animate={level === 'critical' ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                transition={level === 'critical' ? { repeat: Infinity, duration: 1.5 } : {}}
                style={{ color: level === 'critical' ? 'var(--color-error)' : 'var(--color-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
                <Icon size={18} className={level === 'critical' ? styles.pulseIcon : ''} />
                <motion.div 
                    initial={false}
                    animate={{ color: level === 'critical' ? 'var(--color-error)' : level === 'warning' ? 'var(--color-warning)' : 'var(--color-primary)' }}
                    style={{ fontWeight: '800', fontSize: '1.2rem', marginTop: '4px' }}
                >
                    {value || 0}%
                </motion.div>
            </motion.div>
        </div>
    );
};

// --- Dashboard Principal ---

const SuperAdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [recentLogs, setRecentLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMaintenance, setIsMaintenance] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [modalConfig, setModalConfig] = useState({ isOpen: false });

    const fetchData = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const [users, invoices, health, logs] = await Promise.all([
                userService.getAll(),
                invoiceService.getAll(),
                systemService.getHealth(),
                auditService.getLogs({ limit: 8 })
            ]);

            setStats({
                users: users.length,
                invoices: invoices.length,
                health: health.percentage,
                latency: health.dbLatency,
                memory: health.memoryUsage,
                cpu: health.percentage
            });

            setIsMaintenance(health.maintenanceMode);
            setRecentLogs(logs.data);
            setLastUpdated(new Date());
        } catch (err) {
            console.error("Elite Dashboard: Fetch Error", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleToggleMaintenance = async () => {
        const nextState = !isMaintenance;
        try {
            const result = await systemService.toggleMaintenance(nextState);
            setIsMaintenance(result.maintenanceMode);
        } catch (err) {
            console.error("Erro ao alternar manutenção:", err);
            alert("Erro ao alterar o estado de manutenção do sistema.");
        }
    };

    const handleClearCache = async () => {
        setModalConfig({
            isOpen: true,
            title: "Limpar Cache do Sistema",
            message: "Esta ação irá invalidar as sessões temporárias e limpar os buffers de dados. O sistema pode ficar ligeiramente mais lento durante alguns segundos. Desejas continuar?",
            confirmText: "Sim, Limpar Agora",
            icon: RefreshCw,
            onConfirm: async () => {
                await systemService.clearCache();
            }
        });
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => fetchData(true), 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const getHealthStatus = (val) => val > 80 ? 'success' : val > 50 ? 'warning' : 'critical';
    const getLatencyStatus = (val) => val < 50 ? 'success' : val < 150 ? 'warning' : 'critical';
    const isAnyResourceCritical = (stats?.cpu >= 90 || stats?.memory >= 90);

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.dashboardHeader}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <motion.h1 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            Painel de Administração Global
                        </motion.h1>
                        <p>Acesso total ao ecossistema: Gestão de Admins, Auditoria e Recuperação.</p>
                    </div>
                    <div className={styles.lastUpdated} style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        <RefreshCw size={10} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        Última atualização: {lastUpdated.toLocaleTimeString()}
                    </div>
                </div>
            </header>

            <div className={styles.statsGrid}>
                {loading ? (
                    Array(4).fill(0).map((_, i) => <SkeletonLoader key={i} type="metric" />)
                ) : (
                    <>
                        <MetricCard 
                            title="Utilizadores Totais" 
                            value={stats?.users} 
                            icon={Globe} 
                            unit="Ativos"
                        />
                        <MetricCard 
                            title="Volume de Dados" 
                            value={stats?.invoices} 
                            icon={Database} 
                            unit="Faturas"
                        />
                        <MetricCard 
                            title="Saúde do Sistema" 
                            value={stats?.health} 
                            unit="%"
                            status={getHealthStatus(stats?.health)}
                            icon={Activity}
                        />
                        <MetricCard 
                            title="Tempo de Resposta DB" 
                            value={stats?.latency} 
                            unit="ms"
                            status={getLatencyStatus(stats?.latency)}
                            icon={Server}
                        />
                    </>
                )}
            </div>

            <div className={styles.contentGrid}>
                <div className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                        <Activity size={18} />
                        <h3>Auditoria Global</h3>
                    </div>
                    
                    <div className={styles.activityList}>
                        <AnimatePresence mode="popLayout">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => <SkeletonLoader key={i} type="audit" />)
                            ) : recentLogs.map((log, idx) => (
                                <motion.div 
                                    key={log.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={styles.activityItem}
                                    style={{ borderLeft: `3px solid ${log.action === 'ERROR' ? 'var(--color-error)' : 'var(--color-primary)'}` }}
                                >
                                    <div className={styles.activityIcon}>
                                        {log.action === 'LOGIN' ? <LogIn size={16} /> : <Settings size={16} />}
                                    </div>
                                    <div className={styles.activityContent}>
                                        <span className={styles.activityTitle}>
                                            <strong>{log.user?.firstName} {log.user?.lastName}</strong>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '12px', marginLeft: '8px' }}>
                                                realizou {log.action}
                                            </span>
                                        </span>
                                        <span className={styles.activityDate}>
                                            {new Date(log.createdAt).toLocaleString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </span>
                                    </div>
                                    <AuditBadge action={log.action} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                <div className={styles.actionGrid}>
                    <div className={styles.sectionCard}>
                        <div className={styles.sectionHeader}>
                            <Shield size={18} />
                            <h3>Gestão de Admins</h3>
                        </div>
                        <div className={styles.actionGrid} style={{ gap: '8px' }}>
                            <button className={styles.actionBtn}>Convidar Admin</button>
                            <button className={styles.actionBtnSecondary}>Ver Logins Suspeitos</button>
                        </div>
                    </div>

                    <motion.div 
                        animate={isAnyResourceCritical ? { scale: [1, 1.01, 1] } : {}}
                        transition={isAnyResourceCritical ? { repeat: Infinity, duration: 3 } : {}}
                        className={`${styles.sectionCard} ${isAnyResourceCritical ? styles.criticalCardGlow : ''}`}
                    >
                        <div className={styles.sectionHeader}>
                            <Server size={18} />
                            <h3>Recursos de Sistema</h3>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                            <ResourceMeter 
                                label="CPU" 
                                value={stats?.cpu} 
                                icon={Cpu} 
                            />
                            <ResourceMeter 
                                label="MEM" 
                                value={stats?.memory} 
                                icon={HardDrive} 
                            />
                        </div>

                        <div className={styles.actionGrid} style={{ gap: '8px' }}>
                            <button className={styles.actionBtnSecondary} onClick={handleClearCache}>Limpar Cache</button>
                            <button 
                                className={isMaintenance ? styles.actionBtn : styles.actionBtnDanger}
                                onClick={handleToggleMaintenance}
                            >
                                {isMaintenance ? 'Desativar Manutenção' : 'Modo Manutenção'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>

            <ConfirmationModal 
                {...modalConfig} 
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} 
            />
        </div>
    );
};

export default SuperAdminDashboard;