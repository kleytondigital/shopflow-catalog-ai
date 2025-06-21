
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Palette, Copy, Download, Upload, RotateCcw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface AdvancedColorSettingsProps {
  colors: {
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    background_color: string;
    text_color: string;
    border_color: string;
  };
  onChange: (colors: any) => void;
  onReset: () => void;
}

const AdvancedColorSettings: React.FC<AdvancedColorSettingsProps> = ({
  colors,
  onChange,
  onReset
}) => {
  const [gradientEnabled, setGradientEnabled] = useState(true);
  const [gradientAngle, setGradientAngle] = useState(135);
  const [opacity, setOpacity] = useState(100);

  const colorPresets = [
    {
      name: 'Azul Moderno',
      colors: {
        primary_color: '#0057FF',
        secondary_color: '#FF6F00',
        accent_color: '#8E2DE2',
        background_color: '#F8FAFC',
        text_color: '#1E293B',
        border_color: '#E2E8F0',
      }
    },
    {
      name: 'Verde Natureza',
      colors: {
        primary_color: '#059669',
        secondary_color: '#10B981',
        accent_color: '#84CC16',
        background_color: '#F0FDF4',
        text_color: '#14532D',
        border_color: '#BBF7D0',
      }
    },
    {
      name: 'Rosa Elegante',
      colors: {
        primary_color: '#EC4899',
        secondary_color: '#F97316',
        accent_color: '#8B5CF6',
        background_color: '#FDF2F8',
        text_color: '#831843',
        border_color: '#FBCFE8',
      }
    },
    {
      name: 'Roxo Premium',
      colors: {
        primary_color: '#7C3AED',
        secondary_color: '#EC4899',
        accent_color: '#F59E0B',
        background_color: '#FAF5FF',
        text_color: '#581C87',
        border_color: '#DDD6FE',
      }
    }
  ];

  const handleColorChange = (colorKey: string, value: string) => {
    onChange({
      ...colors,
      [colorKey]: value
    });
  };

  const applyPreset = (preset: any) => {
    onChange(preset.colors);
    toast.success(`Paleta "${preset.name}" aplicada!`);
  };

  const copyPalette = () => {
    const paletteData = JSON.stringify(colors, null, 2);
    navigator.clipboard.writeText(paletteData);
    toast.success('Paleta copiada para área de transferência!');
  };

  const exportPalette = () => {
    const dataStr = JSON.stringify(colors, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'paleta-cores.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success('Paleta exportada!');
  };

  return (
    <div className="space-y-6">
      {/* Configurações Básicas de Cores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Cores Principais
          </CardTitle>
          <CardDescription>
            Configure as cores fundamentais do seu template
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Cor Primária</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={colors.primary_color}
                    onChange={(e) => handleColorChange('primary_color', e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    value={colors.primary_color}
                    onChange={(e) => handleColorChange('primary_color', e.target.value)}
                    placeholder="#0057FF"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cor Secundária</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={colors.secondary_color}
                    onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    value={colors.secondary_color}
                    onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                    placeholder="#FF6F00"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cor de Destaque</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={colors.accent_color}
                    onChange={(e) => handleColorChange('accent_color', e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    value={colors.accent_color}
                    onChange={(e) => handleColorChange('accent_color', e.target.value)}
                    placeholder="#8E2DE2"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Cor de Fundo</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={colors.background_color}
                    onChange={(e) => handleColorChange('background_color', e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    value={colors.background_color}
                    onChange={(e) => handleColorChange('background_color', e.target.value)}
                    placeholder="#F8FAFC"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cor do Texto</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={colors.text_color}
                    onChange={(e) => handleColorChange('text_color', e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    value={colors.text_color}
                    onChange={(e) => handleColorChange('text_color', e.target.value)}
                    placeholder="#1E293B"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cor das Bordas</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={colors.border_color}
                    onChange={(e) => handleColorChange('border_color', e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    value={colors.border_color}
                    onChange={(e) => handleColorChange('border_color', e.target.value)}
                    placeholder="#E2E8F0"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Avançado */}
      <Card>
        <CardHeader>
          <CardTitle>Preview das Cores</CardTitle>
          <CardDescription>
            Veja como suas cores ficam em diferentes elementos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-6 rounded-lg border-2 border-dashed border-gray-300" 
               style={{ backgroundColor: colors.background_color }}>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: colors.text_color }}>
                Título do Produto
              </h3>
              
              <div className="flex gap-3">
                <div 
                  className="px-4 py-2 rounded text-white font-medium"
                  style={{ backgroundColor: colors.primary_color }}
                >
                  Botão Primário
                </div>
                <div 
                  className="px-4 py-2 rounded text-white font-medium"
                  style={{ backgroundColor: colors.secondary_color }}
                >
                  Botão Secundário
                </div>
                <div 
                  className="px-4 py-2 rounded text-white font-medium"
                  style={{ backgroundColor: colors.accent_color }}
                >
                  Destaque
                </div>
              </div>

              <div 
                className="p-4 rounded border-2"
                style={{ 
                  borderColor: colors.border_color,
                  backgroundColor: '#FFFFFF'
                }}
              >
                <p style={{ color: colors.text_color }}>
                  Este é um exemplo de card de produto com as cores selecionadas.
                </p>
              </div>

              {gradientEnabled && (
                <div 
                  className="p-4 rounded text-white font-medium"
                  style={{ 
                    background: `linear-gradient(${gradientAngle}deg, ${colors.primary_color}, ${colors.secondary_color})`,
                    opacity: opacity / 100
                  }}
                >
                  Gradiente Personalizado
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações Avançadas */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações Avançadas</CardTitle>
          <CardDescription>
            Personalize gradientes e efeitos especiais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="gradient-enabled">Gradientes Habilitados</Label>
              <p className="text-sm text-gray-600">Usar gradientes nos botões e elementos</p>
            </div>
            <Switch
              id="gradient-enabled"
              checked={gradientEnabled}
              onCheckedChange={setGradientEnabled}
            />
          </div>

          {gradientEnabled && (
            <>
              <div className="space-y-2">
                <Label>Ângulo do Gradiente: {gradientAngle}°</Label>
                <Slider
                  value={[gradientAngle]}
                  onValueChange={(value) => setGradientAngle(value[0])}
                  max={360}
                  min={0}
                  step={15}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Opacidade: {opacity}%</Label>
                <Slider
                  value={[opacity]}
                  onValueChange={(value) => setOpacity(value[0])}
                  max={100}
                  min={10}
                  step={10}
                  className="w-full"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Paletas Predefinidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Paletas Predefinidas
          </CardTitle>
          <CardDescription>
            Escolha uma paleta pronta ou crie a sua própria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {colorPresets.map((preset, index) => (
              <div 
                key={index}
                className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => applyPreset(preset)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{preset.name}</h4>
                  <Badge variant="outline">Aplicar</Badge>
                </div>
                <div className="flex gap-2">
                  {Object.values(preset.colors).slice(0, 4).map((color, colorIndex) => (
                    <div 
                      key={colorIndex}
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex flex-wrap gap-3 justify-end">
        <Button variant="outline" onClick={copyPalette} className="flex items-center gap-2">
          <Copy className="h-4 w-4" />
          Copiar Paleta
        </Button>
        <Button variant="outline" onClick={exportPalette} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
        <Button variant="outline" onClick={onReset} className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          Resetar
        </Button>
      </div>
    </div>
  );
};

export default AdvancedColorSettings;
