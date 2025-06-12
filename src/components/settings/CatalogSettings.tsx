
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBag, Package, Loader2 } from 'lucide-react';

const CatalogSettings = () => {
  const { settings, loading, updateSettings } = useStoreSettings();
  const { toast } = useToast();

  const handleToggle = async (field: 'retail_catalog_active' | 'wholesale_catalog_active', value: boolean) => {
    const { error } = await updateSettings({ [field]: value });
    
    if (error) {
      toast({
        title: "Erro ao atualizar configuração",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Configuração atualizada",
        description: `Catálogo ${field === 'retail_catalog_active' ? 'de varejo' : 'de atacado'} ${value ? 'ativado' : 'desativado'}`
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Configurações de Catálogo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Catálogo de Varejo */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-blue-600" />
                <Label htmlFor="retail-catalog" className="font-medium">
                  Catálogo de Varejo
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Permite vendas unitárias com preços de varejo
              </p>
            </div>
            <Switch
              id="retail-catalog"
              checked={settings?.retail_catalog_active || false}
              onCheckedChange={(checked) => handleToggle('retail_catalog_active', checked)}
            />
          </div>

          {/* Catálogo de Atacado */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-orange-600" />
                <Label htmlFor="wholesale-catalog" className="font-medium">
                  Catálogo de Atacado
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Permite vendas em quantidade com preços de atacado
              </p>
            </div>
            <Switch
              id="wholesale-catalog"
              checked={settings?.wholesale_catalog_active || false}
              onCheckedChange={(checked) => handleToggle('wholesale_catalog_active', checked)}
            />
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Informações Importantes:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• O catálogo de varejo está ativo por padrão</li>
            <li>• Para usar o atacado, configure preços e quantidades mínimas nos produtos</li>
            <li>• Ambos os catálogos podem estar ativos simultaneamente</li>
            <li>• Os clientes verão apenas os catálogos ativos</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default CatalogSettings;
