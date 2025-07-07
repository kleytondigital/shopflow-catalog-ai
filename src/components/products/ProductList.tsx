
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, Sparkles } from "lucide-react";
import { Product } from "@/types/product";
import { useAuth } from "@/hooks/useAuth";

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onGenerateDescription?: (productId: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  onEdit,
  onDelete,
  onGenerateDescription,
}) => {
  const { profile } = useAuth();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const getStockStatus = (stock: number, threshold: number = 5) => {
    if (stock === 0) return { label: "Sem estoque", color: "destructive" };
    if (stock <= threshold) return { label: "Estoque baixo", color: "warning" };
    return { label: "Em estoque", color: "success" };
  };

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-gray-500 mb-4">
              Comece criando seu primeiro produto para aparecer aqui.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => {
        const stockStatus = getStockStatus(product.stock, product.stock_alert_threshold);
        
        return (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square relative overflow-hidden bg-gray-100">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Eye className="mx-auto h-12 w-12 mb-2" />
                    <p className="text-sm">Sem imagem</p>
                  </div>
                </div>
              )}
              {product.is_featured && (
                <Badge className="absolute top-2 right-2 bg-yellow-500">
                  Destaque
                </Badge>
              )}
            </div>
            
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-2">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {product.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(product.retail_price)}
                    </span>
                    {product.wholesale_price && (
                      <span className="text-sm text-gray-500">
                        Atacado: {formatPrice(product.wholesale_price)}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <Badge variant={stockStatus.color as any}>
                      {stockStatus.label}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Estoque: {product.stock}
                    </span>
                  </div>

                  {product.category && (
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(product)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  
                  {onGenerateDescription && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onGenerateDescription(product.id)}
                      title="Gerar descrição com IA"
                    >
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(product.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ProductList;
