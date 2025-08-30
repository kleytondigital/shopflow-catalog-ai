import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Calendar,
  Package2,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Printer,
  FileText,
  Eye,
  MoreHorizontal,
  Tag,
  RefreshCw,
  Download,
  CreditCard,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import OrdersTableMemo from "@/components/orders/OrdersTableMemo";
import OrdersGridMemo from "@/components/orders/OrdersGridMemo";
import OrderDetailsModal from "@/components/orders/OrderDetailsModal";
import { useOrders } from "@/hooks/useOrders";
import { useOrderPayments } from "@/hooks/useOrderPayments";
import useOrderActions from "@/hooks/useOrderActions";
import { Order } from "@/hooks/useOrders";
import { useToast } from "@/hooks/use-toast";

const OrdersImproved = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [filterOrderBump, setFilterOrderBump] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  // Dados do banco de dados
  const { orders, loading, fetchOrders, updateOrderStatus } = useOrders();
  const { getOrderPaymentStatus, refreshPayments } = useOrderPayments(orders);
  const {
    generateOrderReport,
    sendFollowUpMessage,
    markDocumentPrinted,
    updateTrackingCode,
    loading: actionsLoading,
  } = useOrderActions();

  // Estatísticas de Order Bumps
  const orderBumpStats = useMemo(() => {
    const totalOrders = orders.length;
    const ordersWithBumps = orders.filter((order) =>
      order.items?.some((item) => item.is_order_bump)
    ).length;

    const totalBumpRevenue = orders.reduce((sum, order) => {
      const bumpRevenue =
        order.items?.reduce((itemSum, item) => {
          return itemSum + (item.is_order_bump ? item.total_price || 0 : 0);
        }, 0) || 0;
      return sum + bumpRevenue;
    }, 0);

    const totalBumpSavings = orders.reduce((sum, order) => {
      const bumpSavings =
        order.items?.reduce((itemSum, item) => {
          if (item.is_order_bump && item.original_price && item.unit_price) {
            return (
              itemSum + (item.original_price - item.unit_price) * item.quantity
            );
          }
          return itemSum;
        }, 0) || 0;
      return sum + bumpSavings;
    }, 0);

    return {
      conversionRate:
        totalOrders > 0 ? (ordersWithBumps / totalOrders) * 100 : 0,
      ordersWithBumps,
      totalOrders,
      totalBumpRevenue,
      totalBumpSavings,
    };
  }, [orders]);

  // Utilidades para filtragem real dos pedidos
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const searchMatch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch =
        filterStatus === "all" || order.status === filterStatus;
      const typeMatch = filterType === "all" || order.order_type === filterType;
      // O status de pagamento real vem do hook
      const paymentStatusReal = getOrderPaymentStatus(order.id)?.status;
      const paymentMatch =
        filterPayment === "all" || paymentStatusReal === filterPayment;
      const orderBumpMatch =
        filterOrderBump === "all" ||
        (filterOrderBump === "with" &&
          order.items?.some((item) => item.is_order_bump)) ||
        (filterOrderBump === "without" &&
          !order.items?.some((item) => item.is_order_bump));
      let tabMatch = true;
      if (activeTab === "unpaid") {
        tabMatch =
          paymentStatusReal === "pending" || order.status === "pending";
      } else if (activeTab === "pending") {
        tabMatch = ["pending", "confirmed"].includes(order.status);
      } else if (activeTab === "shipped") {
        tabMatch = ["shipping", "delivered"].includes(order.status);
      }
      return (
        searchMatch &&
        statusMatch &&
        typeMatch &&
        paymentMatch &&
        orderBumpMatch &&
        tabMatch
      );
    });
  }, [
    orders,
    searchTerm,
    filterStatus,
    filterType,
    filterPayment,
    filterOrderBump,
    activeTab,
    getOrderPaymentStatus,
  ]);

  const unpaidOrders = useMemo(
    () =>
      orders.filter((order) => {
        const paymentStatus = getOrderPaymentStatus(order.id);
        return (
          paymentStatus?.status === "pending" || order.status === "pending"
        );
      }),
    [orders, getOrderPaymentStatus]
  );

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleRecoverUnpaidOrder = async (order: Order) => {
    await sendFollowUpMessage(order);
  };

  const handleBulkRecovery = async () => {
    if (unpaidOrders.length === 0) return;

    for (const order of unpaidOrders.slice(0, 10)) {
      // Limitar a 10 por vez
      await sendFollowUpMessage(order);
      // Pequeno delay para evitar spam
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    toast({
      title: "Cobranças enviadas!",
      description: `${Math.min(
        unpaidOrders.length,
        10
      )} mensagens de cobrança preparadas.`,
    });
  };

  const handleExportReport = async () => {
    await generateOrderReport(filteredOrders);
  };

  const handleCancelOrder = (orderId: string) => {
    updateOrderStatus(orderId, "cancelled");
  };

  const handleSendFollowUp = async (order: Order) => {
    await sendFollowUpMessage(order);
  };

  const handlePrintLabel = (order: Order) => {
    toast({
      title: "Etiqueta preparada!",
      description: `Etiqueta do pedido #${order.id.slice(
        -8
      )} pronta para impressão.`,
    });
  };

  const handlePrintDeclaration = (order: Order) => {
    toast({
      title: "Declaração preparada!",
      description: `Declaração do pedido #${order.id.slice(
        -8
      )} pronta para impressão.`,
    });
  };

  const handleMarkPrintedDocument = async (
    orderId: string,
    documentType: "label" | "picking_list" | "content_declaration" | "receipt"
  ) => {
    await markDocumentPrinted(orderId, documentType);
    await fetchOrders(); // Recarregar lista
  };

  const handleGenerateTrackingCode = async (orderId: string) => {
    // Esta função será chamada pelo modal de tracking
    await fetchOrders(); // Recarregar lista
  };

  // Mascara nomes de status conforme status real (hook)
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "confirmed":
        return "Confirmado";
      case "preparing":
        return "Preparando";
      case "shipping":
        return "Enviado";
      case "delivered":
        return "Entregue";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  // UX loading
  if (loading) {
    return <div className="py-16 text-center">Carregando pedidos...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Order Bump Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Taxa Conversão
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {orderBumpStats.conversionRate.toFixed(1)}%
                </p>
              </div>
              <Tag className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {orderBumpStats.ordersWithBumps} de {orderBumpStats.totalOrders}{" "}
              pedidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Receita Order Bumps
                </p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {orderBumpStats.totalBumpRevenue.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Economia Total
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {orderBumpStats.totalBumpSavings.toFixed(2)}
                </p>
              </div>
              <Package2 className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Descontos aplicados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Pedidos
                </p>
                <p className="text-2xl font-bold">
                  {orderBumpStats.totalOrders}
                </p>
              </div>
              <FileText className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleBulkRecovery}
            disabled={unpaidOrders.length === 0}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Recuperar Não Pagos ({unpaidOrders.length})
          </Button>
          <Button
            onClick={handleExportReport}
            disabled={actionsLoading}
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            {actionsLoading ? "Gerando..." : "Exportar Relatório"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            size={20}
          />
          <Input
            type="text"
            placeholder="Buscar por número do pedido ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="confirmed">Confirmado</SelectItem>
              <SelectItem value="preparing">Preparando</SelectItem>
              <SelectItem value="shipping">Enviado</SelectItem>
              <SelectItem value="delivered">Entregue</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="retail">Varejo</SelectItem>
              <SelectItem value="wholesale">Atacado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPayment} onValueChange={setFilterPayment}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="paid">Pago</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="partial">Parcial</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterOrderBump} onValueChange={setFilterOrderBump}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Order Bumps" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="with">Com Order Bump</SelectItem>
              <SelectItem value="without">Sem Order Bump</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs de Navegação */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Todos ({orders.length})</TabsTrigger>
          <TabsTrigger value="unpaid" className="text-red-600">
            Não Pagos ({unpaidOrders.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pendentes (
            {
              orders.filter((o) => ["pending", "confirmed"].includes(o.status))
                .length
            }
            )
          </TabsTrigger>
          <TabsTrigger value="shipped">
            Enviados (
            {
              orders.filter((o) => ["shipping", "delivered"].includes(o.status))
                .length
            }
            )
          </TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="space-y-4">
          {/* Vista Desktop - Tabela */}
          <div className="hidden lg:block">
            <OrdersTableMemo
              orders={filteredOrders}
              onViewOrder={handleViewOrder}
              onCancelOrder={handleCancelOrder}
              onSendFollowUp={handleRecoverUnpaidOrder}
              onPrintLabel={handlePrintLabel}
              onPrintDeclaration={handlePrintDeclaration}
              getOrderPaymentStatus={getOrderPaymentStatus}
              onStatusChange={updateOrderStatus}
            />
          </div>

          {/* Vista Mobile - Cards */}
          <div className="lg:hidden space-y-4">
            <OrdersGridMemo
              orders={filteredOrders}
              onViewOrder={handleViewOrder}
              onCancelOrder={handleCancelOrder}
              onSendFollowUp={handleRecoverUnpaidOrder}
              onPrintLabel={handlePrintLabel}
              onPrintDeclaration={handlePrintDeclaration}
              getOrderPaymentStatus={getOrderPaymentStatus}
            />
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Package2
                size={48}
                className="mx-auto text-muted-foreground mb-4"
              />
              <h3 className="text-lg font-semibold mb-2">
                Nenhum pedido encontrado
              </h3>
              <p className="text-muted-foreground">
                {searchTerm ||
                filterStatus !== "all" ||
                filterType !== "all" ||
                filterPayment !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Aguardando os primeiros pedidos da sua loja"}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de Detalhes Profissional */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={showOrderDetails}
        onClose={() => {
          setShowOrderDetails(false);
          setSelectedOrder(null);
        }}
        onCancelOrder={handleCancelOrder}
        onSendFollowUp={handleSendFollowUp}
        onPrintLabel={handlePrintLabel}
        onPrintDeclaration={handlePrintDeclaration}
        onMarkPrintedDocument={handleMarkPrintedDocument}
        onGenerateTrackingCode={handleGenerateTrackingCode}
      />
    </div>
  );
};

export default OrdersImproved;
