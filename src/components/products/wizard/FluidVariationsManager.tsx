
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Palette, Plus, Wand2, Image as ImageIcon } from 'lucide-react';
import { useStoreVariations } from '@/hooks/useStoreVariations';
import { useDraftImages } from '@/hooks/useDraftImages';
import { toast } from '@/components/ui/use-toast';

interface VariationOption {
  id: string;
  value: string;
  hexColor?: string;
}

interface GeneratedVariation {
  id: string;
  color?: string;
  size?: string;
  material?: string;
  style?: string;
  sku: string;
  stock: number;
  priceAdjustment: number;
  imageId?: string;
  isActive: boolean;
}

interface FluidVariationsManagerProps {
  productId?: string;
  variations: any[];
  onChange: (variations: any[]) => void;
}

const VARIATION_TYPES = [
  { key: 'color+size', label: 'Cor + Tamanho', primary: 'color', secondary: 'size' },
  { key: 'color+material', label: 'Cor + Material', primary: 'color', secondary: 'material' },
  { key: 'size+material', label: 'Tamanho + Material', primary: 'size', secondary: 'material' },
  { key: 'color', label: 'Apenas Cor', primary: 'color' },
  { key: 'size', label: 'Apenas Tamanho', primary: 'size' },
  { key: 'material', label: 'Apenas Material', primary: 'material' },
  { key: 'style', label: 'Apenas Estilo', primary: 'style' },
];

const FluidVariationsManager: React.FC<FluidVariationsManagerProps> = ({
  productId,
  variations,
  onChange,
}) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedPrimary, setSelectedPrimary] = useState<string[]>([]);
  const [selectedSecondary, setSelectedSecondary] = useState<string[]>([]);
  const [generatedVariations, setGeneratedVariations] = useState<GeneratedVariation[]>([]);
  const [showImageAssociation, setShowImageAssociation] = useState(false);

  const { draftImages } = useDraftImages();
  const { groups, values, loading } = useStoreVariations();

  // Carregar variações existentes quando editando produto
  useEffect(() => {
    if (variations && variations.length > 0) {
      const converted = variations.map((v, index) => ({
        id: v.id || `var-${index}`,
        color: v.color,
        size: v.size,
        material: v.material,
        style: v.style,
        sku: v.sku || '',
        stock: v.stock || 0,
        priceAdjustment: v.price_adjustment || 0,
        imageId: v.image_id,
        isActive: v.is_active !== false,
      }));
      setGeneratedVariations(converted);
    }
  }, [variations]);

  const getGroupOptions = (attributeKey: string): VariationOption[] => {
    const group = groups.find(g => g.attribute_key === attributeKey);
    if (!group) return [];

    return values
      .filter(v => v.group_id === group.id)
      .map(v => ({
        id: v.id,
        value: v.value,
        hexColor: v.hex_color,
      }));
  };

  const handleTypeSelection = (typeKey: string) => {
    setSelectedType(typeKey);
    setSelectedPrimary([]);
    setSelectedSecondary([]);
    setGeneratedVariations([]);
    setShowImageAssociation(false);
  };

  const handleGenerateVariations = () => {
    const type = VARIATION_TYPES.find(t => t.key === selectedType);
    if (!type) return;

    const primaryOptions = getGroupOptions(type.primary);
    const secondaryOptions = type.secondary ? getGroupOptions(type.secondary) : [];

    const primarySelected = primaryOptions.filter(o => selectedPrimary.includes(o.id));
    const secondarySelected = secondaryOptions.filter(o => selectedSecondary.includes(o.id));

    const combinations: GeneratedVariation[] = [];

    if (type.secondary && secondarySelected.length > 0) {
      // Combinações duplas
      primarySelected.forEach(primary => {
        secondarySelected.forEach(secondary => {
          const variation: GeneratedVariation = {
            id: `${primary.id}-${secondary.id}`,
            [type.primary]: primary.value,
            [type.secondary]: secondary.value,
            sku: `${primary.value.substring(0, 3).toUpperCase()}-${secondary.value.substring(0, 3).toUpperCase()}`,
            stock: 0,
            priceAdjustment: 0,
            isActive: true,
          };
          combinations.push(variation);
        });
      });
    } else {
      // Variações simples
      primarySelected.forEach(primary => {
        const variation: GeneratedVariation = {
          id: primary.id,
          [type.primary]: primary.value,
          sku: primary.value.substring(0, 6).toUpperCase(),
          stock: 0,
          priceAdjustment: 0,
          isActive: true,
        };
        combinations.push(variation);
      });
    }

    setGeneratedVariations(combinations);
    setShowImageAssociation(combinations.length > 0);

    toast({
      title: "Variações geradas!",
      description: `${combinations.length} variação(ões) criada(s) automaticamente.`,
    });
  };

  const handleVariationUpdate = (variationId: string, field: string, value: any) => {
    setGeneratedVariations(prev => 
      prev.map(v => 
        v.id === variationId ? { ...v, [field]: value } : v
      )
    );
  };

  const handleImageAssociation = (variationId: string, imageId: string) => {
    handleVariationUpdate(variationId, 'imageId', imageId);
  };

  const handleSaveVariations = () => {
    const formatted = generatedVariations.map(v => ({
      id: v.id,
      color: v.color || null,
      size: v.size || null,
      material: v.material || null,
      style: v.style || null,
      sku: v.sku,
      stock: v.stock,
      price_adjustment: v.priceAdjustment,
      is_active: v.isActive,
      image_id: v.imageId || null,
    }));

    onChange(formatted);
    
    toast({
      title: "Variações salvas!",
      description: `${formatted.length} variação(ões) configurada(s).`,
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const selectedTypeConfig = VARIATION_TYPES.find(t => t.key === selectedType);
  const primaryOptions = selectedTypeConfig ? getGroupOptions(selectedTypeConfig.primary) : [];
  const secondaryOptions = selectedTypeConfig?.secondary ? getGroupOptions(selectedTypeConfig.secondary) : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Variações Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seleção do Tipo */}
          {!selectedType && (
            <div className="space-y-4">
              <h4 className="font-medium">Escolha o tipo de variação:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {VARIATION_TYPES.map(type => (
                  <Button
                    key={type.key}
                    variant="outline"
                    className="h-auto p-4 text-left justify-start"
                    onClick={() => handleTypeSelection(type.key)}
                  >
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {type.secondary ? 'Variações combinadas' : 'Variação simples'}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Seleção de Opções */}
          {selectedType && !showImageAssociation && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Configure as variações</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedType('')}
                >
                  Alterar Tipo
                </Button>
              </div>

              {/* Opções Primárias */}
              <div className="space-y-3">
                <Label className="text-base font-medium capitalize">
                  {selectedTypeConfig?.primary}
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {primaryOptions.map(option => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`primary-${option.id}`}
                        checked={selectedPrimary.includes(option.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedPrimary(prev => [...prev, option.id]);
                          } else {
                            setSelectedPrimary(prev => prev.filter(id => id !== option.id));
                          }
                        }}
                      />
                      <Label 
                        htmlFor={`primary-${option.id}`}
                        className="flex items-center gap-2"
                      >
                        {option.hexColor && (
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: option.hexColor }}
                          />
                        )}
                        {option.value}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Opções Secundárias */}
              {selectedTypeConfig?.secondary && (
                <div className="space-y-3">
                  <Label className="text-base font-medium capitalize">
                    {selectedTypeConfig.secondary}
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {secondaryOptions.map(option => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`secondary-${option.id}`}
                          checked={selectedSecondary.includes(option.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSecondary(prev => [...prev, option.id]);
                            } else {
                              setSelectedSecondary(prev => prev.filter(id => id !== option.id));
                            }
                          }}
                        />
                        <Label htmlFor={`secondary-${option.id}`}>
                          {option.value}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botão Gerar */}
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleGenerateVariations}
                  disabled={selectedPrimary.length === 0}
                  className="gap-2"
                >
                  <Wand2 className="h-4 w-4" />
                  Gerar Variações
                  {selectedPrimary.length > 0 && (
                    <Badge variant="secondary">
                      {selectedTypeConfig?.secondary 
                        ? selectedPrimary.length * Math.max(selectedSecondary.length, 1)
                        : selectedPrimary.length
                      }
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Associação de Imagens e Configuração */}
          {showImageAssociation && generatedVariations.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Configure as variações geradas</h4>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowImageAssociation(false)}
                  >
                    Voltar
                  </Button>
                  <Button onClick={handleSaveVariations}>
                    Salvar Variações
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {generatedVariations.map(variation => (
                  <Card key={variation.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div>
                        <div className="font-medium">
                          {variation.color && `${variation.color}`}
                          {variation.color && variation.size && ' - '}
                          {variation.size && `${variation.size}`}
                          {variation.material && ` - ${variation.material}`}
                          {variation.style && ` - ${variation.style}`}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          SKU: {variation.sku}
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs">Estoque</Label>
                        <input
                          type="number"
                          value={variation.stock}
                          onChange={(e) => handleVariationUpdate(variation.id, 'stock', parseInt(e.target.value) || 0)}
                          className="w-full p-1 border rounded text-sm"
                          min="0"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Ajuste de Preço (R$)</Label>
                        <input
                          type="number"
                          value={variation.priceAdjustment}
                          onChange={(e) => handleVariationUpdate(variation.id, 'priceAdjustment', parseFloat(e.target.value) || 0)}
                          className="w-full p-1 border rounded text-sm"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Imagem</Label>
                        <div className="flex gap-2 mt-1">
                          {draftImages.map(image => (
                            <button
                              key={image.id}
                              onClick={() => handleImageAssociation(variation.id, image.id)}
                              className={`w-12 h-12 rounded border-2 overflow-hidden ${
                                variation.imageId === image.id 
                                  ? 'border-blue-500' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <img
                                src={image.preview || image.url || ''}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                          {draftImages.length === 0 && (
                            <div className="w-12 h-12 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Variações Existentes */}
      {generatedVariations.length > 0 && !showImageAssociation && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Variações Configuradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {generatedVariations.map(variation => (
                <div key={variation.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">
                      {variation.color && `${variation.color}`}
                      {variation.color && variation.size && ' - '}
                      {variation.size && `${variation.size}`}
                      {variation.material && ` - ${variation.material}`}
                      {variation.style && ` - ${variation.style}`}
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">
                      Estoque: {variation.stock}
                    </span>
                  </div>
                  <Badge variant={variation.isActive ? "default" : "secondary"}>
                    {variation.isActive ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FluidVariationsManager;
