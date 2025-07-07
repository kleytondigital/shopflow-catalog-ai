
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';

interface ProductAdvancedFormProps {
  isFeatured?: boolean;
  isActive?: boolean;
  onIsFeaturedChange: (featured: boolean) => void;
  onIsActiveChange: (active: boolean) => void;
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
          <div className="space-y-0.5">
            <Label htmlFor="is_active">Produto Ativo</Label>
            <p className="text-sm text-muted-foreground">
              Produto visível no catálogo
            </p>
          </div>
          <Switch
            id="is_active"
            checked={isActive !== false}
            onCheckedChange={onIsActiveChange}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="is_featured">Produto Destacado</Label>
            <p className="text-sm text-muted-foreground">
              Produto aparece em destaque no catálogo
            </p>
          </div>
          <Switch
            id="is_featured"
            checked={isFeatured || false}
            onCheckedChange={onIsFeaturedChange}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductAdvancedForm;
