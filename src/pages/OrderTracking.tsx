import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OrderTrackingData {
  id: string;
  customer_name: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  tracking_code?: string;
  carrier?: string;
  estimated_delivery_date?: string;
  items: any[];
  store: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
}

const OrderTracking: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [orderData, setOrderData] = useState<OrderTrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get("orderId");

  useEffect(() => {
    if (!orderId) {
      setError("ID do pedido não fornecido");
      setLoading(false);
      return;
    }

    fetchOrderData();
  }, [orderId]);

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("orders")
        .select(
          `
          *,
          store:stores(name, phone, email, address)
        `
        )
        .eq("id", orderId)
        .single();

      if (fetchError) {
        console.error("Erro ao buscar pedido:", fetchError);
        setError("Pedido não encontrado");
        return;
      }

      if (!data) {
        setError("Pedido não encontrado");
        return;
      }

      const transformedData: OrderTrackingData = {
        ...data,
        store: {
          name: data.store?.name || "Loja",
          phone: data.store?.phone || undefined,
          email: data.store?.email || undefined,
          address: data.store?.address || undefined,
        },
        items: Array.isArray(data.items) ? data.items : [],
      };

      setOrderData(transformedData);
    } catch (err) {
      console.error("Erro ao buscar dados do pedido:", err);
      setError("Erro ao carregar dados do pedido");
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusConfig = {
      pending: {
        label: "Pendente",
        icon: Clock,
        color: "bg-yellow-100 text-yellow-800",
        description: "Aguardando confirmação",
      },
      confirmed: {
        label: "Confirmado",
        icon: CheckCircle2,
        color: "bg-blue-100 text-blue-800",
        description: "Pedido confirmado",
      },
      preparing: {
        label: "Preparando",
        icon: Package,
        color: "bg-orange-100 text-orange-800",
        description: "Produtos sendo preparados",
      },
      shipping: {
        label: "Enviado",
        icon: Truck,
        color: "bg-purple-100 text-purple-800",
        description: "Produtos em trânsito",
      },
      delivered: {
        label: "Entregue",
        icon: CheckCircle2,
        color: "bg-green-100 text-green-800",
        description: "Produtos entregues",
      },
      cancelled: {
        label: "Cancelado",
        icon: AlertCircle,
        color: "bg-red-100 text-red-800",
        description: "Pedido cancelado",
      },
    };

    return (
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando informações do pedido...</p>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Erro ao carregar pedido
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.history.back()}>Voltar</Button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(orderData.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Rastreamento do Pedido</h1>
        <p className="text-gray-600">
          Acompanhe o status do seu pedido #{orderData.id.slice(-8)}
        </p>
      </div>

      {/* Status do Pedido */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StatusIcon className="h-5 w-5" />
            Status do Pedido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
            <p className="text-gray-600">{statusInfo.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Informações do Pedido */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Cliente</h4>
              <p className="text-gray-600">{orderData.customer_name}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Valor Total</h4>
              <p className="text-2xl font-bold text-green-600">
                R$ {orderData.total_amount.toFixed(2)}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Data do Pedido</h4>
              <p className="text-gray-600">
                {new Date(orderData.created_at).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Última Atualização
              </h4>
              <p className="text-gray-600">
                {formatDistanceToNow(new Date(orderData.updated_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rastreamento */}
      {orderData.tracking_code && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Rastreamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Código de Rastreio
                </h4>
                <p className="font-mono text-lg bg-gray-100 p-2 rounded">
                  {orderData.tracking_code}
                </p>
              </div>
              {orderData.carrier && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Transportadora
                  </h4>
                  <p className="text-gray-600">{orderData.carrier}</p>
                </div>
              )}
            </div>
            {orderData.estimated_delivery_date && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Data Estimada de Entrega
                </h4>
                <p className="text-gray-600">
                  {new Date(
                    orderData.estimated_delivery_date
                  ).toLocaleDateString("pt-BR")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Itens do Pedido */}
      {orderData.items && orderData.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Itens do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orderData.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <div className="flex-1">
                    <p className="font-medium">
                      {item.product_name || item.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Quantidade: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      R$ {(item.total_price || item.price || 0).toFixed(2)}
                    </p>
                    {item.is_order_bump && (
                      <Badge variant="secondary" className="text-xs">
                        Order Bump
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações da Loja */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Loja</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Nome da Loja</h4>
              <p className="text-gray-600">{orderData.store.name}</p>
            </div>
            {orderData.store.phone && (
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Telefone</h4>
                <p className="text-gray-600">{orderData.store.phone}</p>
              </div>
            )}
            {orderData.store.email && (
              <div>
                <h4 className="font-medium text-gray-900 mb-1">E-mail</h4>
                <p className="text-gray-600">{orderData.store.email}</p>
              </div>
            )}
            {orderData.store.address && (
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Endereço</h4>
                <p className="text-gray-600">{orderData.store.address}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex gap-4 justify-center">
        <Button variant="outline" onClick={() => window.history.back()}>
          Voltar
        </Button>
        {orderData.store.phone && (
          <Button
            onClick={() => {
              const whatsappUrl = `https://wa.me/${orderData.store.phone?.replace(
                /\D/g,
                ""
              )}?text=${encodeURIComponent(
                `Olá! Gostaria de informações sobre o pedido #${orderData.id.slice(
                  -8
                )}`
              )}`;
              window.open(whatsappUrl, "_blank");
            }}
          >
            Contatar via WhatsApp
          </Button>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
