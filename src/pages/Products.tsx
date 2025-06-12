import React, { useState } from 'react';
import { Plus, Search, Filter, Grid, List, Box, Edit, Trash2, Sparkles } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  wholesalePrice?: number;
  stock: number;
  status: 'active' | 'inactive';
  image?: string;
}

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock data for products
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Camiseta Premium Algodão',
      category: 'Roupas',
      price: 49.90,
      wholesalePrice: 35.00,
      stock: 25,
      status: 'active',
      image: '/placeholder.svg'
    },
    {
      id: '2',
      name: 'Tênis Esportivo Confort',
      category: 'Calçados',
      price: 189.90,
      wholesalePrice: 140.00,
      stock: 12,
      status: 'active',
      image: '/placeholder.svg'
    },
    {
      id: '3',
      name: 'Mochila Executiva',
      category: 'Acessórios',
      price: 89.90,
      stock: 3,
      status: 'inactive',
      image: '/placeholder.svg'
    }
  ];

  const onEdit = (product: Product) => {
    alert(`Editar produto ${product.name}`);
  };

  const onDelete = (id: string) => {
    alert(`Deletar produto com ID ${id}`);
  };

  const onGenerateDescription = (id: string) => {
    alert(`Gerar descrição para produto com ID ${id}`);
  };

  const filteredProducts = mockProducts.filter(product => {
    const searchRegex = new RegExp(searchTerm, 'i');
    const categoryMatch = filterCategory ? product.category === filterCategory : true;
    const statusMatch = filterStatus ? product.status === filterStatus : true;

    return searchRegex.test(product.name) && categoryMatch && statusMatch;
  });

  const renderProductCard = (product: any) => (
    <div key={product.id} className="card-modern hover:scale-105 transition-all duration-300">
      <div className="relative">
        <img 
          src={product.image || '/placeholder.svg'} 
          alt={product.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            product.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {product.status === 'active' ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
        <p className="text-muted-foreground text-sm mb-3">{product.category}</p>
        
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-xl font-bold text-primary">R$ {product.price.toFixed(2)}</p>
            {product.wholesalePrice && (
              <p className="text-sm text-orange-600">Atacado: R$ {product.wholesalePrice.toFixed(2)}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Estoque</p>
            <p className={`font-semibold ${product.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
              {product.stock}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => onEdit(product)}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Edit size={16} />
            Editar
          </button>
          <button 
            onClick={() => onGenerateDescription(product.id)}
            className="flex items-center justify-center gap-2 bg-purple-500 text-white px-3 py-2 rounded-lg hover:bg-purple-600 transition-colors"
          >
            <Sparkles size={16} />
          </button>
          <button 
            onClick={() => onDelete(product.id)}
            className="flex items-center justify-center gap-2 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderProductRow = (product: any) => (
    <tr key={product.id} className="border-b hover:bg-gray-50">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <img 
            src={product.image || '/placeholder.svg'} 
            alt={product.name}
            className="w-12 h-12 object-cover rounded-lg"
          />
          <div>
            <p className="font-semibold">{product.name}</p>
            <p className="text-sm text-muted-foreground">{product.category}</p>
          </div>
        </div>
      </td>
      <td className="p-4">
        <p className="font-semibold">R$ {product.price.toFixed(2)}</p>
        {product.wholesalePrice && (
          <p className="text-sm text-orange-600">R$ {product.wholesalePrice.toFixed(2)}</p>
        )}
      </td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          product.stock < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {product.stock} unidades
        </span>
      </td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          product.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {product.status === 'active' ? 'Ativo' : 'Inativo'}
        </span>
      </td>
      <td className="p-4">
        <div className="flex gap-2">
          <button 
            onClick={() => onEdit(product)}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => onGenerateDescription(product.id)}
            className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <Sparkles size={16} />
          </button>
          <button 
            onClick={() => onDelete(product.id)}
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Produtos</h1>
              <p className="text-muted-foreground">Gerencie o catálogo da sua loja</p>
            </div>
            <button className="btn-primary gap-2">
              <Plus size={20} />
              Adicionar Produto
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-modern pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="input-modern"
              >
                <option value="">Todas as categorias</option>
                <option value="Roupas">Roupas</option>
                <option value="Calçados">Calçados</option>
                <option value="Acessórios">Acessórios</option>
              </select>
              
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-modern"
              >
                <option value="">Todos os status</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
              
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(renderProductCard)}
          </div>
        ) : (
          <div className="card-modern overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-semibold">Produto</th>
                  <th className="text-left p-4 font-semibold">Preço</th>
                  <th className="text-left p-4 font-semibold">Estoque</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(renderProductRow)}
              </tbody>
            </table>
          </div>
        )}
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Box size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterCategory || filterStatus
                ? 'Tente ajustar os filtros de busca'
                : 'Comece adicionando seu primeiro produto'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
