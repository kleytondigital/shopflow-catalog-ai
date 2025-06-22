
import React, { useState } from 'react';
import DashboardCards from './DashboardCards';
import QuickActions from './QuickActions';
import ProtectedNavigationPanel from './ProtectedNavigationPanel';
import ProtectedMobileNavigationPanel from './ProtectedMobileNavigationPanel';
import IntelligentAlerts from './IntelligentAlerts';
import RecentActivityWidget from './RecentActivityWidget';
import ProductFormModal from '@/components/products/ProductFormModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import { toast } from 'sonner';

const StoreDashboard = () => {
  const [showProductModal, setShowProductModal] = useState(false);
  const { isSuperadmin } = useAuth();
  const { createProduct } = useProducts();

  const handleNewProduct = () => {
    setShowProductModal(true);
  };

  const handleCreateProduct = async (data: any) => {
    try {
      const result = await createProduct(data);
      if (result.error) {
        throw new Error(result.error);
      }
      toast.success('Produto criado com sucesso!');
      setShowProductModal(false);
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      toast.error('Erro ao criar produto');
    }
  };

  return (
    <div className="dashboard-container space-y-6 lg:space-y-8">
      {/* Cards principais */}
      <div className="dashboard-grid">
        <DashboardCards userRole={isSuperadmin ? 'superadmin' : 'admin'} />
      </div>

      {/* Alertas Inteligentes */}
      <IntelligentAlerts />

      {/* Seção com Atividade Recente e Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atividade Recente */}
        <RecentActivityWidget />
        
        {/* Ações rápidas - sempre visível */}
        <div>
          <QuickActions onNewProduct={handleNewProduct} />
        </div>
      </div>

      {/* Acesso Rápido - Desktop */}
      <div className="hidden lg:block">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Acesso Rápido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProtectedNavigationPanel />
          </CardContent>
        </Card>
      </div>

      {/* Acesso Rápido - Mobile */}
      <div className="lg:hidden">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Acesso Rápido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProtectedMobileNavigationPanel />
          </CardContent>
        </Card>
      </div>

      {/* Modal para novo produto */}
      <ProductFormModal
        open={showProductModal}
        onOpenChange={setShowProductModal}
        onSubmit={handleCreateProduct}
        mode="create"
      />
    </div>
  );
};

export default StoreDashboard;
