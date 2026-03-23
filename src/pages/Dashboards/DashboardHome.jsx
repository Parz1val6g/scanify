import { useAuth } from '../../context/Auth';
import SuperAdminDashboard from './SuperAdminDashboard';
import CompanyAdminDashboard from './CompanyAdminDashboard';
import UserDashboard from './UserDashboard';
import React from 'react';

const DashboardHome = () => {
    const { user, loading } = useAuth();

    if (loading || !user) return null;

    const dashboards = {
        'SUPER_ADMIN': <SuperAdminDashboard />,
        'COMPANY_ADMIN': <CompanyAdminDashboard />,
        'USER': <UserDashboard />
    };

    const SpecificDashboard = dashboards[user?.role] || <UserDashboard />;

    return (
        <React.Fragment>
            {SpecificDashboard}
        </React.Fragment>
    );
}

export default DashboardHome;