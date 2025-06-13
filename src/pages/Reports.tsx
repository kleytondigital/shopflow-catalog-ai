
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Tag,
  Download, BarChart3, PieChart as PieChartIcon,
  LineChart as LineChartIcon, Package, AlertTriangle, Clock
} from 'lucide-react';
import { useReports } from '@/hooks/useReports';
import StockMovementsTable from '@/components/reports/StockMovementsTable';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Reports = () => {
  const [dateRange, setDateRange] = useState('30d');
  const [reportType, setReportType] = useState('sales');

  const {
    salesMetrics,
    productMetrics,
    stockMetrics,
    salesData,
    categoryDistribution,
    isLoadingSales,
    isLoadingProducts,
    isLoadingStock,
    isLoadingSalesData,
    isLoadingCategories,
    refetchAll
  } = useReports(dateRange);

  const handleExportReport = () => {
    console.log('Exportando relatório...');
    // TODO: Implementar exportação
  };

  const isLoading = isLoadingSales || isLoadingProducts || isLoadingStock;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Relatórios e Análises</h1>
          <p className="text-muted-foreground">Insights detalhados sobre sua loja</p>
        </div>
        <div className="flex gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="1y">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportReport}>
            <Download size={16} className="mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-modern">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSales ? (
              <div className="text-2xl font-bold">Carregando...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  R$ {(salesMetrics?.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {(salesMetrics?.revenueGrowth || 0) > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={(salesMetrics?.revenueGrowth || 0) > 0 ? 'text-green-500' : 'text-red-500'}>
                    {Math.abs(salesMetrics?.revenueGrowth || 0).toFixed(1)}%
                  </span>
                  vs período anterior
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSales ? (
              <div className="text-2xl font-bold">Carregando...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{salesMetrics?.totalOrders || 0}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {(salesMetrics?.ordersGrowth || 0) > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={(salesMetrics?.ordersGrowth || 0) > 0 ? 'text-green-500' : 'text-red-500'}>
                    {Math.abs(salesMetrics?.ordersGrowth || 0).toFixed(1)}%
                  </span>
                  vs período anterior
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingProducts ? (
              <div className="text-2xl font-bold">Carregando...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{productMetrics?.totalProducts || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {productMetrics?.lowStockProducts || 0} com estoque baixo
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSales ? (
              <div className="text-2xl font-bold">Carregando...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  R$ {(salesMetrics?.avgOrderValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Por pedido
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs */}
      <Tabs value={reportType} onValueChange={setReportType} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sales">Vendas</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="stock">Estoque</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon size={20} />
                  Vendas por Período
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingSalesData ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-muted-foreground">Carregando dados...</div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'revenue' ? `R$ ${value}` : value,
                          name === 'revenue' ? 'Receita' : name === 'orders' ? 'Pedidos' : 'Clientes'
                        ]}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Receita" />
                      <Line type="monotone" dataKey="orders" stroke="#82ca9d" name="Pedidos" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Orders Chart */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 size={20} />
                  Pedidos por Período
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingSalesData ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-muted-foreground">Carregando dados...</div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="orders" fill="#8884d8" name="Pedidos" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package size={20} />
                  Produtos Mais Vendidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingProducts ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-muted-foreground">Carregando produtos...</div>
                  </div>
                ) : productMetrics?.topSellingProducts && productMetrics.topSellingProducts.length > 0 ? (
                  <div className="space-y-4">
                    {productMetrics.topSellingProducts.map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">{product.sales} vendas</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-muted-foreground">Nenhuma venda encontrada no período</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stock Alerts */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle size={20} />
                  Alertas de Estoque
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingProducts ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-muted-foreground">Carregando alertas...</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-red-100 text-red-800">Esgotado</Badge>
                        <span>Produtos em falta</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{productMetrics?.outOfStockProducts || 0}</div>
                        <div className="text-sm text-muted-foreground">produtos</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-yellow-100 text-yellow-800">Baixo</Badge>
                        <span>Estoque baixo</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{productMetrics?.lowStockProducts || 0}</div>
                        <div className="text-sm text-muted-foreground">produtos</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-blue-100 text-blue-800">Reservado</Badge>
                        <span>Estoque reservado</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{stockMetrics?.reservedStock || 0}</div>
                        <div className="text-sm text-muted-foreground">unidades</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stock" className="space-y-6">
          <StockMovementsTable 
            stockMetrics={stockMetrics || { totalMovements: 0, reservedStock: 0, recentMovements: [] }}
            isLoading={isLoadingStock}
          />
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon size={20} />
                  Distribuição por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingCategories ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-muted-foreground">Carregando categorias...</div>
                  </div>
                ) : categoryDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-muted-foreground">Nenhuma categoria encontrada</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category List */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle>Categorias por Produtos</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingCategories ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-muted-foreground">Carregando lista...</div>
                  </div>
                ) : categoryDistribution.length > 0 ? (
                  <div className="space-y-4">
                    {categoryDistribution.map((category, index) => (
                      <div key={category.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{category.value}</div>
                          <div className="text-sm text-muted-foreground">produtos</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-muted-foreground">Nenhuma categoria encontrada</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-sm">Conversão de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {salesMetrics?.totalOrders && productMetrics?.totalProducts ? 
                    ((salesMetrics.totalOrders / productMetrics.totalProducts) * 100).toFixed(1) : '0'}%
                </div>
                <p className="text-xs text-muted-foreground">pedidos por produto ativo</p>
              </CardContent>
            </Card>

            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-sm">Produtos Sem Estoque</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{productMetrics?.outOfStockProducts || 0}</div>
                <p className="text-xs text-muted-foreground">produtos esgotados</p>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ 
                      width: `${productMetrics?.totalProducts ? 
                        (productMetrics.outOfStockProducts / productMetrics.totalProducts) * 100 : 0}%` 
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-sm">Movimentações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stockMetrics?.totalMovements || 0}</div>
                <p className="text-xs text-muted-foreground">no período selecionado</p>
                <div className="flex items-center gap-1 text-xs text-green-500 mt-2">
                  <Clock className="h-3 w-3" />
                  {stockMetrics?.reservedStock || 0} reservados
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
