
import React, { useState } from 'react';
import { WizardFormData } from '@/hooks/useImprovedProductFormWizard';
import ImprovedProductImagesForm from '../ImprovedProductImagesForm';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Upload, Image as ImageIcon } from "lucide-react";
import { useDraftImagesContext } from '@/contexts/DraftImagesContext';

interface ImagesStepProps {
  formData: WizardFormData;
  updateFormData: (updates: Partial<WizardFormData>) => void;
  productId?: string;
}

const ImagesStep: React.FC<ImagesStepProps> = ({ formData, updateFormData, productId }) => {
  const { draftImages } = useDraftImagesContext();
  const [useMainImageAsThumbnail, setUseMainImageAsThumbnail] = useState(false);

  // Imagem principal (primeira ou marcada como principal)
  const mainImage = draftImages.find(img => img.isPrimary) || draftImages[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Imagens e Vídeo do Produto</h3>
        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
          📸 Mídia
        </Badge>
      </div>
      
      {/* Seção de Imagens */}
      <div>
        <h4 className="font-medium mb-3 text-gray-700">📸 Imagens</h4>
        <ImprovedProductImagesForm productId={productId} />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <h5 className="font-medium text-blue-900 mb-2 text-sm">💡 Dicas para Imagens</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• A primeira imagem ou a marcada como "Principal" será a capa do produto</li>
            <li>• Use imagens de alta qualidade (mínimo 800x800 pixels)</li>
            <li>• Mostre o produto de diferentes ângulos</li>
            <li>• Evite fundos muito carregados</li>
            <li>• Máximo 10 imagens por produto</li>
          </ul>
        </div>
      </div>

      {/* Seção de Vídeo */}
      <div className="border-t pt-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <h4 className="font-medium text-gray-700">🎬 Vídeo do Produto (Opcional)</h4>
        </div>

        <div className="grid grid-cols-1 gap-4 bg-purple-50 p-4 rounded-lg border border-purple-200">
          {/* Tipo de vídeo */}
          <div className="space-y-2">
            <Label htmlFor="videoType" className="text-sm font-medium">
              Tipo de Vídeo
            </Label>
            <Select
              value={formData.video_type || "youtube"}
              onValueChange={(value) => updateFormData({ video_type: value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="youtube">📺 YouTube</SelectItem>
                <SelectItem value="vimeo">🎬 Vimeo</SelectItem>
                <SelectItem value="direct">📹 Vídeo Direto (MP4)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* URL do vídeo */}
          <div className="space-y-2">
            <Label htmlFor="videoUrl" className="text-sm font-medium">
              URL do Vídeo
            </Label>
            <Input
              id="videoUrl"
              type="url"
              value={formData.video_url || ""}
              onChange={(e) => updateFormData({ video_url: e.target.value })}
              placeholder={
                formData.video_type === 'youtube' 
                  ? "https://www.youtube.com/watch?v=..."
                  : formData.video_type === 'vimeo'
                  ? "https://vimeo.com/..."
                  : "https://exemplo.com/video.mp4"
              }
            />
            <p className="text-xs text-muted-foreground">
              {formData.video_type === 'youtube' && "Cole o link do vídeo no YouTube"}
              {formData.video_type === 'vimeo' && "Cole o link do vídeo no Vimeo"}
              {formData.video_type === 'direct' && "Cole o link direto do arquivo de vídeo"}
            </p>
          </div>

          {/* Opção de usar imagem principal como thumbnail */}
          {mainImage && (
            <div className="space-y-2 bg-white p-3 rounded-lg border border-purple-300">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="useMainImageAsThumbnail"
                  checked={useMainImageAsThumbnail}
                  onChange={(e) => {
                    setUseMainImageAsThumbnail(e.target.checked);
                    if (e.target.checked && mainImage.preview) {
                      updateFormData({ video_thumbnail: mainImage.preview });
                    } else if (!e.target.checked) {
                      updateFormData({ video_thumbnail: "" });
                    }
                  }}
                  className="w-4 h-4 text-purple-600"
                />
                <Label htmlFor="useMainImageAsThumbnail" className="text-sm font-medium cursor-pointer">
                  <ImageIcon className="w-4 h-4 inline mr-1" />
                  Usar imagem principal como thumbnail do vídeo
                </Label>
              </div>
              {useMainImageAsThumbnail && mainImage.preview && (
                <div className="flex items-center gap-2 mt-2">
                  <img 
                    src={mainImage.preview} 
                    alt="Thumbnail" 
                    className="w-20 h-20 object-cover rounded border border-purple-300"
                  />
                  <span className="text-xs text-green-600 font-medium">✓ Usando imagem principal</span>
                </div>
              )}
            </div>
          )}

          {/* Thumbnail personalizada */}
          {!useMainImageAsThumbnail && (
            <div className="space-y-2">
              <Label htmlFor="videoThumbnail" className="text-sm font-medium">
                Thumbnail Personalizada (Opcional)
              </Label>
              <Input
                id="videoThumbnail"
                type="url"
                value={formData.video_thumbnail || ""}
                onChange={(e) => updateFormData({ video_thumbnail: e.target.value })}
                placeholder="https://exemplo.com/thumbnail.jpg"
              />
              <p className="text-xs text-muted-foreground">
                URL da imagem de capa do vídeo
              </p>
            </div>
          )}

          {formData.video_url && (
            <Alert className="bg-purple-100 border-purple-300">
              <AlertCircle className="h-4 w-4 text-purple-700" />
              <AlertDescription className="text-purple-900 text-sm">
                <strong>💡 Dica:</strong> Vídeos aumentam a conversão em até 80%! Mostre o produto em uso, detalhes e benefícios.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImagesStep;
