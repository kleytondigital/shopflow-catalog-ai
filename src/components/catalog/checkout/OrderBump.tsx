import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Clock,
  Users,
  TrendingUp,
  Package,
  Zap,
  ShoppingCart,
  Heart,
  X,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import ProductDetailsModal from "../ProductDetailsModal";
import { createCartItem } from "@/utils/cartHelpers";
import type { Product } from "@/hooks/useProducts";

interface OrderBumpProduct {
  id: string;
  name: string;
  description?: string;
  retail_price: number;
  wholesale_price?: number;
  category?: string;
  order_bump_config?: {
    discount_percentage?: number;
    urgency_text?: string;
    social_proof_text?: string;
    bundle_price?: number;
    is_limited_time?: boolean;
    limited_quantity?: number;
  };
}

interface OrderBumpProps {
  products: OrderBumpProduct[];
  onAddProduct?: (product: OrderBumpProduct) => void; // Tornar opcional
  cartItems: any[];
}

// Componente para exibir imagem do produto
const OrderBumpProductImage: React.FC<{
  productId: string;
  productName: string;
}> = ({ productId, productName }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const { data: productImages } = await supabase
          .from("product_images")
          .select("image_url")
          .eq("product_id", productId)
          .order("is_primary", { ascending: false })
          .order("image_order", { ascending: true })
          .limit(1);

        if (productImages && productImages.length > 0) {
          setImageUrl(productImages[0].image_url);
        }
      } catch (error) {
        console.error("Erro ao carregar imagem:", error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchImage();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <Package className="h-8 w-8 text-gray-400 animate-pulse" />
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <Package className="h-8 w-8 text-gray-400" />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={productName}
      className="w-full h-full object-cover"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.style.display = "none";
      }}
    />
  );
};

const OrderBump: React.FC<OrderBumpProps> = ({
  products,
  onAddProduct,
  cartItems,
}) => {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos
  const [selectedProduct, setSelectedProduct] =
    useState<OrderBumpProduct | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // Timer de urgência
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleProductToggle = async (
    productId: string,
    product: OrderBumpProduct
  ) => {
    // Verificar se o produto já está selecionado
    if (selectedProducts.has(productId)) {
      // Se já está selecionado, remover da seleção
      const newSelected = new Set(selectedProducts);
      newSelected.delete(productId);
      setSelectedProducts(newSelected);

      toast({
        title: "Produto removido",
        description: `${product.name} foi removido da seleção.`,
      });
      return;
    }

    // Buscar dados completos do produto incluindo variações
    try {
      const { data: productData, error } = await supabase
        .from("products")
        .select(
          `
          *,
          variations:product_variations(*)
        `
        )
        .eq("id", productId)
        .single();

      if (error) {
        console.error("Erro ao buscar produto:", error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados do produto.",
          variant: "destructive",
        });
        return;
      }

      // Verificar se tem variações
      const hasVariations =
        productData.variations && productData.variations.length > 0;

      if (hasVariations) {
        // Se tem variações, abrir modal para seleção
        setSelectedProduct({
          ...product,
          variations: productData.variations,
        } as any);
        setShowProductModal(true);
      } else {
        // Se não tem variações, adicionar diretamente ao carrinho
        const discountedPrice =
          product.retail_price *
          (1 - (product.order_bump_config?.discount_percentage || 0) / 100);

        const cartItem = createCartItem(
          {
            id: product.id,
            name: product.name,
            retail_price: discountedPrice, // Usar preço com desconto
            wholesale_price: product.wholesale_price || discountedPrice,
            category: product.category || "",
            image_url: "",
            description: product.description || "",
            is_featured: false,
            is_active: true,
            stock_quantity: 999,
            stock: 999,
            allow_negative_stock: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            store_id: "",
            variations: [],
            // Marcar como order bump para identificação
            isOrderBump: true,
            originalPrice: product.retail_price,
            discountPercentage:
              product.order_bump_config?.discount_percentage || 0,
          } as Product & {
            isOrderBump?: boolean;
            originalPrice?: number;
            discountPercentage?: number;
          },
          "retail",
          1
        );

        // Debug - verificar se está adicionando corretamente
        console.log("OrderBump: Adicionando produto ao carrinho:", {
          cartItem,
          productId,
          productName: product.name,
        });

        addItem(cartItem);

        // Marcar como selecionado
        const newSelected = new Set(selectedProducts);
        newSelected.add(productId);
        setSelectedProducts(newSelected);

        toast({
          title: "Produto adicionado!",
          description: `${product.name} foi adicionado ao carrinho.`,
        });

        // Feedback visual
        const button = document.querySelector(
          `[data-product-id="${productId}"]`
        );
        if (button) {
          button.classList.add("animate-pulse");
          setTimeout(() => {
            button.classList.remove("animate-pulse");
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Erro ao processar produto:", error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar produto ao carrinho.",
        variant: "destructive",
      });
    }
  };

  // Função para lidar com adição via modal
  const handleAddToCartFromModal = (
    product: any,
    quantity: number = 1,
    variation?: any
  ) => {
    try {
      const discountedPrice =
        product.retail_price *
        (1 - (product.order_bump_config?.discount_percentage || 0) / 100);

      const cartItem = createCartItem(
        {
          id: product.id,
          name: product.name,
          retail_price: discountedPrice, // Usar preço com desconto
          wholesale_price: product.wholesale_price || discountedPrice,
          category: product.category || "",
          image_url: "",
          description: product.description || "",
          is_featured: false,
          is_active: true,
          stock_quantity: 999,
          stock: 999,
          allow_negative_stock: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          store_id: "",
          variations: [],
          // Marcar como order bump
          isOrderBump: true,
          originalPrice: product.retail_price,
          discountPercentage:
            product.order_bump_config?.discount_percentage || 0,
        } as Product & {
          isOrderBump?: boolean;
          originalPrice?: number;
          discountPercentage?: number;
        },
        "retail",
        quantity,
        variation
      );

      addItem(cartItem);

      // Marcar como selecionado
      const newSelected = new Set(selectedProducts);
      newSelected.add(product.id);
      setSelectedProducts(newSelected);

      toast({
        title: "Produto adicionado!",
        description: `${quantity}x ${product.name} ${
          variation ? `(${variation.color || ""} ${variation.size || ""})` : ""
        } adicionado ao carrinho.`,
      });

      setShowProductModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar produto ao carrinho.",
        variant: "destructive",
      });
    }
  };

  const getDiscountedPrice = (product: OrderBumpProduct) => {
    const originalPrice = product.retail_price;
    const discount = product.order_bump_config?.discount_percentage || 0;
    return originalPrice * (1 - discount / 100);
  };

  const getSavings = (product: OrderBumpProduct) => {
    return product.retail_price - getDiscountedPrice(product);
  };

  if (!products.length) return null;

  return (
    <div className="space-y-6">
      {/* Header com urgência - Layout responsivo */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 sm:p-6 rounded-lg shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Zap className="h-5 w-5 flex-shrink-0" />
            <span className="font-bold text-lg sm:text-xl leading-tight">
              OFERTA ESPECIAL - ÚLTIMOS MINUTOS!
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-full self-start sm:self-center">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span className="font-mono font-bold text-lg">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        <p className="text-sm sm:text-base mt-3 opacity-90 leading-relaxed">
          Aproveite estas ofertas exclusivas antes de finalizar seu pedido!
        </p>
      </div>

      {/* Grid de produtos em colunas - Layout responsivo otimizado */}
      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-4">
        {products.map((product) => {
          const isSelected = selectedProducts.has(product.id);
          const discountedPrice = getDiscountedPrice(product);
          const savings = getSavings(product);
          const discount = product.order_bump_config?.discount_percentage || 0;

          return (
            <Card
              key={product.id}
              data-product-id={product.id}
              className={`relative transition-all duration-300 cursor-pointer hover:shadow-lg border overflow-hidden ${
                isSelected
                  ? "ring-2 ring-green-500 bg-green-50 border-green-500"
                  : "border-gray-200 hover:border-orange-300"
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleProductToggle(product.id, product);
              }}
            >
              {/* Checkbox no canto superior direito */}
              <div
                className="absolute top-3 right-3 z-10 w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:border-orange-500 transition-colors bg-white shadow-sm"
                onClick={(e) => e.stopPropagation()}
              >
                {isSelected && (
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                )}
              </div>

              {/* Badge de desconto no canto superior esquerdo */}
              {discount > 0 && (
                <div className="absolute top-3 left-3 z-10">
                  <Badge className="bg-red-500 text-white font-bold text-xs animate-pulse shadow-lg">
                    -{discount}% OFF
                  </Badge>
                </div>
              )}

              <CardContent className="p-0">
                {/* Imagem do produto */}
                <div className="relative aspect-square w-full overflow-hidden">
                  <OrderBumpProductImage
                    productId={product.id}
                    productName={product.name}
                  />

                  {/* Overlay com badges na imagem */}
                  <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1 justify-center">
                    {product.order_bump_config?.is_limited_time && (
                      <Badge className="bg-orange-500 text-white font-medium text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Tempo limitado
                      </Badge>
                    )}
                    {product.order_bump_config?.limited_quantity && (
                      <Badge className="bg-red-600 text-white font-medium text-xs">
                        Restam {product.order_bump_config.limited_quantity}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Informações do produto */}
                <div className="p-3">
                  {/* Nome do produto */}
                  <h4 className="font-bold text-xs sm:text-sm mb-2 leading-tight text-center min-h-[2rem] flex items-center justify-center">
                    {product.name}
                  </h4>

                  {/* Social proof - simplificado */}
                  {product.order_bump_config?.social_proof_text && (
                    <div className="flex items-center justify-center gap-1 text-xs text-green-600 mb-2">
                      <Users className="h-3 w-3 flex-shrink-0" />
                      <span className="font-medium text-center text-xs">
                        {product.order_bump_config.social_proof_text}
                      </span>
                    </div>
                  )}

                  {/* Preços - centralizados */}
                  <div className="text-center mb-2">
                    {discount > 0 ? (
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 line-through">
                          De {formatCurrency(product.retail_price)}
                        </div>
                        <div className="text-sm sm:text-base font-bold text-green-600">
                          {formatCurrency(discountedPrice)}
                        </div>
                        <div className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full inline-block">
                          💰 Economize {formatCurrency(savings)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm sm:text-base font-bold text-orange-600">
                        {formatCurrency(product.retail_price)}
                      </div>
                    )}
                  </div>

                  {/* Urgência personalizada */}
                  {product.order_bump_config?.urgency_text && (
                    <div className="mb-2 p-2 bg-gradient-to-r from-orange-100 to-red-100 border border-orange-300 rounded-lg text-center">
                      <div className="flex items-center justify-center gap-1 text-xs font-semibold text-orange-800">
                        <TrendingUp className="h-3 w-3 flex-shrink-0" />
                        {product.order_bump_config.urgency_text}
                      </div>
                    </div>
                  )}

                  {/* Botão de ação */}
                  <Button
                    type="button"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleProductToggle(product.id, product);
                    }}
                    className={`w-full font-bold text-xs px-2 py-2 transition-all duration-300 shadow-lg hover:shadow-xl ${
                      isSelected
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                    }`}
                  >
                    {isSelected ? (
                      <span className="flex items-center justify-center gap-1">
                        <Heart className="h-3 w-3" />
                        Adicionado
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1">
                        <ShoppingCart className="h-3 w-3" />
                        Adicionar
                      </span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer com estatísticas - simplificado */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 p-4 rounded-lg text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-blue-700">
            <Users className="h-4 w-4" />
            <span className="font-bold">+2.847 compraram hoje</span>
          </div>
          <div className="hidden sm:block text-gray-400">•</div>
          <div className="flex items-center gap-2 text-green-700">
            <TrendingUp className="h-4 w-4" />
            <span className="font-bold">96% recomendam</span>
          </div>
          <div className="hidden sm:block text-gray-400">•</div>
          <div className="text-xs font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
            ⚡ Ofertas por tempo limitado
          </div>
        </div>
      </div>

      {/* Modal de seleção de variações */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct as any}
          isOpen={showProductModal}
          onClose={() => {
            setShowProductModal(false);
            setSelectedProduct(null);
          }}
          onAddToCart={handleAddToCartFromModal}
          catalogType="retail"
          showStock={true}
          showPrices={true}
        />
      )}
    </div>
  );
};

export default OrderBump;
