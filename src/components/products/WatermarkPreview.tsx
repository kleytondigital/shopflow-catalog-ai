
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Upload } from 'lucide-react';
import { WatermarkConfig, useImageWatermark } from '@/hooks/useImageWatermark';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useAuth } from '@/hooks/useAuth';

interface WatermarkPreviewProps {
  imageFile: File | null;
  onWatermarkApplied: (file: File) => void;
  defaultConfig?: Partial<WatermarkConfig>;
}

const WatermarkPreview: React.FC<WatermarkPreviewProps> = ({
  imageFile,
  onWatermarkApplied,
  defaultConfig = {}
}) => {
  const { applyWatermark, processing } = useImageWatermark();
  const { profile } = useAuth();
  const { settings } = useStoreSettings(profile?.store_id);
  const [customLogoFile, setCustomLogoFile] = useState<File | null>(null);
  const [customLogoUrl, setCustomLogoUrl] = useState<string>('');
  const [config, setConfig] = useState<WatermarkConfig>({
    text: 'Minha Loja',
    position: 'bottom-right',
    opacity: 0.7,
    fontSize: 24,
    color: '#ffffff',
    logoSize: 80,
    useStoreLogo: false,
    ...defaultConfig
  });
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  // Configurar configurações da loja quando disponível
  useEffect(() => {
    if (settings) {
      // Buscar logo da loja das configurações da store
      // Por enquanto, vamos usar um placeholder
      const storeName = profile?.full_name || 'Minha Loja';
      setConfig(prev => ({
        ...prev,
        text: storeName,
        logoUrl: '' // Será preenchido quando tivermos a tabela stores
      }));
    }
  }, [settings, profile]);

  useEffect(() => {
    if (customLogoFile) {
      const url = URL.createObjectURL(customLogoFile);
      setCustomLogoUrl(url);
      setConfig(prev => ({ ...prev, logoUrl: url }));
      return () => URL.revokeObjectURL(url);
    }
  }, [customLogoFile]);

  const handleCustomLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setCustomLogoFile(file);
    }
  };

  const handleApplyWatermark = async () => {
    if (!imageFile) return;

    try {
      const watermarkedFile = await applyWatermark(imageFile, config);
      onWatermarkApplied(watermarkedFile);
    } catch (error) {
      console.error('Erro ao aplicar marca d\'água:', error);
    }
  };

  if (!imageFile) {
    return (
      <div className="text-center text-gray-500 py-8">
        Selecione uma imagem para visualizar a marca d'água
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Configurar Marca d'Água</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview da imagem */}
        <div className="relative bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-32 object-cover"
          />
          
          {/* Preview da marca d'água */}
          {config.useStoreLogo && (config.logoUrl || customLogoUrl) ? (
            <div
              className={`absolute pointer-events-none ${
                config.position === 'top-left' ? 'top-2 left-2' :
                config.position === 'top-right' ? 'top-2 right-2' :
                config.position === 'bottom-left' ? 'bottom-2 left-2' :
                config.position === 'bottom-right' ? 'bottom-2 right-2' :
                'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
              }`}
              style={{ opacity: config.opacity }}
            >
              <img
                src={config.logoUrl || customLogoUrl}
                alt="Logo"
                className="w-8 h-8 object-contain"
              />
            </div>
          ) : (
            <div
              className={`absolute text-white font-bold pointer-events-none ${
                config.position === 'top-left' ? 'top-2 left-2' :
                config.position === 'top-right' ? 'top-2 right-2' :
                config.position === 'bottom-left' ? 'bottom-2 left-2' :
                config.position === 'bottom-right' ? 'bottom-2 right-2' :
                'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
              }`}
              style={{
                opacity: config.opacity,
                fontSize: `${config.fontSize * 0.5}px`,
                color: config.color
              }}
            >
              {config.text}
            </div>
          )}
        </div>

        {/* Configurações */}
        <div className="grid grid-cols-1 gap-3">
          {/* Tipo de marca d'água */}
          <div className="flex items-center justify-between">
            <Label className="text-xs">Usar Logo</Label>
            <Switch
              checked={config.useStoreLogo}
              onCheckedChange={(checked) => setConfig({ ...config, useStoreLogo: checked })}
            />
          </div>

          {config.useStoreLogo ? (
            <>
              {/* Upload de logo personalizado */}
              <div>
                <Label className="text-xs">Logo Personalizado</Label>
                <div className="mt-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCustomLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="flex items-center justify-center w-full h-16 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary"
                  >
                    {customLogoUrl ? (
                      <img src={customLogoUrl} alt="Logo" className="h-12 w-12 object-contain" />
                    ) : (
                      <div className="text-center">
                        <Upload className="mx-auto h-6 w-6 text-gray-400" />
                        <span className="text-xs text-gray-500">Fazer upload do logo</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <Label className="text-xs">Tamanho do Logo: {config.logoSize}px</Label>
                <Slider
                  value={[config.logoSize || 80]}
                  onValueChange={([value]) => setConfig({ ...config, logoSize: value })}
                  min={40}
                  max={120}
                  step={10}
                  className="mt-1"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <Label className="text-xs">Texto</Label>
                <Input
                  value={config.text}
                  onChange={(e) => setConfig({ ...config, text: e.target.value })}
                  placeholder="Texto da marca d'água"
                  className="h-8"
                />
              </div>

              <div>
                <Label className="text-xs">Tamanho: {config.fontSize}px</Label>
                <Slider
                  value={[config.fontSize]}
                  onValueChange={([value]) => setConfig({ ...config, fontSize: value })}
                  min={12}
                  max={48}
                  step={2}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Cor</Label>
                <Input
                  type="color"
                  value={config.color}
                  onChange={(e) => setConfig({ ...config, color: e.target.value })}
                  className="h-8 w-full"
                />
              </div>
            </>
          )}

          <div>
            <Label className="text-xs">Posição</Label>
            <Select
              value={config.position}
              onValueChange={(value: any) => setConfig({ ...config, position: value })}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top-left">Superior Esquerdo</SelectItem>
                <SelectItem value="top-right">Superior Direito</SelectItem>
                <SelectItem value="bottom-left">Inferior Esquerdo</SelectItem>
                <SelectItem value="bottom-right">Inferior Direito</SelectItem>
                <SelectItem value="center">Centro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Opacidade: {Math.round(config.opacity * 100)}%</Label>
            <Slider
              value={[config.opacity]}
              onValueChange={([value]) => setConfig({ ...config, opacity: value })}
              min={0.1}
              max={1}
              step={0.1}
              className="mt-1"
            />
          </div>
        </div>

        <Button
          onClick={handleApplyWatermark}
          disabled={processing}
          className="w-full h-8 text-xs"
          size="sm"
        >
          {processing ? 'Aplicando...' : 'Aplicar Marca d\'Água'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default WatermarkPreview;
