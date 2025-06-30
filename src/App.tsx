
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Auth from './pages/Auth';
import Index from './pages/Index';
import Products from './pages/Products';
import VariationGroups from './pages/VariationGroups';
import Categories from './pages/Categories';
import OrdersImproved from './pages/OrdersImproved';
import ProtectedCoupons from './pages/ProtectedCoupons';
import ProtectedDeliveries from './pages/ProtectedDeliveries';
import Customers from './pages/Customers';
import ProtectedReports from './pages/ProtectedReports';
import Settings from './pages/Settings';
import Billing from './pages/Billing';
import Stores from './pages/Stores';
import UserManagement from './pages/UserManagement';
import PlanManagement from './pages/PlanManagement';
import GlobalIntegrations from './pages/GlobalIntegrations';
import Shipping from './pages/Shipping';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import PaymentPending from './pages/PaymentPending';
import NotFound from './pages/NotFound';
import ResponsiveAppLayout from './components/layout/ResponsiveAppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicCatalog from './components/catalog/PublicCatalog';

const queryClient = new QueryClient();

function App() {
  return (
    <TooltipProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Toaster />
          <Sonner />

          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failure" element={<PaymentFailure />} />
            <Route path="/payment/pending" element={<PaymentPending />} />
            <Route path="/catalog/:storeSlug" element={<PublicCatalog storeIdentifier="" />} />
          
            <Route element={
              <ProtectedRoute>
                <ResponsiveAppLayout title="" subtitle="">
                  <Outlet />
                </ResponsiveAppLayout>
              </ProtectedRoute>
            }>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/variation-groups" element={<VariationGroups />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/orders" element={<OrdersImproved />} />
              <Route path="/protected-coupons" element={<ProtectedCoupons />} />
              <Route path="/protected-deliveries" element={<ProtectedDeliveries />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/protected-reports" element={<ProtectedReports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/shipping" element={<Shipping />} />
            </Route>
            
            <Route element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <ResponsiveAppLayout title="" subtitle="">
                  <Outlet />
                </ResponsiveAppLayout>
              </ProtectedRoute>
            }>
              <Route path="/stores" element={<Stores />} />
              <Route path="/user-management" element={<UserManagement />} />
              <Route path="/plan-management" element={<PlanManagement />} />
              <Route path="/global-integrations" element={<GlobalIntegrations />} />
            </Route>
          
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </TooltipProvider>
  );
}

export default App;
