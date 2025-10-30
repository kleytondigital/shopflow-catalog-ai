import { useEffect } from "react";
import { useCatalog } from "./useCatalog";
import { useCatalogSettings } from "./useCatalogSettings";
import { useStoreSubscription } from "./useStoreSubscription";

interface UseDynamicMetaTagsProps {
  storeIdentifier?: string;
  catalogType?: "retail" | "wholesale";
  customTitle?: string;
  customDescription?: string;
  customImage?: string;
}

export const useDynamicMetaTags = ({
  storeIdentifier,
  catalogType = "retail",
  customTitle,
  customDescription,
  customImage,
}: UseDynamicMetaTagsProps) => {
  const { store } = useCatalog(storeIdentifier);
  const { settings } = useCatalogSettings(storeIdentifier);
  const { subscription, loading: subscriptionLoading } = useStoreSubscription(store?.id);

  useEffect(() => {
    if (!store || subscriptionLoading) return;

    // Função para atualizar meta tags
    const updateMetaTags = () => {
      // Verificar se o plano é premium
      const isPremium = subscription?.plan?.type === 'premium';

      console.log('🏷️ Meta tags - Verificação de plano:', {
        storeId: store.id,
        storeName: store.name,
        planType: subscription?.plan?.type,
        isPremium,
      });

      // Título da página (com lógica de plano)
      const title = customTitle || 
        (isPremium ? (settings?.seo_title || store.name) : null) || 
        "B2X - Catálogos Online";
      
      document.title = title;

      // Meta description (com lógica de plano)
      const description = customDescription || 
        (isPremium ? (settings?.seo_description || store.description) : null) || 
        "Catálogos online personalizados para sua empresa";

      updateMetaTag("description", description);
      updateMetaTag("og:description", description);

      // Meta title para Open Graph
      updateMetaTag("og:title", title);

      // Imagem da empresa (logo) - com lógica de plano
      const imageUrl = customImage || 
        (isPremium ? store.logo_url : null) || 
        "/b2x-logo.png";

      updateMetaTag("og:image", imageUrl);
      updateMetaTag("twitter:image", imageUrl);

      // URL do site
      const currentUrl = window.location.href;
      updateMetaTag("og:url", currentUrl);

      // Tipo de conteúdo
      updateMetaTag("og:type", "website");

      // Twitter card
      updateMetaTag("twitter:card", "summary_large_image");

      // Site do Twitter (se configurado)
      if (settings?.twitter_url) {
        updateMetaTag("twitter:site", settings.twitter_url);
      }

      // Keywords SEO
      if (settings?.seo_keywords) {
        updateMetaTag("keywords", settings.seo_keywords);
      }

      // Autor
      updateMetaTag("author", store.name);

      console.log("🏷️ Meta tags atualizadas para:", store.name);
    };

    // Função auxiliar para atualizar meta tags
    const updateMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(
        `meta[name="${name}"]`
      ) as HTMLMetaElement;

      if (!meta) {
        meta = document.querySelector(
          `meta[property="${name}"]`
        ) as HTMLMetaElement;
      }

      if (meta) {
        meta.setAttribute("content", content);
      } else {
        // Criar nova meta tag se não existir
        meta = document.createElement("meta");
        if (name.startsWith("og:") || name.startsWith("twitter:")) {
          meta.setAttribute("property", name);
        } else {
          meta.setAttribute("name", name);
        }
        meta.setAttribute("content", content);
        document.head.appendChild(meta);
      }
    };

    // Atualizar meta tags quando os dados da loja estiverem disponíveis
    updateMetaTags();
  }, [store, settings, subscription, subscriptionLoading, customTitle, customDescription, customImage]);

  return {
    store,
    settings,
    isLoaded: !!store,
  };
};
