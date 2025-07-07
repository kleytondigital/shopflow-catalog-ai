
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus } from 'lucide-react';
import { useProductPriceTiers } from '@/hooks/useProductPriceTiers';
import { useStorePriceModel } from '@/hooks/useStorePriceModel';
import { useAuth } from '@/hooks/useAuth';

interface ProductPriceTiersManagerProps {
  productId?: string;
  retailPrice: number;
  onTiersChange?: (tiers: any[]) => void;
}

const ProductPriceTiersManager: React.FC<ProductPriceTiersManagerProps> = ({
  productId,
  retailPrice,
  onTiersChange,
}) => {
  const { profile } = useAuth();
  const { tiers, loading, createTier, updateTier, deleteTier } = useProductPriceTiers(productId);
  const { priceModel } = useStorePriceModel(profile?.store_id);
  
  const [newTier, setNewTier] = useState({
    tier_name: '',
    min_quantity: 1,
    price: 0,
    tier_order: 1,
  });

  useEffect(() => {
    if (onTiersChange) {
      onTiersChange(tiers);
    }
  }, [tiers, onTiersChange]);

  const handleCreateTier = async () => {
    if (!productId || !newTier.tier_name || newTier.price <= 0) return;

    try {
      await createTier({
        product_id: productId,
        tier_name: newTier.tier_name,
        tier_type: 'custom',
        min_quantity: newTier.min_quantity,
        price: newTier.price,
        tier_order: newTier.tier_order,
        is_active: true,
      });

      setNewTier({
        tier_name: '',
        min_quantity: 1,
        price: 0,
        tier_order: tiers.length + 1,
      });
    } catch (error) {
      console.error('Error creating tier:', error);
    }
  };

  if (loading) {
    return <div>Carregando níveis de preço...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Níveis de Preço</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tiers.length > 0 && (
          <div className="space-y-2">
            {tiers.map((tier) => (
              <div key={tier.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      Mín: {tier.min_quantity}
                    </Badge>
                    <span className="font-medium">{tier.tier_name}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    R$ {tier.price.toFixed(2)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTier(tier.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {productId && (
          <div className="border-t pt-4 space-y-3">
            <h4 className="font-medium">Adicionar Novo Nível</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="tier-name">Nome do Nível</Label>
                <Input
                  id="tier-name"
                  value={newTier.tier_name}
                  onChange={(e) => setNewTier(prev => ({ ...prev, tier_name: e.target.value }))}
                  placeholder="Ex: Atacado Grande"
                />
              </div>
              <div>
                <Label htmlFor="min-qty">Quantidade Mínima</Label>
                <Input
                  id="min-qty"
                  type="number"
                  value={newTier.min_quantity}
                  onChange={(e) => setNewTier(prev => ({ ...prev, min_quantity: parseInt(e.target.value) || 1 }))}
                  min="1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="tier-price">Preço</Label>
              <Input
                id="tier-price"
                type="number"
                step="0.01"
                value={newTier.price}
                onChange={(e) => setNewTier(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                min="0"
              />
            </div>
            <Button onClick={handleCreateTier} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Nível
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductPriceTiersManager;
