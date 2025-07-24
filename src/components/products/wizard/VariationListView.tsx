
import React, { useState } from 'react';
import { ProductVariation } from '@/types/product';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  List, 
  Edit, 
  Trash2, 
  Package, 
  Copy, 
  CheckSquare, 
  Square,
  AlertTriangle
} from 'lucide-react';
import { useProductVariations } from '@/hooks/useProductVariations';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface VariationListViewProps {
  variations: ProductVariation[];
  onVariationsChange: (variations: ProductVariation[]) => void;
  productId?: string;
}

const VariationListView: React.FC<VariationListViewProps> = ({
  variations,
  onVariationsChange,
  productId
}) => {
  const [selectedVariations, setSelectedVariations] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { deleteVariationById } = useProductVariations(productId);
  const { toast } = useToast();

  const updateVariation = (index: number, updates: Partial<ProductVariation>) => {
    const updated = variations.map((variation, i) => 
      i === index ? { ...variation, ...updates } : variation
    );
    onVariationsChange(updated);
  };

  const handleDeleteVariation = async (variationId: string, index: number) => {
    if (!variationId || !variationId.startsWith('variation-')) {
      // Para variações ainda não salvas (IDs temporários), remover diretamente
      const updated = variations.filter((_, i) => i !== index);
      onVariationsChange(updated);
      toast({
        title: "Variação removida!",
        description: "Variação removida da lista.",
      });
      return;
    }

    setIsDeleting(variationId);
    try {
      const success = await deleteVariationById(variationId);
      if (success) {
        // Remover da lista local também
        const updated = variations.filter((_, i) => i !== index);
        onVariationsChange(updated);
        
        // Remover da seleção se estava selecionada
        setSelectedVariations(prev => prev.filter(id => id !== variationId));
      }
    } catch (error) {
      console.error('Erro ao excluir variação:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const duplicateVariation = (index: number) => {
    const original = variations[index];
    const duplicate: ProductVariation = {
      ...original,
      id: `variation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sku: original.sku ? `${original.sku}-copy` : '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const updated = [...variations, duplicate];
    onVariationsChange(updated);
    
    toast({
      title: "Variação duplicada!",
      description: "Uma cópia da variação foi criada.",
    });
  };

  const toggleVariationSelection = (variationId: string) => {
    setSelectedVariations(prev => 
      prev.includes(variationId) 
        ? prev.filter(id => id !== variationId)
        : [...prev, variationId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedVariations.length === variations.length) {
      setSelectedVariations([]);
    } else {
      setSelectedVariations(variations.map(v => v.id));
    }
  };

  const deleteSelectedVariations = async () => {
    const indicesToRemove: number[] = [];
    
    for (const variationId of selectedVariations) {
      const index = variations.findIndex(v => v.id === variationId);
      if (index !== -1) {
        if (variationId.startsWith('variation-')) {
          // Variação temporária, apenas marcar para remoção
          indicesToRemove.push(index);
        } else {
          // Variação salva, excluir do banco
          try {
            await deleteVariationById(variationId);
            indicesToRemove.push(index);
          } catch (error) {
            console.error(`Erro ao excluir variação ${variationId}:`, error);
          }
        }
      }
    }
    
    // Remover da lista local
    const updated = variations.filter((_, index) => !indicesToRemove.includes(index));
    onVariationsChange(updated);
    setSelectedVariations([]);
    
    toast({
      title: "Variações removidas!",
      description: `${indicesToRemove.length} variação(ões) foram removidas.`,
    });
  };

  if (variations.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="p-4 bg-gray-100 rounded-lg">
                <List className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Nenhuma Variação Criada
              </h3>
              <p className="text-gray-600 mt-2">
                Use a aba "Grade" para criar variações do seu produto.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com controles de seleção */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Lista de Variações ({variations.length})
          </h3>
          <Badge variant="secondary">
            {variations.filter(v => v.stock > 0).length} com estoque
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSelectAll}
            className="flex items-center gap-2"
          >
            {selectedVariations.length === variations.length ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            {selectedVariations.length === variations.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
          </Button>
          
          {selectedVariations.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Excluir Selecionadas ({selectedVariations.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Confirmar Exclusão
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir {selectedVariations.length} variação(ões) selecionada(s)? 
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={deleteSelectedVariations}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Excluir Todas
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Lista de variações */}
      <div className="grid gap-4">
        {variations.map((variation, index) => (
          <Card key={variation.id || index} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedVariations.includes(variation.id)}
                    onCheckedChange={() => toggleVariationSelection(variation.id)}
                  />
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    {[variation.color, variation.size, variation.material]
                      .filter(Boolean)
                      .join(' - ') || 'Variação sem nome'}
                  </CardTitle>
                  {variation.is_grade && (
                    <Badge variant="outline" className="text-xs">
                      Grade
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => duplicateVariation(index)}
                    title="Duplicar variação"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isDeleting === variation.id}
                        className="text-red-600 hover:text-red-700"
                      >
                        {isDeleting === variation.id ? (
                          <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          Confirmar Exclusão
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir esta variação? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteVariation(variation.id, index)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor={`stock-${index}`}>Estoque</Label>
                  <Input
                    id={`stock-${index}`}
                    type="number"
                    value={variation.stock}
                    onChange={(e) => updateVariation(index, { 
                      stock: parseInt(e.target.value) || 0 
                    })}
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor={`price-${index}`}>Ajuste de Preço (R$)</Label>
                  <Input
                    id={`price-${index}`}
                    type="number"
                    step="0.01"
                    value={variation.price_adjustment}
                    onChange={(e) => updateVariation(index, { 
                      price_adjustment: parseFloat(e.target.value) || 0 
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor={`sku-${index}`}>SKU</Label>
                  <Input
                    id={`sku-${index}`}
                    type="text"
                    value={variation.sku || ''}
                    onChange={(e) => updateVariation(index, { 
                      sku: e.target.value 
                    })}
                    placeholder="Código único"
                  />
                </div>
                <div className="flex items-end">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`active-${index}`}
                      checked={variation.is_active}
                      onCheckedChange={(checked) => updateVariation(index, { 
                        is_active: !!checked 
                      })}
                    />
                    <Label htmlFor={`active-${index}`} className="text-sm">
                      Ativo
                    </Label>
                  </div>
                </div>
              </div>
              
              {/* Informações da grade se aplicável */}
              {variation.is_grade && (variation.grade_sizes || variation.grade_pairs) && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    Configuração da Grade
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {variation.grade_name && (
                      <div>
                        <span className="text-blue-700">Nome da Grade: </span>
                        <span className="font-medium">{variation.grade_name}</span>
                      </div>
                    )}
                    {variation.grade_quantity && (
                      <div>
                        <span className="text-blue-700">Quantidade Total: </span>
                        <span className="font-medium">{variation.grade_quantity}</span>
                      </div>
                    )}
                    {variation.grade_sizes && (
                      <div className="col-span-2">
                        <span className="text-blue-700">Tamanhos: </span>
                        <span className="font-medium">{variation.grade_sizes.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VariationListView;
