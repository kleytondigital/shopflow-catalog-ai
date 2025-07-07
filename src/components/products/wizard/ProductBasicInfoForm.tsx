
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Package, FileText, Tag } from "lucide-react";

export interface ProductBasicInfoFormProps {
  name: string;
  description: string;
  category: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

const ProductBasicInfoForm: React.FC<ProductBasicInfoFormProps> = ({
  name,
  description,
  category,
  onNameChange,
  onDescriptionChange,
  onCategoryChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Informações Básicas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="product-name">
            Nome do Produto <span className="text-red-500">*</span>
          </Label>
          <Input
            id="product-name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Digite o nome do produto"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-description" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Descrição
          </Label>
          <Textarea
            id="product-description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Descreva o produto em detalhes"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-category" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Categoria
          </Label>
          <Input
            id="product-category"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            placeholder="Ex: Roupas, Eletrônicos, Casa"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductBasicInfoForm;
