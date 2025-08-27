
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Moon, 
  Zap, 
  Building,
  Shirt,
  Smartphone,
  Coffee,
  Sparkles,
  Eye,
  Check
} from 'lucide-react';

interface TemplateStyleSelectorProps {
  currentTemplate: string;
  onTemplateChange: (templateName: string) => void;
}

const TEMPLATE_STYLES = [
  {
    style: 'minimal',
    name: 'Minimalista',
    description: 'Design limpo e focado no essencial',
    icon: Palette,
    colors: ['#2c3338', '#6b7280', '#8b5cf6'],
    features: ['Espaços brancos', 'Tipografia clara', 'Navegação simples'],
    preview: 'bg-white border-gray-200'
  },
  {
    style: 'dark',
    name: 'Escuro',
    description: 'Estética premium com tema escuro',
    icon: Moon,
    colors: ['#eab308', '#f97316', '#8b5cf6'],
    features: ['Tema escuro', 'Acentos dourados', 'Visual premium'],
    preview: 'bg-slate-900 border-yellow-400'
  },
  {
    style: 'vibrant',
    name: 'Vibrante',
    description: 'Cores energéticas e design jovem',
    icon: Zap,
    colors: ['#8b5cf6', '#e11d48', '#f97316'],
    features: ['Cores vibrantes', 'Animações', 'Visual energético'],
    preview: 'bg-purple-50 border-purple-400'
  },
  {
    style: 'neutral',
    name: 'Neutro',
    description: 'Profissional e confiável',
    icon: Building,
    colors: ['#3b82f6', '#16a34a', '#f97316'],
    features: ['Cores corporativas', 'Layout confiável', 'Visual profissional'],
    preview: 'bg-blue-50 border-blue-400'
  }
];

const TEMPLATE_NICHES = [
  {
    niche: 'fashion',
    name: 'Moda & Lifestyle',
    description: 'Para roupas, acessórios e lifestyle',
    icon: Shirt,
    adaptations: {
      minimal: 'Tons elegantes e sofisticados',
      dark: 'Luxury com dourados e prateados',
      vibrant: 'Cores fashion e gradientes',
      neutral: 'Tons terrosos e profissionais'
    }
  },
  {
    niche: 'electronics',
    name: 'Eletrônicos & Tech',
    description: 'Para tecnologia e eletrônicos',
    icon: Smartphone,
    adaptations: {
      minimal: 'Azul tech e visual limpo',
      dark: 'Cyber punk com neons',
      vibrant: 'Sci-fi com cores tech',
      neutral: 'Azuis corporativos'
    }
  },
  {
    niche: 'food',
    name: 'Alimentos & Bebidas',
    description: 'Para comidas, bebidas e gastronomia',
    icon: Coffee,
    adaptations: {
      minimal: 'Verde natural e clean',
      dark: 'Gourmet com warm tones',
      vibrant: 'Fresh com cores naturais',
      neutral: 'Orgânico com verdes/marrons'
    }
  },
  {
    niche: 'cosmetics',
    name: 'Cosméticos & Beleza',
    description: 'Para beleza, cuidados e bem-estar',
    icon: Sparkles,
    adaptations: {
      minimal: 'Magenta suave e clean',
      dark: 'Premium com metálicos',
      vibrant: 'Colorful e criativo',
      neutral: 'Rosa/bege profissional'
    }
  }
];

const TemplateStyleSelector: React.FC<TemplateStyleSelectorProps> = ({
  currentTemplate,
  onTemplateChange
}) => {
  const [selectedStyle, setSelectedStyle] = useState<string>('minimal');
  const [selectedNiche, setSelectedNiche] = useState<string>('fashion');
  const [previewMode, setPreviewMode] = useState<'grid' | 'detail'>('grid');

  // Determinar configuração atual
  const currentConfig = currentTemplate.includes('-') 
    ? currentTemplate.split('-') 
    : ['neutral', 'electronics'];
  
  React.useEffect(() => {
    if (currentConfig.length === 2) {
      setSelectedStyle(currentConfig[0]);
      setSelectedNiche(currentConfig[1]);
    }
  }, [currentTemplate]);

  const handleApplyTemplate = () => {
    const newTemplate = `${selectedStyle}-${selectedNiche}`;
    onTemplateChange(newTemplate);
  };

  const getTemplatePreview = (style: string, niche: string) => {
    const styleConfig = TEMPLATE_STYLES.find(s => s.style === style);
    const nicheConfig = TEMPLATE_NICHES.find(n => n.niche === niche);
    
    if (!styleConfig || !nicheConfig) return null;

    return {
      ...styleConfig,
      adaptation: nicheConfig.adaptations[style as keyof typeof nicheConfig.adaptations],
      nicheName: nicheConfig.name
    };
  };

  const currentPreview = getTemplatePreview(selectedStyle, selectedNiche);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-semibold">Escolha seu Template</h3>
        <p className="text-muted-foreground">
          Selecione um estilo base e adapte para seu nicho de mercado
        </p>
      </div>

      {/* Preview do Template Selecionado */}
      {currentPreview && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 text-white rounded-lg">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {currentPreview.name} - {currentPreview.nicheName}
                  </CardTitle>
                  <CardDescription>{currentPreview.adaptation}</CardDescription>
                </div>
              </div>
              <Button onClick={handleApplyTemplate} className="gap-2">
                <Check className="w-4 h-4" />
                Aplicar Template
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {currentPreview.colors.map((color, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {currentPreview.features.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seletor de Estilo */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold">1. Escolha o Estilo Base</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEMPLATE_STYLES.map((style) => {
            const IconComponent = style.icon;
            const isSelected = selectedStyle === style.style;
            
            return (
              <Card
                key={style.style}
                className={`cursor-pointer transition-all border-2 hover:shadow-lg ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedStyle(style.style)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${
                      isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    {isSelected && (
                      <Badge className="bg-blue-500">
                        <Check className="w-3 h-3 mr-1" />
                        Selecionado
                      </Badge>
                    )}
                  </div>
                  
                  <div>
                    <h5 className="font-semibold">{style.name}</h5>
                    <p className="text-xs text-muted-foreground">{style.description}</p>
                  </div>
                  
                  <div className="flex gap-1">
                    {style.colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded-full border border-gray-200"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Seletor de Nicho */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold">2. Escolha seu Nicho de Mercado</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TEMPLATE_NICHES.map((niche) => {
            const IconComponent = niche.icon;
            const isSelected = selectedNiche === niche.niche;
            const adaptation = niche.adaptations[selectedStyle as keyof typeof niche.adaptations];
            
            return (
              <Card
                key={niche.niche}
                className={`cursor-pointer transition-all border-2 hover:shadow-lg ${
                  isSelected
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedNiche(niche.niche)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        isSelected ? 'bg-green-500 text-white' : 'bg-gray-100'
                      }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-semibold">{niche.name}</h5>
                        <p className="text-xs text-muted-foreground">{niche.description}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <Badge className="bg-green-500">
                        <Check className="w-3 h-3 mr-1" />
                        Selecionado
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 bg-gray-100 p-3 rounded-lg">
                    <strong>Adaptação {TEMPLATE_STYLES.find(s => s.style === selectedStyle)?.name}:</strong>
                    <br />
                    {adaptation}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TemplateStyleSelector;
