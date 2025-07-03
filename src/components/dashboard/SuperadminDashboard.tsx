import React, { useState } from "react";
import {
  Store,
  Building2,
  Users,
  DollarSign,
  Plus,
  TrendingUp,
  Activity,
  CreditCard,
  Globe,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
  PieChart,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStores, CreateStoreData } from "@/hooks/useStores";
import { useUsers } from "@/hooks/useUsers";
import { useSuperadminMetrics } from "@/hooks/useSuperadminMetrics";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import StoreForm from "@/components/stores/StoreForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

const SuperadminDashboard = () => {
  const { stores, loading: storesLoading, createStore } = useStores();
  const { users, loading: usersLoading } = useUsers();
  const { data: metrics, isLoading: metricsLoading } = useSuperadminMetrics();
  const { profile } = useAuth();
  const [showStoreForm, setShowStoreForm] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
      owner_id: profile.id,
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

  // Métricas calculadas localmente
  const totalStores = stores.length;
  const activeStores = stores.filter((store) => store.is_active).length;
  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.is_active).length;
  const totalRevenue = stores.reduce(
    (sum, store) => sum + (store.monthly_fee || 0),
    0
  );

  // Dados simulados para demonstração
  const recentActivities = [
    {
      type: "store",
      message: 'Nova loja "TechStore" criada',
      time: "2 min atrás",
      status: "success",
    },
    {
      type: "payment",
      message: "Pagamento recebido - R$ 99,90",
      time: "15 min atrás",
      status: "success",
    },
    {
      type: "user",
      message: "Novo usuário cadastrado",
      time: "1h atrás",
      status: "info",
    },
    {
      type: "alert",
      message: "Loja offline detectada",
      time: "2h atrás",
      status: "warning",
    },
    {
      type: "update",
      message: "Plano upgradado para Pro",
      time: "3h atrás",
      status: "success",
    },
  ];

  const systemAlerts = [
    { type: "info", message: "Manutenção programada para domingo às 02:00" },
    { type: "warning", message: "3 lojas com pagamentos pendentes" },
    { type: "success", message: "Sistema operando normalmente" },
  ];

  const loading = storesLoading || usersLoading || metricsLoading;

  return (
    <div className="space-y-8 animate-fadeInUp">
      {/* Header Melhorado */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
            Dashboard Administrativo
          </h1>
          <p className="text-muted-foreground mt-2">
            Visão geral completa do sistema VendeMais SaaS
          </p>
          <div className="flex items-center gap-4 mt-3">
            <Badge
              variant="outline"
              className="text-green-600 border-green-600"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Sistema Online
            </Badge>
            <Badge variant="outline">
              <Clock className="w-3 h-3 mr-1" />
              Atualizado agora
            </Badge>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={() => navigate("/reports")}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Relatórios
          </Button>
          <Button variant="outline" onClick={() => navigate("/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Button>
          <Button
            onClick={() => setShowStoreForm(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="mr-2 h-5 w-5" />
            Nova Loja
          </Button>
        </div>
      </div>

      {/* Alertas do Sistema */}
      {systemAlerts.length > 0 && (
        <div className="space-y-3">
          {systemAlerts.map((alert, index) => (
            <Alert
              key={index}
              variant={alert.type === "warning" ? "destructive" : "default"}
            >
              {alert.type === "warning" && (
                <AlertTriangle className="h-4 w-4" />
              )}
              {alert.type === "success" && <CheckCircle className="h-4 w-4" />}
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Total de Lojas
            </CardTitle>
            <Store className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {loading ? "..." : totalStores}
            </div>
            <div className="flex items-center text-sm text-blue-600 dark:text-blue-400 mt-2">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span>{loading ? "..." : activeStores} ativas</span>
            </div>
            <Progress
              value={activeStores > 0 ? (activeStores / totalStores) * 100 : 0}
              className="mt-3"
            />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              Receita Mensal
            </CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">
              {loading
                ? "..."
                : `R$ ${totalRevenue.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}`}
            </div>
            <div className="flex items-center text-sm text-green-600 dark:text-green-400 mt-2">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span>+{metrics?.revenueGrowth || 12}% este mês</span>
            </div>
            <Progress value={75} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Usuários Ativos
            </CardTitle>
            <Users className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              {loading ? "..." : activeUsers}
            </div>
            <div className="flex items-center text-sm text-purple-600 dark:text-purple-400 mt-2">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span>de {totalUsers} totais</span>
            </div>
            <Progress
              value={activeUsers > 0 ? (activeUsers / totalUsers) * 100 : 0}
              className="mt-3"
            />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
              Pedidos Hoje
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
              {loading ? "..." : metrics?.ordersToday || 0}
            </div>
            <div className="flex items-center text-sm text-orange-600 dark:text-orange-400 mt-2">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span>+{metrics?.ordersGrowth || 15}% vs ontem</span>
            </div>
            <Progress value={60} className="mt-3" />
          </CardContent>
        </Card>
      </div>

      {/* Seção Principal com Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="stores">Lojas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance das Lojas */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Performance das Lojas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Carregando...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stores.slice(0, 5).map((store, index) => {
                      const performance = Math.floor(Math.random() * 100);
                      return (
                        <div
                          key={store.id}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                store.is_active ? "bg-green-500" : "bg-gray-400"
                              }`}
                            ></div>
                            <div>
                              <span className="font-medium">{store.name}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {store.plan_type}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {store.is_active ? "Online" : "Offline"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              R$ {(store.monthly_fee || 0).toFixed(2)}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-20 h-2 bg-muted rounded-full">
                                <div
                                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                  style={{ width: `${performance}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {performance}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {stores.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma loja encontrada</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Atividade Recente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          activity.status === "success"
                            ? "bg-green-500"
                            : activity.status === "warning"
                            ? "bg-orange-500"
                            : activity.status === "info"
                            ? "bg-blue-500"
                            : "bg-gray-500"
                        }`}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {activity.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stores">
          {/* Lista Detalhada de Lojas */}
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Lojas</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Carregando lojas...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {stores.map((store) => (
                    <div
                      key={store.id}
                      className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{store.name}</h3>
                          <Badge
                            variant={store.is_active ? "default" : "secondary"}
                          >
                            {store.is_active ? "Ativa" : "Inativa"}
                          </Badge>
                          <Badge variant="outline">{store.plan_type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {store.description || "Sem descrição"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Criada em:{" "}
                          {new Date(store.created_at).toLocaleDateString(
                            "pt-BR"
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          R$ {(store.monthly_fee || 0).toFixed(2)}/mês
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ID: {store.id.slice(0, 8)}...
                        </p>
                        <Button size="sm" variant="outline" className="mt-2">
                          Gerenciar
                        </Button>
                      </div>
                    </div>
                  ))}
                  {stores.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma loja cadastrada ainda.</p>
                      <Button
                        className="mt-4"
                        onClick={() => setShowStoreForm(true)}
                      >
                        Criar primeira loja
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Distribuição por Plano
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Básico</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pro</span>
                    <span className="font-medium">35%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Enterprise</span>
                    <span className="font-medium">20%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Crescimento Mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Novas Lojas</span>
                    <span className="font-medium text-green-600">+12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Receita</span>
                    <span className="font-medium text-green-600">
                      +R$ 2.450
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Usuários</span>
                    <span className="font-medium text-green-600">+28</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Status do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>API</span>
                    <Badge variant="default" className="bg-green-500">
                      Online
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Banco de Dados</span>
                    <Badge variant="default" className="bg-green-500">
                      Online
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>CDN</span>
                    <Badge variant="default" className="bg-green-500">
                      Online
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pagamentos</span>
                    <Badge variant="default" className="bg-green-500">
                      Online
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Recursos do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>CPU</span>
                      <span>45%</span>
                    </div>
                    <Progress value={45} className="mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Memória</span>
                      <span>62%</span>
                    </div>
                    <Progress value={62} className="mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Armazenamento</span>
                      <span>78%</span>
                    </div>
                    <Progress value={78} className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog para criar nova loja */}
      <Dialog open={showStoreForm} onOpenChange={setShowStoreForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Loja</DialogTitle>
          </DialogHeader>
          <StoreForm
            onSubmit={handleCreateStore}
            onCancel={() => setShowStoreForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperadminDashboard;
