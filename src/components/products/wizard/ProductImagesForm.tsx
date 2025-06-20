
import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, AlertCircle, CheckCircle, Wand2, Droplet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useProductImages } from '@/hooks/useProductImages';
import { useDraftImages } from '@/hooks/useDraftImages';
import { useImageWatermark } from '@/hooks/useImageWatermark';
import { UseFormReturn } from 'react-hook-form';

interface ProductImagesFormProps {
  form: UseFormReturn<any>;
  initialData?: any;
  mode?: 'create' | 'edit';
  onValidationChange?: (isValid: boolean) => void;
}

const ProductImagesForm: React.FC<ProductImagesFormProps> = ({
  form,
  initialData,
  mode = 'create',
  onValidationChange
}) => {
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const { uploadAndSaveImages, loading, error } = useProductImages();
  const { 
    draftImages, 
    addDraftImages, 
    removeDraftImage, 
    clearDraftImages
  } = useDraftImages();
  const { applyWatermark, isWatermarkEnabled } = useImageWatermark();

  // Carregar imagens iniciais se estiver no modo edição
  useEffect(() => {
    if (mode === 'edit' && initialData?.image_url) {
      setImages([initialData.image_url]);
    }
  }, [mode, initialData]);

  // Sincronizar draft images com estado local
  useEffect(() => {
    if (mode === 'create' && draftImages.length > 0) {
      const imageUrls = draftImages.map(img => img.url);
      setImages(imageUrls);
      
      // Atualizar o form com a primeira imagem
      if (imageUrls.length > 0) {
        form.setValue('image_url', imageUrls[0]);
        setUploadStatus('success');
      }
    }
  }, [draftImages, mode, form]);

  // Notificar sobre mudanças de validação
  useEffect(() => {
    const isValid = images.length > 0;
    onValidationChange?.(isValid);
  }, [images.length, onValidationChange]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    setUploadStatus('idle');

    try {
      const processedFiles: File[] = [];
      
      // Aplicar marca d'água automaticamente se estiver habilitada
      for (const file of acceptedFiles) {
        let processedFile = file;
        
        if (isWatermarkEnabled) {
          try {
            console.log('Aplicando marca d\'água automaticamente...');
            processedFile = await applyWatermark(file);
          } catch (error) {
            console.error('Erro ao aplicar marca d\'água:', error);
            // Continuar com arquivo original se falhar
          }
        }
        
        processedFiles.push(processedFile);
      }

      if (mode === 'create') {
        addDraftImages(processedFiles);
        setUploadStatus('success');
      } else if (mode === 'edit' && initialData?.id) {
        const uploadedImages = await uploadAndSaveImages(processedFiles, initialData.id);
        const newImageUrls = uploadedImages.map(img => img.image_url);
        const updatedImages = [...images, ...newImageUrls];
        setImages(updatedImages);
        
        if (updatedImages.length > 0) {
          form.setValue('image_url', updatedImages[0]);
        }
        setUploadStatus('success');
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
  }, [mode, initialData, addDraftImages, uploadAndSaveImages, images, form, isWatermarkEnabled, applyWatermark]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: true,
    disabled: uploading
  });

  const removeImage = (index: number) => {
    if (mode === 'create') {
      removeDraftImage(index);
    } else {
      const updatedImages = images.filter((_, i) => i !== index);
      setImages(updatedImages);
      
      if (updatedImages.length > 0) {
        form.setValue('image_url', updatedImages[0]);
      } else {
        form.setValue('image_url', '');
      }
    }
  };

  const isLoading = loading || uploading;
  const displayImages = mode === 'create' ? draftImages.map(img => img.url) : images;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Imagens do Produto</h3>
          {isWatermarkEnabled && (
            <Badge variant="outline" className="text-xs">
              <Droplet className="h-3 w-3 mr-1" />
              Marca d'água ativa
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Adicione até 10 imagens do produto. A primeira imagem será a principal.
          {isWatermarkEnabled && (
            <span className="block mt-1 text-blue-600">
              ✨ Marca d'água será aplicada automaticamente
            </span>
          )}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {uploadStatus === 'success' && displayImages.length > 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            {displayImages.length} imagem(ns) adicionada(s) com sucesso!
            {isWatermarkEnabled && ' Marca d\'água aplicada automaticamente.'}
          </AlertDescription>
        </Alert>
      )}

      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-primary bg-primary/5 scale-102' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} disabled={isLoading} />
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-lg font-medium mb-2">
              {isDragActive
                ? 'Solte as imagens aqui...'
                : 'Arraste imagens aqui ou clique para selecionar'
              }
            </p>
            <p className="text-sm text-muted-foreground">
              Formatos: JPG, PNG, WebP • Máximo 5MB cada • Até 10 imagens
            </p>
            {isWatermarkEnabled && (
              <p className="text-xs text-blue-600 mt-2">
                ✨ Marca d'água será aplicada automaticamente
              </p>
            )}
          </div>
          {isLoading && (
            <div className="flex items-center gap-2 text-primary">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
              <span className="text-sm">
                {isWatermarkEnabled ? 'Processando e aplicando marca d\'água...' : 'Processando...'}
              </span>
            </div>
          )}
        </div>
      </div>

      {displayImages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Imagens Adicionadas ({displayImages.length})</h4>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayImages.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={`Produto ${index + 1}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  
                  {/* Preview da marca d'água se estiver ativa */}
                  {isWatermarkEnabled && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute bottom-2 right-2 opacity-70">
                        <Droplet className="h-4 w-4 text-white drop-shadow-lg" />
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
                {index === 0 && (
                  <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                    Principal
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImagesForm;
