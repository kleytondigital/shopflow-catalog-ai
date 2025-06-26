
import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShoppingCart, Heart, Package, Minus, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { Product } from '@/types/product';
import { ProductVariation } from '@/types/variation';
import ProductImageGallery from '@/components/products/ProductImageGallery';
import ProductVariationSelector from '@/components/catalog/ProductVariationSelector';
import { useProductVariations } from '@/hooks/useProductVariations';
import { useToast } from '@/hooks/use-toast';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product, quantity: number, variation?: ProductVariation) => void;
  onAddToWishlist?: (product: Product) => void;
  catalogType?: 'retail' | 'wholesale';
  isInWishlist?: boolean;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onAddToWishlist,
  catalogType = 'retail',
  isInWishlist = false
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);
  const [showVariationError, setShowVariationError] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantityChangeKey, setQuantityChangeKey] = useState(0);
  const { toast } = useToast();

  // Hook para carregar variações do produto
  const { variations, loading: variationsLoading } = useProductVariations(product?.id);

  console.log('🎨 MODAL - Estado atual:', {
    productId: product?.id,
    productName: product?.name,
    isOpen,
    quantity,
    selectedVariation: selectedVariation ? {
      id: selectedVariation.id,
      color: selectedVariation.color,
      size: selectedVariation.size,
      stock: selectedVariation.stock
    } : null,
    variationsCount: variations?.length || 0,
    onAddToCartAvailable: !!onAddToCart,
    quantityChangeKey
  });

  // Reset quando produto muda
  useEffect(() => {
    if (product && isOpen) {
      console.log('🔄 MODAL - Reset para produto:', product.name);
      setQuantity(1);
      setSelectedVariation(null);
      setShowVariationError(false);
      setIsAddingToCart(false);
      setQuantityChangeKey(prev => prev + 1);
    }
  }, [product?.id, isOpen]);

  // Reset variação selecionada quando variações carregam
  useEffect(() => {
    if (variations && variations.length > 0 && !selectedVariation) {
      setSelectedVariation(null);
      console.log('🎯 MODAL - Variações carregadas:', variations.length);
    } else if (variations && variations.length === 0) {
      setSelectedVariation(null);
    }
  }, [variations, selectedVariation]);

  if (!product) {
    console.log('❌ MODAL - Produto não fornecido');
    return null;
  }

  const hasVariations = variations && variations.length > 0;
  const requiresVariationSelection = hasVariations;

  // Calcular preço baseado na variação selecionada
  const basePrice = catalogType === 'wholesale' && product.wholesale_price 
    ? product.wholesale_price 
    : product.retail_price;
  
  const finalPrice = selectedVariation 
    ? basePrice + (selectedVariation.price_adjustment || 0)
    : basePrice;

  // Calcular estoque disponível
  const availableStock = selectedVariation 
    ? selectedVariation.stock 
    : product.stock;

  const isWholesale = catalogType === 'wholesale';
  const minQty = isWholesale ? (product.min_wholesale_qty || 1) : 1;
  const maxQty = Math.min(availableStock, 999); // Limite máximo de 999 unidades

  console.log('📊 MODAL - Cálculos:', {
    basePrice,
    finalPrice,
    availableStock,
    minQty,
    maxQty,
    currentQuantity: quantity,
    hasVariations,
    requiresVariationSelection
  });

  // Função melhorada para mudança de quantidade
  const handleQuantityChange = useCallback((newQuantity: number) => {
    console.log('🔢 MODAL - Tentando alterar quantidade:', {
      from: quantity,
      to: newQuantity,
      minQty,
      maxQty,
      availableStock
    });

    // Validar limites
    let validQuantity = newQuantity;
    
    if (validQuantity < minQty) {
      validQuantity = minQty;
      console.log('⚠️ MODAL - Quantidade ajustada para mínimo:', validQuantity);
    }
    
    if (validQuantity > maxQty) {
      validQuantity = maxQty;
      console.log('⚠️ MODAL - Quantidade ajustada para máximo:', validQuantity);
    }

    // Atualizar estado apenas se houve mudança
    if (validQuantity !== quantity) {
      setQuantity(validQuantity);
      setQuantityChangeKey(prev => prev + 1);
      
      // Feedback visual
      toast({
        title: "Quantidade atualizada",
        description: `Quantidade alterada para ${validQuantity} unidade${validQuantity > 1 ? 's' : ''}`,
        duration: 1500,
      });

      console.log('✅ MODAL - Quantidade atualizada:', {
        old: quantity,
        new: validQuantity,
        key: quantityChangeKey + 1
      });
    } else {
      console.log('🔄 MODAL - Quantidade já é a mesma, não alterando');
    }
  }, [quantity, minQty, maxQty, availableStock, quantityChangeKey, toast]);

  const handleVariationChange = useCallback((variation: ProductVariation | null) => {
    console.log('🎯 MODAL - Variação selecionada:', variation);
    setSelectedVariation(variation);
    setShowVariationError(false);
    
    // Ajustar quantidade se exceder o estoque da variação
    if (variation && quantity > variation.stock) {
      const newQuantity = Math.max(minQty, Math.min(variation.stock, quantity));
      handleQuantityChange(newQuantity);
      console.log('📦 MODAL - Quantidade ajustada para estoque da variação:', newQuantity);
    }
  }, [quantity, minQty, handleQuantityChange]);

  const handleAddToCart = useCallback(async () => {
    console.log('🛒 MODAL - Iniciando adição ao carrinho:', {
      hasVariations,
      requiresVariationSelection,
      selectedVariation: selectedVariation ? {
        id: selectedVariation.id,
        color: selectedVariation.color,
        size: selectedVariation.size,
        stock: selectedVariation.stock,
        price_adjustment: selectedVariation.price_adjustment
      } : null,
      quantity,
      onAddToCartAvailable: !!onAddToCart
    });

    // Validar seleção de variação obrigatória
    if (requiresVariationSelection && !selectedVariation) {
      console.log('❌ MODAL - Variação obrigatória não selecionada');
      setShowVariationError(true);
      toast({
        title: "Seleção obrigatória",
        description: "Por favor, selecione uma opção antes de adicionar ao carrinho.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // Validar estoque disponível
    if (quantity > availableStock) {
      console.log('❌ MODAL - Quantidade excede estoque disponível');
      toast({
        title: "Estoque insuficiente",
        description: `Apenas ${availableStock} unidade${availableStock > 1 ? 's' : ''} disponível${availableStock > 1 ? 'eis' : ''}.`,
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (!onAddToCart) {
      console.log('❌ MODAL - onAddToCart não fornecido');
      toast({
        title: "Erro",
        description: "Função de adicionar ao carrinho não disponível.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    try {
      setIsAddingToCart(true);

      console.log('✅ MODAL - Adicionando ao carrinho:', {
        product: product.name,
        quantity,
        variation: selectedVariation ? {
          id: selectedVariation.id,
          color: selectedVariation.color,
          size: selectedVariation.size,
          price_adjustment: selectedVariation.price_adjustment,
          stock: selectedVariation.stock
        } : null,
        finalPrice
      });
      
      await onAddToCart(product, quantity, selectedVariation || undefined);
      
      toast({
        title: "Produto adicionado!",
        description: `${product.name} foi adicionado ao carrinho com sucesso.`,
        duration: 2000,
      });
      
      onClose();
      
    } catch (error) {
      console.error('💥 MODAL - Erro ao adicionar ao carrinho:', error);
      toast({
        title: "Erro ao adicionar",
        description: "Ocorreu um erro ao adicionar o produto ao carrinho. Tente novamente.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsAddingToCart(false);
    }
  }, [
    requiresVariationSelection,
    selectedVariation,
    quantity,
    availableStock,
    onAddToCart,
    product,
    finalPrice,
    onClose,
    toast
  ]);

  const handleAddToWishlist = useCallback(() => {
    if (onAddToWishlist) {
      onAddToWishlist(product);
      toast({
        title: isInWishlist ? "Removido da lista" : "Adicionado à lista",
        description: `${product.name} foi ${isInWishlist ? 'removido da' : 'adicionado à'} lista de desejos.`,
        duration: 2000,
      });
    }
  }, [onAddToWishlist, product, isInWishlist, toast]);

  const isOutOfStock = availableStock === 0;
  const canAddToCart = !isOutOfStock && (!requiresVariationSelection || selectedVariation) && !isAddingToCart;

  // Verificar se os botões de quantidade devem estar habilitados
  const canDecreaseQuantity = quantity > minQty && !isAddingToCart;
  const canIncreaseQuantity = quantity < maxQty && !isAddingToCart;

  console.log('🎯 MODAL - Estado dos botões:', {
    isOutOfStock,
    requiresVariationSelection,
    hasSelectedVariation: !!selectedVariation,
    canAddToCart,
    canDecreaseQuantity,
    canIncreaseQuantity,
    isAddingToCart
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
          {/* Galeria de Imagens */}
          <div>
            <ProductImageGallery 
              productId={product.id} 
              productName={product.name}
              selectedVariationImage={selectedVariation?.image_url}
            />
          </div>

          {/* Informações do Produto */}
          <div className="space-y-6">
            {/* Cabeçalho */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {product.name}
              </h2>
              {product.category && (
                <Badge variant="secondary" className="mb-4">
                  {product.category}
                </Badge>
              )}
            </div>

            {/* Preço */}
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">
                R$ {finalPrice.toFixed(2).replace('.', ',')}
              </div>
              {selectedVariation && selectedVariation.price_adjustment !== 0 && (
                <div className="text-sm text-gray-500">
                  Preço base: R$ {basePrice.toFixed(2).replace('.', ',')}
                  {selectedVariation.price_adjustment > 0 ? ' + ' : ' - '}
                  R$ {Math.abs(selectedVariation.price_adjustment).toFixed(2).replace('.', ',')}
                </div>
              )}
              {isWholesale && product.retail_price !== basePrice && (
                <div className="text-sm text-gray-500">
                  Varejo: R$ {product.retail_price.toFixed(2).replace('.', ',')}
                </div>
              )}
              {isWholesale && minQty > 1 && (
                <div className="text-sm text-orange-600">
                  Quantidade mínima: {minQty} unidades
                </div>
              )}
            </div>

            {/* Estoque */}
            <div className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4" />
              {availableStock > 0 ? (
                <span className="text-green-600">
                  {availableStock} em estoque
                  {selectedVariation && (
                    <span className="text-gray-500 ml-1">
                      (desta variação)
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-red-600">Fora de estoque</span>
              )}
            </div>

            {/* Seleção de Variações */}
            {hasVariations && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-3">Selecione as opções:</h3>
                  <ProductVariationSelector
                    variations={variations}
                    selectedVariation={selectedVariation}
                    onVariationChange={handleVariationChange}
                    loading={variationsLoading}
                  />
                </div>
                
                {/* Erro de variação obrigatória */}
                {showVariationError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Por favor, selecione uma opção antes de adicionar ao carrinho.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Descrição */}
            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">Descrição</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Controles de Quantidade */}
            {!isOutOfStock && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Quantidade
                  </label>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={!canDecreaseQuantity}
                      className="h-10 w-10 p-0"
                    >
                      {isAddingToCart ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Minus className="h-4 w-4" />
                      )}
                    </Button>
                    <div className="w-20 text-center">
                      <span className="text-lg font-medium border-2 border-gray-200 rounded px-3 py-2 bg-white inline-block min-w-[60px]">
                        {quantity}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={!canIncreaseQuantity}
                      className="h-10 w-10 p-0"
                    >
                      {isAddingToCart ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 space-y-1">
                    {minQty > 1 && (
                      <p>Mínimo: {minQty} unidades</p>
                    )}
                    <p>Máximo: {maxQty} unidades</p>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="space-y-3">
                  <Button 
                    onClick={handleAddToCart}
                    className="w-full"
                    size="lg"
                    disabled={!canAddToCart}
                  >
                    {isAddingToCart ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Adicionando...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Adicionar ao Carrinho
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleAddToWishlist}
                    className="w-full"
                    size="lg"
                    disabled={isAddingToCart}
                  >
                    <Heart className={`h-5 w-5 mr-2 ${isInWishlist ? 'fill-current' : ''}`} />
                    {isInWishlist ? 'Remover da Lista' : 'Adicionar à Lista de Desejos'}
                  </Button>
                </div>
              </div>
            )}

            {/* Produto Fora de Estoque */}
            {isOutOfStock && (
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-600 mb-3">
                  {selectedVariation 
                    ? 'Esta variação está temporariamente fora de estoque'
                    : 'Este produto está temporariamente fora de estoque'
                  }
                </p>
                <Button
                  variant="outline"
                  onClick={handleAddToWishlist}
                  className="w-full"
                  disabled={isAddingToCart}
                >
                  <Heart className={`h-5 w-5 mr-2 ${isInWishlist ? 'fill-current' : ''}`} />
                  Adicionar à Lista de Desejos
                </Button>
              </div>
            )}

            {/* Debug Info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                <strong>🐛 DEBUG MODAL:</strong>
                <div>Produto: {product.name}</div>
                <div>Modal aberto: {isOpen ? 'Sim' : 'Não'}</div>
                <div>Variações carregadas: {variations?.length || 0}</div>
                <div>Variação selecionada: {selectedVariation ? `${selectedVariation.color || 'S/C'} ${selectedVariation.size || 'S/T'}` : 'Nenhuma'}</div>
                <div>Requer seleção: {requiresVariationSelection ? 'Sim' : 'Não'}</div>
                <div>Pode adicionar: {canAddToCart ? 'Sim' : 'Não'}</div>
                <div>Estoque disponível: {availableStock}</div>
                <div>Quantidade atual: {quantity}</div>
                <div>Preço final: R$ {finalPrice.toFixed(2)}</div>
                <div>onAddToCart disponível: {onAddToCart ? 'Sim' : 'Não'}</div>
                <div>Quantidade key: {quantityChangeKey}</div>
                <div>Adicionando ao carrinho: {isAddingToCart ? 'Sim' : 'Não'}</div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsModal;
