
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Target, Gift, ShoppingBag } from "lucide-react";
import { useCatalogSettings } from "@/hooks/useCatalogSettings";
import { useStorePriceModel } from "@/hooks/useStorePriceModel";

interface CartIncentivesBannerProps {
  items: any[];
  totalAmount: number;
  storeId?: string;
  onAddMoreItems?: () => void;
}

const CartIncentivesBanner: React.FC<CartIncentivesBannerProps> = ({
  items,
  totalAmount,
  storeId,
  onAddMoreItems,
}) => {
  const { settings } = useCatalogSettings(storeId);
  const { priceModel } = useStorePriceModel(storeId);
  
  const catalogMode = settings?.catalog_mode || 'separated';
  const modelKey = priceModel?.price_model || "retail_only";

  // Calcular estatísticas do carrinho
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueProducts = items.length;

  // Função para calcular incentivos baseados no modelo
  const getIncentives = () => {
    switch (modelKey) {
      case "gradual_wholesale":
        return getGradualWholesaleIncentives();
      case "simple_wholesale":
        return getSimpleWholesaleIncentives();
      case "wholesale_only":
        return getWholesaleOnlyIncentives();
      default:
        return getRetailOnlyIncentives();
    }
  };

  const getGradualWholesaleIncentives = () => {
    // Analisar itens que podem subir de nível
    const itemsWithNextTier = items.filter(item => item.nextTierHint && item.nextTierQuantityNeeded > 0);
    
    if (itemsWithNextTier.length > 0) {
      const totalPotentialSavings = itemsWithNextTier.reduce(
        (sum, item) => sum + (item.nextTierPotentialSavings || 0) * item.nextTierQuantityNeeded,
        0
      );
      
      return {
        type: "gradual",
        title: "🎯 Desbloqueie Mais Descontos!",
        message: `${itemsWithNextTier.length} produto(s) podem atingir o próximo nível de desconto`,
        action: `Economize até R$ ${totalPotentialSavings.toFixed(2).replace(".", ",")} adicionando mais itens`,
        color: "blue",
        icon: TrendingUp
      };
    }
    
    return {
      type: "gradual",
      title: "✅ Ótimos Descontos Ativados!",
      message: "Você está aproveitando os melhores preços disponíveis",
      color: "green",
      icon: Gift
    };
  };

  const getSimpleWholesaleIncentives = () => {
    const retailItems = items.filter(item => 
      item.currentTier?.tier_name === "Varejo" && 
      item.product.wholesale_price &&
      item.quantity < (item.product.min_wholesale_qty || 1)
    );
    
    if (retailItems.length > 0) {
      const totalSavings = retailItems.reduce((sum, item) => {
        const wholesaleSavings = (item.product.retail_price - item.product.wholesale_price) * item.product.min_wholesale_qty;
        return sum + wholesaleSavings;
      }, 0);
      
      return {
        type: "simple",
        title: "🚀 Migre para Atacado!",
        message: `${retailItems.length} produto(s) podem ter preço de atacado`,
        action: `Economize até R$ ${totalSavings.toFixed(2).replace(".", ",")} comprando em quantidade`,
        color: "orange",
        icon: Target
      };
    }
    
    return {
      type: "simple",
      title: "💪 Preços de Atacado Ativados!",
      message: "Você está comprando com os melhores preços",
      color: "green",
      icon: Gift
    };
  };

  const getWholesaleOnlyIncentives = () => {
    return {
      type: "wholesale",
      title: "🏢 Compra Atacadista",
      message: `${totalItems} itens no seu pedido atacadista`,
      action: `Total: R$ ${totalAmount.toFixed(2).replace(".", ",")}`,
      color: "orange",
      icon: ShoppingBag
    };
  };

  const getRetailOnlyIncentives = () => {
    // Incentivar aumento de quantidade ou valor
    if (totalAmount < 100) {
      return {
        type: "retail",
        title: "🛍️ Continue Comprando!",
        message: "Adicione mais produtos para um pedido completo",
        action: `Valor atual: R$ ${totalAmount.toFixed(2).replace(".", ",")}`,
        color: "blue",
        icon: ShoppingBag
      };
    }
    
    return {
      type: "retail",
      title: "🎉 Ótimo Pedido!",
      message: `${uniqueProducts} produto(s) diferentes no seu carrinho`,
      color: "green",
      icon: Gift
    };
  };

  const incentive = getIncentives();
  const IconComponent = incentive.icon;

  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return "from-blue-50 to-indigo-50 border-blue-200 text-blue-800";
      case "orange":
        return "from-orange-50 to-amber-50 border-orange-200 text-orange-800";
      case "green":
        return "from-green-50 to-emerald-50 border-green-200 text-green-800";
      default:
        return "from-gray-50 to-slate-50 border-gray-200 text-gray-800";
    }
  };

  // Não mostrar banner se carrinho vazio
  if (items.length === 0) return null;

  return (
    <Card className={`bg-gradient-to-r ${getColorClasses(incentive.color)} mb-4`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <IconComponent className="h-5 w-5 mt-0.5" />
          </div>
          <div className="flex-1 space-y-2">
            <h4 className="font-semibold text-sm">{incentive.title}</h4>
            <p className="text-sm opacity-90">{incentive.message}</p>
            {incentive.action && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">{incentive.action}</span>
                {onAddMoreItems && incentive.type !== "wholesale" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onAddMoreItems}
                    className="h-7 px-3 text-xs"
                  >
                    Ver Produtos
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CartIncentivesBanner;
