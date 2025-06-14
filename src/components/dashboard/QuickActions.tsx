
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Settings, 
  Eye, 
  BarChart3, 
  Tag, 
  Package,
  ExternalLink,
  Palette,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface QuickActionsProps {
  onNewProduct: () => void;
}

const QuickActions = ({ onNewProduct }: QuickActionsProps) => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const actions = [
    {
      title: 'Novo Produto',
      description: 'Adicionar produto ao catálogo',
      icon: Plus,
      color: 'bg-blue-100 text-blue-600',
      onClick: onNewProduct
    },
    {
      title: 'Ver Catálogo',
      description: 'Visualizar como cliente',
      icon: Eye,
      color: 'bg-green-100 text-green-600',
      onClick: () => {
        if (profile?.store_id) {
          window.open(`/catalog/${profile.store_id}`, '_blank');
        }
      }
    },
    {
      title: 'Configurações',
      description: 'Ajustes da loja',
      icon: Settings,
      color: 'bg-gray-100 text-gray-600',
      onClick: () => navigate('/settings')
    },
    {
      title: 'Relatórios',
      description: 'Análises e métricas',
      icon: BarChart3,
      color: 'bg-purple-100 text-purple-600',
      onClick: () => navigate('/reports')
    },
    {
      title: 'Cupons',
      description: 'Gerenciar descontos',
      icon: Tag,
      color: 'bg-orange-100 text-orange-600',
      onClick: () => navigate('/coupons')
    },
    {
      title: 'Categorias',
      description: 'Organizar produtos',
      icon: Package,
      color: 'bg-indigo-100 text-indigo-600',
      onClick: () => navigate('/categories')
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5" />
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant="outline"
              className="h-auto p-3 flex flex-col items-center gap-2 hover:shadow-md transition-all"
              onClick={action.onClick}
            >
              <div className={`p-2 rounded-lg ${action.color}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">{action.title}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
