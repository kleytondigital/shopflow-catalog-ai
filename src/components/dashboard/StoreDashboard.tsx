
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, Users, DollarSign, Plus, Settings, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProducts, CreateProductData } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ProductFormModal from '@/components/products/ProductFormModal';
import DashboardCard from './DashboardCard';
import NavigationPanel from './NavigationPanel';
import QuickSearch from './QuickSearch';
import ProductFilters from './ProductFilters';
import QuickActions from './QuickActions';

const StoreDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { products, loading: productsLoading, createProduct } = useProducts(profile?.store_id || '');
  const { orders, loading: ordersLoading } = useOrders();
  const [showProductForm, setShowProductForm] = useState(false);
  const [productFilters, setProductFilters] = useState<any>({});
  const { toast } = useToast();

  // Obter categorias únicas dos produtos
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(
      products
        .filter(product => product.category)
        .map(product => product.category!)
    ));
    return uniqueCategories.sort();
  }, [products]);

  // Aplicar filtros aos produtos
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Filtro por categoria
      if (productFilters.category && product.category !== productFilters.category) {
        return false;
      }

      // Filtro por preço mínimo
      if (productFilters.minPrice && product.retail_price < productFilters.minPrice) {
        return false;
      }

      // Filtro por preço máximo
      if (productFilters.maxPrice && product.retail_price > productFilters.maxPrice) {
        return false;
      }

      // Filtro por estoque
      if (productFilters.inStock && product.stock <= 0) {
        return false;
      }

      // Filtro por ativo/inativo
      if (productFilters.isActive === false && product.is_active) {
        return false;
      }

      return true;
    });
  }, [products, productFilters]);

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

  const handleProductSelect = (productId: string) => {
    navigate(`/products?highlight=${productId}`);
  };

  const handleOrderSelect = (orderId: string) => {
    navigate(`/orders?highlight=${orderId}`);
  };

  const clearFilters = () => {
    setProductFilters({});
  };

  const totalProducts = products.length;
  const activeProducts = products.filter(product => product.is_active).length;
  const lowStockProducts = products.filter(product => product.stock <= 5).length;
  const totalValue = products.reduce((sum, product) => sum + (product.retail_price * product.stock), 0);
  
  // Calcular estatísticas de pedidos
  const todayOrders = orders.filter(order => {
    const today = new Date();
    const orderDate = new Date(order.created_at);
    return orderDate.toDateString() === today.toDateString();
  }).length;

  const pendingOrders = orders.filter(order => order.status === 'pending').length;

  return (
    <div className="space-y-8 animate-fadeInUp">
      {/* Header com Busca */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Dashboard da Loja</h1>
          <p className="text-gray-600 mt-2">Gerencie seus produtos e vendas</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
          <QuickSearch
            onProductSelect={handleProductSelect}
            onOrderSelect={handleOrderSelect}
          />
          <Button onClick={() => setShowProductForm(true)} className="btn-primary">
            <Plus className="mr-2 h-5 w-5" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Ações Rápidas */}
      <QuickActions onNewProduct={() => setShowProductForm(true)} />

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total de Produtos"
          value={totalProducts}
          subtitle={`${activeProducts} ativos`}
          icon={Package}
          variant="primary"
          trend={{ value: 15.3, isPositive: true }}
        />

        <DashboardCard
          title="Valor do Estoque"
          value={`R$ ${totalValue.toFixed(2)}`}
          subtitle="Inventário total"
          icon={DollarSign}
          variant="success"
          trend={{ value: 8.7, isPositive: true }}
        />

        <DashboardCard
          title="Estoque Baixo"
          value={lowStockProducts}
          subtitle="Produtos com ≤ 5 unidades"
          icon={AlertTriangle}
          variant="warning"
          trend={{ value: -12.1, isPositive: false }}
        />

        <DashboardCard
          title="Pedidos Hoje"
          value={todayOrders}
          subtitle={`${pendingOrders} pendentes`}
          icon={ShoppingCart}
          variant="secondary"
          trend={{ value: todayOrders > 0 ? 100 : 0, isPositive: todayOrders > 0 }}
          onClick={() => navigate('/orders')}
        />
      </div>

      {/* Painel de Navegação */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Acesso Rápido</h2>
        <NavigationPanel />
      </div>

      {/* Filtros de Produtos */}
      <ProductFilters
        categories={categories}
        filters={productFilters}
        onFiltersChange={setProductFilters}
        onClearFilters={clearFilters}
      />

      {/* Produtos e Pedidos Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Produtos Recentes */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Produtos Recentes
              {Object.keys(productFilters).length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filteredProducts.length} de {products.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="loading-spinner"></div>
                <span className="ml-2">Carregando produtos...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                       onClick={() => handleProductSelect(product.id)}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm">{product.name}</h3>
                          <Badge variant={product.is_active ? "default" : "secondary"} className="text-xs">
                            {product.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                          {product.stock <= 5 && (
                            <Badge variant="destructive" className="text-xs">Estoque Baixo</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {product.category || "Sem categoria"} • {product.stock} unidades
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">R$ {product.retail_price.toFixed(2)}</p>
                      {product.wholesale_price && (
                        <p className="text-xs text-muted-foreground">
                          Atacado: R$ {product.wholesale_price.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {filteredProducts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="mb-2">
                      {Object.keys(productFilters).length > 0 
                        ? 'Nenhum produto encontrado com os filtros aplicados'
                        : 'Nenhum produto cadastrado ainda'
                      }
                    </p>
                    {Object.keys(productFilters).length > 0 ? (
                      <Button onClick={clearFilters} variant="outline">
                        Limpar Filtros
                      </Button>
                    ) : (
                      <Button onClick={() => setShowProductForm(true)} variant="outline">
                        Cadastrar Primeiro Produto
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pedidos Recentes */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-green-600" />
              Pedidos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="loading-spinner"></div>
                <span className="ml-2">Carregando pedidos...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                       onClick={() => handleOrderSelect(order.id)}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-600 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm">{order.customer_name}</h3>
                          <Badge 
                            variant={order.status === 'pending' ? "secondary" : order.status === 'delivered' ? "default" : "outline"} 
                            className="text-xs"
                          >
                            {order.status === 'pending' ? 'Pendente' : 
                             order.status === 'confirmed' ? 'Confirmado' :
                             order.status === 'delivered' ? 'Entregue' : order.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {order.items?.length || 0} item(s) • #{order.id.slice(-8)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">R$ {order.total_amount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="mb-2">Nenhum pedido recebido ainda</p>
                    <Button onClick={() => navigate('/orders')} variant="outline">
                      Ver Todos os Pedidos
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal para criar novo produto */}
      <ProductFormModal
        open={showProductForm}
        onOpenChange={setShowProductForm}
        onSubmit={handleCreateProduct}
        mode="create"
      />
    </div>
  );
};

export default StoreDashboard;
