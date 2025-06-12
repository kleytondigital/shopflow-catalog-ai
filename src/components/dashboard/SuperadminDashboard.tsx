
import React, { useState } from 'react';
import { Store, Building2, Users, DollarSign, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStores } from '@/hooks/useStores';
import { useToast } from '@/hooks/use-toast';
import StoreForm from '@/components/stores/StoreForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const SuperadminDashboard = () => {
  const { stores, loading, createStore } = useStores();
  const [showStoreForm, setShowStoreForm] = useState(false);
  const { toast } = useToast();

  const handleCreateStore = async (storeData: any) => {
    const { error } = await createStore(storeData);
    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar loja",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Loja criada com sucesso",
      });
      setShowStoreForm(false);
    }
  };

  const totalStores = stores.length;
  const activeStores = stores.filter(store => store.is_active).length;
  const totalRevenue = stores.reduce((sum, store) => sum + (store.monthly_fee || 0), 0);

  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Lojas</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStores}</div>
            <p className="text-xs text-muted-foreground">
              {activeStores} ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Receita recorrente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lojas Ativas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeStores}</div>
            <p className="text-xs text-muted-foreground">
              {((activeStores / totalStores) * 100 || 0).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStores}</div>
            <p className="text-xs text-muted-foreground">
              Administradores de loja
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Lojas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gestão de Lojas</CardTitle>
          <Button onClick={() => setShowStoreForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Loja
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Carregando lojas...</div>
          ) : (
            <div className="space-y-4">
              {stores.map((store) => (
                <div key={store.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{store.name}</h3>
                      <Badge variant={store.is_active ? "default" : "secondary"}>
                        {store.is_active ? "Ativa" : "Inativa"}
                      </Badge>
                      <Badge variant="outline">{store.plan_type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {store.description || "Sem descrição"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Criada em: {new Date(store.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">R$ {(store.monthly_fee || 0).toFixed(2)}/mês</p>
                    <p className="text-sm text-muted-foreground">ID: {store.id.slice(0, 8)}...</p>
                  </div>
                </div>
              ))}
              {stores.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma loja cadastrada ainda.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para criar nova loja */}
      <Dialog open={showStoreForm} onOpenChange={setShowStoreForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Loja</DialogTitle>
          </DialogHeader>
          <StoreForm onSubmit={handleCreateStore} onCancel={() => setShowStoreForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperadminDashboard;
