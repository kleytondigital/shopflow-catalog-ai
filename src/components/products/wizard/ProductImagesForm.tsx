
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
  const { draftImages, addImage, removeImage, uploadImages } = useDraftImages();

  React.useEffect(() => {
    if (onImageUploadReady) {
      onImageUploadReady(uploadImages);
    }
  }, [onImageUploadReady, uploadImages]);

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
          onImageAdd={addImage}
          onImageRemove={removeImage}
        />
      </CardContent>
    </Card>
  );
};

export default ProductImagesForm;
