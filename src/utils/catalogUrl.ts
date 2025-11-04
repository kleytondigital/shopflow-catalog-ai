/**
 * Utilitário para gerar URLs do catálogo baseado nas configurações da loja
 */

import { getSubdomainInfo } from './subdomainRouter';

interface CatalogSettings {
  domain_mode?: 'slug' | 'subdomain' | 'custom_domain';
  subdomain?: string;
  custom_domain?: string;
}

interface StoreInfo {
  id: string;
  url_slug?: string | null;
}

/**
 * Gera a URL do catálogo baseada nas configurações
 * @param store - Informações da loja
 * @param settings - Configurações do catálogo
 * @returns URL completa do catálogo
 */
export const generateCatalogUrl = (
  store: StoreInfo,
  settings?: CatalogSettings | null
): string => {
  if (!store) {
    return '';
  }

  const identifier = store.url_slug || store.id;
  const domainMode = settings?.domain_mode || 'slug';

  // Determinar URL base conforme domain_mode
  let baseUrl = '';
  let pathPrefix = '';

  if (domainMode === 'subdomain' && settings?.subdomain) {
    baseUrl = `https://${settings.subdomain}.aoseudispor.com.br`;
    pathPrefix = ''; // Sem /catalog/ no subdomínio
  } else if (domainMode === 'custom_domain' && settings?.custom_domain) {
    baseUrl = `https://${settings.custom_domain}`;
    pathPrefix = ''; // Sem /catalog/ no domínio próprio
  } else {
    baseUrl = 'https://app.aoseudispor.com.br';
    pathPrefix = `/catalog/${identifier}`; // Com /catalog/ no slug tradicional
  }

  return `${baseUrl}${pathPrefix}`;
};

/**
 * Gera a URL da página do produto baseada no contexto atual
 * @param productId - ID do produto
 * @param store - Informações da loja (opcional, usado para URL padrão)
 * @param settings - Configurações do catálogo (opcional)
 * @param storeIdentifier - Identificador da loja como fallback (opcional)
 * @returns URL completa do produto ou null se deve usar modal
 */
export const generateProductUrl = (
  productId: string,
  store?: StoreInfo | null,
  settings?: CatalogSettings | null,
  storeIdentifier?: string | null
): string | null => {
  if (!productId) {
    return null;
  }

  const { isSubdomain, subdomain } = getSubdomainInfo();

  // Se estiver em subdomínio, usar rota /produto/:productId
  if (isSubdomain && subdomain) {
    return `/produto/${productId}`;
  }

  // Se estiver no app principal com URL padrão, usar /catalog/:slug/produto/:productId
  // Tentar usar store primeiro, depois storeIdentifier como fallback
  let identifier: string | null = null;
  
  if (store) {
    identifier = store.url_slug || store.id;
  } else if (storeIdentifier) {
    identifier = storeIdentifier;
  }

  if (identifier) {
    return `/catalog/${identifier}/produto/${productId}`;
  }

  // Se não tiver informações da loja, retornar null para usar modal
  console.warn('⚠️ generateProductUrl - Não foi possível gerar URL: falta store ou storeIdentifier');
  return null;
};

/**
 * Hook helper para gerar URL do catálogo usando dados do hook useCatalogSettings
 * Esta função pode ser usada em componentes que já têm acesso ao useCatalogSettings
 */
export const getCatalogUrlFromSettings = (
  store: StoreInfo | null | undefined,
  settings: CatalogSettings | null | undefined
): string => {
  if (!store) {
    return '';
  }

  return generateCatalogUrl(store, settings);
};

/**
 * Hook helper para gerar URL do produto usando dados do hook useCatalogSettings
 * Retorna null se deve usar modal em vez de redirecionar
 */
export const getProductUrlFromSettings = (
  productId: string,
  store: StoreInfo | null | undefined,
  settings: CatalogSettings | null | undefined
): string | null => {
  if (!productId || !store) {
    return null;
  }

  return generateProductUrl(productId, store, settings);
};
