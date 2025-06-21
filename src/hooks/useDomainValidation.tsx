
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DomainValidationResult {
  isValid: boolean;
  isAvailable: boolean;
  errors: string[];
  suggestions?: string[];
}

export const useDomainValidation = () => {
  const [isValidating, setIsValidating] = useState(false);

  const validateDomain = useCallback(async (domain: string): Promise<DomainValidationResult> => {
    setIsValidating(true);
    
    try {
      // Remove protocol if present
      const cleanDomain = domain.replace(/^https?:\/\//, '').toLowerCase();
      
      const errors: string[] = [];
      const suggestions: string[] = [];

      // Basic format validation
      const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
      
      if (!domainRegex.test(cleanDomain)) {
        errors.push('Formato de domínio inválido');
        suggestions.push('Use o formato: www.seusite.com.br');
      }

      // Check for forbidden domains
      const forbiddenDomains = [
        'localhost',
        '127.0.0.1',
        'example.com',
        'test.com',
        'google.com',
        'facebook.com',
        'instagram.com'
      ];

      if (forbiddenDomains.some(forbidden => cleanDomain.includes(forbidden))) {
        errors.push('Domínio não permitido');
      }

      // Check if domain is already in use by another store
      if (errors.length === 0) {
        const { data: existingStores, error } = await supabase
          .from('store_settings')
          .select('store_id')
          .eq('custom_domain', cleanDomain)
          .neq('store_id', 'current-store-id'); // TODO: Replace with actual current store ID

        if (error) {
          console.error('Erro ao verificar domínio:', error);
          errors.push('Erro ao verificar disponibilidade do domínio');
        } else if (existingStores && existingStores.length > 0) {
          errors.push('Este domínio já está sendo usado por outra loja');
        }
      }

      return {
        isValid: errors.length === 0,
        isAvailable: errors.length === 0,
        errors,
        suggestions: suggestions.length > 0 ? suggestions : undefined
      };

    } catch (error) {
      console.error('Erro na validação de domínio:', error);
      return {
        isValid: false,
        isAvailable: false,
        errors: ['Erro interno na validação']
      };
    } finally {
      setIsValidating(false);
    }
  }, []);

  const validateSlug = useCallback((slug: string): DomainValidationResult => {
    const errors: string[] = [];
    const suggestions: string[] = [];

    // Basic validation
    if (slug.length < 3) {
      errors.push('URL deve ter pelo menos 3 caracteres');
    }

    if (slug.length > 50) {
      errors.push('URL deve ter no máximo 50 caracteres');
    }

    // Only allow letters, numbers, and hyphens
    const slugRegex = /^[a-zA-Z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      errors.push('URL deve conter apenas letras, números e hífens');
      suggestions.push('Exemplo: minha-loja-online');
    }

    // Cannot start or end with hyphen
    if (slug.startsWith('-') || slug.endsWith('-')) {
      errors.push('URL não pode começar ou terminar com hífen');
    }

    // Cannot have consecutive hyphens
    if (slug.includes('--')) {
      errors.push('URL não pode ter hífens consecutivos');
    }

    // Reserved words
    const reservedWords = [
      'admin', 'api', 'www', 'mail', 'ftp', 'localhost', 'root',
      'support', 'help', 'about', 'contact', 'terms', 'privacy'
    ];

    if (reservedWords.includes(slug.toLowerCase())) {
      errors.push('Esta URL é reservada pelo sistema');
      suggestions.push(`Use: ${slug}-loja ou minha-${slug}`);
    }

    return {
      isValid: errors.length === 0,
      isAvailable: errors.length === 0,
      errors,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  }, []);

  return {
    validateDomain,
    validateSlug,
    isValidating
  };
};
