
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  LayoutGrid,
  Table,
  Download,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OrdersHeaderProps {
  totalOrders: number;
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
  onRefresh: () => void;
  onExport: () => void;
  isLoading: boolean;
}

const OrdersHeader: React.FC<OrdersHeaderProps> = ({
  totalOrders,
  viewMode,
  onViewModeChange,
  onRefresh,
  onExport,
  isLoading
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {/* Navegação */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Button>
        <span className="text-gray-400">/</span>
        <span className="font-medium text-gray-900">Pedidos</span>
      </div>

      {/* Header Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Gerencie todos os pedidos da sua loja</span>
            <Badge variant="secondary">
              {totalOrders} pedido{totalOrders !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Controles de Visualização */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('table')}
              className="h-8 px-3"
            >
              <Table className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="h-8 px-3"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>

          {/* Ações */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrdersHeader;
