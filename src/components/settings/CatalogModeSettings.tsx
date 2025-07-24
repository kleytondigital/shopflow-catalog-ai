
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CatalogModeSettings = () => {
  const { profile } = useAuth();
  const { settings, loading, updateSettings } = useSettings(profile?.store_id);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Catálogo</CardTitle>
          <CardDescription>Carregando configurações...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleModeChange = (mode: 'separated' | 'hybrid' | 'toggle') => {
    updateSettings({ catalog_mode: mode });
  };

  const handleCatalogToggle = (catalog: 'retail' | 'wholesale', active: boolean) => {
    if (catalog === 'retail') {
      updateSettings({ retail_catalog_active: active });
    } else {
      updateSettings({ wholesale_catalog_active: active });
    }
  };

  const canChangeMode = settings?.catalog_mode !== 'separated';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Modo do Catálogo</CardTitle>
          <CardDescription>
            Configure como seus catálogos de varejo e atacado serão exibidos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={settings?.catalog_mode || 'separated'}
            onValueChange={handleModeChange}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="separated" id="separated" />
              <Label htmlFor="separated">
                <div>
                  <div className="font-medium">Catálogos Separados</div>
                  <div className="text-sm text-muted-foreground">
                    URLs diferentes para varejo e atacado
                  </div>
                </div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hybrid" id="hybrid" />
              <Label htmlFor="hybrid">
                <div>
                  <div className="font-medium">Catálogo Híbrido</div>
                  <div className="text-sm text-muted-foreground">
                    Um catálogo que mostra preços conforme o tipo de cliente
                  </div>
                </div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="toggle" id="toggle" />
              <Label htmlFor="toggle">
                <div>
                  <div className="font-medium">Catálogo com Toggle</div>
                  <div className="text-sm text-muted-foreground">
                    Permite alternar entre varejo e atacado na mesma página
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {settings?.catalog_mode === 'separated' && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                No modo separado, você terá URLs distintas para cada tipo de catálogo.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ativação dos Catálogos</CardTitle>
          <CardDescription>
            Controle quais catálogos estão ativos para seus clientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="retail-active">Catálogo de Varejo</Label>
              <div className="text-sm text-muted-foreground">
                Permite vendas no varejo
              </div>
            </div>
            <Switch
              id="retail-active"
              checked={settings?.retail_catalog_active ?? true}
              onCheckedChange={(checked) => handleCatalogToggle('retail', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="wholesale-active">Catálogo de Atacado</Label>
              <div className="text-sm text-muted-foreground">
                Permite vendas no atacado
              </div>
            </div>
            <Switch
              id="wholesale-active"
              checked={settings?.wholesale_catalog_active ?? false}
              onCheckedChange={(checked) => handleCatalogToggle('wholesale', checked)}
            />
          </div>

          {!settings?.retail_catalog_active && !settings?.wholesale_catalog_active && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Atenção: Todos os catálogos estão desativados. Seus clientes não poderão visualizar produtos.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CatalogModeSettings;
