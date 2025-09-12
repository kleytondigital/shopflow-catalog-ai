import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AnalyticsNotification {
  id: string;
  store_id: string | null;
  notification_type:
    | "high_revenue"
    | "low_stock"
    | "new_customer"
    | "abandoned_cart"
    | "system";
  title: string;
  message: string;
  is_read: boolean;
  metadata: Record<string, any>;
  created_at: string;
}

export const useAnalyticsNotifications = (storeId?: string) => {
  const [notifications, setNotifications] = useState<AnalyticsNotification[]>(
    []
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotifications = useCallback(async () => {
    try {
      // Temporariamente desabilitado - tabela não existe
      // let query = supabase
      //   .from("analytics_notifications")
      //   .select("*")
      //   .order("created_at", { ascending: false })
      //   .limit(50);

      // if (storeId) {
      //   query = query.eq("store_id", storeId);
      // }

      // const { data, error } = await query;

      // if (error) throw error;

      // setNotifications(data || []);
      // setUnreadCount(data?.filter((n) => !n.is_read).length || 0);

      // Retornar dados vazios temporariamente
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Erro ao buscar notificações:", err);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // Temporariamente desabilitado - tabela não existe
      // const { error } = await supabase
      //   .from("analytics_notifications")
      //   .update({ is_read: true })
      //   .eq("id", notificationId);
      // if (error) throw error;
      // setNotifications((prev) =>
      //   prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      // );
      // setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Erro ao marcar notificação como lida:", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      // Temporariamente desabilitado - tabela não existe
      // const unreadIds = notifications
      //   .filter((n) => !n.is_read)
      //   .map((n) => n.id);
      // if (unreadIds.length === 0) return;
      // const { error } = await supabase
      //   .from("analytics_notifications")
      //   .update({ is_read: true })
      //   .in("id", unreadIds);
      // if (error) throw error;
      // setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      // setUnreadCount(0);
    } catch (err) {
      console.error("Erro ao marcar todas como lidas:", err);
    }
  }, [notifications]);

  const createNotification = useCallback(
    async (
      type: AnalyticsNotification["notification_type"],
      title: string,
      message: string,
      targetStoreId?: string,
      metadata?: Record<string, any>
    ) => {
      try {
        // Temporariamente desabilitado - tabela não existe
        // const { error } = await supabase
        //   .from("analytics_notifications")
        //   .insert({
        //     store_id: targetStoreId || storeId || null,
        //     notification_type: type,
        //     title,
        //     message,
        //     metadata: metadata || {},
        //   });
        // if (error) throw error;
        // // Recarregar notificações
        // await fetchNotifications();
        // // Mostrar toast para notificações importantes
        // if (type === "high_revenue" || type === "low_stock") {
        //   toast({
        //     title,
        //     description: message,
        //     duration: 5000,
        //   });
        // }
      } catch (err) {
        console.error("Erro ao criar notificação:", err);
      }
    },
    [storeId, fetchNotifications, toast]
  );

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      // Temporariamente desabilitado - tabela não existe
      // const { error } = await supabase
      //   .from("analytics_notifications")
      //   .delete()
      //   .eq("id", notificationId);
      // if (error) throw error;
      // setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      // setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Erro ao deletar notificação:", err);
    }
  }, []);

  // Verificar alertas automáticos
  const checkAlerts = useCallback(async () => {
    if (!storeId) return;

    try {
      // Temporariamente desabilitado - funcionalidade de notificações desabilitada
      // // Verificar receita alta
      // const { data: revenueData } = await supabase
      //   .from("orders")
      //   .select("total_amount")
      //   .eq("store_id", storeId)
      //   .eq("status", "delivered")
      //   .gte(
      //     "created_at",
      //     new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      //   );
      // const todayRevenue =
      //   revenueData?.reduce(
      //     (sum, order) => sum + (order.total_amount || 0),
      //     0
      //   ) || 0;
      // if (todayRevenue > 1000) {
      //   // Threshold de R$ 1000
      //   await createNotification(
      //     "high_revenue",
      //     "Receita Alta Hoje! 🎉",
      //     `Sua loja faturou R$ ${todayRevenue.toFixed(
      //       2
      //     )} nas últimas 24 horas!`,
      //     storeId,
      //     { revenue: todayRevenue }
      //   );
      // }
      // // Verificar estoque baixo
      // const { data: lowStockProducts } = await supabase
      //   .from("products")
      //   .select("name, stock")
      //   .eq("store_id", storeId)
      //   .eq("is_active", true)
      //   .lte("stock", 5);
      // if (lowStockProducts && lowStockProducts.length > 0) {
      //   await createNotification(
      //     "low_stock",
      //     "Estoque Baixo ⚠️",
      //     `${
      //       lowStockProducts.length
      //     } produto(s) com estoque baixo: ${lowStockProducts
      //       .map((p) => p.name)
      //       .join(", ")}`,
      //     storeId,
      //     { products: lowStockProducts }
      //   );
      // }
    } catch (err) {
      console.error("Erro ao verificar alertas:", err);
    }
  }, [storeId, createNotification]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Verificar alertas a cada 5 minutos
  useEffect(() => {
    const interval = setInterval(checkAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkAlerts]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
    deleteNotification,
    checkAlerts,
  };
};
