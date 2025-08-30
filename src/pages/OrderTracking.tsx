import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Package,
  Truck,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Phone,
  Mail,
  Building,
  Hash,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface OrderTrackingData {
  id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  total_amount: number;
  status: string;
  items: any[];
  shipping_address: any;
  tracking_code?: string;
  carrier?: string;
  estimated_delivery_date?: string;
  created_at: string;
  updated_at: string;
  payment_method?: string;
  shipping_method?: string;
  notes?: string;
  store: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
}

const OrderTracking: React.FC = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const [searchOrderId, setSearchOrderId] = useState(
    orderId || searchParams.get("order") || ""
  );
  const [orderData, setOrderData] = useState<OrderTrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (orderId) {
      handleSearch(orderId);
    }
  }, [orderId]);

  const handleSearch = async (orderIdToSearch?: string) => {
    const searchId = orderIdToSearch || searchOrderId;
    if (!searchId.trim()) {
      toast({
        title: "Erro",
        description: "Digite um código de pedido para buscar.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);
    setOrderData(null);

    try {
      // Buscar pedido com dados da loja
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          store:stores(name, phone, email, address, city, state)
        `
        )
        .or(`id.eq.${searchId},id.ilike.%${searchId}%`)
        .single();

      if (error || !data) {
        setError(
          "Pedido não encontrado. Verifique o código e tente novamente."
        );
        return;
      }

      setOrderData(data as OrderTrackingData);
    } catch (error) {
      console.error("Erro ao buscar pedido:", error);
      setError("Erro ao buscar pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      pending: {
        label: "Pendente",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <Clock className="h-4 w-4" />,
        description: "Aguardando confirmação",
      },
      confirmed: {
        label: "Confirmado",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <CheckCircle className="h-4 w-4" />,
        description: "Pedido confirmado e sendo preparado",
      },
      preparing: {
        label: "Preparando",
        color: "bg-orange-100 text-orange-800 border-orange-200",
        icon: <Package className="h-4 w-4" />,
        description: "Produtos sendo separados",
      },
      shipping: {
        label: "Enviado",
        color: "bg-purple-100 text-purple-800 border-purple-200",
        icon: <Truck className="h-4 w-4" />,
        description: "Em trânsito para o destino",
      },
      delivered: {
        label: "Entregue",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <CheckCircle className="h-4 w-4" />,
        description: "Pedido entregue com sucesso",
      },
      cancelled: {
        label: "Cancelado",
        color: "bg-red-100 text-red-800 border-red-200",
        icon: <AlertCircle className="h-4 w-4" />,
        description: "Pedido cancelado",
      },
    };

    return (
      statusMap[status as keyof typeof statusMap] || {
        label: status,
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: <Package className="h-4 w-4" />,
        description: "Status desconhecido",
      }
    );
  };

  const handleTrackWithCarrier = () => {
    if (!orderData?.tracking_code) return;

    const trackingUrls = {
      correios: `https://www.correios.com.br/rastreamento?codigo=${orderData.tracking_code}`,
      jadlog: `https://www.jadlog.com.br/tracking/${orderData.tracking_code}`,
      total: `https://www.totalexpress.com.br/rastreamento/?codigo=${orderData.tracking_code}`,
      loggi: `https://www.loggi.com/rastreamento/${orderData.tracking_code}`,
    };

    const url =
      trackingUrls[orderData.carrier as keyof typeof trackingUrls] ||
      trackingUrls.correios;

    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Package className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Rastreamento de Pedidos</h1>
          </div>
          <p className="text-gray-600">
            Digite o código do seu pedido para acompanhar o status da entrega
          </p>
        </div>

        {/* Busca */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  value={searchOrderId}
                  onChange={(e) => setSearchOrderId(e.target.value)}
                  placeholder="Digite o código do pedido (ex: ABC12345)"
                  className="text-lg"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button
                onClick={() => handleSearch()}
                disabled={loading}
                className="flex items-center gap-2"
                size="lg"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Buscar Pedido
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Erro */}
        {error && (
          <Card className="mb-6 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dados do Pedido */}
        {orderData && (
          <div className="space-y-6">
            {/* Status Principal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Pedido #{orderData.id.slice(-8)}</span>
                  <Badge
                    className={getStatusInfo(orderData.status).color}
                    variant="outline"
                  >
                    <span className="flex items-center gap-2">
                      {getStatusInfo(orderData.status).icon}
                      {getStatusInfo(orderData.status).label}
                    </span>
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Informações do Pedido
                    </h4>
                    <div className="text-sm space-y-1">
                      <p>
                        <strong>Data:</strong>{" "}
                        {format(
                          new Date(orderData.created_at),
                          "dd/MM/yyyy HH:mm",
                          { locale: ptBR }
                        )}
                      </p>
                      <p>
                        <strong>Total:</strong> R${" "}
                        {orderData.total_amount.toFixed(2)}
                      </p>
                      <p>
                        <strong>Itens:</strong> {orderData.items?.length || 0}{" "}
                        produtos
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        {getStatusInfo(orderData.status).description}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Loja
                    </h4>
                    <div className="text-sm space-y-1">
                      <p>
                        <strong>Nome:</strong> {orderData.store.name}
                      </p>
                      {orderData.store.phone && (
                        <p>
                          <strong>Telefone:</strong> {orderData.store.phone}
                        </p>
                      )}
                      {orderData.store.email && (
                        <p>
                          <strong>Email:</strong> {orderData.store.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {orderData.tracking_code && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Rastreamento
                      </h4>
                      <div className="text-sm space-y-2">
                        <div className="bg-gray-100 p-2 rounded font-mono text-center">
                          {orderData.tracking_code}
                        </div>
                        {orderData.carrier && (
                          <p>
                            <strong>Transportadora:</strong> {orderData.carrier}
                          </p>
                        )}
                        {orderData.estimated_delivery_date && (
                          <p>
                            <strong>Previsão:</strong>{" "}
                            {format(
                              new Date(orderData.estimated_delivery_date),
                              "dd/MM/yyyy",
                              { locale: ptBR }
                            )}
                          </p>
                        )}
                        <Button
                          onClick={handleTrackWithCarrier}
                          variant="outline"
                          size="sm"
                          className="w-full flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Rastrear na Transportadora
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Timeline de Status */}
            <Card>
              <CardHeader>
                <CardTitle>Linha do Tempo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Timeline baseada no status atual */}
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        [
                          "pending",
                          "confirmed",
                          "preparing",
                          "shipping",
                          "delivered",
                        ].includes(orderData.status)
                          ? "bg-green-500 text-white"
                          : "bg-gray-300"
                      }`}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">Pedido Recebido</p>
                      <p className="text-sm text-gray-600">
                        {format(
                          new Date(orderData.created_at),
                          "dd/MM/yyyy HH:mm",
                          { locale: ptBR }
                        )}
                      </p>
                    </div>
                  </div>

                  {orderData.status !== "pending" && (
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          [
                            "confirmed",
                            "preparing",
                            "shipping",
                            "delivered",
                          ].includes(orderData.status)
                            ? "bg-green-500 text-white"
                            : "bg-gray-300"
                        }`}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">Pagamento Confirmado</p>
                        <p className="text-sm text-gray-600">
                          Pedido confirmado e em preparação
                        </p>
                      </div>
                    </div>
                  )}

                  {["preparing", "shipping", "delivered"].includes(
                    orderData.status
                  ) && (
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          ["shipping", "delivered"].includes(orderData.status)
                            ? "bg-green-500 text-white"
                            : "bg-blue-500 text-white"
                        }`}
                      >
                        <Package className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">Produtos Separados</p>
                        <p className="text-sm text-gray-600">
                          Produtos preparados para envio
                        </p>
                      </div>
                    </div>
                  )}

                  {["shipping", "delivered"].includes(orderData.status) && (
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          orderData.status === "delivered"
                            ? "bg-green-500 text-white"
                            : "bg-blue-500 text-white"
                        }`}
                      >
                        <Truck className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">Produto Enviado</p>
                        <p className="text-sm text-gray-600">
                          {orderData.tracking_code
                            ? `Código: ${orderData.tracking_code}`
                            : "Produto a caminho do destino"}
                        </p>
                      </div>
                    </div>
                  )}

                  {orderData.status === "delivered" && (
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">Produto Entregue</p>
                        <p className="text-sm text-gray-600">
                          Pedido entregue com sucesso
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Produtos do Pedido */}
            <Card>
              <CardHeader>
                <CardTitle>Produtos do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orderData.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {item.product_name || item.name}
                          </span>
                          {item.is_order_bump && (
                            <Badge className="bg-orange-100 text-orange-800 text-xs">
                              🎁 Oferta Especial
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          Quantidade: {item.quantity}x
                          {item.variation_details && (
                            <span className="ml-2">
                              | Variação: {item.variation_details.color}{" "}
                              {item.variation_details.size}
                            </span>
                          )}
                        </div>
                        {item.is_order_bump && item.discount_percentage > 0 && (
                          <div className="text-xs text-green-600 mt-1">
                            💰 Desconto de {item.discount_percentage}% aplicado
                          </div>
                        )}
                      </div>
                      <div className="font-semibold">
                        R${" "}
                        {(
                          item.total_price ||
                          (item.unit_price || item.price || 0) * item.quantity
                        ).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total do Pedido:</span>
                  <span className="text-green-600">
                    R$ {orderData.total_amount.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Informações de Entrega */}
            {orderData.shipping_address && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Endereço de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <p>
                      {orderData.shipping_address.street},{" "}
                      {orderData.shipping_address.number}
                    </p>
                    {orderData.shipping_address.complement && (
                      <p>{orderData.shipping_address.complement}</p>
                    )}
                    <p>{orderData.shipping_address.neighborhood}</p>
                    <p>
                      {orderData.shipping_address.city} -{" "}
                      {orderData.shipping_address.state}
                    </p>
                    <p>CEP: {orderData.shipping_address.zip_code}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contato da Loja */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Contato da Loja
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="font-semibold">{orderData.store.name}</p>
                    {orderData.store.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <a
                          href={`https://wa.me/${orderData.store.phone.replace(
                            /\D/g,
                            ""
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:underline"
                        >
                          {orderData.store.phone}
                        </a>
                      </div>
                    )}
                    {orderData.store.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <a
                          href={`mailto:${orderData.store.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {orderData.store.email}
                        </a>
                      </div>
                    )}
                  </div>

                  {orderData.notes && (
                    <div>
                      <p className="font-semibold mb-2">Observações:</p>
                      <div className="bg-gray-100 p-3 rounded text-sm">
                        {orderData.notes}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>© 2024 VendeMais - Sistema de Gestão de Vendas</p>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
