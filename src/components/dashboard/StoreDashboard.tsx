import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { toast } from "sonner";

// Componentes da Fase 1
import DashboardCards from "./DashboardCards";
import QuickActions from "./QuickActions";
import ProtectedNavigationPanel from "./ProtectedNavigationPanel";
import ProtectedMobileNavigationPanel from "./ProtectedMobileNavigationPanel";
import IntelligentAlerts from "./IntelligentAlerts";
import RecentActivityWidget from "./RecentActivityWidget";

// Componentes da Fase 2
import DateRangeFilter, { DateRange } from "./DateRangeFilter";
import AdvancedMetricsCards from "./AdvancedMetricsCards";
import QuickControlCenter from "./QuickControlCenter";

// Modal de produto
import ProductFormModal from "@/components/products/ProductFormModal";

// Importar novos componentes da Fase 3
import PredictiveAnalytics from "./PredictiveAnalytics";
import SmartAutomationHub from "./SmartAutomationHub";
import CustomReportsBuilder from "./CustomReportsBuilder";
import AdvancedIntegrationPanel from "./AdvancedIntegrationPanel";
import { BenefitGate } from "@/components/billing/BenefitGate";

const StoreDashboard = () => {
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>("30d");
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
      toast.success("Produto criado com sucesso!");
      setShowProductModal(false);
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      toast.error("Erro ao criar produto");
    }
  };

  return (
    <div className="w-full h-full">
      <div className="w-full space-y-6">
        {/* Filtro de período - Fase 2 */}
        <div className="w-full">
          <DateRangeFilter
            selectedRange={selectedDateRange}
            onRangeChange={setSelectedDateRange}
          />
        </div>

        {/* Cards principais - Grid responsivo melhorado */}
        <div className="w-full">
          <DashboardCards userRole={isSuperadmin ? "superadmin" : "admin"} />
        </div>

        {/* Métricas avançadas - Fase 2 */}
        <div className="w-full">
          <AdvancedMetricsCards dateRange={selectedDateRange} />
        </div>

        {/* Alertas Inteligentes */}
        <div className="w-full">
          <IntelligentAlerts />
        </div>

        {/* Layout em grid responsivo melhorado */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
          {/* Atividade Recente */}
          <div className="xl:col-span-1 w-full">
            <RecentActivityWidget />
          </div>

          {/* Ações Rápidas */}
          <div className="xl:col-span-1 w-full">
            <QuickActions onNewProduct={handleNewProduct} />
          </div>

          {/* Centro de Controle - Fase 2 */}
          <div className="xl:col-span-1 w-full">
            <QuickControlCenter />
          </div>
        </div>

        {/* FASE 3 - Funcionalidades Premium/Enterprise */}
        <BenefitGate
          benefitKey="dedicated_support"
          customMessage="As funcionalidades avançadas de análise e automação estão disponíveis apenas nos planos Premium e Enterprise."
        >
          <div className="space-y-6 w-full">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Painel Executivo Avançado
            </h3>

            {/* Análise Preditiva e Automações */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
              <PredictiveAnalytics />
              <SmartAutomationHub />
            </div>

            {/* Relatórios Personalizados e Integrações */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
              <CustomReportsBuilder />
              <AdvancedIntegrationPanel />
            </div>
          </div>
        </BenefitGate>

        {/* Acesso Rápido - Desktop */}
        <div className="hidden lg:block w-full">
          <Card className="border-0 shadow-sm">
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
        <div className="lg:hidden w-full">
          <Card className="border-0 shadow-sm">
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
    </div>
  );
};

export default StoreDashboard;
