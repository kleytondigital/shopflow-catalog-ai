
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Gift, Target } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/utils";

const TierProgressIndicator: React.FC = () => {
  const {
    items,
    totalSavings,
    potentialSavings,
    canGetWholesalePrice,
    itemsToWholesale,
  } = useCart();

  // Se não há itens, não mostrar
  if (items.length === 0) {
    return null;
  }

  // Se já tem economia máxima, mostrar mensagem de sucesso
  if (totalSavings > 0 && !canGetWholesalePrice) {
    return (
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Gift className="h-5 w-5" />
            Máximo desconto ativado!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-700 text-sm">
            Você já está aproveitando o melhor preço disponível em todos os
            produtos!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Se não há progresso disponível, não mostrar
  if (!canGetWholesalePrice && potentialSavings === 0) {
    return null;
  }

  // Calcular progresso geral
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const progressPercentage = Math.min(
    100,
    (totalItems / (totalItems + itemsToWholesale)) * 100
  );

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <TrendingUp className="h-5 w-5" />
          Progresso de Preços
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progresso para próximo nível */}
        {canGetWholesalePrice && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">
                Progresso para preços de atacado
              </span>
              <span className="text-blue-600 font-medium">
                {totalItems} / {totalItems + itemsToWholesale} itens
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        {/* Economia potencial */}
        {potentialSavings > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-100 rounded-lg">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Economia potencial:
              </span>
            </div>
            <Badge className="bg-green-500 text-white">
              {formatCurrency(potentialSavings)}
            </Badge>
          </div>
        )}

        {/* Itens necessários */}
        {itemsToWholesale > 0 && (
          <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              Adicione mais <strong>{itemsToWholesale} item(ns)</strong> para
              atingir preços de atacado
            </p>
          </div>
        )}

        {/* Resumo por produto */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-blue-800">
            Itens no carrinho:
          </h4>
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-blue-700 truncate max-w-32">
                {item.product.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-blue-600">
                  {item.quantity} unidades
                </span>
                {item.totalSavings && item.totalSavings > 0 && (
                  <Badge variant="outline" className="text-xs">
                    -{formatCurrency(item.totalSavings)}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TierProgressIndicator;
