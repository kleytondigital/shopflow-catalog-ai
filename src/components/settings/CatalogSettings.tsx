
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCatalogSettings } from "@/hooks/useCatalogSettings";
import { useTemplateColors } from "@/hooks/useTemplateColors";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import AdvancedColorSettings from "./AdvancedColorSettings";
import ShareableLinks from "./ShareableLinks";
import CatalogModeSettings from "./CatalogModeSettings";
import MobileLayoutSettings from "./MobileLayoutSettings";
import FooterSettings from "./FooterSettings";
import TemplateStyleSelector from "./TemplateStyleSelector";
import {
  Palette,
  Eye,
  Save,
  RotateCw,
  Smartphone,
  Share2,
  ArrowLeftRight,
  Search,
  Globe,
  Sparkles,
} from "lucide-react";

const CatalogSettings = () => {
  const { profile } = useAuth();
  const { settings, loading, updateSettings } = useCatalogSettings();
  const { resetToTemplateDefaults } = useTemplateColors();

  const [localSettings, setLocalSettings] = useState({
    template_name: "minimal-fashion",
    show_prices: true,
    show_stock: true,
    show_categories: true,
    show_search: true,
    show_filters: true,
    items_per_page: 12,
    catalog_title: "",
    catalog_description: "",
    primary_color: "#2c3338",
    secondary_color: "#6b7280",
    accent_color: "#8b5cf6",
    background_color: "#ffffff",
    text_color: "#2c3338",
    border_color: "#e2e8f0",
    font_family: "Inter",
    custom_css: "",
    seo_keywords: "",
  });

  useEffect(() => {
    if (settings) {
      setLocalSettings({
        template_name: settings.template_name || "minimal-fashion",
        show_prices: settings.show_prices !== false,
        show_stock: settings.show_stock !== false,
        show_categories: settings.allow_categories_filter !== false,
        show_search: true,
        show_filters: settings.allow_price_filter !== false,
        items_per_page: 12,
        catalog_title: settings.seo_title || "",
        catalog_description: settings.seo_description || "",
        primary_color: settings.primary_color || "#2c3338",
        secondary_color: settings.secondary_color || "#6b7280",
        accent_color: settings.accent_color || "#8b5cf6",
        background_color: settings.background_color || "#ffffff",
        text_color: settings.text_color || "#2c3338",
        border_color: settings.border_color || "#e2e8f0",
        font_family: "Inter",
        custom_css: "",
        seo_keywords: settings.seo_keywords || "",
      });
    }
  }, [settings]);

  const handleSave = async () => {
    const updates = {
      template_name: localSettings.template_name,
      show_prices: localSettings.show_prices,
      show_stock: localSettings.show_stock,
      allow_categories_filter: localSettings.show_categories,
      allow_price_filter: localSettings.show_filters,
      seo_title: localSettings.catalog_title,
      seo_description: localSettings.catalog_description,
      seo_keywords: localSettings.seo_keywords,
      primary_color: localSettings.primary_color,
      secondary_color: localSettings.secondary_color,
      accent_color: localSettings.accent_color,
      background_color: localSettings.background_color,
      text_color: localSettings.text_color,
      border_color: localSettings.border_color,
    };

    const result = await updateSettings(updates);
    if (result.data && !result.error) {
      toast.success("Configurações do catálogo salvas com sucesso!");
    } else {
      toast.error(
        "Erro ao salvar configurações: " +
          (result.error?.message || "Erro desconhecido")
      );
    }
  };

  const handleTemplateChange = async (templateName: string) => {
    // Determinar cores padrão baseado no novo template
    const [style, niche] = templateName.split('-');
    const templateKey = `${style}-${niche}` as any;
    const defaultColors = resetToTemplateDefaults(templateKey);

    setLocalSettings((prev) => ({
      ...prev,
      template_name: templateName,
      ...defaultColors,
    }));

    const updates = {
      template_name: templateName,
      ...defaultColors,
    };

    const result = await updateSettings(updates);
    if (result.data && !result.error) {
      toast.success(`Template "${templateName}" aplicado com sucesso!`);
    }
  };

  const handleReset = () => {
    const defaultColors = resetToTemplateDefaults(localSettings.template_name);
    setLocalSettings((prev) => ({
      ...prev,
      ...defaultColors,
      show_prices: true,
      show_stock: true,
      show_categories: true,
      show_search: true,
      show_filters: true,
      items_per_page: 12,
      catalog_title: "",
      catalog_description: "",
      seo_keywords: "",
    }));
    toast.info("Configurações resetadas para o padrão!");
  };

  const handleColorChange = (colors: any) => {
    setLocalSettings((prev) => ({
      ...prev,
      ...colors,
    }));
  };

  const handleColorReset = () => {
    const defaultColors = resetToTemplateDefaults(localSettings.template_name);
    setLocalSettings((prev) => ({
      ...prev,
      ...defaultColors,
    }));
    toast.success("Cores resetadas para o padrão do template!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="template" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="template" className="flex items-center gap-1">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Template</span>
          </TabsTrigger>
          <TabsTrigger value="mode" className="flex items-center gap-1">
            <ArrowLeftRight className="h-4 w-4" />
            <span className="hidden sm:inline">Modo</span>
          </TabsTrigger>
          <TabsTrigger value="display" className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Exibição</span>
          </TabsTrigger>
          <TabsTrigger value="mobile" className="flex items-center gap-1">
            <Smartphone className="h-4 w-4" />
            <span className="hidden sm:inline">Mobile</span>
          </TabsTrigger>
          <TabsTrigger value="colors" className="flex items-center gap-1">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Cores</span>
          </TabsTrigger>
          <TabsTrigger value="footer" className="flex items-center gap-1">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Footer</span>
          </TabsTrigger>
          <TabsTrigger value="sharing" className="flex items-center gap-1">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Links</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-1">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">SEO</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="template" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Seleção de Template
              </CardTitle>
              <CardDescription>
                Escolha o estilo visual e nicho que melhor representa sua marca.
                O sistema aplicará automaticamente cores e layout otimizados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TemplateStyleSelector
                currentTemplate={localSettings.template_name}
                onTemplateChange={handleTemplateChange}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mode" className="space-y-6">
          <CatalogModeSettings />
        </TabsContent>

        <TabsContent value="display" className="space-y-6">
          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Configurações de Exibição
              </CardTitle>
              <CardDescription>
                Configure o que será exibido em seu catálogo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Elementos Visuais</h4>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-prices">Exibir Preços</Label>
                    <Switch
                      id="show-prices"
                      checked={localSettings.show_prices}
                      onCheckedChange={(checked) =>
                        setLocalSettings({
                          ...localSettings,
                          show_prices: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-stock">Exibir Estoque</Label>
                    <Switch
                      id="show-stock"
                      checked={localSettings.show_stock}
                      onCheckedChange={(checked) =>
                        setLocalSettings({
                          ...localSettings,
                          show_stock: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-categories">Exibir Categorias</Label>
                    <Switch
                      id="show-categories"
                      checked={localSettings.show_categories}
                      onCheckedChange={(checked) =>
                        setLocalSettings({
                          ...localSettings,
                          show_categories: checked,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Funcionalidades</h4>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-search">Barra de Pesquisa</Label>
                    <Switch
                      id="show-search"
                      checked={localSettings.show_search}
                      onCheckedChange={(checked) =>
                        setLocalSettings({
                          ...localSettings,
                          show_search: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-filters">Filtros de Produto</Label>
                    <Switch
                      id="show-filters"
                      checked={localSettings.show_filters}
                      onCheckedChange={(checked) =>
                        setLocalSettings({
                          ...localSettings,
                          show_filters: checked,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mobile" className="space-y-6">
          <MobileLayoutSettings />
        </TabsContent>

        <TabsContent value="colors" className="space-y-6">
          <AdvancedColorSettings
            colors={{
              primary_color: localSettings.primary_color,
              secondary_color: localSettings.secondary_color,
              accent_color: localSettings.accent_color,
              background_color: localSettings.background_color,
              text_color: localSettings.text_color,
              border_color: localSettings.border_color,
            }}
            onChange={handleColorChange}
            onReset={handleColorReset}
          />
        </TabsContent>

        <TabsContent value="footer" className="space-y-6">
          <FooterSettings />
        </TabsContent>

        <TabsContent value="sharing" className="space-y-6">
          <ShareableLinks />
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Configurações de SEO
              </CardTitle>
              <CardDescription>
                Otimize seu catálogo para mecanismos de busca
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="catalog-title">Título do Catálogo (SEO)</Label>
                <Input
                  id="catalog-title"
                  value={localSettings.catalog_title}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      catalog_title: e.target.value,
                    })
                  }
                  placeholder="Ex: Catálogo de Produtos - Minha Loja"
                />
                <p className="text-xs text-muted-foreground">
                  Aparece na aba do navegador e nos resultados de busca
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="catalog-description">
                  Descrição do Catálogo (SEO)
                </Label>
                <Input
                  id="catalog-description"
                  value={localSettings.catalog_description}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      catalog_description: e.target.value,
                    })
                  }
                  placeholder="Ex: Encontre os melhores produtos com os melhores preços"
                />
                <p className="text-xs text-muted-foreground">
                  Aparece nos resultados de busca do Google
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo-keywords">Palavras-chave (SEO)</Label>
                <Input
                  id="seo-keywords"
                  value={localSettings.seo_keywords}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      seo_keywords: e.target.value,
                    })
                  }
                  placeholder="Ex: produtos, loja online, varejo, atacado"
                />
                <p className="text-xs text-muted-foreground">
                  Separe as palavras-chave por vírgulas
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button
          variant="outline"
          onClick={handleReset}
          className="flex items-center gap-2"
        >
          <RotateCw className="h-4 w-4" />
          Resetar
        </Button>
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
};

export default CatalogSettings;
