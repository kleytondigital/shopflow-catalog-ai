import { Product } from "@/hooks/useProducts";
import { CatalogType } from "@/hooks/useCatalog";
import { CartItem } from "@/hooks/useCart";
import { ProductVariation } from "@/types/variation";

export const createCartItem = (
  product: Product,
  catalogType: CatalogType,
  quantity: number = 1,
  variation?: ProductVariation
): CartItem => {
  console.log("🛒 CART HELPER - Criando item do carrinho:", {
    productId: product.id,
    productName: product.name,
    catalogType,
    quantity,
    variation: variation
      ? {
          id: variation.id,
          color: variation.color,
          size: variation.size,
          stock: variation.stock,
          price_adjustment: variation.price_adjustment,
        }
      : null,
  });

  // Para wholesale_only, sempre usar wholesale_price se disponível
  // Para outros casos, usar retail_price inicialmente (será recalculado no hook)
  const basePrice =
    catalogType === "wholesale"
      ? product.wholesale_price || product.retail_price || 0
      : product.retail_price;

  // Calcular preço final considerando ajuste da variação
  const finalPrice = variation
    ? basePrice + (variation.price_adjustment || 0)
    : basePrice;

  // Calcular quantidade mínima
  const minQuantity =
    catalogType === "wholesale" && product.min_wholesale_qty
      ? product.min_wholesale_qty
      : 1;
  const finalQuantity = Math.max(minQuantity, Math.floor(quantity));

  console.log("💰 CART HELPER - Cálculo de preço:", {
    basePrice,
    variationAdjustment: variation?.price_adjustment || 0,
    finalPrice,
    catalogType,
    quantidadeOriginal: quantity,
    quantidadeMinima: minQuantity,
    quantidadeFinal: finalQuantity,
  });

  // Criar ID único considerando variação
  const itemId = variation
    ? `${product.id}-${catalogType}-${
        variation.id ||
        `${variation.color || "nocolor"}-${variation.size || "nosize"}`
      }`
    : `${product.id}-${catalogType}`;

  const cartItem: CartItem = {
    id: itemId,
    product: {
      id: product.id,
      name: product.name,
      retail_price: product.retail_price,
      wholesale_price: product.wholesale_price,
      min_wholesale_qty: product.min_wholesale_qty,
      image_url: product.image_url,
      store_id: product.store_id,
      stock: product.stock || 0,
      allow_negative_stock: product.allow_negative_stock || false,
    },
    quantity: finalQuantity,
    price: finalPrice,
    originalPrice:
      catalogType === "wholesale"
        ? product.wholesale_price || product.retail_price || 0
        : product.retail_price,
    variation: variation
      ? {
          id: variation.id,
          product_id: variation.product_id,
          color: variation.color,
          size: variation.size,
          sku: variation.sku,
          stock: variation.stock,
          price_adjustment: variation.price_adjustment || 0,
          is_active: variation.is_active,
          image_url: variation.image_url,
          created_at: variation.created_at,
          updated_at: variation.updated_at,
        }
      : undefined,
    catalogType,
  };

  console.log("✅ CART HELPER - Item criado:", {
    id: cartItem.id,
    productName: cartItem.product.name,
    quantity: cartItem.quantity,
    price: cartItem.price,
    hasVariation: !!cartItem.variation,
    variationDetails: cartItem.variation
      ? {
          color: cartItem.variation.color,
          size: cartItem.variation.size,
          priceAdjustment: cartItem.variation.price_adjustment,
        }
      : null,
  });

  return cartItem;
};
