
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useStores, CreateStoreData } from '@/hooks/useStores';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/layout/AppLayout';
import StoreForm from '@/components/stores/StoreForm';
import { Store, Plus, Search, Filter, MoreHorizontal, ExternalLink, Edit } from 'lucide-react';

const Stores = () => {
  const { stores, loading, createStore } = useStores();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleCreateStore = async (storeData: CreateStoreData) => {
    if (!profile?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }

    const dataWithOwner: CreateStoreData = {
      ...storeData,
      owner_id: profile.id
    };

    const { error } = await createStore(dataWithOwner);
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

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && store.is_active) ||
                         (statusFilter === 'inactive' && !store.is_active);
    
    return matchesSearch && matchesStatus;
  });

  const breadcrumbs = [
    { href: '/', label: 'Dashboard' },
    { label: 'Gestão de Lojas', current: true }
  ];

  if (profile?.role !== 'superadmin') {
    return (
      <AppLayout title="Acesso Negado">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h2>
            <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout 
      title="Gestão de Lojas"
      subtitle="Gerencie todas as lojas do sistema"
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Header com ações */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex-1 flex flex-col sm:flex-row gap-4 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar lojas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="active">Ativas</SelectItem>
                <SelectItem value="inactive">Inativas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setShowStoreForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Loja
          </Button>
        </div>

        {/* Métricas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total de Lojas</p>
                  <p className="text-2xl font-bold">{stores.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm text-gray-600">Lojas Ativas</p>
                  <p className="text-2xl font-bold">{stores.filter(s => s.is_active).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div>
                  <p className="text-sm text-gray-600">Lojas Inativas</p>
                  <p className="text-2xl font-bold">{stores.filter(s => !s.is_active).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-gray-600">Receita Mensal</p>
                <p className="text-2xl font-bold">
                  R$ {stores.reduce((sum, store) => sum + (store.monthly_fee || 0), 0).toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de lojas */}
        <Card>
          <CardHeader>
            <CardTitle>Lojas ({filteredStores.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Carregando lojas...</span>
              </div>
            ) : filteredStores.length > 0 ? (
              <div className="space-y-4">
                {filteredStores.map((store) => (
                  <div key={store.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{store.name}</h3>
                          <Badge variant={store.is_active ? "default" : "secondary"}>
                            {store.is_active ? "Ativa" : "Inativa"}
                          </Badge>
                          <Badge variant="outline">{store.plan_type}</Badge>
                          {store.url_slug && (
                            <Button variant="ghost" size="sm" className="gap-1 text-blue-600">
                              <ExternalLink className="h-3 w-3" />
                              {store.url_slug}
                            </Button>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-2">
                          {store.description || "Sem descrição"}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Email:</span>
                            <p>{store.email || "Não informado"}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Telefone:</span>
                            <p>{store.phone || "Não informado"}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">CNPJ:</span>
                            <p>{store.cnpj || "Não informado"}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <span>ID: {store.id.slice(0, 8)}...</span>
                          <span>Criada: {new Date(store.created_at).toLocaleDateString('pt-BR')}</span>
                          <span>Atualizada: {new Date(store.updated_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <div className="text-right">
                          <p className="font-semibold">R$ {(store.monthly_fee || 0).toFixed(2)}</p>
                          <p className="text-sm text-gray-500">mensais</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? "Nenhuma loja encontrada com os filtros aplicados."
                  : "Nenhuma loja cadastrada ainda."
                }
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
    </AppLayout>
  );
};

export default Stores;
