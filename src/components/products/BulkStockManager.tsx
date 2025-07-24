
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Package, Upload, Download, Check, X, Calculator } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useStockMovements } from '@/hooks/useStockMovements';
import { useToast } from '@/hooks/use-toast';
import { QuantityInput } from '@/components/ui/quantity-input';

interface BulkStockManagerProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
}

interface ProductStockUpdate {
  id: string;
  name: string;
  sku?: string;
  currentStock: number;
  newStock: number;
  adjustment: number;
  selected: boolean;
}

const BulkStockManager: React.FC<BulkStockManagerProps> = ({
  isOpen,
  onClose,
  storeId
}) => {
  const { products, fetchProducts } = useProducts();
  const { createStockMovement } = useStockMovements();
  const { toast } = useToast();

  const [selectedProducts, setSelectedProducts] = useState<ProductStockUpdate[]>([]);
  const [bulkAdjustment, setBulkAdjustment] = useState<number>(0);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract' | 'set'>('add');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  React.useEffect(() => {
    if (isOpen && products.length > 0) {
      const productUpdates = products
        .filter(product => product.store_id === storeId)
        .map(product => ({
          id: product.id,
          name: product.name,
          sku: product.sku,
          currentStock: product.stock,
          newStock: product.stock,
          adjustment: 0,
          selected: false
        }));
      setSelectedProducts(productUpdates);
    }
  }, [isOpen, products, storeId]);

  const filteredProducts = selectedProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const handleSelectAll = (checked: boolean) => {
    setSelectedProducts(prev => 
      prev.map(product => ({ ...product, selected: checked }))
    );
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    setSelectedProducts(prev =>
      prev.map(product =>
        product.id === productId ? { ...product, selected: checked } : product
      )
    );
  };

  const handleStockChange = (productId: string, newStock: number) => {
    setSelectedProducts(prev =>
      prev.map(product =>
        product.id === productId 
          ? { 
              ...product, 
              newStock, 
              adjustment: newStock - product.currentStock 
            }
          : product
      )
    );
  };

  const applyBulkAdjustment = () => {
    if (bulkAdjustment === 0) return;

    setSelectedProducts(prev =>
      prev.map(product => {
        if (!product.selected) return product;

        let newStock = product.currentStock;
        
        switch (adjustmentType) {
          case 'add':
            newStock = product.currentStock + bulkAdjustment;
            break;
          case 'subtract':
            newStock = Math.max(0, product.currentStock - bulkAdjustment);
            break;
          case 'set':
            newStock = bulkAdjustment;
            break;
        }

        return {
          ...product,
          newStock,
          adjustment: newStock - product.currentStock
        };
      })
    );

    setBulkAdjustment(0);
    toast({
      title: "Ajuste aplicado!",
      description: "Os valores foram calculados para os produtos selecionados.",
    });
  };

  const handleSaveChanges = async () => {
    const changedProducts = selectedProducts.filter(
      product => product.selected && product.adjustment !== 0
    );

    if (changedProducts.length === 0) {
      toast({
        title: "Nenhuma alteração",
        description: "Selecione produtos e faça ajustes antes de salvar.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      for (const product of changedProducts) {
        await createStockMovement({
          product_id: product.id,
          movement_type: 'adjustment',
          quantity: product.newStock,
          notes: `Ajuste em massa: ${product.adjustment > 0 ? '+' : ''}${product.adjustment}`
        });
      }

      toast({
        title: "Estoque atualizado!",
        description: `${changedProducts.length} produto(s) tiveram seu estoque ajustado.`,
      });

      await fetchProducts();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao salvar as alterações.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedCount = selectedProducts.filter(p => p.selected).length;
  const hasChanges = selectedProducts.some(p => p.selected && p.adjustment !== 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Gestão de Estoque em Massa
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="adjust" className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="adjust">Ajustar Estoque</TabsTrigger>
            <TabsTrigger value="import">Importar/Exportar</TabsTrigger>
          </TabsList>

          <TabsContent value="adjust" className="space-y-4">
            {/* Filtros e Busca */}
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por nome ou SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => handleSelectAll(true)}
                size="sm"
              >
                Selecionar Todos
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSelectAll(false)}
                size="sm"
              >
                Desselecionar
              </Button>
            </div>

            {/* Ajuste em Massa */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Ajuste em Massa
                  {selectedCount > 0 && (
                    <Badge variant="secondary">
                      {selectedCount} selecionado(s)
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label>Tipo de Ajuste</Label>
                    <Select value={adjustmentType} onValueChange={(value: any) => setAdjustmentType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="add">Adicionar (+)</SelectItem>
                        <SelectItem value="subtract">Subtrair (-)</SelectItem>
                        <SelectItem value="set">Definir valor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label>Quantidade</Label>
                    <QuantityInput
                      value={bulkAdjustment}
                      onChange={setBulkAdjustment}
                      min={0}
                    />
                  </div>
                  <Button 
                    onClick={applyBulkAdjustment}
                    disabled={selectedCount === 0 || bulkAdjustment === 0}
                  >
                    Aplicar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Produtos */}
            <div className="border rounded-lg max-h-96 overflow-y-auto">
              <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 font-medium text-sm border-b sticky top-0">
                <div className="col-span-1">Sel.</div>
                <div className="col-span-4">Produto</div>
                <div className="col-span-2">SKU</div>
                <div className="col-span-2">Estoque Atual</div>
                <div className="col-span-2">Novo Estoque</div>
                <div className="col-span-1">Ajuste</div>
              </div>

              {filteredProducts.map((product) => (
                <div key={product.id} className="grid grid-cols-12 gap-4 p-4 border-b items-center hover:bg-gray-50">
                  <div className="col-span-1">
                    <Checkbox
                      checked={product.selected}
                      onCheckedChange={(checked) => 
                        handleSelectProduct(product.id, checked as boolean)
                      }
                    />
                  </div>
                  <div className="col-span-4">
                    <div className="font-medium">{product.name}</div>
                  </div>
                  <div className="col-span-2">
                    <Badge variant="outline" className="text-xs">
                      {product.sku || 'Sem SKU'}
                    </Badge>
                  </div>
                  <div className="col-span-2 text-center">
                    <Badge variant="secondary">
                      {product.currentStock}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <QuantityInput
                      value={product.newStock}
                      onChange={(value) => handleStockChange(product.id, value)}
                      min={0}
                      className="w-full"
                    />
                  </div>
                  <div className="col-span-1 text-center">
                    {product.adjustment !== 0 && (
                      <Badge 
                        variant={product.adjustment > 0 ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {product.adjustment > 0 ? '+' : ''}{product.adjustment}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Ações */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-gray-600">
                {selectedCount} produto(s) selecionado(s)
                {hasChanges && ` • ${selectedProducts.filter(p => p.selected && p.adjustment !== 0).length} com alterações`}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSaveChanges}
                  disabled={!hasChanges || isProcessing}
                  className="min-w-32"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Salvando...
                    </div>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <div className="text-center py-8 text-gray-500">
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Importação/Exportação de Estoque</p>
              <p className="text-sm">
                Funcionalidade em desenvolvimento. Em breve você poderá importar e exportar dados de estoque via CSV/Excel.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default BulkStockManager;
