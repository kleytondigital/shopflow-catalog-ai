
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, AlertCircle, Check } from 'lucide-react';
import { HierarchicalVariation, VariationTemplate } from '@/types/variation';

interface HierarchicalVariationPreviewProps {
  template?: VariationTemplate;
  variations: HierarchicalVariation[];
}

const HierarchicalVariationPreview: React.FC<HierarchicalVariationPreviewProps> = ({
  template,
  variations
}) => {
  if (!template || variations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Package className="w-12 h-12 text-gray-400 mb-3" />
          <h3 className="font-medium text-gray-900 mb-1">Nenhuma variação configurada</h3>
          <p className="text-sm text-gray-500">
            Configure as variações na aba "Configurar" para ver o preview
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalStock = variations.reduce((sum, main) => {
    if (main.children && main.children.length > 0) {
      return sum + main.children.reduce((subSum, child) => subSum + child.stock, 0);
    }
    return sum + main.stock;
  }, 0);

  const activeVariations = variations.filter(v => v.is_active);
  const totalCombinations = variations.reduce((sum, main) => {
    if (main.children && main.children.length > 0) {
      return sum + main.children.filter(child => child.is_active).length;
    }
    return sum + (main.is_active ? 1 : 0);
  }, 0);

  const getAttributeLabel = (attribute: string) => {
    const labels: Record<string, string> = {
      color: 'Cor',
      size: 'Tamanho',
      material: 'Material',
      style: 'Estilo',
      weight: 'Peso'
    };
    return labels[attribute] || attribute;
  };

  const formatPrice = (adjustment: number) => {
    if (adjustment === 0) return 'Preço base';
    return adjustment > 0 ? `+R$ ${adjustment.toFixed(2)}` : `R$ ${adjustment.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Resumo geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{activeVariations.length}</div>
              <div className="text-sm text-gray-500">
                {getAttributeLabel(template.primary)}(s) Ativa(s)
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalCombinations}</div>
              <div className="text-sm text-gray-500">
                Combinações Totais
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalStock}</div>
              <div className="text-sm text-gray-500">
                Estoque Total
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {variations.filter(v => v.image_url).length}
              </div>
              <div className="text-sm text-gray-500">
                Com Imagem
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview das variações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Preview do Catálogo - {template.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {variations.map((mainVariation, mainIndex) => (
              <div key={`preview-main-${mainIndex}`} className="border rounded-lg p-4">
                <div className="flex items-start gap-4 mb-4">
                  {/* Imagem da variação principal */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {mainVariation.image_url ? (
                      <img 
                        src={mainVariation.image_url} 
                        alt={mainVariation.variation_value}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  
                  {/* Info da variação principal */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">
                        {getAttributeLabel(template.primary)}: {mainVariation.variation_value}
                      </h4>
                      <Badge variant={mainVariation.is_active ? "default" : "secondary"}>
                        {mainVariation.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                      {mainVariation.image_url && (
                        <Badge variant="outline">
                          <Check className="w-3 h-3 mr-1" />
                          Com imagem
                        </Badge>
                      )}
                    </div>
                    
                    {!template.secondary && (
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Estoque: <strong>{mainVariation.stock} unidades</strong></p>
                        <p>Preço: <strong>{formatPrice(mainVariation.price_adjustment)}</strong></p>
                        {mainVariation.sku && <p>SKU: <strong>{mainVariation.sku}</strong></p>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Subvariações */}
                {template.secondary && mainVariation.children && mainVariation.children.length > 0 && (
                  <div className="ml-20 space-y-2">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">
                      {getAttributeLabel(template.secondary)} disponíveis:
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {mainVariation.children.map((subVariation, subIndex) => (
                        <div 
                          key={`preview-sub-${subIndex}`}
                          className={`p-3 border rounded-lg text-sm ${
                            subVariation.is_active 
                              ? 'bg-white border-gray-200' 
                              : 'bg-gray-50 border-gray-100'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{subVariation.variation_value}</span>
                            {!subVariation.is_active && (
                              <Badge variant="secondary" className="text-xs">Inativo</Badge>
                            )}
                          </div>
                          
                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex justify-between">
                              <span>Estoque:</span>
                              <span className={subVariation.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                                {subVariation.stock > 0 ? `${subVariation.stock} un.` : 'Sem estoque'}
                              </span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span>Preço:</span>
                              <span>{formatPrice(subVariation.price_adjustment)}</span>
                            </div>
                            
                            {subVariation.sku && (
                              <div className="flex justify-between">
                                <span>SKU:</span>
                                <span>{subVariation.sku}</span>
                              </div>
                            )}
                          </div>
                          
                          {subVariation.stock === 0 && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
                              <AlertCircle className="w-3 h-3" />
                              <span>Fora de estoque</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {template.secondary && (!mainVariation.children || mainVariation.children.length === 0) && (
                  <div className="ml-20 p-4 bg-gray-50 rounded-lg text-center">
                    <AlertCircle className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Nenhum {getAttributeLabel(template.secondary).toLowerCase()} configurado para esta {getAttributeLabel(template.primary).toLowerCase()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Simulação da experiência do cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Experiência do Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-3">Como o cliente verá:</h4>
            
            {template.secondary ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    1. Primeiro, escolhe a {getAttributeLabel(template.primary).toLowerCase()}:
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {activeVariations.map((variation, index) => (
                      <Button key={index} variant="outline" size="sm" className="pointer-events-none">
                        {variation.variation_value}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {activeVariations.length > 0 && activeVariations[0].children && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      2. Depois escolhe o {getAttributeLabel(template.secondary!).toLowerCase()}:
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {activeVariations[0].children.slice(0, 3).map((sub, index) => (
                        <Button key={index} variant="outline" size="sm" className="pointer-events-none">
                          {sub.variation_value}
                        </Button>
                      ))}
                      {activeVariations[0].children.length > 3 && (
                        <Button variant="outline" size="sm" className="pointer-events-none">
                          +{activeVariations[0].children.length - 3} mais
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Cliente escolhe diretamente:
                </Label>
                <div className="flex flex-wrap gap-2">
                  {activeVariations.slice(0, 5).map((variation, index) => (
                    <Button key={index} variant="outline" size="sm" className="pointer-events-none">
                      {variation.variation_value}
                    </Button>
                  ))}
                  {activeVariations.length > 5 && (
                    <Button variant="outline" size="sm" className="pointer-events-none">
                      +{activeVariations.length - 5} mais
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Label: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <label className={className}>{children}</label>
);

export default HierarchicalVariationPreview;
