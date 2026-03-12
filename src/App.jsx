import React, { Suspense, createContext, useContext, useState, useEffect, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// Contextos e hooks
import { AuthProvider, useAuth, ThemeProvider } from './context';

// Layouts e componentes
import { DashboardLayout } from './layouts';
import { SkeletonBlock, DashboardSkeleton, InvoicesSkeleton } from './components/Skeleton';
import { ProtectedRoute } from './components/ProtectedRoute';

// Páginas lazy-loaded (públicas)
const Login = lazy(() => import('./pages/Login'));
const SignUp = lazy(() => import('./pages/SignUp'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Páginas lazy-loaded (autenticadas)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const InvoiceGeneral = lazy(() => import('./pages/InvoiceGeneral'));
const Profile = lazy(() => import('./pages/Profile'));
const Users = lazy(() => import('./pages/Users'));

const LoaderContext = createContext();

export function useLoader() {
  return useContext(LoaderContext);
}

function LoaderProvider({ children }) {
  const [loading, setLoading] = useState(false);
  return (
    <LoaderContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoaderContext.Provider>
  );
}

function RootConditional() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <InvoicesSkeleton />;
  return isAuthenticated ? <DashboardLayout /> : <Login />;
}

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<InvoicesSkeleton />}>
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Layout autenticado — RootConditional gere o redirect */}
              <Route path="/" element={
                <LoaderProvider>
                  <RootConditional />
                </LoaderProvider>
              }>
                {/* Rotas protegidas dentro do DashboardLayout */}
                <Route element={<ProtectedRoute />}>
                  <Route index element={<Dashboard />} />
                  <Route path="invoices" element={<InvoiceGeneral />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="users" element={<Users />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
