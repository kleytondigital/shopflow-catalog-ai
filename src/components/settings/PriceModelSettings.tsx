
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useStorePriceModel } from '@/hooks/useStorePriceModel';
import { useAuth } from '@/hooks/useAuth';

const PriceModelSettings: React.FC = () => {
  const { profile } = useAuth();
  const { priceModel, loading, updatePriceModel } = useStorePriceModel(profile?.store_id);
  const [localSettings, setLocalSettings] = useState(priceModel);

  useEffect(() => {
    setLocalSettings(priceModel);
  }, [priceModel]);

  const handleModelChange = (value: string) => {
    const newSettings = { ...localSettings, price_model: value as any };
    setLocalSettings(newSettings);
    updatePriceModel({ price_model: value as any });
  };

  const handleSettingChange = (field: keyof typeof localSettings, value: any) => {
    const newSettings = { ...localSettings, [field]: value };
    setLocalSettings(newSettings);
    updatePriceModel({ [field]: value });
  };

  if (loading) {
    return <div>Carregando configurações...</div>;
  }

  if (!localSettings) {
    return <div>Erro ao carregar configurações</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Preços</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base font-semibold">Modelo de Preços</Label>
          <RadioGroup 
            value={localSettings.price_model} 
            onValueChange={handleModelChange}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="retail_only" id="retail_only" />
              <Label htmlFor="retail_only">Apenas Varejo</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="simple_wholesale" id="simple_wholesale" />
              <Label htmlFor="simple_wholesale">Varejo + Atacado</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="gradual_wholesale" id="gradual_wholesale" />
              <Label htmlFor="gradual_wholesale">Níveis Graduais</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Mostrar Tabela de Preços</Label>
              <p className="text-sm text-gray-600">Exibir níveis no produto</p>
            </div>
            <Switch
              checked={localSettings.show_price_tiers}
              onCheckedChange={(checked) => handleSettingChange('show_price_tiers', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Indicadores de Economia</Label>
              <p className="text-sm text-gray-600">Mostrar valor economizado</p>
            </div>
            <Switch
              checked={localSettings.show_savings_indicators}
              onCheckedChange={(checked) => handleSettingChange('show_savings_indicators', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Dica do Próximo Nível</Label>
              <p className="text-sm text-gray-600">Sugerir próximo desconto</p>
            </div>
            <Switch
              checked={localSettings.show_next_tier_hint}
              onCheckedChange={(checked) => handleSettingChange('show_next_tier_hint', checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceModelSettings;
