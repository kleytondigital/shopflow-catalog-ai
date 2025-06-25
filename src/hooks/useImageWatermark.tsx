
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCatalogSettings } from '@/hooks/useCatalogSettings';

type WatermarkPosition = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export const useImageWatermark = () => {
  const { profile } = useAuth();
  const { settings } = useCatalogSettings();
  const [processing, setProcessing] = useState(false);

  const applyWatermark = async (imageUrl: string, productName?: string): Promise<string> => {
    if (!settings?.watermark_enabled) {
      return imageUrl;
    }

    try {
      setProcessing(true);
      
      // Validar posição do watermark
      const validPositions: WatermarkPosition[] = ['center', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];
      const position = validPositions.includes(settings.watermark_position as WatermarkPosition) 
        ? settings.watermark_position as WatermarkPosition
        : 'bottom-right';

      // Criar canvas para aplicar watermark
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Canvas not supported');

      // Carregar imagem original
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Desenhar imagem original
          ctx.drawImage(img, 0, 0);
          
          // Configurar watermark
          const fontSize = settings.watermark_size || 24;
          const opacity = settings.watermark_opacity || 0.7;
          const text = settings.watermark_text || productName || 'Minha Loja';
          
          ctx.font = `${fontSize}px Arial`;
          ctx.fillStyle = settings.watermark_color || '#ffffff';
          ctx.globalAlpha = opacity;
          
          // Calcular posição
          const textMetrics = ctx.measureText(text);
          let x, y;
          
          switch (position) {
            case 'center':
              x = (canvas.width - textMetrics.width) / 2;
              y = canvas.height / 2;
              break;
            case 'top-left':
              x = 20;
              y = fontSize + 20;
              break;
            case 'top-right':
              x = canvas.width - textMetrics.width - 20;
              y = fontSize + 20;
              break;
            case 'bottom-left':
              x = 20;
              y = canvas.height - 20;
              break;
            case 'bottom-right':
            default:
              x = canvas.width - textMetrics.width - 20;
              y = canvas.height - 20;
              break;
          }
          
          // Desenhar watermark
          ctx.fillText(text, x, y);
          
          // Converter para URL
          const watermarkedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
          resolve(watermarkedImageUrl);
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imageUrl;
      });
      
    } catch (error) {
      console.error('Error applying watermark:', error);
      return imageUrl; // Retornar imagem original em caso de erro
    } finally {
      setProcessing(false);
    }
  };

  return {
    applyWatermark,
    processing,
    watermarkEnabled: settings?.watermark_enabled || false
  };
};
