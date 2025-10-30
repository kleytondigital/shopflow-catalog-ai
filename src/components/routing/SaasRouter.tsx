import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { getSubdomainInfo, shouldShowCatalog, shouldShowAdmin } from '@/utils/subdomainRouter';
import { useSubdomainStore } from '@/hooks/useSubdomainStore';
import PublicCatalogPage from '@/pages/PublicCatalogPage';
import SubdomainCatalogPage from '@/pages/SubdomainCatalogPage';
import SubdomainProductPage from '@/pages/SubdomainProductPage';
import { Loader2 } from 'lucide-react';

// Import admin components
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Auth from '@/pages/Auth';

// Import existing admin routes
import Index from '@/pages/Index';
import Settings from '@/pages/Settings';
import Products from '@/pages/Products';
import OrdersImproved from '@/pages/OrdersImproved';
import Customers from '@/pages/Customers';
import Categories from '@/pages/Categories';
import Coupons from '@/pages/Coupons';
import Deliveries from '@/pages/Deliveries';
import Reports from '@/pages/Reports';
import ProductPage from '@/pages/ProductPage';
import OrderTracking from '@/pages/OrderTracking';
import AdminSettings from '@/pages/AdminSettings';
import GlobalIntegrations from '@/pages/GlobalIntegrations';
import Automations from '@/pages/Automations';
import UserManagement from '@/pages/UserManagement';
import Analytics from '@/pages/Analytics';
import AISettings from '@/pages/AISettings';
import Organizations from '@/pages/Organizations';
import Stores from '@/pages/Stores';
import Billing from '@/pages/Billing';
import PlanManagement from '@/pages/PlanManagement';
import Revenue from '@/pages/Revenue';
import Monitoring from '@/pages/Monitoring';

/**
 * Error component for subdomain store loading errors
 */
const SubdomainError: React.FC<{ error: string; subdomain: string }> = ({ error, subdomain }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
      <div className="mb-4">
        <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
      </div>
      
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Loja não encontrada</h1>
      <p className="text-gray-600 mb-4">{error}</p>
      
      <div className="bg-gray-100 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-700">
          <strong>Subdomínio:</strong> <code>{subdomain}.aoseudispor.com.br</code>
        </p>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        <p>Possíveis causas:</p>
        <ul className="list-disc list-inside space-y-1 text-left">
          <li>Subdomínio não foi configurado</li>
          <li>Loja foi desativada</li>
          <li>Configuração de DNS incorreta</li>
        </ul>
      </div>
      
      <div className="mt-6">
        <a 
          href="https://app.aoseudispor.com.br" 
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          Ir para Admin
        </a>
      </div>
    </div>
  </div>
);

/**
 * Subdomain Catalog Router - renders catalog for tenant subdomains
 */
const SubdomainCatalogRouter: React.FC = () => {
  return (
    <Routes>
      {/* Product page route */}
      <Route path="/produto/:productId" element={<SubdomainProductPage />} />
      
      {/* Main catalog route - must be last */}
      <Route path="/*" element={<SubdomainCatalogPage />} />
    </Routes>
  );
};

/**
 * Main App Router - renders admin interface for main domain
 */
const MainAppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Authentication Route */}
      <Route path="/auth" element={<Auth />} />
      
      {/* Dashboard Routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <AppLayout title="Dashboard">
              <Index />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      
      {/* Core Features */}
      <Route 
        path="/products" 
        element={
          <ProtectedRoute>
            <AppLayout 
              title="Produtos" 
              subtitle="Gerencie o catálogo de produtos da sua loja"
            >
              <Products />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/products/:id" 
        element={
          <ProtectedRoute>
            <AppLayout 
              title="Produto" 
              subtitle="Visualizar e editar produto"
            >
              <ProductPage />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/orders" 
        element={
          <ProtectedRoute>
            <AppLayout 
              title="Pedidos" 
              subtitle="Gerencie os pedidos da sua loja"
            >
              <OrdersImproved />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/customers" 
        element={
          <ProtectedRoute>
            <AppLayout 
              title="Clientes" 
              subtitle="Visualize e gerencie seus clientes"
            >
              <Customers />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/categories" 
        element={
          <ProtectedRoute>
            <AppLayout 
              title="Categorias" 
              subtitle="Organize seus produtos em categorias"
            >
              <Categories />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/coupons" 
        element={
          <ProtectedRoute>
            <AppLayout 
              title="Cupons de Desconto" 
              subtitle="Gerencie cupons e promoções da sua loja"
            >
              <Coupons />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/deliveries" 
        element={
          <ProtectedRoute>
            <AppLayout 
              title="Gestão de Entregas" 
              subtitle="Acompanhe e gerencie todas as entregas em andamento"
            >
              <Deliveries />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/reports" 
        element={
          <ProtectedRoute>
            <AppLayout 
              title="Relatórios" 
              subtitle="Análise detalhada do desempenho da sua loja"
            >
              <Reports />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/analytics" 
        element={
          <ProtectedRoute>
            <AppLayout 
              title="Analytics Avançado" 
              subtitle="Análises detalhadas do sistema"
            >
              <Analytics />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Settings */}
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <AppLayout 
              title="Configurações" 
              subtitle="Gerencie as configurações da sua loja"
            >
              <Settings />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Public Catalog Routes (for URL-based access) */}
      <Route path="/catalog/:storeSlug" element={<PublicCatalogPage />} />
      <Route path="/catalog/:storeSlug/*" element={<PublicCatalogPage />} />
      
      {/* Order Tracking - Public */}
      <Route path="/track/:orderId" element={<OrderTracking />} />
      
      {/* Super Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <AppLayout 
              title="Administração" 
              subtitle="Painel de controle administrativo"
            >
              <AdminSettings />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <AppLayout 
              title="Gerenciamento de Usuários" 
              subtitle="Administração de usuários do sistema"
            >
              <UserManagement />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/integrations" 
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <AppLayout 
              title="Integrações Globais" 
              subtitle="Configurações de integrações do sistema"
            >
              <GlobalIntegrations />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/automations" 
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <AppLayout 
              title="Automações" 
              subtitle="Fluxos automatizados do sistema"
            >
              <Automations />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/ai" 
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <AppLayout 
              title="Configurações de IA" 
              subtitle="Configuração dos provedores de IA"
            >
              <AISettings />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/organizations" 
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <AppLayout 
              title="Organizações" 
              subtitle="Gerenciamento de organizações"
            >
              <Organizations />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/stores" 
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <AppLayout 
              title="Lojas" 
              subtitle="Gerenciamento de lojas do sistema"
            >
              <Stores />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/billing" 
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <AppLayout 
              title="Faturamento" 
              subtitle="Controle de cobrança e assinaturas"
            >
              <Billing />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/plans" 
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <AppLayout 
              title="Planos" 
              subtitle="Gerenciamento de planos de assinatura"
            >
              <PlanManagement />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/revenue" 
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <AppLayout 
              title="Receita" 
              subtitle="Análise de receita do sistema"
            >
              <Revenue />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/monitoring" 
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <AppLayout 
              title="Monitoramento" 
              subtitle="Monitoramento do sistema"
            >
              <Monitoring />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Legacy catalog routes for backward compatibility */}
      <Route path="/catalog/:storeSlug" element={<PublicCatalogPage />} />
      <Route path="/catalog/:storeSlug/produto/:productId" element={<PublicCatalogPage />} />
      
      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

/**
 * SaaS Router - intelligent routing based on domain context
 */
export const SaasRouter: React.FC = () => {
  const { isSubdomain, subdomain, isMainApp } = getSubdomainInfo();

  // Debug info in development
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.group('🌐 SaaS Router');
      console.log('Hostname:', window.location.hostname);
      console.log('Is Subdomain:', isSubdomain);
      console.log('Subdomain:', subdomain);
      console.log('Is Main App:', isMainApp);
      console.log('Route Decision:', isSubdomain ? 'Catalog' : 'Admin');
      console.groupEnd();
    }
  }, [isSubdomain, subdomain, isMainApp]);

  // Route to catalog if subdomain, admin if main app
  if (isSubdomain && subdomain) {
    return <SubdomainCatalogRouter />;
  }
  
  if (isMainApp) {
    return <MainAppRouter />;
  }

  // Fallback - shouldn't happen but just in case
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Carregando...</h1>
        <p className="text-gray-600">Detectando configuração do domínio</p>
      </div>
    </div>
  );
};

export default SaasRouter;
