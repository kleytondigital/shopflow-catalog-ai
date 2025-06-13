
import React from 'react';
import { Order } from '@/hooks/useOrders';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  MessageCircle, 
  X, 
  Printer, 
  FileText,
  Phone,
  Calendar,
  Package,
  MapPin
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OrdersGridProps {
  orders: Order[];
  onViewOrder: (order: Order) => void;
  onCancelOrder: (orderId: string) => void;
  onSendFollowUp: (order: Order) => void;
  onPrintLabel: (order: Order) => void;
  onPrintDeclaration: (order: Order) => void;
}

const OrdersGrid: React.FC<OrdersGridProps> = ({
  orders,
  onViewOrder,
  onCancelOrder,
  onSendFollowUp,
  onPrintLabel,
  onPrintDeclaration
}) => {
  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      preparing: 'bg-orange-100 text-orange-800 border-orange-200',
      shipping: 'bg-purple-100 text-purple-800 border-purple-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = (status: string) => {
    const texts = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      preparing: 'Preparando',
      shipping: 'Enviado',
      delivered: 'Entregue',
      cancelled: 'Cancelado'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getPaymentStatus = (order: Order) => {
    if (order.status === 'cancelled') return 'cancelled';
    if (order.status === 'delivered') return 'paid';
    if (order.status === 'pending') return 'pending';
    return 'processing';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-red-50 text-red-700 border-red-200',
      processing: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      paid: 'bg-green-50 text-green-700 border-green-200',
      cancelled: 'bg-gray-50 text-gray-700 border-gray-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getPaymentStatusText = (status: string) => {
    const texts = {
      pending: 'Não Pago',
      processing: 'Processando',
      paid: 'Pago',
      cancelled: 'Cancelado'
    };
    return texts[status as keyof typeof texts] || status;
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {orders.map((order) => {
        const paymentStatus = getPaymentStatus(order);
        return (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium">
                      #{order.id.slice(-8)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {order.order_type === 'retail' ? 'Varejo' : 'Atacado'}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-lg text-primary">
                      R$ {order.total_amount.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(order.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{order.customer_name}</span>
                  {order.customer_phone && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Phone className="h-3 w-3" />
                      {order.customer_phone}
                    </div>
                  )}
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(order.status)} variant="outline">
                    {getStatusText(order.status)}
                  </Badge>
                  <Badge className={getPaymentStatusColor(paymentStatus)} variant="outline">
                    {getPaymentStatusText(paymentStatus)}
                  </Badge>
                </div>

                {/* Items Preview */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Package className="h-4 w-4" />
                  <span>{order.items?.length || 0} item(s)</span>
                  {order.items?.length > 0 && (
                    <span className="truncate">
                      - {order.items[0].name}
                      {order.items.length > 1 && ` e mais ${order.items.length - 1}`}
                    </span>
                  )}
                </div>

                {/* Address */}
                {order.shipping_address && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="truncate">
                      {order.shipping_address.city} - {order.shipping_address.state}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewOrder(order)}
                      className="h-8"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Detalhes
                    </Button>
                    
                    {paymentStatus === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSendFollowUp(order)}
                        className="h-8 text-blue-600 hover:text-blue-700"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Cobrar
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {(order.status === 'confirmed' || order.status === 'preparing' || order.status === 'shipping') && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onPrintLabel(order)}
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onPrintDeclaration(order)}
                          className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onCancelOrder(order.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default OrdersGrid;
