import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Wand2, TrendingDown } from "lucide-react";
import { Product } from "@/types/product";
import { useProductPriceTiers } from "@/hooks/useProductPriceTiers";
import { useAuth } from "@/hooks/useAuth";

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onGenerateDescription: (id: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  onEdit,
  onDelete,
  onGenerateDescription,
}) => {
  const { profile } = useAuth();

  // Componente para exibir níveis de preço de um produto
  const ProductPriceTiers = ({ product }: { product: Product }) => {
    const { tiers, loading } = useProductPriceTiers(
      product.id,
      profile?.store_id
    );

    if (loading || !tiers || tiers.length <= 1) {
      return null;
    }

    // Filtrar apenas níveis ativos (exceto varejo)
    const activeTiers = tiers.filter(
      (tier) => tier.tier_order > 1 && tier.is_active
    );

    if (activeTiers.length === 0) {
      return null;
    }

    // Calcular desconto máximo
    const maxDiscountTier = activeTiers.reduce(
      (max, tier) => {
        const savingsAmount = product.retail_price - tier.price;
        const savingsPercentage = (savingsAmount / product.retail_price) * 100;
        return savingsPercentage > max.percentage
          ? { tier, percentage: savingsPercentage }
          : max;
      },
      { tier: activeTiers[0], percentage: 0 }
    );

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <TrendingDown className="h-3 w-3" />
          <span className="font-medium">Níveis Progressivos:</span>
          <Badge
            variant="outline"
            className="text-xs bg-orange-100 text-orange-700"
          >
            Descontos até {maxDiscountTier.percentage.toFixed(0)}%
          </Badge>
        </div>
        {activeTiers.map((tier) => {
          const savingsAmount = product.retail_price - tier.price;
          const savingsPercentage =
            (savingsAmount / product.retail_price) * 100;

          return (
            <div
              key={tier.id}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-1">
                <span className="text-gray-700">{tier.tier_name}:</span>
                <Badge variant="outline" className="text-xs">
                  {tier.min_quantity}+ un
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-green-700">
                  R$ {tier.price.toFixed(2).replace(".", ",")}
                </span>
                <Badge
                  variant="secondary"
                  className="text-xs bg-green-100 text-green-700"
                >
                  -{savingsPercentage.toFixed(0)}%
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  if (!products || products.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">
            Nenhum produto cadastrado ainda.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Clique em "Novo Produto" para começar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg line-clamp-2">
                  {product.name}
                </CardTitle>
                {product.category && (
                  <Badge variant="outline" className="mt-2">
                    {product.category}
                  </Badge>
                )}
              </div>
              <Badge variant={product.is_active ? "default" : "secondary"}>
                {product.is_active ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {product.image_url && (
              <div className="aspect-video overflow-hidden rounded-md bg-muted">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {product.description && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {product.description}
              </p>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Varejo:</span>
                <span className="font-semibold">
                  R${" "}
                  {product.retail_price.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              {/* Níveis de preço progressivos */}
              <ProductPriceTiers product={product} />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Estoque:</span>
                <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                  {product.stock} unidades
                </Badge>
              </div>

              {product.variations && product.variations.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Variações:</span>
                  <Badge variant="outline">
                    {product.variations.length} opções
                  </Badge>
                </div>
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => onGenerateDescription(product.id)}
              >
                <Wand2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(product.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProductList;
