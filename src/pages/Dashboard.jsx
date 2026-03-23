// import styles from './Dashboard.module.css';
// import { useEffect, useState } from 'react';
// import { useAuth } from '../context';
// import { SkeletonBlock } from '../components/Skeleton';

// function DashboardSkeleton() {
//     return (
//         <div className={styles.dashboardStats}>
//             <SkeletonBlock className="statCard" style={{ height: 80, width: 180, marginRight: 24 }} />
//             <SkeletonBlock className="statCard" style={{ height: 80, width: 180 }} />
//         </div>
//     );
// }

// export const Dashboard = () => {
//     const { user } = useAuth();
    
//     // Admins (COMPANY_ADMIN ou SUPER_ADMIN) vêem o dashboard operacional
//     const isAdmin = user?.role === 'COMPANY_ADMIN' || user?.role === 'SUPER_ADMIN';

//     if (isAdmin) {
//         return <AdminDashboard />;
//     }

//     return <UserDashboard />;
// }

// export default Dashboard;