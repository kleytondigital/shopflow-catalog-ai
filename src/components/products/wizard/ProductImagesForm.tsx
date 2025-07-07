
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera } from "lucide-react";
import { useDraftImages } from "@/hooks/useDraftImages";
import DraftImageUpload from "../DraftImageUpload";

export interface ProductImagesFormProps {
  productId?: string;
  onImageUploadReady?: (uploadFn: (productId: string) => Promise<string[]>) => void;
}

const ProductImagesForm: React.FC<ProductImagesFormProps> = ({
  productId,
  onImageUploadReady,
}) => {
  const { draftImages, addDraftImages, removeDraftImage, uploadAllImages } = useDraftImages();

  const handleImageAdd = (files: File[]) => {
    addDraftImages(files);
  };

  const handleImageRemove = (imageId: string) => {
    removeDraftImage(imageId);
  };

  React.useEffect(() => {
    if (onImageUploadReady) {
      onImageUploadReady(uploadAllImages);
    }
  }, [onImageUploadReady, uploadAllImages]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Imagens do Produto
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DraftImageUpload
          draftImages={draftImages}
          onImageAdd={handleImageAdd}
          onImageRemove={handleImageRemove}
        />
      </CardContent>
    </Card>
  );
};

export default ProductImagesForm;
