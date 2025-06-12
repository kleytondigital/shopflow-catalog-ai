
import React, { useState } from 'react';
import { Package, ShoppingCart, Users, DollarSign, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProducts, CreateProductData } from '@/hooks/useProducts';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ProductForm from '@/components/products/ProductForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const StoreDashboard = () => {
  const { profile } = useAuth();
  const { products, loading, createProduct } = useProducts(profile?.store_id || '');
  const [showProductForm, setShowProductForm] = useState(false);
  const { toast } = useToast();

  const handleCreateProduct = async (productData: CreateProductData) => {
    if (!profile?.store_id) {
      toast({
        title: "Erro",
        description: "Loja não identificada",
        variant: "destructive",
      });
      return;
    }

    const dataWithStore: CreateProductData = {
      ...productData,
      store_id: profile.store_id
    };

    const { error } = await createProduct(dataWithStore);
    
    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar produto",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Produto criado com sucesso",
      });
      setShowProductForm(false);
    }
  };

  const totalProducts = products.length;
  const activeProducts = products.filter(product => product.is_active).length;
  const lowStockProducts = products.filter(product => product.stock <= 5).length;
  const totalValue = products.reduce((sum, product) => sum + (product.retail_price * product.stock), 0);

  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {activeProducts} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor do Estoque</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Valor total do inventário
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <Package className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              Produtos com ≤ 5 unidades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Hoje</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Nenhum pedido ainda
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowProductForm(true)}>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <Plus className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Adicionar Produto</h3>
              <p className="text-sm text-muted-foreground">Cadastre um novo produto</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <Settings className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Configurar Catálogos</h3>
              <p className="text-sm text-muted-foreground">Gerencie varejo e atacado</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Ver Pedidos</h3>
              <p className="text-sm text-muted-foreground">Acompanhe seus pedidos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Produtos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Produtos Recentes</CardTitle>
          <Button variant="outline" onClick={() => setShowProductForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Carregando produtos...</div>
          ) : (
            <div className="space-y-4">
              {products.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{product.name}</h3>
                        <Badge variant={product.is_active ? "default" : "secondary"}>
                          {product.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                        {product.stock <= 5 && (
                          <Badge variant="destructive">Estoque Baixo</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {product.category || "Sem categoria"} • {product.stock} unidades
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">R$ {product.retail_price.toFixed(2)}</p>
                    {product.wholesale_price && (
                      <p className="text-sm text-muted-foreground">
                        Atacado: R$ {product.wholesale_price.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum produto cadastrado ainda.
                  <br />
                  <Button className="mt-2" onClick={() => setShowProductForm(true)}>
                    Cadastrar Primeiro Produto
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para criar novo produto */}
      <Dialog open={showProductForm} onOpenChange={setShowProductForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Produto</DialogTitle>
          </DialogHeader>
          <ProductForm onSubmit={handleCreateProduct} onCancel={() => setShowProductForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoreDashboard;
