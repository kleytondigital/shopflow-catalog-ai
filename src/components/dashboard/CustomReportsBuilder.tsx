
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Download,
  Plus,
  Eye,
  Calendar,
  Filter
} from 'lucide-react';

interface CustomReport {
  id: string;
  name: string;
  type: 'sales' | 'products' | 'customers' | 'inventory';
  chartType: 'bar' | 'line' | 'pie' | 'table';
  frequency: 'daily' | 'weekly' | 'monthly';
  lastGenerated: string;
  status: 'active' | 'draft';
}

const CustomReportsBuilder: React.FC = () => {
  const [reports, setReports] = useState<CustomReport[]>([
    {
      id: '1',
      name: 'Vendas por Categoria',
      type: 'sales',
      chartType: 'pie',
      frequency: 'weekly',
      lastGenerated: '2 dias atrás',
      status: 'active'
    },
    {
      id: '2',
      name: 'Top 10 Produtos',
      type: 'products',
      chartType: 'bar',
      frequency: 'monthly',
      lastGenerated: '1 semana atrás',
      status: 'active'
    },
    {
      id: '3',
      name: 'Evolução de Clientes',
      type: 'customers',
      chartType: 'line',
      frequency: 'daily',
      lastGenerated: 'ontem',
      status: 'draft'
    }
  ]);

  const getTypeColor = (type: string) => {
    const colors = {
      sales: 'bg-green-100 text-green-700 border-green-200',
      products: 'bg-blue-100 text-blue-700 border-blue-200',
      customers: 'bg-purple-100 text-purple-700 border-purple-200',
      inventory: 'bg-orange-100 text-orange-700 border-orange-200'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getChartIcon = (chartType: string) => {
    const icons = {
      bar: BarChart3,
      line: TrendingUp,
      pie: PieChart,
      table: Filter
    };
    const Icon = icons[chartType as keyof typeof icons] || BarChart3;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Relatórios Personalizados
          </div>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Novo
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {reports.map((report) => (
          <div
            key={report.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 bg-muted rounded-lg">
                {getChartIcon(report.chartType)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium truncate">{report.name}</h4>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getTypeColor(report.type)}`}
                  >
                    {report.type}
                  </Badge>
                  <Badge 
                    variant={report.status === 'active' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {report.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {report.frequency}
                  </div>
                  <span>•</span>
                  <span>Gerado {report.lastGenerated}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost">
                <Eye className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        <div className="pt-3 border-t grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Agendar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomReportsBuilder;
