
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Eye, 
  EyeOff, 
  Store, 
  Palette,
  RefreshCw,
  Activity
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const QuickControlCenter: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Buscar configurações da loja
  const { data: storeSettings, isLoading } = useQuery({
    queryKey: ['storeSettings', profile?.store_id],
    queryFn: async () => {
      if (!profile?.store_id) throw new Error('Store ID não encontrado');
      
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('store_id', profile.store_id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!profile?.store_id
  });

  // Mutation para atualizar configurações
  const updateSettingsMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      if (!profile?.store_id) throw new Error('Store ID não encontrado');
      
      const { error } = await supabase
        .from('store_settings')
        .upsert({
          store_id: profile.store_id,
          [key]: value
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeSettings', profile?.store_id] });
      toast.success('Configuração atualizada!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar configuração:', error);
      toast.error('Erro ao atualizar configuração');
    }
  });

  const handleToggleSetting = (key: string, currentValue: boolean) => {
    updateSettingsMutation.mutate({ key, value: !currentValue });
  };

  const controls = [
    {
      id: 'retail_catalog_active',
      label: 'Catálogo Varejo',
      description: 'Permitir vendas no varejo',
      value: storeSettings?.retail_catalog_active ?? true,
      icon: Store
    },
    {
      id: 'wholesale_catalog_active',
      label: 'Catálogo Atacado',
      description: 'Permitir vendas no atacado',
      value: storeSettings?.wholesale_catalog_active ?? false,
      icon: Store
    },
    {
      id: 'show_prices',
      label: 'Mostrar Preços',
      description: 'Exibir preços no catálogo',
      value: storeSettings?.show_prices ?? true,
      icon: Eye
    },
    {
      id: 'show_stock',
      label: 'Mostrar Estoque',
      description: 'Exibir quantidade em estoque',
      value: storeSettings?.show_stock ?? true,
      icon: Activity
    }
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5" />
            Centro de Controle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-6 w-10 bg-muted rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Centro de Controle
          </div>
          <Badge variant="outline" className="text-xs">
            Rápido
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {controls.map((control) => {
          const IconComponent = control.icon;
          return (
            <div
              key={control.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <IconComponent className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">{control.label}</p>
                  <p className="text-xs text-muted-foreground">{control.description}</p>
                </div>
              </div>
              <Switch
                checked={control.value}
                onCheckedChange={() => handleToggleSetting(control.id, control.value)}
                disabled={updateSettingsMutation.isPending}
              />
            </div>
          );
        })}

        <div className="pt-3 border-t flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/settings')}
            className="flex-1"
          >
            <Palette className="h-4 w-4 mr-2" />
            Personalizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries()}
            className="flex-1"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickControlCenter;
