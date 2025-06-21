
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe, Check, AlertCircle, ExternalLink, Copy } from 'lucide-react';
import { useCatalogSettings } from '@/hooks/useCatalogSettings';
import { useToast } from '@/hooks/use-toast';

const DomainSettings = () => {
  const { settings, loading, updateSettings } = useCatalogSettings();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [validatingDomain, setValidatingDomain] = useState(false);
  const [domainStatus, setDomainStatus] = useState<'valid' | 'invalid' | 'pending' | null>(null);

  const validateDomain = (domain: string): boolean => {
    if (!domain) return true; // Empty domain is valid (uses default)
    
    // Remove protocol if present
    const cleanDomain = domain.replace(/^https?:\/\//, '');
    
    // Basic domain validation regex
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    
    return domainRegex.test(cleanDomain);
  };

  const validateSlug = (slug: string): boolean => {
    if (!slug) return true; // Empty slug is valid
    
    // Only allow letters, numbers, and hyphens
    const slugRegex = /^[a-zA-Z0-9-]+$/;
    
    return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 50;
  };

  const handleDomainChange = async (field: string, value: string) => {
    setSaving(true);
    
    try {
      // Validate domain format
      if (field === 'custom_domain' && !validateDomain(value)) {
        toast({
          title: "Domínio inválido",
          description: "Por favor, insira um domínio válido (ex: www.meusite.com.br)",
          variant: "destructive"
        });
        setSaving(false);
        return;
      }

      // Validate URL slug
      if (field === 'catalog_url_slug' && !validateSlug(value)) {
        toast({
          title: "URL inválida",
          description: "A URL deve conter apenas letras, números e hífens (3-50 caracteres)",
          variant: "destructive"
        });
        setSaving(false);
        return;
      }

      const { error } = await updateSettings({ [field]: value || null });
      
      if (error) {
        throw error;
      }

      toast({
        title: "Configuração atualizada",
        description: "As alterações foram salvas com sucesso",
      });

      // If domain was set, show validation status
      if (field === 'custom_domain' && value) {
        setDomainStatus('pending');
      }

    } catch (error) {
      console.error('Erro ao atualizar domínio:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Link copiado para a área de transferência",
    });
  };

  const generateCatalogUrl = () => {
    if (!settings) return '';
    
    const baseUrl = settings.custom_domain 
      ? `https://${settings.custom_domain}`
      : 'https://catalogo.exemplo.com'; // URL base padrão do sistema
    
    const slug = settings.catalog_url_slug || 'loja';
    
    return `${baseUrl}/${slug}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <p className="text-gray-500">Erro ao carregar configurações de domínio</p>
        </CardContent>
      </Card>
    );
  }

  const catalogUrl = generateCatalogUrl();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-6 w-6 text-blue-600" />
          Configurações de Domínio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Domínio Personalizado */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="custom_domain">Domínio Personalizado</Label>
            {domainStatus === 'valid' && (
              <Badge variant="outline" className="text-green-600 border-green-200">
                <Check className="h-3 w-3 mr-1" />
                Verificado
              </Badge>
            )}
            {domainStatus === 'pending' && (
              <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                <AlertCircle className="h-3 w-3 mr-1" />
                Verificando
              </Badge>
            )}
          </div>
          
          <Input
            id="custom_domain"
            placeholder="www.meusite.com.br"
            value={settings.custom_domain || ''}
            onChange={(e) => handleDomainChange('custom_domain', e.target.value)}
            disabled={saving}
            className="font-mono"
          />
          
          <p className="text-sm text-muted-foreground">
            Deixe em branco para usar o domínio padrão do sistema
          </p>

          {settings.custom_domain && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Configuração DNS necessária:</strong><br />
                Para usar seu domínio personalizado, configure um registro CNAME apontando para nossos servidores.
                Entre em contato com o suporte para obter as configurações específicas.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* URL do Catálogo */}
        <div className="space-y-3">
          <Label htmlFor="catalog_url_slug">URL do Catálogo</Label>
          
          <div className="flex gap-2">
            <Input
              id="catalog_url_slug"
              placeholder="minha-loja"
              value={settings.catalog_url_slug || ''}
              onChange={(e) => handleDomainChange('catalog_url_slug', e.target.value)}
              disabled={saving}
              className="font-mono"
            />
          </div>
          
          <p className="text-sm text-muted-foreground">
            Personaliza a URL do seu catálogo (apenas letras, números e hífens)
          </p>
        </div>

        {/* Preview da URL */}
        <div className="space-y-3">
          <Label>Preview da URL do Catálogo</Label>
          
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
            <code className="flex-1 text-sm font-mono text-blue-600">
              {catalogUrl}
            </code>
            
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(catalogUrl)}
                className="h-8 w-8 p-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => window.open(catalogUrl, '_blank')}
                className="h-8 w-8 p-0"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Informações de Segurança */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Segurança:</strong> Todos os domínios personalizados são validados antes da ativação. 
            URLs maliciosas ou inadequadas serão bloqueadas automaticamente.
          </AlertDescription>
        </Alert>

        {/* Status de Salvamento */}
        {saving && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Salvando configurações...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DomainSettings;
