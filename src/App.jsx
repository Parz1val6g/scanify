import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Contextos e hooks
import { AuthProvider, useAuth, ThemeProvider } from './context';

// Layouts e componentes
import { DashboardLayout } from './layouts';
import { InvoicesSkeleton } from './components/Skeleton';
import { ProtectedRoute } from './components/ProtectedRoute';

// Páginas lazy-loaded
const Login = lazy(() => import('./pages/Login'));
const SignUp = lazy(() => import('./pages/SignUp'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Dashboard = lazy(() => import('./pages/Dashboards/DashboardHome'));
const InvoiceList = lazy(() => import('./pages/Invoices/InvoiceList'));
const Profile = lazy(() => import('./pages/Profile/UserProfile'));
const UserList = lazy(() => import('./pages/Users/UserList'));

function RootConditional() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <InvoicesSkeleton />;
  return isAuthenticated ? <DashboardLayout /> : <Login />;
}


function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<InvoicesSkeleton />}>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Layout Base de Administração */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="invoices" element={<InvoiceList />} />
              <Route path="profile" element={<Profile />} />
              <Route element={<ProtectedRoute allowedRoles={['COMPANY_ADMIN', 'SUPER_ADMIN']} />}>
                <Route path="users" element={<UserList />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
