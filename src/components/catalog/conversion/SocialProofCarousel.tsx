/**
 * SocialProofCarousel - Carrossel Rotativo de Prova Social
 * Substitui múltiplos badges estáticos por um carrossel limpo e profissional
 */

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  Eye, 
  TrendingUp, 
  ShoppingBag, 
  Clock,
  MapPin,
  Star,
  CheckCircle,
} from "lucide-react";

interface SocialProofItem {
  id: string;
  type: 'views' | 'sales' | 'recent_purchase' | 'stock' | 'trending';
  message: string;
  icon: 'users' | 'eye' | 'trending' | 'shopping' | 'clock' | 'map' | 'star' | 'check';
  variant: 'default' | 'success' | 'warning' | 'info' | 'urgent';
}

interface SocialProofCarouselProps {
  salesCount?: number;
  viewsLast24h?: number;
  viewsNow?: number;
  stockStatus?: 'in_stock' | 'low_stock' | 'out_stock';
  isBestSeller?: boolean;
  recentPurchases?: Array<{
    customerName: string;
    city: string;
    timeAgo: string;
  }>;
  autoRotateInterval?: number; // ms
}

const SocialProofCarousel: React.FC<SocialProofCarouselProps> = ({
  salesCount,
  viewsLast24h,
  viewsNow,
  stockStatus = 'in_stock',
  isBestSeller = false,
  recentPurchases,
  autoRotateInterval = 4000, // 4 segundos
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Construir lista de provas sociais
  const proofs: SocialProofItem[] = [];

  // Vendas
  if (salesCount && salesCount > 20) {
    proofs.push({
      id: 'sales',
      type: 'sales',
      message: `+${salesCount} vendidos este mês`,
      icon: 'shopping',
      variant: 'info',
    });
  }

  // Visualizações 24h
  if (viewsLast24h && viewsLast24h > 10) {
    proofs.push({
      id: 'views_24h',
      type: 'views',
      message: `${viewsLast24h} pessoas viram nas últimas 24h`,
      icon: 'eye',
      variant: 'default',
    });
  }

  // Visualizando agora
  if (viewsNow && viewsNow > 0) {
    proofs.push({
      id: 'views_now',
      type: 'views',
      message: `${viewsNow} ${viewsNow === 1 ? 'pessoa visualizando' : 'pessoas visualizando'} agora`,
      icon: 'users',
      variant: 'urgent',
    });
  }

  // Estoque
  if (stockStatus === 'in_stock') {
    proofs.push({
      id: 'stock',
      type: 'stock',
      message: 'Em Estoque - Pronta Entrega',
      icon: 'check',
      variant: 'success',
    });
  }

  // Mais vendido
  if (isBestSeller) {
    proofs.push({
      id: 'bestseller',
      type: 'trending',
      message: 'Produto Mais Vendido da Categoria',
      icon: 'trending',
      variant: 'warning',
    });
  }

  // Compras recentes
  if (recentPurchases && recentPurchases.length > 0) {
    recentPurchases.slice(0, 3).forEach((purchase, idx) => {
      proofs.push({
        id: `purchase_${idx}`,
        type: 'recent_purchase',
        message: `${purchase.customerName} de ${purchase.city} comprou ${purchase.timeAgo}`,
        icon: 'map',
        variant: 'success',
      });
    });
  }

  // Auto-rotação
  useEffect(() => {
    if (proofs.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % proofs.length);
    }, autoRotateInterval);

    return () => clearInterval(interval);
  }, [proofs.length, autoRotateInterval]);

  if (proofs.length === 0) return null;

  const currentProof = proofs[currentIndex];

  // Mapear ícones
  const iconMap = {
    users: <Users className="h-5 w-5" />,
    eye: <Eye className="h-5 w-5" />,
    trending: <TrendingUp className="h-5 w-5" />,
    shopping: <ShoppingBag className="h-5 w-5" />,
    clock: <Clock className="h-5 w-5" />,
    map: <MapPin className="h-5 w-5" />,
    star: <Star className="h-5 w-5" />,
    check: <CheckCircle className="h-5 w-5" />,
  };

  // Mapear cores por variante
  const variantStyles = {
    default: "border-gray-300 bg-gray-50 text-gray-900",
    success: "border-green-300 bg-green-50 text-green-900",
    warning: "border-orange-300 bg-orange-50 text-orange-900",
    info: "border-blue-300 bg-blue-50 text-blue-900",
    urgent: "border-red-300 bg-red-50 text-red-900 animate-pulse",
  };

  const iconColors = {
    default: "text-gray-600",
    success: "text-green-600",
    warning: "text-orange-600",
    info: "text-blue-600",
    urgent: "text-red-600",
  };

  return (
    <div className="mb-4">
      {/* Carrossel Principal */}
      <Alert 
        className={`${variantStyles[currentProof.variant]} transition-all duration-500 ease-in-out`}
      >
        <div className={iconColors[currentProof.variant]}>
          {iconMap[currentProof.icon]}
        </div>
        <AlertDescription className="font-semibold">
          {currentProof.message}
        </AlertDescription>
      </Alert>

      {/* Indicadores de Navegação */}
      {proofs.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {proofs.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'w-8 bg-blue-600' 
                  : 'w-1.5 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Ir para prova social ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SocialProofCarousel;

