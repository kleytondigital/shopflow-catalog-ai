import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { getSubdomainInfo, shouldShowCatalog, shouldShowAdmin } from '@/utils/subdomainRouter';
import { useSubdomainStore } from '@/hooks/useSubdomainStore';
import PublicCatalogPage from '@/pages/PublicCatalogPage';
import SubdomainCatalogPage from '@/pages/SubdomainCatalogPage';
import { Loader2 } from 'lucide-react';

// Import existing admin routes (we'll keep the same structure)
import Index from '@/pages/Index';
import Settings from '@/pages/Settings';
import Products from '@/pages/Products';
import OrdersImproved from '@/pages/OrdersImproved';
import Customers from '@/pages/Customers';
import Categories from '@/pages/Categories';
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
      {/* All paths lead to catalog for subdomain */}
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
      {/* Dashboard Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      
      {/* Core Features */}
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductPage />} />
      <Route path="/orders" element={<OrdersImproved />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/analytics" element={<Analytics />} />
      
      {/* Settings */}
      <Route path="/settings" element={<Settings />} />
      
      {/* Public Catalog Routes (for URL-based access) */}
      <Route path="/catalog/:storeSlug" element={<PublicCatalogPage />} />
      <Route path="/catalog/:storeSlug/*" element={<PublicCatalogPage />} />
      
      {/* Order Tracking */}
      <Route path="/track/:orderId" element={<OrderTracking />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminSettings />} />
      <Route path="/admin/users" element={<UserManagement />} />
      <Route path="/admin/integrations" element={<GlobalIntegrations />} />
      <Route path="/admin/automations" element={<Automations />} />
      <Route path="/admin/ai" element={<AISettings />} />
      <Route path="/admin/organizations" element={<Organizations />} />
      <Route path="/admin/stores" element={<Stores />} />
      <Route path="/admin/billing" element={<Billing />} />
      <Route path="/admin/plans" element={<PlanManagement />} />
      <Route path="/admin/revenue" element={<Revenue />} />
      <Route path="/admin/monitoring" element={<Monitoring />} />
      
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
