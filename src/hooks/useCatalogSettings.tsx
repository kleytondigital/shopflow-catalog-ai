import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useStoreResolver } from "@/hooks/useStoreResolver";

export interface CatalogSettingsData {
  store_id?: string;
  template_name?: string;
  show_prices?: boolean;
  show_stock?: boolean;
  allow_categories_filter?: boolean;
  allow_price_filter?: boolean;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  background_color?: string;
  text_color?: string;
  border_color?: string;
  mobile_columns?: number;
  catalog_mode?: string;
  custom_domain?: string;
  catalog_url_slug?: string;
  checkout_type?: string;
  payment_methods?: any;
  business_hours?: any;
  shipping_options?: any;
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  whatsapp_number?: string;
  whatsapp_integration_active?: boolean;
  font_family?: string;
  layout_spacing?: number;
  border_radius?: number;
  retail_catalog_active?: boolean;
  wholesale_catalog_active?: boolean;
  watermark_enabled?: boolean;
  watermark_type?: string;
  watermark_text?: string;
  watermark_logo_url?: string;
  watermark_position?: string;
  watermark_opacity?: number;
  watermark_size?: number;
  watermark_color?: string;
  privacy_policy_content?: string;
  terms_of_use_content?: string;
  returns_policy_content?: string;
  delivery_policy_content?: string;
  about_us_content?: string;
  linkedin_url?: string;
  youtube_url?: string;
  tiktok_url?: string;
  footer_enabled?: boolean;
  footer_custom_text?: string;
  footer_copyright_text?: string;
  business_hours_display_type?: "summary" | "detailed";
  // Propriedades adicionais para compatibilidade com templates
  colors?: {
    primary: string;
    secondary: string;
    surface: string;
    text: string;
  };
  global?: {
    borderRadius: number;
    fontSize: {
      small: string;
      medium: string;
      large: string;
    };
  };
  productCard?: {
    showQuickView: boolean;
    showAddToCart: boolean;
    productCardStyle: string;
  };
}

export const useCatalogSettings = (storeIdentifier?: string) => {
  const { profile } = useAuth();
  const { resolveStoreId } = useStoreResolver();
  const [settings, setSettings] = useState<CatalogSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedStoreId, setResolvedStoreId] = useState<string | null>(null);

  // Resolver store ID uma vez
  useEffect(() => {
    const resolveStore = async () => {
      try {
        setError(null);
        const targetIdentifier = storeIdentifier || profile?.store_id;

        if (!targetIdentifier) {
          console.log(
            "useCatalogSettings: Nenhum identificador de loja disponível"
          );
          setSettings({});
          setResolvedStoreId(null);
          return;
        }

        console.log(
          "useCatalogSettings: Resolvendo store ID para:",
          targetIdentifier
        );
        const storeId = await resolveStoreId(targetIdentifier);

        if (!storeId) {
          console.error(
            "useCatalogSettings: Loja não encontrada para:",
            targetIdentifier
          );
          setError("Loja não encontrada");
          setSettings({});
          setResolvedStoreId(null);
          return;
        }

        console.log("useCatalogSettings: Store ID resolvido:", storeId);
        setResolvedStoreId(storeId);
      } catch (err) {
        console.error("useCatalogSettings: Erro ao resolver store ID:", err);
        setError("Erro ao carregar configurações da loja");
        setSettings({});
        setResolvedStoreId(null);
      }
    };

    resolveStore();
  }, [storeIdentifier, profile?.store_id, resolveStoreId]);

  const fetchSettings = async () => {
    if (!resolvedStoreId) {
      console.log("useCatalogSettings: Store ID não resolvido ainda");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(
        "useCatalogSettings: Buscando configurações para store_id:",
        resolvedStoreId
      );

      const { data, error: fetchError } = await supabase
        .from("store_settings")
        .select("*")
        .eq("store_id", resolvedStoreId)
        .maybeSingle();

      if (fetchError) {
        console.error(
          "useCatalogSettings: Erro ao buscar configurações:",
          fetchError
        );
        setError("Erro ao carregar configurações");
        setSettings({});
        return;
      }

      if (data) {
        console.log("useCatalogSettings: Configurações carregadas");
        setSettings({
          store_id: data.store_id,
          template_name: data.template_name,
          show_prices: data.show_prices,
          show_stock: data.show_stock,
          allow_categories_filter: data.allow_categories_filter,
          allow_price_filter: data.allow_price_filter,
          seo_title: data.seo_title,
          seo_description: data.seo_description,
          seo_keywords: data.seo_keywords,
          primary_color: data.primary_color,
          secondary_color: data.secondary_color,
          accent_color: data.accent_color,
          background_color: data.background_color,
          text_color: data.text_color,
          border_color: data.border_color,
          mobile_columns: data.mobile_columns,
          catalog_mode: data.catalog_mode,
          custom_domain: data.custom_domain,
          catalog_url_slug: data.catalog_url_slug,
          checkout_type: data.checkout_type,
          payment_methods: data.payment_methods,
          business_hours: data.business_hours,
          shipping_options: data.shipping_options,
          facebook_url: data.facebook_url,
          instagram_url: data.instagram_url,
          twitter_url: data.twitter_url,
          whatsapp_number: data.whatsapp_number,
          whatsapp_integration_active: data.whatsapp_integration_active,
          font_family: data.font_family,
          layout_spacing: data.layout_spacing,
          border_radius: data.border_radius,
          retail_catalog_active: data.retail_catalog_active,
          wholesale_catalog_active: data.wholesale_catalog_active,
          watermark_enabled: data.watermark_enabled,
          watermark_type: data.watermark_type,
          watermark_text: data.watermark_text,
          watermark_logo_url: data.watermark_logo_url,
          watermark_position: data.watermark_position,
          watermark_opacity: data.watermark_opacity,
          watermark_size: data.watermark_size,
          watermark_color: data.watermark_color,
          privacy_policy_content: (data as any).privacy_policy_content,
          terms_of_use_content: (data as any).terms_of_use_content,
          returns_policy_content: (data as any).returns_policy_content,
          delivery_policy_content: (data as any).delivery_policy_content,
          about_us_content: (data as any).about_us_content,
          linkedin_url: (data as any).linkedin_url,
          youtube_url: (data as any).youtube_url,
          tiktok_url: (data as any).tiktok_url,
          footer_enabled: (data as any).footer_enabled,
          footer_custom_text: (data as any).footer_custom_text,
          footer_copyright_text: (data as any).footer_copyright_text,
          business_hours_display_type:
            (data as any).business_hours_display_type || "summary",
        });
      } else {
        console.log(
          "useCatalogSettings: Nenhuma configuração encontrada, usando padrões"
        );
        setSettings({});
      }
    } catch (error) {
      console.error("useCatalogSettings: Erro geral:", error);
      setError("Erro ao carregar configurações");
      setSettings({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resolvedStoreId) {
      fetchSettings();
    } else if (resolvedStoreId === null && !loading) {
      setLoading(false);
    }
  }, [resolvedStoreId]);

  const updateSettings = async (updates: Partial<CatalogSettingsData>) => {
    if (!resolvedStoreId) {
      throw new Error("Store ID não disponível");
    }

    try {
      const { data, error } = await supabase
        .from("store_settings")
        .upsert(
          {
            store_id: resolvedStoreId,
            ...updates,
          },
          {
            onConflict: "store_id",
          }
        )
        .select()
        .single();

      if (error) {
        throw error;
      }

      await fetchSettings();
      return { data, error: null };
    } catch (error) {
      console.error(
        "useCatalogSettings: Erro ao atualizar configurações:",
        error
      );
      return { data: null, error };
    }
  };

  return {
    settings,
    loading,
    error,
    updateSettings,
    refetch: fetchSettings,
    storeId: resolvedStoreId,
  };
};
