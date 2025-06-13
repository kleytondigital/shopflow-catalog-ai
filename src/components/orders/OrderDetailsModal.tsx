
import React from 'react';
import { Order } from '@/hooks/useOrders';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Package, 
  CreditCard,
  Truck,
  Calendar,
  FileText,
  MessageCircle,
  X,
  Printer
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelOrder: (orderId: string) => void;
  onSendFollowUp: (order: Order) => void;
  onPrintLabel: (order: Order) => void;
  onPrintDeclaration: (order: Order) => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  onCancelOrder,
  onSendFollowUp,
  onPrintLabel,
  onPrintDeclaration
}) => {
  if (!order) return null;

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

  const paymentStatus = getPaymentStatus(order);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Package className="h-5 w-5" />
            Pedido #{order.id.slice(-8)}
            <Badge variant="outline" className="ml-auto">
              {order.order_type === 'retail' ? 'Varejo' : 'Atacado'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status e Info Geral */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Status do Pedido</label>
              <Badge className={getStatusColor(order.status)} variant="outline">
                {getStatusText(order.status)}
              </Badge>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Status do Pagamento</label>
              <Badge className={getPaymentStatusColor(paymentStatus)} variant="outline">
                {getPaymentStatusText(paymentStatus)}
              </Badge>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Data do Pedido</label>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                {format(new Date(order.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </div>
            </div>
          </div>

          <Separator />

          {/* Informações do Cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações do Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Nome</label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  {order.customer_name}
                </div>
              </div>
              {order.customer_phone && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Telefone</label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {order.customer_phone}
                  </div>
                </div>
              )}
              {order.customer_email && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {order.customer_email}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Itens do Pedido */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Itens do Pedido
            </h3>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-600">
                      Quantidade: {item.quantity}x - Preço unitário: R$ {item.price?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                  <div className="font-semibold">
                    R$ {((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                  </div>
                </div>
              )) || (
                <div className="text-gray-500 text-center py-4">
                  Nenhum item encontrado
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Endereço de Entrega */}
          {order.shipping_address && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Endereço de Entrega
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <div>{order.shipping_address.street}, {order.shipping_address.number}</div>
                    {order.shipping_address.complement && (
                      <div>{order.shipping_address.complement}</div>
                    )}
                    <div>{order.shipping_address.district}</div>
                    <div>{order.shipping_address.city} - {order.shipping_address.state}</div>
                    <div>CEP: {order.shipping_address.zip_code}</div>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Resumo Financeiro */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Resumo Financeiro
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>R$ {(order.total_amount - (order.shipping_cost || 0)).toFixed(2)}</span>
              </div>
              {order.shipping_cost && order.shipping_cost > 0 && (
                <div className="flex justify-between">
                  <span>Frete</span>
                  <span>R$ {order.shipping_cost.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>R$ {order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Observações */}
          {order.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Observações
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  {order.notes}
                </div>
              </div>
            </>
          )}

          {/* Ações */}
          <Separator />
          <div className="flex flex-wrap gap-3 justify-end">
            {paymentStatus === 'pending' && (
              <Button
                onClick={() => onSendFollowUp(order)}
                className="flex items-center gap-2"
                variant="outline"
              >
                <MessageCircle className="h-4 w-4" />
                Enviar Cobrança
              </Button>
            )}
            
            {(order.status === 'confirmed' || order.status === 'preparing' || order.status === 'shipping') && (
              <>
                <Button
                  onClick={() => onPrintLabel(order)}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <Printer className="h-4 w-4" />
                  Imprimir Etiqueta
                </Button>
                <Button
                  onClick={() => onPrintDeclaration(order)}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <FileText className="h-4 w-4" />
                  Declaração de Conteúdo
                </Button>
              </>
            )}
            
            {order.status !== 'cancelled' && order.status !== 'delivered' && (
              <Button
                onClick={() => onCancelOrder(order.id)}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancelar Pedido
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;
