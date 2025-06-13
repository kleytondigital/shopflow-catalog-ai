
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ProtectedLayout } from '@/components/auth/ProtectedLayout';

// Pages
import Auth from '@/pages/Auth';
import Index from '@/pages/Index';
import Products from '@/pages/Products';
import Orders from '@/pages/Orders';
import Coupons from '@/pages/Coupons';
import Customers from '@/pages/Customers';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import UserManagement from '@/pages/UserManagement';
import Catalog from '@/pages/Catalog';
import NotFound from '@/pages/NotFound';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Rota pública de autenticação */}
          <Route 
            path="/auth" 
            element={
              <ProtectedLayout requireAuth={false}>
                <Auth />
              </ProtectedLayout>
            } 
          />
          
          {/* Catálogo público */}
          <Route 
            path="/catalog/:storeSlug" 
            element={
              <ProtectedLayout requireAuth={false}>
                <Catalog />
              </ProtectedLayout>
            } 
          />
          
          {/* Rotas protegidas do dashboard */}
          <Route 
            path="/" 
            element={
              <ProtectedLayout>
                <Index />
              </ProtectedLayout>
            } 
          />
          
          <Route 
            path="/products" 
            element={
              <ProtectedLayout>
                <Products />
              </ProtectedLayout>
            } 
          />
          
          <Route 
            path="/orders" 
            element={
              <ProtectedLayout>
                <Orders />
              </ProtectedLayout>
            } 
          />
          
          <Route 
            path="/coupons" 
            element={
              <ProtectedLayout>
                <Coupons />
              </ProtectedLayout>
            } 
          />
          
          <Route 
            path="/customers" 
            element={
              <ProtectedLayout>
                <Customers />
              </ProtectedLayout>
            } 
          />
          
          <Route 
            path="/reports" 
            element={
              <ProtectedLayout>
                <Reports />
              </ProtectedLayout>
            } 
          />
          
          <Route 
            path="/settings" 
            element={
              <ProtectedLayout>
                <Settings />
              </ProtectedLayout>
            } 
          />
          
          {/* Rota apenas para superadmins */}
          <Route 
            path="/admin/users" 
            element={
              <ProtectedLayout allowedRoles={['superadmin']}>
                <UserManagement />
              </ProtectedLayout>
            } 
          />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
