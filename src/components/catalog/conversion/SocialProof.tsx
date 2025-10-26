/**
 * SocialProof - Indicadores de Prova Social
 * Vendas, visualizações, popularidade
 */

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Eye, TrendingUp, ShoppingBag, Clock } from "lucide-react";

interface SocialProofProps {
  salesCount?: number;
  viewsLast24h?: number;
  viewsNow?: number;
  recentPurchases?: Array<{
    customerName: string;
    city: string;
    timeAgo: string;
  }>;
}

const SocialProof: React.FC<SocialProofProps> = ({
  salesCount,
  viewsLast24h,
  viewsNow,
  recentPurchases,
}) => {
  return (
    <div className="space-y-3 mb-6">
      {/* Estatísticas Rápidas */}
      <div className="flex flex-wrap gap-2">
        {/* Vendas */}
        {salesCount && salesCount > 20 && (
          <Badge className="bg-blue-600 text-white px-3 py-2 text-sm font-semibold">
            <ShoppingBag className="w-4 h-4 mr-1" />
            +{salesCount} vendidos este mês
          </Badge>
        )}

        {/* Visualizações 24h */}
        {viewsLast24h && viewsLast24h > 10 && (
          <Badge className="bg-orange-100 text-orange-700 border border-orange-300 px-3 py-2 text-sm">
            <Eye className="w-4 h-4 mr-1" />
            {viewsLast24h} pessoas viram nas últimas 24h
          </Badge>
        )}

        {/* Visualizando agora */}
        {viewsNow && viewsNow > 0 && (
          <Badge className="bg-red-100 text-red-700 border border-red-300 px-3 py-2 text-sm animate-pulse">
            <Users className="w-4 h-4 mr-1" />
            {viewsNow} pessoas visualizando agora
          </Badge>
        )}
      </div>

      {/* Compras Recentes (Notificação Simulada) */}
      {recentPurchases && recentPurchases.length > 0 && (
        <Alert className="border-green-300 bg-green-50 animate-in slide-in-from-bottom-5 duration-500">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-900">
            <strong>{recentPurchases[0].customerName}</strong> de{' '}
            <strong>{recentPurchases[0].city}</strong> comprou este produto{' '}
            <span className="italic">{recentPurchases[0].timeAgo}</span>
          </AlertDescription>
        </Alert>
      )}

      {/* Popularidade Geral */}
      {salesCount && salesCount > 50 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-purple-900">Produto Popular</div>
              <div className="text-sm text-purple-700">
                Um dos mais vendidos na categoria
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialProof;

