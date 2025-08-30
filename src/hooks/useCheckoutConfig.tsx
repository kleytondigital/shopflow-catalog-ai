import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PaymentMethod {
  id: string;
  name: string;
  type:
    | "pix"
    | "credit_card"
    | "debit_card"
    | "bank_transfer"
    | "cash"
    | "crypto";
  is_active: boolean;
  config?: {
    pix_key?: string;
    pix_key_type?: string;
    gateway_config?: any;
    instructions?: string;
  };
}

export interface ShippingMethod {
  id: string;
  name: string;
  type: "pickup" | "delivery" | "correios" | "custom";
  is_active: boolean;
  price: number;
  estimated_days?: number;
  config?: {
    pickup_address?: string;
    delivery_radius?: number;
    custom_instructions?: string;
  };
}

export interface OrderBumpConfig {
  id: string;
  product_id: string;
  is_active: boolean;
  discount_percentage?: number;
  urgency_text?: string;
  social_proof_text?: string;
  bundle_price?: number;
  is_limited_time?: boolean;
  limited_quantity?: number;
  trigger_conditions?: {
    min_cart_value?: number;
    specific_categories?: string[];
    customer_segments?: string[];
  };
}

export interface CheckoutConfig {
  payment_methods: PaymentMethod[];
  shipping_methods: ShippingMethod[];
  order_bump_products: any[];
  order_bump_configs: OrderBumpConfig[];
  store_settings: {
    checkout_upsell_enabled: boolean;
    urgency_timer_enabled: boolean;
    social_proof_enabled: boolean;
    trust_badges_enabled: boolean;
    quick_add_enabled: boolean;
  };
}

export const useCheckoutConfig = (storeId: string) => {
  const [config, setConfig] = useState<CheckoutConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCheckoutConfig = async () => {
      if (!storeId) return;

      setLoading(true);
      setError(null);

      try {
        // Buscar métodos de pagamento configurados
        const { data: paymentMethods } = await supabase
          .from("store_payment_methods")
          .select("*")
          .eq("store_id", storeId)
          .eq("is_active", true);

        // Buscar métodos de entrega configurados
        const { data: shippingMethods } = await supabase
          .from("store_shipping_methods")
          .select("*")
          .eq("store_id", storeId)
          .eq("is_active", true);

        // Buscar configurações de order bump - apenas ativos
        let orderBumpConfigs = [];
        try {
          console.log(
            "useCheckoutConfig: Buscando order bumps para store:",
            storeId
          );

          const { data, error } = await supabase
            .from("store_order_bump_configs")
            .select("*")
            .eq("store_id", storeId)
            .eq("is_active", true);

          if (error) {
            console.warn(
              "Tabela store_order_bump_configs não encontrada:",
              error
            );
            orderBumpConfigs = [];
          } else {
            console.log(
              "useCheckoutConfig: Order bumps encontrados:",
              data?.length || 0
            );

            // Buscar dados dos produtos separadamente
            if (data && data.length > 0) {
              const productIds = data.map((bump) => bump.product_id);
              const { data: products, error: productsError } = await supabase
                .from("products")
                .select(
                  "id, name, description, retail_price, wholesale_price, category"
                )
                .in("id", productIds)
                .eq("is_active", true);

              if (productsError) {
                console.error(
                  "Erro ao buscar produtos para order bumps:",
                  productsError
                );
                orderBumpConfigs = [];
              } else {
                // Combinar dados
                orderBumpConfigs = data
                  .map((bump) => ({
                    ...bump,
                    product:
                      products?.find((p) => p.id === bump.product_id) || null,
                  }))
                  .filter((bump) => bump.product); // Só incluir bumps com produtos válidos

                console.log(
                  "useCheckoutConfig: Order bumps com produtos:",
                  orderBumpConfigs.length
                );
              }
            }
          }
        } catch (err) {
          console.warn("Erro ao buscar order bumps:", err);
          orderBumpConfigs = [];
        }

        // Buscar configurações gerais da loja
        const { data: storeSettings } = await supabase
          .from("store_settings")
          .select(
            `
            checkout_upsell_enabled,
            urgency_timer_enabled,
            social_proof_enabled,
            trust_badges_enabled,
            quick_add_enabled
          `
          )
          .eq("store_id", storeId)
          .single();

        // Processar produtos order bump
        const orderBumpProducts =
          orderBumpConfigs?.map((config) => ({
            ...config.product,
            order_bump_config: {
              discount_percentage: config.discount_percentage,
              urgency_text: config.urgency_text,
              social_proof_text: config.social_proof_text,
              bundle_price: config.bundle_price,
              is_limited_time: config.is_limited_time,
              limited_quantity: config.limited_quantity,
            },
          })) || [];

        console.log(
          "useCheckoutConfig: Order bump products processados:",
          orderBumpProducts.length
        );

        // Sempre incluir métodos padrão "A Combinar"
        const allPaymentMethods = [
          {
            id: "a_combinar_payment",
            name: "A Combinar",
            type: "cash" as const,
            is_active: true,
            config: {
              instructions: "Forma de pagamento será definida via WhatsApp",
            },
          },
          ...(paymentMethods || []),
        ];

        const allShippingMethods = [
          {
            id: "a_combinar_shipping",
            name: "A Combinar",
            type: "custom" as const,
            is_active: true,
            price: 0,
            config: {
              custom_instructions:
                "Detalhes da entrega serão definidos via WhatsApp",
            },
          },
          ...(shippingMethods || []),
        ];

        setConfig({
          payment_methods: allPaymentMethods,
          shipping_methods: allShippingMethods,
          order_bump_products: orderBumpProducts,
          order_bump_configs: orderBumpConfigs || [],
          store_settings: {
            checkout_upsell_enabled:
              storeSettings?.checkout_upsell_enabled ?? true,
            urgency_timer_enabled: storeSettings?.urgency_timer_enabled ?? true,
            social_proof_enabled: storeSettings?.social_proof_enabled ?? true,
            trust_badges_enabled: storeSettings?.trust_badges_enabled ?? true,
            quick_add_enabled: storeSettings?.quick_add_enabled ?? true,
          },
        });
      } catch (err) {
        console.error("Erro ao buscar configurações do checkout:", err);
        setError("Erro ao carregar configurações");

        // Configurações padrão com métodos "A Combinar"
        const defaultPaymentMethods = [
          {
            id: "a_combinar_payment",
            name: "A Combinar",
            type: "cash" as const,
            is_active: true,
            config: {
              instructions: "Forma de pagamento será definida via WhatsApp",
            },
          },
          ...(paymentMethods || []),
        ];

        const defaultShippingMethods = [
          {
            id: "a_combinar_shipping",
            name: "A Combinar",
            type: "custom" as const,
            is_active: true,
            price: 0,
            config: {
              custom_instructions:
                "Detalhes da entrega serão definidos via WhatsApp",
            },
          },
          ...(shippingMethods || []),
        ];

        setConfig({
          payment_methods: defaultPaymentMethods,
          shipping_methods: defaultShippingMethods,
          order_bump_products: orderBumpProducts,
          order_bump_configs: orderBumpConfigs || [],
          store_settings: {
            checkout_upsell_enabled:
              storeSettings?.checkout_upsell_enabled ?? true,
            urgency_timer_enabled: storeSettings?.urgency_timer_enabled ?? true,
            social_proof_enabled: storeSettings?.social_proof_enabled ?? true,
            trust_badges_enabled: storeSettings?.trust_badges_enabled ?? true,
            quick_add_enabled: storeSettings?.quick_add_enabled ?? true,
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCheckoutConfig();
  }, [storeId]);

  return {
    config,
    loading,
    error,
    refetch: () => fetchCheckoutConfig(),
  };
};
