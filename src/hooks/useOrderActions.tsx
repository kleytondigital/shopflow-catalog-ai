import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Order } from "@/hooks/useOrders";

export const useOrderActions = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateTrackingCode = async (
    orderId: string,
    trackingCode: string,
    carrier?: string,
    estimatedDate?: string
  ) => {
    try {
      setLoading(true);

      const updateData: any = {
        tracking_code: trackingCode,
        updated_at: new Date().toISOString(),
      };

      if (carrier) updateData.carrier = carrier;
      if (estimatedDate) updateData.estimated_delivery_date = estimatedDate;

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Código de rastreio atualizado com sucesso.",
      });

      return { success: true };
    } catch (error) {
      console.error("Erro ao atualizar código de rastreio:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar código de rastreio.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const markDocumentPrinted = async (
    orderId: string,
    documentType: "label" | "picking_list" | "content_declaration" | "receipt",
    userId?: string
  ) => {
    try {
      setLoading(true);

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      const timestamp = new Date().toISOString();

      switch (documentType) {
        case "label":
          updateData.label_generated_at = timestamp;
          if (userId) updateData.label_generated_by = userId;
          break;
        case "picking_list":
          updateData.picking_list_printed_at = timestamp;
          if (userId) updateData.picking_list_printed_by = userId;
          break;
        case "content_declaration":
          updateData.content_declaration_printed_at = timestamp;
          if (userId) updateData.content_declaration_printed_by = userId;
          break;
        case "receipt":
          updateData.receipt_printed_at = timestamp;
          if (userId) updateData.receipt_printed_by = userId;
          break;
      }

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId);

      if (error) throw error;

      const documentNames = {
        label: "etiqueta",
        picking_list: "romaneio",
        content_declaration: "declaração de conteúdo",
        receipt: "recibo",
      };

      toast({
        title: "Documento marcado!",
        description: `${documentNames[documentType]} marcada como impressa.`,
      });

      return { success: true };
    } catch (error) {
      console.error("Erro ao marcar documento:", error);
      toast({
        title: "Erro",
        description: "Erro ao marcar documento como impresso.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from("orders")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (error) throw error;

      const statusNames = {
        pending: "Pendente",
        confirmed: "Confirmado",
        preparing: "Preparando",
        shipping: "Enviado",
        delivered: "Entregue",
        cancelled: "Cancelado",
      };

      toast({
        title: "Status atualizado!",
        description: `Pedido marcado como ${
          statusNames[newStatus as keyof typeof statusNames] || newStatus
        }.`,
      });

      return { success: true };
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do pedido.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const sendFollowUpMessage = async (order: Order) => {
    try {
      const message =
        `🔔 *LEMBRETE DE PAGAMENTO*\n\n` +
        `Olá ${order.customer_name}!\n\n` +
        `Seu pedido #${order.id.slice(
          -8
        )} ainda está aguardando o pagamento.\n\n` +
        `💰 *Valor:* R$ ${order.total_amount.toFixed(2)}\n` +
        `📅 *Data do Pedido:* ${new Date(order.created_at).toLocaleDateString(
          "pt-BR"
        )}\n\n` +
        `Para finalizar sua compra, entre em contato conosco:\n` +
        `📱 WhatsApp ou 📧 Email\n\n` +
        `Obrigado pela preferência! 😊`;

      if (order.customer_phone) {
        const whatsappUrl = `https://wa.me/${order.customer_phone.replace(
          /\D/g,
          ""
        )}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");

        toast({
          title: "WhatsApp aberto!",
          description: "Mensagem de cobrança preparada para envio.",
        });
      } else {
        // Copiar para clipboard
        navigator.clipboard.writeText(message);
        toast({
          title: "Mensagem copiada!",
          description: "Cole no WhatsApp do cliente.",
        });
      }

      return { success: true };
    } catch (error) {
      console.error("Erro ao enviar follow-up:", error);
      toast({
        title: "Erro",
        description: "Erro ao preparar mensagem de cobrança.",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const generateOrderReport = async (orders: Order[]) => {
    try {
      setLoading(true);

      // Calcular estatísticas
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce(
        (sum, order) => sum + order.total_amount,
        0
      );
      const ordersWithBumps = orders.filter((order) =>
        order.items?.some((item) => item.is_order_bump)
      ).length;

      const bumpRevenue = orders.reduce((sum, order) => {
        return (
          sum +
          (order.items?.reduce((itemSum, item) => {
            return itemSum + (item.is_order_bump ? item.total_price || 0 : 0);
          }, 0) || 0)
        );
      }, 0);

      const reportData = {
        period: `${new Date().toLocaleDateString("pt-BR")}`,
        totalOrders,
        totalRevenue,
        ordersWithBumps,
        bumpRevenue,
        conversionRate:
          totalOrders > 0 ? (ordersWithBumps / totalOrders) * 100 : 0,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      };

      // Gerar CSV
      const csvContent =
        `data:text/csv;charset=utf-8,` +
        `Relatório de Pedidos - ${reportData.period}\n` +
        `Total de Pedidos,${totalOrders}\n` +
        `Receita Total,R$ ${totalRevenue.toFixed(2)}\n` +
        `Pedidos com Order Bump,${ordersWithBumps}\n` +
        `Receita Order Bumps,R$ ${bumpRevenue.toFixed(2)}\n` +
        `Taxa de Conversão,${reportData.conversionRate.toFixed(1)}%\n` +
        `Ticket Médio,R$ ${reportData.averageOrderValue.toFixed(2)}\n\n` +
        `ID do Pedido,Cliente,Status,Total,Data,Tem Order Bump\n` +
        orders
          .map(
            (order) =>
              `${order.id.slice(-8)},${order.customer_name},${
                order.status
              },R$ ${order.total_amount.toFixed(2)},${new Date(
                order.created_at
              ).toLocaleDateString("pt-BR")},${
                order.items?.some((item) => item.is_order_bump) ? "Sim" : "Não"
              }`
          )
          .join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `relatorio_pedidos_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Relatório gerado!",
        description: "Download iniciado automaticamente.",
      });

      return { success: true };
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      toast({
        title: "Erro",
        description: "Erro ao gerar relatório.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    updateTrackingCode,
    markDocumentPrinted,
    updateOrderStatus,
    sendFollowUpMessage,
    generateOrderReport,
  };
};

export default useOrderActions;
