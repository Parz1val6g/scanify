// import { useEffect, useState } from 'react';
// import { Users, FileText, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
// import styles from './Dashboard.module.css';
// import { invoiceService, userService } from '../services';

// const StatCard = ({ title, value, icon: Icon, color, loading }) => (
//     <div className={`${styles.statCard} ${styles[color]}`}>
//         <div className={styles.statInfo}>
//             <span className={styles.statTitle}>{title}</span>
//             <h2 className={styles.statValue}>{loading ? '...' : value}</h2>
//         </div>
//         <div className={styles.statIcon}>
//             <Icon size={24} />
//         </div>
//     </div>
// );

// export const AdminDashboard = () => {
//     const [stats, setStats] = useState({
//         totalUsers: 0,
//         totalInvoices: 0,
//         pendingInvoices: 0,
//         activeUsers: 0
//     });
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchStats = async () => {
//             try {
//                 const [users, invoices] = await Promise.all([
//                     userService.getAll(),
//                     invoiceService.getAll()
//                 ]);

//                 setStats({
//                     totalUsers: users.length,
//                     activeUsers: users.filter(u => u.status === 'ACTIVE').length,
//                     totalInvoices: invoices.length,
//                     pendingInvoices: invoices.filter(i => i.status === 'PENDING').length
//                 });
//             } catch (err) {
//                 console.error("Erro ao carregar stats do admin:", err);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchStats();
//     }, []);

//     return (
//         <div className={styles.dashboardContainer}>
//             <header className={styles.dashboardHeader}>
//                 <h1>Gestão Operacional</h1>
//                 <p>Visão geral do sistema e métricas críticas da empresa.</p>
//             </header>

//             <div className={styles.statsGrid}>
//                 <StatCard 
//                     title="Utilizadores Totais" 
//                     value={stats.totalUsers} 
//                     icon={Users} 
//                     color="blue" 
//                     loading={loading}
//                 />
//                 <StatCard 
//                     title="Contas Ativas" 
//                     value={stats.activeUsers} 
//                     icon={CheckCircle} 
//                     color="green" 
//                     loading={loading}
//                 />
//                 <StatCard 
//                     title="Volume Faturas" 
//                     value={stats.totalInvoices} 
//                     icon={FileText} 
//                     color="purple" 
//                     loading={loading}
//                 />
//                 <StatCard 
//                     title="Pendentes de Revisão" 
//                     value={stats.pendingInvoices} 
//                     icon={AlertCircle} 
//                     color="orange" 
//                     loading={loading}
//                 />
//             </div>

//             <div className={styles.contentGrid}>
//                 <div className={styles.recentActivity}>
//                     <div className={styles.sectionHeader}>
//                         <TrendingUp size={20} />
//                         <h3>Tendências do Mês</h3>
//                     </div>
//                     <div className={styles.emptyState}>
//                         <p>Gráficos de tendência em processamento...</p>
//                     </div>
//                 </div>
                
//                 <div className={styles.systemAlerts}>
//                     <div className={styles.sectionHeader}>
//                         <AlertCircle size={20} />
//                         <h3>Alertas de Sistema</h3>
//                     </div>
//                     <ul className={styles.alertList}>
//                         <li className={styles.alertItem}>
//                             <span className={styles.alertDot}></span>
//                             Sincronização com o banco de dados OK
//                         </li>
//                         <li className={styles.alertItem}>
//                             <span className={styles.alertDot}></span>
//                             Audit Log ativo e a registar eventos
//                         </li>
//                     </ul>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default AdminDashboard;
