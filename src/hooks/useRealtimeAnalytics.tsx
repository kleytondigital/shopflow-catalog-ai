import { useEffect, useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

interface RealtimeData {
  orders: number;
  revenue: number;
  views: number;
  lastUpdate: Date;
}

export const useRealtimeAnalytics = (storeId?: string) => {
  const [realtimeData, setRealtimeData] = useState<RealtimeData>({
    orders: 0,
    revenue: 0,
    views: 0,
    lastUpdate: new Date(),
  });
  const [isConnected, setIsConnected] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const updateMetrics = useCallback((newData: Partial<RealtimeData>) => {
    setRealtimeData((prev) => ({
      ...prev,
      ...newData,
      lastUpdate: new Date(),
    }));
  }, []);

  useEffect(() => {
    // Criar canal de tempo real para superadmin (todos os dados)
    const channelName = storeId ? `analytics-${storeId}` : "analytics-global";
    const realtimeChannel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          ...(storeId && { filter: `store_id=eq.${storeId}` }),
        },
        (payload) => {
          console.log("Novo pedido em tempo real:", payload);
          updateMetrics({
            orders: realtimeData.orders + 1,
            revenue: realtimeData.revenue + (payload.new.total_amount || 0),
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          ...(storeId && { filter: `store_id=eq.${storeId}` }),
        },
        (payload) => {
          console.log("Pedido atualizado em tempo real:", payload);
          // Aqui você pode implementar lógica para atualizar métricas
          // baseada em mudanças de status, por exemplo
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "analytics_views",
          ...(storeId && { filter: `store_id=eq.${storeId}` }),
        },
        (payload) => {
          console.log("Nova visualização em tempo real:", payload);
          updateMetrics({
            views: realtimeData.views + (payload.new.view_count || 1),
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "analytics_metrics",
          ...(storeId && { filter: `store_id=eq.${storeId}` }),
        },
        (payload) => {
          console.log("Nova métrica em tempo real:", payload);
          // Atualizar métricas baseadas no tipo
          if (payload.new.metric_type === "purchase") {
            updateMetrics({
              revenue: realtimeData.revenue + (payload.new.metric_value || 0),
            });
          }
        }
      )
      .subscribe((status) => {
        console.log("Status da conexão WebSocket:", status);
        setIsConnected(status === "SUBSCRIBED");
      });

    setChannel(realtimeChannel);

    // Cleanup
    return () => {
      realtimeChannel.unsubscribe();
    };
  }, [
    storeId,
    realtimeData.orders,
    realtimeData.revenue,
    realtimeData.views,
    updateMetrics,
  ]);

  const refreshData = useCallback(async () => {
    try {
      // Buscar dados atuais
      let ordersQuery = supabase
        .from("orders")
        .select("total_amount")
        .gte(
          "created_at",
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        );

      if (storeId) {
        ordersQuery = ordersQuery.eq("store_id", storeId);
      }

      const { data: ordersData } = await ordersQuery;

      // Temporariamente desabilitado - tabela não existe
      // let viewsQuery = supabase
      //   .from("analytics_views")
      //   .select("view_count")
      //   .gte(
      //     "created_at",
      //     new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      //   );

      // if (storeId) {
      //   viewsQuery = viewsQuery.eq("store_id", storeId);
      // }

      // const { data: viewsData } = await viewsQuery;

      const orders = ordersData?.length || 0;
      const revenue =
        ordersData?.reduce(
          (sum, order) => sum + (order.total_amount || 0),
          0
        ) || 0;
      const views = 0; // Temporariamente retornar 0

      updateMetrics({ orders, revenue, views });
    } catch (error) {
      console.error("Erro ao atualizar dados em tempo real:", error);
    }
  }, [storeId, updateMetrics]);

  // Atualizar dados a cada 30 segundos como fallback
  useEffect(() => {
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [refreshData]);

  return {
    realtimeData,
    isConnected,
    refreshData,
  };
};
