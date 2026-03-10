import React, { Suspense, createContext, useContext, useState, useEffect, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// Contextos e hooks
import { AuthProvider, useAuth, ThemeProvider } from './context';

// Layouts e componentes
import { DashboardLayout } from './layouts';
import { SkeletonBlock, DashboardSkeleton, InvoicesSkeleton } from './components/Skeleton';

// Páginas lazy-loaded
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const InvoiceGeneral = lazy(() => import('./pages/InvoiceGeneral'));
const Login = lazy(() => import('./pages/Login'));
const SignUp = lazy(() => import('./pages/SignUp'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const NotFound = lazy(() => import('./pages/NotFound'));
const SkeletonTest = lazy(() => import('./pages/SkeletonTest'));

const LoaderContext = createContext();

export function useLoader() {
  return useContext(LoaderContext);
}

function LoaderProvider({ children }) {
  const [loading, setLoading] = useState(false);
  // Mantém lógica de skeleton adaptativo para uso futuro, mas não bloqueia render.
  // Suspense é o handler principal de loading.
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
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/skeleton-test" element={<SkeletonTest />} />

              {/* Rota Raiz Condicional & Layout */}
              <Route path="/" element={
                <LoaderProvider>
                  <RootConditional />
                </LoaderProvider>
              }>
                <Route index element={<Dashboard />} />
                <Route path="invoices" element={<InvoiceGeneral />} />
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