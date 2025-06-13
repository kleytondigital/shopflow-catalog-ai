
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, TrendingUp, TrendingDown, RotateCcw, Settings, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { StockMetrics } from '@/hooks/useReports';

interface StockMovementsTableProps {
  stockMetrics: StockMetrics;
  isLoading: boolean;
}

const StockMovementsTable: React.FC<StockMovementsTableProps> = ({ 
  stockMetrics, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package size={20} />
            Movimentações Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Carregando movimentações...
          </div>
        </CardContent>
      </Card>
    );
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'return':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'adjustment':
        return <Settings className="h-4 w-4 text-blue-500" />;
      case 'reservation':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'release':
        return <RotateCcw className="h-4 w-4 text-purple-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMovementLabel = (type: string) => {
    switch (type) {
      case 'sale':
        return 'Venda';
      case 'return':
        return 'Devolução';
      case 'adjustment':
        return 'Ajuste';
      case 'reservation':
        return 'Reserva';
      case 'release':
        return 'Liberação';
      default:
        return type;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'sale':
        return 'bg-red-100 text-red-800';
      case 'return':
        return 'bg-green-100 text-green-800';
      case 'adjustment':
        return 'bg-blue-100 text-blue-800';
      case 'reservation':
        return 'bg-yellow-100 text-yellow-800';
      case 'release':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="card-modern">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package size={20} />
          Movimentações Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {stockMetrics.recentMovements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma movimentação encontrada no período selecionado.
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockMetrics.recentMovements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell className="font-medium">
                      {movement.product_name}
                    </TableCell>
                    <TableCell>
                      <Badge className={getMovementColor(movement.movement_type)}>
                        {getMovementIcon(movement.movement_type)}
                        {getMovementLabel(movement.movement_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={movement.movement_type === 'sale' ? 'text-red-600' : 'text-green-600'}>
                        {movement.movement_type === 'sale' ? '-' : '+'}
                        {movement.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(movement.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockMovementsTable;
