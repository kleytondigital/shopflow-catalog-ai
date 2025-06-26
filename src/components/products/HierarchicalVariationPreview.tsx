
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HierarchicalVariation, VariationTemplate } from '@/types/variation';
import { Eye, Image } from 'lucide-react';

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
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Eye className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-gray-500">Configure as variações para visualizar o preview</p>
        </CardContent>
      </Card>
    );
  }

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Preview do Catálogo - {template.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            Este é como as variações aparecerão no catálogo online para os clientes.
          </div>
          
          <div className="space-y-4">
            {variations.map((mainVariation, mainIndex) => (
              <div key={`preview-main-${mainIndex}`} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  {mainVariation.image_url ? (
                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={mainVariation.image_url}
                        alt={mainVariation.variation_value}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      <Image className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h4 className="font-medium">
                      {getAttributeLabel(template.primary)}: {mainVariation.variation_value}
                    </h4>
                    {!mainVariation.is_active && (
                      <Badge variant="secondary" className="mt-1">Indisponível</Badge>
                    )}
                  </div>
                </div>

                {template.secondary && mainVariation.children && mainVariation.children.length > 0 ? (
                  <div className="ml-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      {getAttributeLabel(template.secondary)} disponíveis:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {mainVariation.children.map((subVariation, subIndex) => (
                        <div
                          key={`preview-sub-${mainIndex}-${subIndex}`}
                          className={`p-2 border rounded text-sm ${
                            subVariation.is_active 
                              ? 'border-gray-200 bg-white' 
                              : 'border-gray-100 bg-gray-50 text-gray-400'
                          }`}
                        >
                          <div className="font-medium">{subVariation.variation_value}</div>
                          <div className="text-xs">
                            Estoque: {subVariation.stock}
                            {subVariation.price_adjustment !== 0 && (
                              <span className="ml-1">
                                ({subVariation.price_adjustment > 0 ? '+' : ''}{formatPrice(subVariation.price_adjustment)})
                              </span>
                            )}
                          </div>
                          {!subVariation.is_active && (
                            <Badge variant="secondary" className="mt-1 text-xs">Indisponível</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="ml-4 text-sm text-gray-600">
                    <p>Estoque: {mainVariation.stock}</p>
                    {mainVariation.price_adjustment !== 0 && (
                      <p>Ajuste de preço: {formatPrice(mainVariation.price_adjustment)}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Resumo das Variações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-1">
            <p>• <strong>{variations.length}</strong> variação(ões) principal(is)</p>
            <p>• <strong>{variations.reduce((sum, v) => sum + (v.children?.length || 0), 0)}</strong> subvariação(ões) total</p>
            <p>• <strong>{variations.filter(v => v.is_active).length}</strong> variação(ões) ativa(s)</p>
            <p>• <strong>{variations.reduce((sum, v) => sum + (v.children?.reduce((subSum, child) => subSum + child.stock, 0) || v.stock), 0)}</strong> unidades em estoque</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HierarchicalVariationPreview;
