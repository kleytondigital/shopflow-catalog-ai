import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Search,
  Globe,
  TrendingUp,
  Link,
  FileText,
  Tag,
  Eye,
  Share2,
} from 'lucide-react';

interface SEOSettingsProps {
  settings: any;
  onUpdate: (field: string, value: any) => void;
}

const SEOSettings: React.FC<SEOSettingsProps> = ({ settings, onUpdate }) => {
  const [localSettings, setLocalSettings] = useState({
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    canonical_url: '',
    robots_txt: 'index, follow',
    og_title: '',
    og_description: '',
    og_image: '',
    twitter_card_type: 'summary_large_image',
    twitter_title: '',
    twitter_description: '',
    json_ld_enabled: true,
    sitemap_enabled: true,
    analytics_enabled: false,
    search_console_verified: false,
    ...settings
  });

  const updateSetting = (field: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
    onUpdate(field, value);
  };

  const seoScore = React.useMemo(() => {
    let score = 0;
    let maxScore = 10;

    // Title (20%)
    if (localSettings.seo_title && localSettings.seo_title.length >= 30 && localSettings.seo_title.length <= 60) {
      score += 2;
    } else if (localSettings.seo_title) {
      score += 1;
    }

    // Description (20%)
    if (localSettings.seo_description && localSettings.seo_description.length >= 120 && localSettings.seo_description.length <= 160) {
      score += 2;
    } else if (localSettings.seo_description) {
      score += 1;
    }

    // Keywords (10%)
    if (localSettings.seo_keywords && localSettings.seo_keywords.split(',').length >= 3) {
      score += 1;
    }

    // Open Graph (20%)
    if (localSettings.og_title && localSettings.og_description) {
      score += 2;
    }

    // Twitter Cards (10%)
    if (localSettings.twitter_title && localSettings.twitter_description) {
      score += 1;
    }

    // Technical SEO (20%)
    if (localSettings.json_ld_enabled) score += 1;
    if (localSettings.sitemap_enabled) score += 1;

    return Math.round((score / maxScore) * 100);
  }, [localSettings]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* SEO Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              SEO Score
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-16 h-2 rounded-full ${getScoreColor(seoScore)}`}>
                <div 
                  className="h-full bg-white rounded-full" 
                  style={{ width: `${100 - seoScore}%`, marginLeft: `${seoScore}%` }}
                />
              </div>
              <Badge variant={seoScore >= 80 ? "default" : seoScore >= 60 ? "secondary" : "destructive"}>
                {seoScore}%
              </Badge>
            </div>
          </CardTitle>
          <CardDescription>
            Otimização do seu catálogo para mecanismos de busca
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Configurações Básicas de SEO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Configurações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seo-title">Título SEO</Label>
            <Input
              id="seo-title"
              value={localSettings.seo_title}
              onChange={(e) => updateSetting('seo_title', e.target.value)}
              placeholder="Ex: Loja Online - Melhores Produtos e Preços"
              maxLength={60}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Recomendado: 30-60 caracteres</span>
              <span>{localSettings.seo_title?.length || 0}/60</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-description">Meta Descrição</Label>
            <Textarea
              id="seo-description"
              value={localSettings.seo_description}
              onChange={(e) => updateSetting('seo_description', e.target.value)}
              placeholder="Encontre os melhores produtos com os melhores preços. Entrega rápida e segura para todo o Brasil."
              maxLength={160}
              rows={3}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Recomendado: 120-160 caracteres</span>
              <span>{localSettings.seo_description?.length || 0}/160</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-keywords">Palavras-chave</Label>
            <Input
              id="seo-keywords"
              value={localSettings.seo_keywords}
              onChange={(e) => updateSetting('seo_keywords', e.target.value)}
              placeholder="loja online, produtos, varejo, atacado, entrega rápida"
            />
            <p className="text-xs text-muted-foreground">
              Separe as palavras-chave por vírgulas (mínimo 3 recomendado)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Open Graph (Facebook) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Open Graph (Facebook/WhatsApp)
          </CardTitle>
          <CardDescription>
            Como seu catálogo aparece quando compartilhado no Facebook e WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="og-title">Título para Compartilhamento</Label>
            <Input
              id="og-title"
              value={localSettings.og_title}
              onChange={(e) => updateSetting('og_title', e.target.value)}
              placeholder="Catálogo Online - Minha Loja"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="og-description">Descrição para Compartilhamento</Label>
            <Textarea
              id="og-description"
              value={localSettings.og_description}
              onChange={(e) => updateSetting('og_description', e.target.value)}
              placeholder="Confira nossos produtos incríveis com os melhores preços!"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="og-image">Imagem de Compartilhamento (URL)</Label>
            <Input
              id="og-image"
              value={localSettings.og_image}
              onChange={(e) => updateSetting('og_image', e.target.value)}
              placeholder="https://exemplo.com/imagem-compartilhamento.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Recomendado: 1200x630px (formato 1.91:1)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Twitter Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Twitter Cards
          </CardTitle>
          <CardDescription>
            Como seu catálogo aparece quando compartilhado no Twitter/X
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="twitter-title">Título para Twitter</Label>
            <Input
              id="twitter-title"
              value={localSettings.twitter_title}
              onChange={(e) => updateSetting('twitter_title', e.target.value)}
              placeholder="Catálogo Online - Minha Loja"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter-description">Descrição para Twitter</Label>
            <Textarea
              id="twitter-description"
              value={localSettings.twitter_description}
              onChange={(e) => updateSetting('twitter_description', e.target.value)}
              placeholder="Confira nossos produtos com os melhores preços!"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* SEO Técnico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            SEO Técnico
          </CardTitle>
          <CardDescription>
            Configurações avançadas para otimização
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Dados estruturados (JSON-LD)</Label>
              <p className="text-xs text-muted-foreground">
                Ajuda o Google a entender melhor seus produtos
              </p>
            </div>
            <Switch
              checked={localSettings.json_ld_enabled}
              onCheckedChange={(checked) => updateSetting('json_ld_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Gerar Sitemap automático</Label>
              <p className="text-xs text-muted-foreground">
                Lista todos os produtos para indexação
              </p>
            </div>
            <Switch
              checked={localSettings.sitemap_enabled}
              onCheckedChange={(checked) => updateSetting('sitemap_enabled', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="canonical-url">URL Canônica</Label>
            <Input
              id="canonical-url"
              value={localSettings.canonical_url}
              onChange={(e) => updateSetting('canonical_url', e.target.value)}
              placeholder="https://www.meudominio.com.br"
            />
            <p className="text-xs text-muted-foreground">
              URL principal do seu catálogo (evita conteúdo duplicado)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Status e Ferramentas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Ferramentas de Monitoramento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Google Search Console</span>
                <Badge variant={localSettings.search_console_verified ? "default" : "secondary"}>
                  {localSettings.search_console_verified ? "Verificado" : "Pendente"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Monitore como o Google vê seu catálogo
              </p>
              <Button variant="outline" size="sm" className="w-full">
                {localSettings.search_console_verified ? "Acessar Console" : "Configurar"}
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Google Analytics</span>
                <Badge variant={localSettings.analytics_enabled ? "default" : "secondary"}>
                  {localSettings.analytics_enabled ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Analise o tráfego do seu catálogo
              </p>
              <Button variant="outline" size="sm" className="w-full">
                {localSettings.analytics_enabled ? "Ver Relatórios" : "Configurar"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview nos Resultados de Busca</CardTitle>
          <CardDescription>
            Como seu catálogo aparecerá no Google
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="text-blue-600 text-lg font-medium hover:underline cursor-pointer">
              {localSettings.seo_title || "Título SEO não definido"}
            </div>
            <div className="text-green-700 text-sm">
              {localSettings.canonical_url || "https://www.seudominio.com.br"}
            </div>
            <div className="text-gray-700 text-sm mt-1">
              {localSettings.seo_description || "Meta descrição não definida. Adicione uma descrição atrativa para melhorar o CTR."}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SEOSettings;
