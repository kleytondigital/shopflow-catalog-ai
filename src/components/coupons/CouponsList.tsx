
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Tag, 
  Edit, 
  Trash2, 
  Calendar, 
  DollarSign, 
  Percent, 
  Users,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { Coupon } from '@/hooks/useCoupons';

interface CouponsListProps {
  coupons: Coupon[];
  onEdit: (coupon: Coupon) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  loading?: boolean;
}

const CouponsList: React.FC<CouponsListProps> = ({ 
  coupons, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  loading = false 
}) => {
  const { toast } = useToast();

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Código copiado",
      description: `Código "${code}" copiado para a área de transferência`,
    });
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}%`;
    }
    return `R$ ${coupon.discount_value.toFixed(2)}`;
  };

  const getStatusColor = (coupon: Coupon) => {
    if (!coupon.is_active) return 'secondary';
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return 'destructive';
    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) return 'destructive';
    return 'default';
  };

  const getStatusText = (coupon: Coupon) => {
    if (!coupon.is_active) return 'Inativo';
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return 'Expirado';
    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) return 'Esgotado';
    return 'Ativo';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Tag className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Nenhum cupom criado</h3>
          <p className="text-gray-600">
            Crie seu primeiro cupom de desconto para aumentar as vendas
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {coupons.map((coupon) => (
        <Card key={coupon.id} className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Tag className="h-5 w-5" />
                {coupon.code}
              </CardTitle>
              <Badge variant={getStatusColor(coupon)}>
                {getStatusText(coupon)}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Valor do Desconto */}
            <div className="flex items-center gap-2">
              {coupon.discount_type === 'percentage' ? (
                <Percent className="h-4 w-4 text-green-600" />
              ) : (
                <DollarSign className="h-4 w-4 text-green-600" />
              )}
              <span className="font-semibold text-green-600">
                {formatDiscount(coupon)} de desconto
              </span>
            </div>

            {/* Descrição */}
            {coupon.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {coupon.description}
              </p>
            )}

            {/* Informações adicionais */}
            <div className="space-y-2 text-sm text-gray-500">
              {coupon.min_order_amount && coupon.min_order_amount > 0 && (
                <div>Pedido mínimo: R$ {coupon.min_order_amount.toFixed(2)}</div>
              )}
              
              {coupon.max_uses && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {coupon.current_uses}/{coupon.max_uses} usos
                </div>
              )}
              
              {coupon.expires_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Expira em {new Date(coupon.expires_at).toLocaleDateString('pt-BR')}
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(coupon.code)}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copiar
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleStatus(coupon.id, !coupon.is_active)}
              >
                {coupon.is_active ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(coupon)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(coupon.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CouponsList;
