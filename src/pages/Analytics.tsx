import React, { useState } from "react";
import {
  BarChart,
  TrendingUp,
  Users,
  DollarSign,
  ShoppingCart,
  Eye,
  Calendar,
  Download,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SimpleChart } from "@/components/analytics/SimpleChart";
import { DataExporter } from "@/components/analytics/DataExporter";
import { NotificationsPanel } from "@/components/analytics/NotificationsPanel";
import { useRealtimeAnalytics } from "@/hooks/useRealtimeAnalytics";
import { useAnalyticsTracking } from "@/hooks/useAnalyticsTracking";

const Analytics = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("30d");

  // Analytics do Superadmin - ver dados de TODAS as lojas
  // Para lojista, seria necessário passar o storeId específico
  const storeId = undefined; // Superadmin vê todos os dados

  const {
    metrics,
    topStores,
    monthlyGrowth,
    recentActivity,
    loading,
    error,
    refetch,
    formatCurrency,
  } = useAnalytics(timeRange, storeId);

  // Hooks para funcionalidades avançadas
  const { realtimeData, isConnected } = useRealtimeAnalytics(storeId);
  const { trackPageView } = useAnalyticsTracking();

  // Rastrear visualização da página
  React.useEffect(() => {
    trackPageView({
      pagePath: "/analytics",
      pageTitle: "Analytics Dashboard",
    });
  }, [trackPageView]);

  const handleRefresh = () => {
    refetch();
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">
            Métricas e insights do sistema VendeMais
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="1y">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Atualizar
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                    </div>
                    <div className="p-3 bg-gray-200 rounded-lg animate-pulse">
                      <div className="w-6 h-6"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          : metrics
          ? [
              {
                title: "Receita Total",
                value: formatCurrency(metrics.totalRevenue),
                change: `${
                  metrics.revenueChange >= 0 ? "+" : ""
                }${metrics.revenueChange.toFixed(1)}%`,
                changeType:
                  metrics.revenueChange >= 0 ? "positive" : "negative",
                icon: DollarSign,
                description: "vs período anterior",
              },
              {
                title: "Novos Usuários",
                value: metrics.totalUsers.toLocaleString(),
                change: `${
                  metrics.usersChange >= 0 ? "+" : ""
                }${metrics.usersChange.toFixed(1)}%`,
                changeType: metrics.usersChange >= 0 ? "positive" : "negative",
                icon: Users,
                description: "vs período anterior",
              },
              {
                title: "Pedidos",
                value: metrics.totalOrders.toLocaleString(),
                change: `${
                  metrics.ordersChange >= 0 ? "+" : ""
                }${metrics.ordersChange.toFixed(1)}%`,
                changeType: metrics.ordersChange >= 0 ? "positive" : "negative",
                icon: ShoppingCart,
                description: "vs período anterior",
              },
              {
                title: "Visualizações",
                value: metrics.totalViews.toLocaleString(),
                change: `${
                  metrics.viewsChange >= 0 ? "+" : ""
                }${metrics.viewsChange.toFixed(1)}%`,
                changeType: metrics.viewsChange >= 0 ? "positive" : "negative",
                icon: Eye,
                description: "vs período anterior",
              },
            ].map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {metric.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {metric.value}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge
                          variant={
                            metric.changeType === "positive"
                              ? "default"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          {metric.change}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {metric.description}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <metric.icon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          : null}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="revenue">Receita</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="activity">Atividade</TabsTrigger>
          <TabsTrigger value="export">Exportar</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  Top Lojas por Receita
                </CardTitle>
                <CardDescription>
                  Lojas com maior faturamento no período
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                          <div className="space-y-1">
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-12"></div>
                        </div>
                      </div>
                    ))
                  ) : topStores.length > 0 ? (
                    topStores.map((store, index) => (
                      <div
                        key={store.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {store.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {store.orders} pedidos
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(store.revenue)}
                          </p>
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            {store.growth >= 0 ? "+" : ""}
                            {store.growth.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Nenhuma loja encontrada no período selecionado
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Crescimento Mensal
                </CardTitle>
                <CardDescription>
                  Evolução da receita nos últimos meses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2 animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                        </div>
                      </div>
                    ))
                  ) : monthlyGrowth.length > 0 ? (
                    monthlyGrowth.map((month, index) => {
                      const maxRevenue = Math.max(
                        ...monthlyGrowth.map((m) => m.revenue)
                      );
                      const percentage =
                        maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm text-gray-600">
                            {month.month}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">
                              {formatCurrency(month.revenue)}
                            </span>
                            {month.percentage !== 0 && (
                              <span
                                className={`text-xs ${
                                  month.percentage >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {month.percentage >= 0 ? "+" : ""}
                                {month.percentage.toFixed(1)}%
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Nenhum dado de crescimento encontrado
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Receita</CardTitle>
              <CardDescription>
                Detalhamento da receita por período
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
                    <p className="text-gray-500">
                      Carregando dados de receita...
                    </p>
                  </div>
                </div>
              ) : monthlyGrowth.length > 0 ? (
                <div className="space-y-4">
                  <SimpleChart
                    data={monthlyGrowth.map((month) => ({
                      label: month.month.split(" ")[0], // Apenas o mês
                      value: month.revenue,
                      color: "#10B981",
                    }))}
                    type="bar"
                    height={200}
                    showValues={true}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(
                          monthlyGrowth.reduce(
                            (sum, month) => sum + month.revenue,
                            0
                          )
                        )}
                      </p>
                      <p className="text-sm text-green-700">Receita Total</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {monthlyGrowth.length}
                      </p>
                      <p className="text-sm text-blue-700">Meses Analisados</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        {monthlyGrowth.length > 0
                          ? formatCurrency(
                              monthlyGrowth.reduce(
                                (sum, month) => sum + month.revenue,
                                0
                              ) / monthlyGrowth.length
                            )
                          : "R$ 0,00"}
                      </p>
                      <p className="text-sm text-purple-700">Média Mensal</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">
                      Nenhum dado de receita encontrado
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Usuários</CardTitle>
              <CardDescription>
                Crescimento e comportamento dos usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
                    <p className="text-gray-500">
                      Carregando dados de usuários...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        Estatísticas de Usuários
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                          <span className="text-sm font-medium">
                            Total de Usuários
                          </span>
                          <span className="text-xl font-bold text-blue-600">
                            {metrics?.totalUsers.toLocaleString() || 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <span className="text-sm font-medium">
                            Crescimento
                          </span>
                          <span
                            className={`text-lg font-bold ${
                              metrics?.usersChange >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {metrics?.usersChange >= 0 ? "+" : ""}
                            {metrics?.usersChange.toFixed(1) || 0}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                          <span className="text-sm font-medium">Período</span>
                          <span className="text-sm text-gray-600">
                            {timeRange === "7d"
                              ? "7 dias"
                              : timeRange === "30d"
                              ? "30 dias"
                              : timeRange === "90d"
                              ? "90 dias"
                              : "1 ano"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        Comparação com Período Anterior
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium">
                            Usuários Atuais
                          </span>
                          <span className="text-lg font-bold">
                            {metrics?.totalUsers.toLocaleString() || 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium">Variação</span>
                          <span
                            className={`text-lg font-bold ${
                              metrics?.usersChange >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {metrics?.usersChange >= 0 ? "+" : ""}
                            {metrics?.usersChange.toFixed(1) || 0}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium">Status</span>
                          <span
                            className={`text-sm font-medium ${
                              metrics?.usersChange >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {metrics?.usersChange >= 0
                              ? "Crescimento"
                              : "Declínio"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {monthlyGrowth.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        Crescimento Mensal de Usuários
                      </h3>
                      <SimpleChart
                        data={monthlyGrowth.map((_, index) => ({
                          label: `Mês ${index + 1}`,
                          value: Math.floor(Math.random() * 100) + 50, // Simulado por enquanto
                          color: "#8B5CF6",
                        }))}
                        type="line"
                        height={150}
                        showValues={false}
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>Últimas atividades no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                      </div>
                    </div>
                  ))
                ) : recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="text-2xl">{activity.icon}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma atividade recente encontrada
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DataExporter timeRange={timeRange} />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Status da Conexão
                </CardTitle>
                <CardDescription>Monitoramento em tempo real</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Conexão WebSocket
                    </span>
                    <Badge variant={isConnected ? "default" : "destructive"}>
                      {isConnected ? "Conectado" : "Desconectado"}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Pedidos (24h):</span>
                      <span className="font-medium">{realtimeData.orders}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Receita (24h):</span>
                      <span className="font-medium">
                        {formatCurrency(realtimeData.revenue)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Visualizações (24h):</span>
                      <span className="font-medium">{realtimeData.views}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Última atualização:</span>
                      <span>
                        {realtimeData.lastUpdate.toLocaleTimeString("pt-BR")}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
