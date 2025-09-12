import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
} from "lucide-react";

const Revenue = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Receitas</h1>
          <p className="text-muted-foreground">
            Acompanhe o desempenho financeiro do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtrar
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Receita Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 125.430</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                +15.2% vs mês anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Receita Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 45.230</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                +8.5% vs mês anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Receita Diária
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 1.508</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingDown className="h-3 w-3 text-red-600" />
                -2.1% vs ontem
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Ticket Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 89,50</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                +5.3% vs mês anterior
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Receita por Plano</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">Plano Premium</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">R$ 65.780</div>
                    <div className="text-xs text-muted-foreground">
                      58% do total
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Plano Básico</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">R$ 35.640</div>
                    <div className="text-xs text-muted-foreground">
                      32% do total
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm font-medium">
                      Plano Enterprise
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">R$ 24.010</div>
                    <div className="text-xs text-muted-foreground">
                      10% do total
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Lojas por Receita</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Loja Central</div>
                    <div className="text-sm text-muted-foreground">
                      São Paulo, SP
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">R$ 18.450</div>
                    <Badge variant="default">1º lugar</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Loja Online</div>
                    <div className="text-sm text-muted-foreground">
                      E-commerce
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">R$ 15.230</div>
                    <Badge variant="secondary">2º lugar</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Loja Filial Norte</div>
                    <div className="text-sm text-muted-foreground">
                      Rio de Janeiro, RJ
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">R$ 11.550</div>
                    <Badge variant="outline">3º lugar</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Histórico de Receitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-semibold">Janeiro 2024</div>
                  <div className="text-sm text-muted-foreground">
                    45.230 vendas
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">R$ 45.230</div>
                  <div className="text-sm text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +8.5%
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-semibold">Dezembro 2023</div>
                  <div className="text-sm text-muted-foreground">
                    41.680 vendas
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">R$ 41.680</div>
                  <div className="text-sm text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +12.3%
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-semibold">Novembro 2023</div>
                  <div className="text-sm text-muted-foreground">
                    37.120 vendas
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">R$ 37.120</div>
                  <div className="text-sm text-red-600 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    -2.1%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Revenue;

