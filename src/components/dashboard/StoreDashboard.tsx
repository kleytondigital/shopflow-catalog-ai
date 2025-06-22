
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import { toast } from 'sonner';

// Componentes da Fase 1
import DashboardCards from './DashboardCards';
import QuickActions from './QuickActions';
import ProtectedNavigationPanel from './ProtectedNavigationPanel';
import ProtectedMobileNavigationPanel from './ProtectedMobileNavigationPanel';
import IntelligentAlerts from './IntelligentAlerts';
import RecentActivityWidget from './RecentActivityWidget';

// Componentes da Fase 2
import DateRangeFilter, { DateRange } from './DateRangeFilter';
import AdvancedMetricsCards from './AdvancedMetricsCards';
import QuickControlCenter from './QuickControlCenter';

// Modal de produto
import ProductFormModal from '@/components/products/ProductFormModal';

const StoreDashboard = () => {
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>('30d');
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
      {/* Filtro de período - Fase 2 */}
      <DateRangeFilter 
        selectedRange={selectedDateRange}
        onRangeChange={setSelectedDateRange}
      />

      {/* Cards principais */}
      <div className="dashboard-grid">
        <DashboardCards userRole={isSuperadmin ? 'superadmin' : 'admin'} />
      </div>

      {/* Métricas avançadas - Fase 2 */}
      <AdvancedMetricsCards dateRange={selectedDateRange} />

      {/* Alertas Inteligentes */}
      <IntelligentAlerts />

      {/* Layout em grid responsivo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1: Atividade Recente */}
        <div className="lg:col-span-1">
          <RecentActivityWidget />
        </div>
        
        {/* Coluna 2: Ações Rápidas */}
        <div className="lg:col-span-1">
          <QuickActions onNewProduct={handleNewProduct} />
        </div>

        {/* Coluna 3: Centro de Controle - Fase 2 */}
        <div className="lg:col-span-1">
          <QuickControlCenter />
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
