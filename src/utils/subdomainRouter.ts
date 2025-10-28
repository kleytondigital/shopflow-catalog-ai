/**
 * Utility functions for SaaS subdomain routing
 * Handles dynamic subdomain detection and routing logic
 */

export interface SubdomainInfo {
  isSubdomain: boolean;
  subdomain: string | null;
  isMainApp: boolean;
  hostname: string;
}

/**
 * Extract subdomain information from current hostname
 */
export const getSubdomainInfo = (): SubdomainInfo => {
  const hostname = window.location.hostname;
  
  // Development environment
  if (hostname === 'localhost' || hostname.startsWith('127.0.0.1') || hostname.startsWith('192.168.')) {
    return {
      isSubdomain: false,
      subdomain: null,
      isMainApp: true,
      hostname
    };
  }

  // Main app domain
  if (hostname === 'app.aoseudispor.com.br') {
    return {
      isSubdomain: false,
      subdomain: null,
      isMainApp: true,
      hostname
    };
  }

  // Check for subdomain pattern: {subdomain}.aoseudispor.com.br
  const subdomainMatch = hostname.match(/^(.+)\.aoseudispor\.com\.br$/);
  if (subdomainMatch) {
    const subdomain = subdomainMatch[1];
    
    // Exclude known system subdomains
    const systemSubdomains = ['app', 'www', 'api', 'admin', 'mail', 'ftp'];
    if (systemSubdomains.includes(subdomain)) {
      return {
        isSubdomain: false,
        subdomain: null,
        isMainApp: true,
        hostname
      };
    }

    return {
      isSubdomain: true,
      subdomain,
      isMainApp: false,
      hostname
    };
  }

  // Custom domain (future support)
  // This would check against a database of custom domains
  
  // Fallback to main app
  return {
    isSubdomain: false,
    subdomain: null,
    isMainApp: true,
    hostname
  };
};

/**
 * Check if current context should show catalog
 */
export const shouldShowCatalog = (): boolean => {
  const { isSubdomain } = getSubdomainInfo();
  return isSubdomain;
};

/**
 * Check if current context should show admin interface
 */
export const shouldShowAdmin = (): boolean => {
  const { isMainApp } = getSubdomainInfo();
  return isMainApp;
};

/**
 * Get the appropriate redirect URL for tenant catalog
 */
export const getTenantCatalogUrl = (tenantSlug: string): string => {
  const baseUrl = window.location.protocol + '//' + window.location.host;
  
  // If we're on a subdomain, construct the subdomain URL
  if (tenantSlug) {
    return `https://${tenantSlug}.aoseudispor.com.br`;
  }
  
  // Fallback to slug-based URL
  return `${baseUrl}/catalog/${tenantSlug}`;
};

/**
 * Get canonical URL for sharing/SEO
 */
export const getCanonicalUrl = (tenantSlug: string, path: string = ''): string => {
  const { isSubdomain, subdomain } = getSubdomainInfo();
  
  if (isSubdomain && subdomain) {
    return `https://${subdomain}.aoseudispor.com.br${path}`;
  }
  
  return `https://app.aoseudispor.com.br/catalog/${tenantSlug}${path}`;
};

/**
 * Validate subdomain format for tenant registration
 */
export const validateSubdomainFormat = (subdomain: string): { valid: boolean; error?: string } => {
  if (!subdomain || subdomain.trim() === '') {
    return { valid: false, error: 'Subdomínio não pode ser vazio' };
  }

  // Length validation
  if (subdomain.length < 3) {
    return { valid: false, error: 'Subdomínio deve ter pelo menos 3 caracteres' };
  }

  if (subdomain.length > 63) {
    return { valid: false, error: 'Subdomínio deve ter no máximo 63 caracteres' };
  }

  // Format validation: only lowercase letters, numbers, and hyphens
  const formatRegex = /^[a-z0-9-]+$/;
  if (!formatRegex.test(subdomain)) {
    return { valid: false, error: 'Apenas letras minúsculas, números e hífen são permitidos' };
  }

  // Cannot start or end with hyphen
  if (subdomain.startsWith('-') || subdomain.endsWith('-')) {
    return { valid: false, error: 'Subdomínio não pode começar ou terminar com hífen' };
  }

  // Reserved subdomains
  const reserved = [
    'www', 'app', 'admin', 'api', 'mail', 'ftp', 'blog', 'shop', 'store',
    'dashboard', 'panel', 'control', 'manage', 'system', 'root', 'test',
    'staging', 'dev', 'demo', 'support', 'help', 'docs', 'cdn', 'media',
    'assets', 'static', 'files', 'uploads', 'downloads', 'backup'
  ];
  
  if (reserved.includes(subdomain.toLowerCase())) {
    return { valid: false, error: 'Este subdomínio está reservado pelo sistema' };
  }

  return { valid: true };
};

/**
 * Debug information for development
 */
export const getSubdomainDebugInfo = () => {
  const info = getSubdomainInfo();
  
  return {
    ...info,
    currentUrl: window.location.href,
    shouldShowCatalog: shouldShowCatalog(),
    shouldShowAdmin: shouldShowAdmin(),
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  };
};

/**
 * Log subdomain info for debugging (development only)
 */
export const logSubdomainInfo = () => {
  if (process.env.NODE_ENV === 'development') {
    console.group('🌐 Subdomain Router Debug');
    console.table(getSubdomainDebugInfo());
    console.groupEnd();
  }
};
