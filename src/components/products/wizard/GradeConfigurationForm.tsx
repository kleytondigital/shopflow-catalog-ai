
import React, { useState, useCallback } from 'react';
import { ProductVariation } from '@/types/product';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Package, 
  Plus, 
  Minus, 
  Palette, 
  RotateCcw,
  Sparkles,
  TrendingUp,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GradeConfigurationFormProps {
  variations: ProductVariation[];
  onVariationsGenerated: (variations: ProductVariation[]) => void;
  productId?: string;
  storeId?: string;
}

interface SizePairConfig {
  size: string;
  pairs: number;
}

const GradeConfigurationForm: React.FC<GradeConfigurationFormProps> = ({
  variations,
  onVariationsGenerated,
  productId,
  storeId
}) => {
  const { toast } = useToast();
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [customColor, setCustomColor] = useState('');
  const [sizePairConfigs, setSizePairConfigs] = useState<SizePairConfig[]>([]);
  const [gradeName, setGradeName] = useState('Grade Personalizada');

  const commonColors = [
    'Preto', 'Branco', 'Azul', 'Vermelho', 'Verde',
    'Amarelo', 'Rosa', 'Roxo', 'Marrom', 'Cinza'
  ];

  const commonSizes = [
    '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'
  ];

  const gradeTemplates = [
    { 
      name: 'Grade Baixa', 
      sizes: ['35', '36', '37', '38', '39'],
      distribution: [1, 2, 2, 2, 1] // Curva de distribuição padrão
    },
    { 
      name: 'Grade Média', 
      sizes: ['34', '35', '36', '37', '38', '39', '40'],
      distribution: [1, 2, 2, 3, 2, 2, 1]
    },
    { 
      name: 'Grade Alta', 
      sizes: ['36', '37', '38', '39', '40', '41', '42'],
      distribution: [1, 2, 2, 3, 2, 2, 1]
    },
    { 
      name: 'Grade Masculina', 
      sizes: ['38', '39', '40', '41', '42', '43', '44'],
      distribution: [1, 2, 3, 3, 2, 1, 1]
    },
    { 
      name: 'Grade Infantil', 
      sizes: ['20', '21', '22', '23', '24', '25', '26'],
      distribution: [1, 1, 2, 2, 2, 1, 1]
    }
  ];

  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  const addCustomColor = () => {
    if (customColor.trim() && !selectedColors.includes(customColor.trim())) {
      setSelectedColors(prev => [...prev, customColor.trim()]);
      setCustomColor('');
    }
  };

  const applyGradeTemplate = (template: typeof gradeTemplates[0]) => {
    const newConfigs: SizePairConfig[] = template.sizes.map((size, index) => ({
      size,
      pairs: template.distribution[index] || 1
    }));
    setSizePairConfigs(newConfigs);
    setGradeName(`${template.name}`);
  };

  const addSizePair = () => {
    const availableSizes = commonSizes.filter(size => 
      !sizePairConfigs.some(config => config.size === size)
    );
    
    if (availableSizes.length > 0) {
      setSizePairConfigs(prev => [...prev, { size: availableSizes[0], pairs: 1 }]);
    }
  };

  const removeSizePair = (index: number) => {
    setSizePairConfigs(prev => prev.filter((_, i) => i !== index));
  };

  const updateSizePair = (index: number, field: keyof SizePairConfig, value: string | number) => {
    setSizePairConfigs(prev => prev.map((config, i) => 
      i === index ? { ...config, [field]: value } : config
    ));
  };

  const adjustPairs = (index: number, delta: number) => {
    setSizePairConfigs(prev => prev.map((config, i) => 
      i === index 
        ? { ...config, pairs: Math.max(0, config.pairs + delta) }
        : config
    ));
  };

  const resetConfiguration = () => {
    setSelectedColors([]);
    setSizePairConfigs([]);
    setGradeName('Grade Personalizada');
    setCustomColor('');
  };

  const generateOptimizedDistribution = useCallback(() => {
    if (sizePairConfigs.length === 0) return;

    // Aplicar curva ABC padrão baseada no número de tamanhos
    const totalSizes = sizePairConfigs.length;
    const newConfigs = sizePairConfigs.map((config, index) => {
      let pairs: number;
      
      if (totalSizes <= 3) {
        pairs = 2; // Distribuição uniforme para poucas grades
      } else if (totalSizes <= 5) {
        // Curva para grades pequenas
        pairs = index === Math.floor(totalSizes / 2) ? 3 : (index === 0 || index === totalSizes - 1) ? 1 : 2;
      } else {
        // Curva ABC para grades maiores
        const middle = Math.floor(totalSizes / 2);
        const distance = Math.abs(index - middle);
        pairs = Math.max(1, 4 - distance);
      }
      
      return { ...config, pairs };
    });

    setSizePairConfigs(newConfigs);
    
    toast({
      title: "Distribuição otimizada!",
      description: "Aplicada curva ABC para melhor distribuição de estoque.",
    });
  }, [sizePairConfigs, toast]);

  const generateVariations = () => {
    if (selectedColors.length === 0 || sizePairConfigs.length === 0) {
      toast({
        title: "Configuração incompleta",
        description: "Selecione pelo menos uma cor e configure os tamanhos.",
        variant: "destructive"
      });
      return;
    }

    console.log('🎨 GRADE - Gerando variações...');
    console.log('📋 Cores selecionadas:', selectedColors);
    console.log('📐 Configuração de pares:', sizePairConfigs);

    const newVariations: ProductVariation[] = [];
    const totalPairsPerColor = sizePairConfigs.reduce((sum, config) => sum + config.pairs, 0);

    // Gerar UMA variação por cor (não uma por tamanho)
    selectedColors.forEach((color, colorIndex) => {
      const uniqueId = `grade-${Date.now()}-${colorIndex}-${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`🎨 Criando grade para cor: ${color}`);
      console.log(`📦 Total de pares na grade: ${totalPairsPerColor}`);
      console.log(`📏 Tamanhos inclusos: ${sizePairConfigs.map(c => c.size).join(', ')}`);
      console.log(`🔢 Pares por tamanho: ${sizePairConfigs.map(c => c.pairs).join(', ')}`);
      
      const gradeVariation: ProductVariation = {
        id: uniqueId,
        product_id: productId || '',
        color,
        size: null, // Grade não tem tamanho único
        stock: totalPairsPerColor, // Estoque total da grade
        price_adjustment: 0,
        is_active: true,
        sku: `${gradeName.toLowerCase().replace(/\s+/g, '-')}-${color.toLowerCase().replace(/\s+/g, '-')}`,
        image_url: '',
        variation_type: 'grade',
        is_grade: true,
        grade_name: `${gradeName} - ${color}`,
        grade_color: color,
        grade_sizes: sizePairConfigs.map(c => c.size), // Array com todos os tamanhos
        grade_pairs: sizePairConfigs.map(c => c.pairs), // Array com quantidades por tamanho  
        grade_quantity: totalPairsPerColor, // Quantidade total da grade
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        display_order: colorIndex
      };

      console.log('✅ Grade criada:', {
        id: gradeVariation.id,
        color: gradeVariation.color,
        totalStock: gradeVariation.stock,
        sizes: gradeVariation.grade_sizes,
        pairs: gradeVariation.grade_pairs
      });

      newVariations.push(gradeVariation);
    });

    console.log(`🎯 RESULTADO: ${newVariations.length} grades criadas (uma por cor)`);
    console.log(`📊 Total de variações geradas: ${newVariations.length}`);

    onVariationsGenerated(newVariations);

    toast({
      title: "Grades criadas com sucesso!",
      description: `${newVariations.length} grade(s) foram geradas, totalizando ${totalPairsPerColor * selectedColors.length} pares.`
    });
  };

  const totalVariations = selectedColors.length; // Uma variação por cor
  const totalPairs = sizePairConfigs.reduce((sum, config) => sum + config.pairs, 0);
  const totalPairsAllColors = totalPairs * selectedColors.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Configuração Avançada de Grades
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Nome da Grade */}
          <div>
            <Label htmlFor="grade-name" className="text-base font-semibold">Nome da Grade</Label>
            <Input
              id="grade-name"
              value={gradeName}
              onChange={(e) => setGradeName(e.target.value)}
              placeholder="Ex: Grade Verão 2024"
              className="mt-2"
            />
          </div>

          {/* Seleção de Cores */}
          <div>
            <Label className="text-base font-semibold">1. Escolha as Cores</Label>
            <p className="text-sm text-gray-600 mb-3">
              Selecione as cores disponíveis para este produto. Cada cor será uma grade separada.
            </p>
            
            <div className="grid grid-cols-5 gap-2 mb-4">
              {commonColors.map(color => (
                <Button
                  key={color}
                  variant={selectedColors.includes(color) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleColor(color)}
                  className="text-xs"
                >
                  {color}
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Cor personalizada"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomColor()}
              />
              <Button onClick={addCustomColor} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {selectedColors.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium mb-2">Cores selecionadas:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedColors.map(color => (
                    <Badge 
                      key={color} 
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => toggleColor(color)}
                    >
                      {color} ×
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Templates de Grade */}
          <div>
            <Label className="text-base font-semibold">2. Templates de Grade</Label>
            <p className="text-sm text-gray-600 mb-3">
              Use um template pronto ou configure manualmente os tamanhos e quantidades
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
              {gradeTemplates.map(template => (
                <Button
                  key={template.name}
                  variant="outline"
                  size="sm"
                  onClick={() => applyGradeTemplate(template)}
                  className="justify-start"
                >
                  <Package className="w-4 h-4 mr-2" />
                  {template.name}
                  <Badge variant="secondary" className="ml-auto">
                    {template.sizes.length}
                  </Badge>
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={generateOptimizedDistribution}
                disabled={sizePairConfigs.length === 0}
                className="flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Aplicar Curva ABC
              </Button>
              <Button
                variant="outline"
                onClick={resetConfiguration}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Limpar Tudo
              </Button>
            </div>
          </div>

          {/* Configuração Individual de Pares */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">3. Pares por Tamanho</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={addSizePair}
                disabled={sizePairConfigs.length >= commonSizes.length}
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar Tamanho
              </Button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Configure individualmente quantos pares de cada tamanho estarão na grade
            </p>

            {sizePairConfigs.length === 0 ? (
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertDescription>
                  Use um template acima ou adicione tamanhos manualmente para começar.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {sizePairConfigs.map((config, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 border rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <Label className="text-sm font-medium">Tamanho</Label>
                      <select
                        value={config.size}
                        onChange={(e) => updateSizePair(index, 'size', e.target.value)}
                        className="w-full mt-1 px-3 py-2 border rounded-md bg-white"
                      >
                        {commonSizes.map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex-1">
                      <Label className="text-sm font-medium">Pares</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => adjustPairs(index, -1)}
                          disabled={config.pairs <= 0}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Input
                          type="number"
                          value={config.pairs}
                          onChange={(e) => updateSizePair(index, 'pairs', parseInt(e.target.value) || 0)}
                          className="w-20 text-center"
                          min="0"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => adjustPairs(index, 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeSizePair(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preview da Grade */}
          {selectedColors.length > 0 && sizePairConfigs.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview das Grades:
              </h4>
              
              <div className="space-y-3">
                {selectedColors.map((color, index) => (
                  <div key={color} className="bg-white p-3 rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">
                        Grade {index + 1}: {gradeName} - {color}
                      </h5>
                      <Badge variant="secondary">
                        {totalPairs} pares
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Tamanhos:</strong> {sizePairConfigs.map(c => `${c.size} (${c.pairs})`).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-3 border-t border-green-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-green-700">Grades: </span>
                    <span className="font-medium">{selectedColors.length}</span>
                  </div>
                  <div>
                    <span className="text-green-700">Tamanhos por grade: </span>
                    <span className="font-medium">{sizePairConfigs.length}</span>
                  </div>
                  <div>
                    <span className="text-green-700">Pares por grade: </span>
                    <span className="font-medium">{totalPairs}</span>
                  </div>
                  <div>
                    <span className="text-green-700">Total geral: </span>
                    <span className="font-bold text-green-900 text-lg">{totalPairsAllColors} pares</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botão de Geração */}
          <div className="pt-4">
            <Button
              onClick={generateVariations}
              className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
              disabled={selectedColors.length === 0 || sizePairConfigs.length === 0}
            >
              <Package className="w-5 h-5 mr-2" />
              Gerar {totalVariations} Grade{totalVariations > 1 ? 's' : ''} Personalizada{totalVariations > 1 ? 's' : ''}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GradeConfigurationForm;
