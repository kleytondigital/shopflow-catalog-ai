
import React, { useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useDraftImages } from '@/hooks/useDraftImages';

interface ProductImagesFormProps {
  productId?: string;
}

const ProductImagesForm: React.FC<ProductImagesFormProps> = ({ productId }) => {
  const {
    draftImages,
    isUploading,
    isLoading,
    addDraftImages,
    removeDraftImage,
    loadExistingImages
  } = useDraftImages();

  // Carregar imagens existentes apenas uma vez quando em modo de edição
  useEffect(() => {
    if (productId) {
      console.log('ProductImagesForm: Carregando imagens para produto:', productId);
      loadExistingImages(productId);
    }
  }, [productId]); // Remover loadExistingImages das dependências para evitar loop

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 10,
    onDrop: (acceptedFiles) => {
      console.log('ProductImagesForm: Arquivos selecionados:', acceptedFiles.length);
      addDraftImages(acceptedFiles);
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Carregando imagens...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Imagens do Produto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Área de Upload */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? 'border-primary bg-primary/10 scale-[1.02]'
              : 'border-gray-300 hover:border-primary hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-primary font-medium">Solte as imagens aqui...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-2 font-medium">
                Arraste e solte imagens aqui, ou clique para selecionar
              </p>
              <p className="text-sm text-gray-500">
                Suporta PNG, JPG, JPEG, GIF, WEBP (máx. 10 imagens)
              </p>
            </div>
          )}
        </div>

        {/* Preview das Imagens */}
        {draftImages.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">
                Imagens Selecionadas ({draftImages.length})
              </h4>
              {isUploading && (
                <div className="flex items-center text-sm text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processando...
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {draftImages.map((image, index) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary transition-colors">
                    <img
                      src={image.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    {image.uploaded ? (
                      <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        ✓ Salva
                      </div>
                    ) : (
                      <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        ◯ Nova
                      </div>
                    )}
                  </div>

                  {/* Principal Badge */}
                  {index === 0 && (
                    <div className="absolute top-2 right-8">
                      <div className="bg-primary text-white text-xs px-2 py-1 rounded-full font-medium">
                        Principal
                      </div>
                    </div>
                  )}
                  
                  {/* Remove Button */}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeDraftImage(image.id)}
                    disabled={isUploading}
                  >
                    <X className="h-3 w-3" />
                  </Button>

                  {/* Image Order */}
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informações e Dicas */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 mb-2">💡 Dicas importantes:</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• A primeira imagem será definida como principal</li>
            <li>• Use imagens de boa qualidade (mínimo 800x800px)</li>
            <li>• Máximo de 10 imagens por produto</li>
            <li>• Formatos aceitos: PNG, JPG, JPEG, GIF, WEBP</li>
            <li>• As imagens serão salvas automaticamente ao concluir o cadastro</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductImagesForm;
