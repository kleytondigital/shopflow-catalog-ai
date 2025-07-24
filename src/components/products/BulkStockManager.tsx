
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, Plus, Minus, Settings, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';

interface BulkStockManagerProps {
  products: Product[];
  onStockUpdated: () => void;
}

interface StockOperation {
  productId: string;
  productName: string;
  currentStock: number;
  newStock: number;
  operation: 'add' | 'subtract' | 'set';
  quantity: number;
}

const BulkStockManager: React.FC<BulkStockManagerProps> = ({
  products,
  onStockUpdated
}) => {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [operation, setOperation] = useState<'add' | 'subtract' | 'set'>('add');
  const [quantity, setQuantity] = useState<number>(0);
  const [operations, setOperations] = useState<StockOperation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleProductSelect = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllProducts = () => {
    setSelectedProducts(products.map(p => p.id));
  };

  const clearSelection = () => {
    setSelectedProducts([]);
    setOperations([]);
  };

  const previewOperations = () => {
    if (selectedProducts.length === 0 || quantity <= 0) return;

    const newOperations: StockOperation[] = selectedProducts.map(productId => {
      const product = products.find(p => p.id === productId);
      if (!product) return null;

      let newStock = product.stock;
      
      switch (operation) {
        case 'add':
          newStock = product.stock + quantity;
          break;
        case 'subtract':
          newStock = Math.max(0, product.stock - quantity);
          break;
        case 'set':
          newStock = quantity;
          break;
      }

      return {
        productId,
        productName: product.name,
        currentStock: product.stock,
        newStock,
        operation,
        quantity
      };
    }).filter(Boolean) as StockOperation[];

    setOperations(newOperations);
  };

  const executeOperations = async () => {
    if (operations.length === 0) return;

    setIsProcessing(true);
    try {
      const updates = operations.map(op => ({
        id: op.productId,
        stock: op.newStock,
        updated_at: new Date().toISOString()
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('products')
          .update({ 
            stock: update.stock,
            updated_at: update.updated_at
          })
          .eq('id', update.id);

        if (error) throw error;
      }

      toast({
        title: "Estoque atualizado!",
        description: `${operations.length} produto(s) atualizado(s) com sucesso.`,
      });

      onStockUpdated();
      clearSelection();
      setQuantity(0);

    } catch (error: any) {
      console.error('Erro ao atualizar estoque:', error);
      toast({
        title: "Erro ao atualizar estoque",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (selectedProducts.length > 0 && quantity > 0) {
      previewOperations();
    } else {
      setOperations([]);
    }
  }, [selectedProducts, operation, quantity]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Gestão de Estoque em Massa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seleção de Produtos */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Selecionar Produtos</Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAllProducts}>
                Selecionar Todos
              </Button>
              <Button variant="outline" size="sm" onClick={clearSelection}>
                Limpar Seleção
              </Button>
            </div>
          </div>

          <div className="max-h-40 overflow-y-auto border rounded-lg">
            {products.map(product => (
              <div
                key={product.id}
                className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                  selectedProducts.includes(product.id) ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => handleProductSelect(product.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{product.name}</span>
                    <Badge variant="outline" className="ml-2">
                      Estoque: {product.stock}
                    </Badge>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleProductSelect(product.id)}
                    className="rounded"
                  />
                </div>
              </div>
            ))}
          </div>

          {selectedProducts.length > 0 && (
            <Badge variant="secondary">
              {selectedProducts.length} produto(s) selecionado(s)
            </Badge>
          )}
        </div>

        <Separator />

        {/* Configuração da Operação */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tipo de Operação</Label>
            <Select value={operation} onValueChange={(value: 'add' | 'subtract' | 'set') => setOperation(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-green-600" />
                    Adicionar ao estoque
                  </div>
                </SelectItem>
                <SelectItem value="subtract">
                  <div className="flex items-center gap-2">
                    <Minus className="h-4 w-4 text-red-600" />
                    Subtrair do estoque
                  </div>
                </SelectItem>
                <SelectItem value="set">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-blue-600" />
                    Definir estoque exato
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Quantidade</Label>
            <Input
              type="number"
              min="0"
              value={quantity || ''}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              placeholder="Digite a quantidade"
            />
          </div>
        </div>

        {/* Preview das Operações */}
        {operations.length > 0 && (
          <div className="space-y-4">
            <Separator />
            <div>
              <Label className="text-base font-semibold">Preview das Alterações</Label>
              <div className="mt-2 max-h-32 overflow-y-auto border rounded-lg">
                {operations.map(op => (
                  <div key={op.productId} className="p-3 border-b last:border-b-0">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{op.productName}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{op.currentStock}</Badge>
                        <span>→</span>
                        <Badge 
                          variant={op.newStock > op.currentStock ? "default" : "secondary"}
                          className={op.newStock > op.currentStock ? "bg-green-600" : ""}
                        >
                          {op.newStock}
                        </Badge>
                        {op.newStock > op.currentStock ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : op.newStock < op.currentStock ? (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={executeOperations}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? 'Processando...' : `Aplicar Alterações (${operations.length} produtos)`}
              </Button>
              <Button variant="outline" onClick={clearSelection}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkStockManager;
