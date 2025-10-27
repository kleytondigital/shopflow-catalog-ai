/**
 * Middleware de Validação de Domínio
 * Verifica status de domínios customizados antes de renderizar catálogo
 */

export interface DomainStatus {
  canRender: boolean;
  warnings: string[];
  errors: string[];
  sslStatus?: 'pending' | 'active' | 'failed';
}

export const validateDomainAccess = (storeSettings: any): DomainStatus => {
  const warnings: string[] = [];
  const errors: string[] = [];
  let canRender = true;

  const domainMode = storeSettings?.domain_mode || 'slug';

  // Modo: Domínio Próprio
  if (domainMode === 'custom_domain') {
    // Verificar se domínio está configurado
    if (!storeSettings?.custom_domain) {
      errors.push('Domínio próprio não configurado');
      canRender = false;
    }

    // Verificar se domínio está verificado
    if (!storeSettings?.custom_domain_verified) {
      warnings.push('Domínio próprio ainda não foi verificado via DNS');
      errors.push('Domínio não verificado. Configure o DNS conforme instruções no painel admin.');
      canRender = false;
    }

    // Verificar SSL
    if (storeSettings?.ssl_cert_status === 'failed') {
      warnings.push('Certificado SSL falhou. Configure com Let\'s Encrypt.');
    }

    if (storeSettings?.ssl_cert_status === 'pending') {
      warnings.push('Certificado SSL pendente. Execute certbot conforme instruções.');
    }
  }

  // Modo: Subdomínio
  if (domainMode === 'subdomain') {
    // Verificar se subdomínio está configurado
    if (!storeSettings?.subdomain) {
      errors.push('Subdomínio não configurado');
      canRender = false;
    }

    // Verificar se subdomínio está ativado
    if (!storeSettings?.subdomain_enabled) {
      errors.push('Subdomínio não está ativado. Ative nas configurações.');
      canRender = false;
    }
  }

  return {
    canRender,
    warnings,
    errors,
    sslStatus: storeSettings?.ssl_cert_status,
  };
};

/**
 * Gera mensagem de erro amigável
 */
export const getDomainErrorMessage = (status: DomainStatus, domainMode: string, domain?: string): string => {
  if (status.canRender) {
    return '';
  }

  const domainLabel = domainMode === 'custom_domain' 
    ? `Domínio: ${domain}`
    : `Subdomínio: ${domain}`;

  const errorMessages = status.errors.join('; ');
  
  return `${domainLabel} - ${errorMessages}`;
};

