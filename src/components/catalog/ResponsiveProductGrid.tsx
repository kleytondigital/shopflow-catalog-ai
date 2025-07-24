import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from 'sonner'
import { useShoppingCart } from '@/hooks/use-shopping-cart';
import { Skeleton } from "@/components/ui/skeleton"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from '@/lib/utils';

interface ResponsiveProductGridProps {
  products: Product[];
  isLoading?: boolean;
  mode?: 'grid' | 'carousel';
  onProductClick?: (product: Product) => void;
  catalogSettings?: any;
}

const ResponsiveProductGrid: React.FC<ResponsiveProductGridProps> = ({
  products,
  isLoading,
  mode = 'grid',
  onProductClick,
  catalogSettings,
}) => {
  const { addItem: addToCart } = useShoppingCart();
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768); // Define a largura para considerar como tela pequena (ex: 768px)
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const renderProductCard = (product: Product) => (
    <Card key={product.id} className="group/product relative transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
        <CardDescription>{product.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <AspectRatio ratio={16 / 9}>
          <img
            src={product.image_url}
            alt={product.name}
            className="object-cover rounded-md"
            onClick={() => onProductClick?.(product)}
            style={{ cursor: 'pointer' }}
          />
        </AspectRatio>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex flex-col space-y-1">
          <span className="text-sm font-medium">R$ {product.retail_price}</span>
          {product.stock <= 5 && product.stock > 0 && (
            <Badge variant="secondary">
              Apenas {product.stock} restantes
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge variant="destructive">
              Sem estoque
            </Badge>
          )}
        </div>
        <Button size="sm" onClick={() => handleAddToCart(product)}>
          Adicionar
        </Button>
      </CardFooter>
    </Card>
  );

  const handleAddToCart = (product: Product, selectedVariation?: any) => {
    console.log('📦 GRID - Adicionando ao carrinho:', product, selectedVariation);
    
    // Transform the product to match the expected structure
    const productForCart = {
      id: product.id,
      name: product.name,
      retail_price: product.retail_price,
      wholesale_price: product.wholesale_price,
      min_wholesale_qty: product.min_wholesale_qty,
      image_url: product.image_url,
      store_id: product.store_id,
      stock: product.stock,
      allow_negative_stock: product.allow_negative_stock,
    };

    addToCart(productForCart, 1, selectedVariation);
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="group/product relative transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle><Skeleton className="h-4 w-[80%]" /></CardTitle>
              <CardDescription><Skeleton className="h-4 w-[60%]" /></CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <AspectRatio ratio={16 / 9}>
                <Skeleton className="w-full h-full rounded-md" />
              </AspectRatio>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <Skeleton className="h-4 w-[50%]" />
              </div>
              <Skeleton className="h-8 w-20" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (mode === 'carousel') {
    return (
      <Carousel className="w-full max-w-5xl">
        <CarouselContent className="-ml-1 pl-1">
          {products.map((product) => (
            <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                {renderProductCard(product)}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => renderProductCard(product))}
    </div>
  );
};

export default ResponsiveProductGrid;
