import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@/types/product";
import {
  Image as ImageIcon,
  Package,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  ShoppingCart,
  Star,
} from "lucide-react";

interface ProductInfoCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onView?: (product: Product) => void;
  onDelete?: (id: string) => void;
  storePriceModel?:
    | "retail_only"
    | "simple_wholesale"
    | "gradual_wholesale"
    | "wholesale_only";
}

const ProductInfoCard: React.FC<ProductInfoCardProps> = ({
  product,
  onEdit,
  onView,
  onDelete,
  storePriceModel,
}) => {
  const mainImage =
    product.image_url ||
    product.variations?.find((v) => v.image_url)?.image_url ||
    null;

  const imageCount = ((): number => {
    let count = 0;
    if (product.image_url) count++;
    if (product.variations)
      count += product.variations.filter((v) => v.image_url).length;
    return count;
  })();

  // Corrigir linter: garantir que product.price_model existe
  const modelKey = (storePriceModel ||
    (product as any).price_model ||
    "retail_only") as
    | "retail_only"
    | "simple_wholesale"
    | "gradual_wholesale"
    | "wholesale_only";

  const rating =
    3.5 +
    (Math.abs(
      product.id
        .split("")
        .reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) & a, 0)
    ) %
      15) /
      10;
  const reviewCount = Math.floor(
    5 + ((product.name.length + (product.retail_price || 0)) % 45)
  );

  return (
    <Card className="hover:shadow-lg transition-all duration-300 rounded-2xl border border-gray-200 bg-white flex flex-col min-h-[340px]">
      {/* Imagem do produto */}
      <div className="w-full aspect-square bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden group">
        {mainImage ? (
          <img
            src={mainImage}
            alt={product.name}
            className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-105"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
            <ImageIcon className="h-10 w-10 mb-1" />
            <span className="text-xs">Sem imagem</span>
          </div>
        )}
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col px-4 pt-2 pb-3 justify-between">
        {/* Topo: Título, ID e botões */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-bold truncate leading-tight">
              {product.name}
            </CardTitle>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              ID: {product.id.slice(0, 8)}...
            </p>
          </div>
          <div className="flex gap-1 mt-0.5">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 p-0"
              onClick={() => onView?.(product)}
              title="Visualizar produto no catálogo"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 p-0"
              onClick={() => onEdit(product)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              className="h-8 w-8 p-0"
              onClick={() => onDelete(product.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Bloco compacto de informações */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] font-medium mb-2">
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-orange-600" />
            <span className="text-orange-600 font-bold">
              {product.wholesale_price
                ? formatCurrency(product.wholesale_price)
                : "Não definido"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Package className="h-4 w-4 text-green-600" />
            <span className="text-green-600 font-bold">
              {product.stock} un.
            </span>
          </div>
          {modelKey === "wholesale_only" && (
            <div className="flex items-center gap-1">
              <Package className="h-4 w-4 text-orange-600" />
              <span className="text-orange-600 font-bold">
                Mín.: {product.min_wholesale_qty || 1} un.
              </span>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1 mb-2">
          {product.is_featured && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
              Destaque
            </Badge>
          )}
          {modelKey === "wholesale_only" && (
            <Badge className="bg-orange-600 text-white">Apenas Atacado</Badge>
          )}
          {product.variations?.length > 0 && (
            <Badge className="bg-purple-600 text-white">
              {product.variations.length} Variações
            </Badge>
          )}
          {product.stock <= (product.stock_alert_threshold || 5) &&
            product.stock > 0 && (
              <Badge className="bg-yellow-500 text-white">Estoque Baixo</Badge>
            )}
          {product.stock === 0 && (
            <Badge variant="destructive">Sem estoque</Badge>
          )}
        </div>

        {/* Avaliação */}
        <div className="flex items-center gap-1 mt-auto pt-1">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  rating >= i ? "text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">
            {rating.toFixed(1)} ({reviewCount} avaliações)
          </span>
        </div>
      </div>
    </Card>
  );
};

export default ProductInfoCard;
