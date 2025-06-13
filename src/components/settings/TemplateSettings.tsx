
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCatalogSettings } from '@/hooks/useCatalogSettings';
import { useProducts } from '@/hooks/useProducts';
import { Palette, Check, Eye } from 'lucide-react';
import ModernTemplate from '@/components/catalog/templates/ModernTemplate';
import MinimalTemplate from '@/components/catalog/templates/MinimalTemplate';
import ElegantTemplate from '@/components/catalog/templates/ElegantTemplate';

const TemplateSettings = () => {
  const { settings, updateSettings } = useCatalogSettings();
  const { products } = useProducts();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  // Produto de exemplo para preview
  const sampleProduct = products[0] || {
    id: 'sample',
    name: 'Produto de Exemplo',
    description: 'Esta é uma descrição de exemplo do produto',
    retail_price: 99.90,
    wholesale_price: 79.90,
    stock: 10,
    image_url: '/placeholder.svg',
    store_id: '',
    category: 'Exemplo',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const templates = [
    {
      id: 'modern',
      name: 'Moderno',
      description: 'Design arrojado com gradientes e sombras vibrantes',
      component: ModernTemplate,
      preview: '/placeholder.svg' // Pode ser uma screenshot do template
    },
    {
      id: 'minimal',
      name: 'Minimalista',
      description: 'Layout limpo e focado no produto',
      component: MinimalTemplate,
      preview: '/placeholder.svg'
    },
    {
      id: 'elegant',
      name: 'Elegante',
      description: 'Estilo sofisticado com detalhes refinados',
      component: ElegantTemplate,
      preview: '/placeholder.svg'
    }
  ];

  const currentTemplate = settings?.template_name || 'modern';

  const handleTemplateChange = async (templateId: string) => {
    setSaving(true);
    try {
      const { error } = await updateSettings({
        template_name: templateId
      });

      if (error) throw error;

      toast({
        title: "Template atualizado",
        description: "O template foi alterado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar o template.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Escolha o Template do Catálogo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            Selecione o template que melhor representa sua marca. As alterações são aplicadas em tempo real.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map((template) => {
              const TemplateComponent = template.component;
              const isSelected = currentTemplate === template.id;
              
              return (
                <Card 
                  key={template.id} 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:ring-1 hover:ring-gray-300'
                  }`}
                  onClick={() => handleTemplateChange(template.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{template.name}</h3>
                      {isSelected && (
                        <Badge variant="default" className="text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Ativo
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {/* Preview do Template */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <div className="transform scale-75 origin-top-left">
                        <TemplateComponent
                          product={sampleProduct}
                          catalogType="retail"
                          onAddToCart={() => {}}
                          onAddToWishlist={() => {}}
                          onQuickView={() => {}}
                          isInWishlist={false}
                          showPrices={true}
                          showStock={true}
                        />
                      </div>
                    </div>
                    
                    <Button 
                      variant={isSelected ? "default" : "outline"}
                      className="w-full"
                      disabled={saving}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTemplateChange(template.id);
                      }}
                    >
                      {isSelected ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Selecionado
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          Usar Este Template
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Sobre os Templates:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• As alterações são aplicadas instantaneamente no catálogo</li>
              <li>• Cada template é otimizado para diferentes tipos de produtos</li>
              <li>• Todos os templates são responsivos e funcionam em mobile</li>
              <li>• Você pode trocar o template a qualquer momento</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateSettings;
