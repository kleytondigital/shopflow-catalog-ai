
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useStorePriceModel, PriceModelType } from '@/hooks/useStorePriceModel';
import { Badge } from '@/components/ui/badge';
import { Settings, DollarSign, TrendingUp, Package } from 'lucide-react';

interface CatalogModeSettingsProps {
  storeId?: string;
}

const CatalogModeSettings: React.FC<CatalogModeSettingsProps> = ({ storeId }) => {
  const { priceModel, loading, updatePriceModel } = useStorePriceModel(storeId);
  const [localModel, setLocalModel] = useState(priceModel);

  useEffect(() => {
    setLocalModel(priceModel);
  }, [priceModel]);

  const handlePriceModelChange = (value: string) => {
    const newModel = { ...localModel, price_model: value as PriceModelType };
    setLocalModel(newModel);
    updatePriceModel({ price_model: value as PriceModelType });
  };

  const handleToggleChange = (field: keyof typeof localModel, value: boolean) => {
    const newModel = { ...localModel, [field]: value };
    setLocalModel(newModel);
    updatePriceModel({ [field]: value });
  };

  const handleInputChange = (field: keyof typeof localModel, value: string | number) => {
    const newModel = { ...localModel, [field]: value };
    setLocalModel(newModel);
  };

  const handleSave = () => {
    updatePriceModel(localModel);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações de Preços
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Carregando configurações...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configurações de Preços
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Modelo de Preços */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Modelo de Preços</Label>
          <RadioGroup 
            value={localModel.price_model} 
            onValueChange={handlePriceModelChange}
          >
            <div className="space-y-3">
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="retail_only" id="retail_only" />
                <div className="flex-1">
                  <Label htmlFor="retail_only" className="font-medium cursor-pointer">
                    Apenas Varejo
                  </Label>
                  <p className="text-sm text-gray-600">Preço único para todos os clientes</p>
                </div>
                <Badge variant="outline">
                  <Package className="h-3 w-3 mr-1" />
                  Simples
                </Badge>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="simple_wholesale" id="simple_wholesale" />
                <div className="flex-1">
                  <Label htmlFor="simple_wholesale" className="font-medium cursor-pointer">
                    Varejo + Atacado Simples
                  </Label>
                  <p className="text-sm text-gray-600">Dois preços: varejo e atacado com quantidade mínima</p>
                </div>
                <Badge variant="outline">
                  <DollarSign className="h-3 w-3 mr-1" />
                  Básico
                </Badge>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="gradual_wholesale" id="gradual_wholesale" />
                <div className="flex-1">
                  <Label htmlFor="gradual_wholesale" className="font-medium cursor-pointer">
                    Níveis Graduais
                  </Label>
                  <p className="text-sm text-gray-600">Múltiplos níveis de preço baseados na quantidade</p>
                </div>
                <Badge variant="outline">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Avançado
                </Badge>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Configurações do Atacado Simples */}
        {localModel.price_model === 'simple_wholesale' && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900">Configurações do Atacado Simples</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="wholesale-name">Nome do Atacado</Label>
                <Input
                  id="wholesale-name"
                  value={localModel.simple_wholesale_name}
                  onChange={(e) => handleInputChange('simple_wholesale_name', e.target.value)}
                  placeholder="Ex: Atacado, Distribuidor"
                />
              </div>
              
              <div>
                <Label htmlFor="wholesale-min-qty">Quantidade Mínima</Label>
                <Input
                  id="wholesale-min-qty"
                  type="number"
                  value={localModel.simple_wholesale_min_qty}
                  onChange={(e) => handleInputChange('simple_wholesale_min_qty', parseInt(e.target.value) || 0)}
                  min="1"
                />
              </div>
            </div>
          </div>
        )}

        {/* Configurações dos Níveis Graduais */}
        {localModel.price_model === 'gradual_wholesale' && (
          <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-900">Configurações dos Níveis Graduais</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="tiers-count">Número de Níveis</Label>
                <Input
                  id="tiers-count"
                  type="number"
                  value={localModel.gradual_tiers_count}
                  onChange={(e) => handleInputChange('gradual_tiers_count', parseInt(e.target.value) || 2)}
                  min="2"
                  max="4"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].slice(0, localModel.gradual_tiers_count).map((tier) => (
                  <div key={tier} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={localModel[`tier_${tier}_enabled` as keyof typeof localModel] as boolean}
                        onCheckedChange={(checked) => 
                          handleToggleChange(`tier_${tier}_enabled` as keyof typeof localModel, checked)
                        }
                      />
                      <Label>Nível {tier}</Label>
                    </div>
                    {localModel[`tier_${tier}_enabled` as keyof typeof localModel] && (
                      <Input
                        value={localModel[`tier_${tier}_name` as keyof typeof localModel] as string}
                        onChange={(e) => 
                          handleInputChange(`tier_${tier}_name` as keyof typeof localModel, e.target.value)
                        }
                        placeholder={`Nome do Nível ${tier}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Configurações de Exibição */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Configurações de Exibição</Label>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Mostrar Níveis de Preço</Label>
                <p className="text-sm text-gray-600">Exibir tabela de preços no produto</p>
              </div>
              <Switch
                checked={localModel.show_price_tiers}
                onCheckedChange={(checked) => handleToggleChange('show_price_tiers', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Indicadores de Economia</Label>
                <p className="text-sm text-gray-600">Mostrar quanto o cliente economiza</p>
              </div>
              <Switch
                checked={localModel.show_savings_indicators}
                onCheckedChange={(checked) => handleToggleChange('show_savings_indicators', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Dica do Próximo Nível</Label>
                <p className="text-sm text-gray-600">Sugerir próximo nível de desconto</p>
              </div>
              <Switch
                checked={localModel.show_next_tier_hint}
                onCheckedChange={(checked) => handleToggleChange('show_next_tier_hint', checked)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CatalogModeSettings;
