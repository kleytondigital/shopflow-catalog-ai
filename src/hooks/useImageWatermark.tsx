
import { useState } from 'react';

export interface WatermarkConfig {
  text?: string;
  logoUrl?: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
  fontSize: number;
  color: string;
}

export const useImageWatermark = () => {
  const [processing, setProcessing] = useState(false);

  const applyWatermark = async (
    imageFile: File, 
    config: WatermarkConfig
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      setProcessing(true);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        try {
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Desenhar imagem original
          ctx!.drawImage(img, 0, 0);
          
          // Configurar marca d'água
          ctx!.globalAlpha = config.opacity;
          ctx!.fillStyle = config.color;
          ctx!.font = `${config.fontSize}px Arial`;
          
          if (config.text) {
            const textMetrics = ctx!.measureText(config.text);
            let x, y;
            
            switch (config.position) {
              case 'top-left':
                x = 20;
                y = config.fontSize + 20;
                break;
              case 'top-right':
                x = canvas.width - textMetrics.width - 20;
                y = config.fontSize + 20;
                break;
              case 'bottom-left':
                x = 20;
                y = canvas.height - 20;
                break;
              case 'bottom-right':
                x = canvas.width - textMetrics.width - 20;
                y = canvas.height - 20;
                break;
              case 'center':
                x = (canvas.width - textMetrics.width) / 2;
                y = canvas.height / 2;
                break;
              default:
                x = 20;
                y = canvas.height - 20;
            }
            
            ctx!.fillText(config.text, x, y);
          }
          
          // Converter canvas para blob e depois para File
          canvas.toBlob((blob) => {
            if (blob) {
              const watermarkedFile = new File(
                [blob], 
                imageFile.name, 
                { type: imageFile.type }
              );
              resolve(watermarkedFile);
            } else {
              reject(new Error('Falha ao aplicar marca d\'água'));
            }
            setProcessing(false);
          }, imageFile.type, 0.9);
          
        } catch (error) {
          setProcessing(false);
          reject(error);
        }
      };
      
      img.onerror = () => {
        setProcessing(false);
        reject(new Error('Falha ao carregar imagem'));
      };
      
      img.src = URL.createObjectURL(imageFile);
    });
  };

  return {
    applyWatermark,
    processing
  };
};
