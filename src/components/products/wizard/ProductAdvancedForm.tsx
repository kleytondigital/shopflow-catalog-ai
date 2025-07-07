
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Star, Eye, Settings } from "lucide-react";

export interface ProductAdvancedFormProps {
  isFeatured: boolean;
  isActive: boolean;
  onIsFeaturedChange: (value: boolean) => void;
  onIsActiveChange: (value: boolean) => void;
}

const ProductAdvancedForm: React.FC<ProductAdvancedFormProps> = ({
  isFeatured,
  isActive,
  onIsFeaturedChange,
  onIsActiveChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configurações Avançadas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Produto em Destaque
            </Label>
            <p className="text-sm text-gray-500">
              Produto aparecerá em destaque no catálogo
            </p>
          </div>
          <Switch
            checked={isFeatured}
            onCheckedChange={onIsFeaturedChange}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Produto Ativo
            </Label>
            <p className="text-sm text-gray-500">
              Produto ficará visível no catálogo público
            </p>
          </div>
          <Switch
            checked={isActive}
            onCheckedChange={onIsActiveChange}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductAdvancedForm;
