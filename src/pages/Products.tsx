
import React, { useState } from 'react';
import { Plus, Search, Filter, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/hooks/useAuth';
import ProductFormAdvanced from '@/components/products/ProductFormAdvanced';
import ProductList from '@/components/products/ProductList';

const Products = () => {
  const { profile } = useAuth();
  const { products, loading } = useProducts(profile?.store_id || '');
  const [showProductForm, setShowProductForm] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const mockProducts = [
    {
      id: '1',
      name: 'Camiseta Básica',
      category: 'Roupas',
      price: 29.90,
      stock: 15,
      status: 'active' as const,
      image: '/placeholder.svg',
      wholesalePrice: 22.50
    },
    {
      id: '2',
      name: 'Tênis Esportivo',
      category: 'Calçados',
      price: 149.90,
      stock: 3,
      status: 'active' as const,
      image: '/placeholder.svg',
      wholesalePrice: 120.00
    }
  ];

  const handleEditProduct = (product: any) => {
    console.log('Editar produto:', product);
  };

  const handleDeleteProduct = (id: string) => {
    console.log('Deletar produto:', id);
  };

  const handleGenerateDescription = (id: string) => {
    console.log('Gerar descrição para produto:', id);
  };

  return (
    <div className="space-y-8 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Produtos</h1>
          <p className="text-gray-600 mt-2">Gerencie seu catálogo de produtos</p>
        </div>
        <Button onClick={() => setShowProductForm(true)} className="btn-primary">
          <Plus className="mr-2 h-5 w-5" />
          Novo Produto
        </Button>
      </div>

      {/* Filtros e Busca */}
      <Card className="card-modern">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white"
            >
              <option value="">Todas as categorias</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="stat-card stat-card-blue">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <div className="w-2 h-12 bg-blue-500 rounded"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card stat-card-green">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ativos</p>
                <p className="text-2xl font-bold">{products.filter(p => p.is_active).length}</p>
              </div>
              <div className="w-2 h-12 bg-green-500 rounded"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card stat-card-orange">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Estoque Baixo</p>
                <p className="text-2xl font-bold">{products.filter(p => p.stock <= 5).length}</p>
              </div>
              <div className="w-2 h-12 bg-orange-500 rounded"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card stat-card-purple">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categorias</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
              <div className="w-2 h-12 bg-purple-500 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista/Grid de Produtos */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="loading-spinner"></div>
          <span className="ml-2">Carregando produtos...</span>
        </div>
      ) : viewMode === 'list' ? (
        <ProductList
          products={mockProducts}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          onGenerateDescription={handleGenerateDescription}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="card-modern group cursor-pointer">
              <CardContent className="p-0">
                <div className="aspect-square bg-gray-100 rounded-t-2xl flex items-center justify-center">
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                    <Badge variant={product.is_active ? "default" : "secondary"} className="ml-2">
                      {product.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-2">{product.category}</p>
                  
                  <div className="space-y-1">
                    <p className="font-semibold">R$ {product.retail_price.toFixed(2)}</p>
                    {product.wholesale_price && (
                      <p className="text-sm text-gray-600">
                        Atacado: R$ {product.wholesale_price.toFixed(2)}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <span className={`text-sm ${product.stock <= 5 ? 'text-red-600' : 'text-gray-600'}`}>
                      Estoque: {product.stock}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory 
                  ? "Tente ajustar os filtros de busca" 
                  : "Comece adicionando seu primeiro produto"
                }
              </p>
              {!searchTerm && !selectedCategory && (
                <Button onClick={() => setShowProductForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Produto
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Dialog para criar/editar produto */}
      <Dialog open={showProductForm} onOpenChange={setShowProductForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Produto</DialogTitle>
          </DialogHeader>
          <ProductFormAdvanced 
            onSubmit={(data, variations, images) => {
              console.log('Criar produto:', { data, variations, images });
              setShowProductForm(false);
            }} 
            onCancel={() => setShowProductForm(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
