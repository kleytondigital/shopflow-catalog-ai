import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TrackingData {
  pagePath: string;
  pageTitle?: string;
  storeId?: string;
  metadata?: Record<string, any>;
}

export const useAnalyticsTracking = () => {
  const trackPageView = useCallback(async (data: TrackingData) => {
    try {
      // Temporariamente desabilitado - tabela não existe
      // const { error } = await supabase.from("analytics_views").insert({
      //   store_id: data.storeId || null,
      //   page_path: data.pagePath,
      //   page_title: data.pageTitle || document.title,
      //   user_agent: navigator.userAgent,
      //   referrer: document.referrer || null,
      //   view_count: 1,
      //   session_id: getSessionId(),
      // });
      // if (error) {
      //   console.warn("Erro ao rastrear visualização:", error);
      // }
    } catch (err) {
      console.warn("Erro ao rastrear visualização:", err);
    }
  }, []);

  const trackMetric = useCallback(
    async (
      metricType: string,
      value: number = 1,
      storeId?: string,
      metadata?: Record<string, any>
    ) => {
      try {
        // Temporariamente desabilitado - tabela não existe
        // const { error } = await supabase.from("analytics_metrics").insert({
        //   store_id: storeId || null,
        //   metric_type: metricType,
        //   metric_value: value,
        //   metadata: metadata || {},
        // });
        // if (error) {
        //   console.warn("Erro ao rastrear métrica:", error);
        // }
      } catch (err) {
        console.warn("Erro ao rastrear métrica:", err);
      }
    },
    []
  );

  const trackProductView = useCallback(
    async (productId: string, storeId?: string) => {
      await trackMetric("product_view", 1, storeId, { product_id: productId });
    },
    [trackMetric]
  );

  const trackCartAdd = useCallback(
    async (productId: string, quantity: number, storeId?: string) => {
      await trackMetric("cart_add", quantity, storeId, {
        product_id: productId,
      });
    },
    [trackMetric]
  );

  const trackCheckoutStart = useCallback(
    async (storeId?: string, metadata?: Record<string, any>) => {
      await trackMetric("checkout_start", 1, storeId, metadata);
    },
    [trackMetric]
  );

  const trackPurchase = useCallback(
    async (orderId: string, totalAmount: number, storeId?: string) => {
      await trackMetric("purchase", totalAmount, storeId, {
        order_id: orderId,
      });
    },
    [trackMetric]
  );

  return {
    trackPageView,
    trackMetric,
    trackProductView,
    trackCartAdd,
    trackCheckoutStart,
    trackPurchase,
  };
};

// Função auxiliar para gerar session ID
function getSessionId(): string {
  let sessionId = sessionStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    sessionStorage.setItem("analytics_session_id", sessionId);
  }
  return sessionId;
}
