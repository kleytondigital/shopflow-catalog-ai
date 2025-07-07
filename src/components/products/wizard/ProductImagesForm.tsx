
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera } from "lucide-react";
import DraftImageUpload from "../DraftImageUpload";

export interface ProductImagesFormProps {
  productId?: string;
  onImageUploadReady?: (uploadFn: (productId: string) => Promise<string[]>) => void;
}

const ProductImagesForm: React.FC<ProductImagesFormProps> = ({
  productId,
  onImageUploadReady,
}) => {
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
          productId={productId}
          onUploadReady={onImageUploadReady}
        />
      </CardContent>
    </Card>
  );
};

export default ProductImagesForm;
