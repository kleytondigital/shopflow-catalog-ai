
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Settings, 
  Eye, 
  BarChart3, 
  Tag, 
  Truck,
  ExternalLink,
  Lock,
  Share2,
  Copy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { useStores } from '@/hooks/useStores';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface QuickActionsProps {
  onNewProduct: () => void;
}

const QuickActions = ({ onNewProduct }: QuickActionsProps) => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { hasBenefit, isSuperadmin } = usePlanPermissions();
  const { currentStore } = useStores();

  const handleViewCatalog = () => {
    if (!currentStore) {
      toast.error('Loja não encontrada');
      return;
    }

    const storeIdentifier = currentStore.url_slug || currentStore.id;
    const catalogUrl = `/catalog/${storeIdentifier}`;
    
    console.log('QuickActions: Abrindo catálogo:', { 
      storeId: currentStore.id, 
      urlSlug: currentStore.url_slug, 
      finalIdentifier: storeIdentifier, 
      catalogUrl 
    });
    
    window.open(catalogUrl, '_blank');
  };

  const handleShareCatalog = async () => {
    if (!currentStore) {
      toast.error('Loja não encontrada');
      return;
    }

    const storeIdentifier = currentStore.url_slug || currentStore.id;
    const catalogUrl = `${window.location.origin}/catalog/${storeIdentifier}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Catálogo - ${currentStore.name}`,
          text: `Confira nosso catálogo online!`,
          url: catalogUrl
        });
      } else {
        await navigator.clipboard.writeText(catalogUrl);
        toast.success('Link do catálogo copiado!');
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      // Fallback para clipboard
      try {
        await navigator.clipboard.writeText(catalogUrl);
        toast.success('Link do catálogo copiado!');
      } catch (clipboardError) {
        toast.error('Erro ao copiar link');
      }
    }
  };

  const actions = [
    {
      title: 'Produto',
      description: 'Adicionar novo',
      icon: Plus,
      color: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
      onClick: onNewProduct,
      requiresBenefit: null
    },
    {
      title: 'Visualizar',
      description: 'Ver catálogo',
      icon: Eye,
      color: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100',
      onClick: handleViewCatalog,
      requiresBenefit: null
    },
    {
      title: 'Compartilhar',
      description: 'Link catálogo',
      icon: Share2,
      color: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100',
      onClick: handleShareCatalog,
      requiresBenefit: null
    },
    {
      title: 'Configurar',
      description: 'Ajustar loja',
      icon: Settings,
      color: 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100',
      onClick: () => navigate('/settings'),
      requiresBenefit: null
    },
    {
      title: 'Relatórios',
      description: 'Ver métricas',
      icon: BarChart3,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100',
      onClick: () => navigate('/reports'),
      requiresBenefit: 'dedicated_support'
    },
    {
      title: 'Cupons',
      description: 'Descontos',
      icon: Tag,
      color: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100',
      onClick: () => navigate('/coupons'),
      requiresBenefit: 'discount_coupons'
    },
    {
      title: 'Entrega',
      description: 'Frete',
      icon: Truck,
      color: 'bg-teal-50 text-teal-600 border-teal-200 hover:bg-teal-100',
      onClick: () => navigate('/deliveries'),
      requiresBenefit: 'shipping_calculator'
    }
  ];

  const handleActionClick = (action: typeof actions[0]) => {
    if (action.requiresBenefit && !isSuperadmin && !hasBenefit(action.requiresBenefit)) {
      toast.error(`Esta funcionalidade está disponível apenas no plano Premium. Faça upgrade para ter acesso!`);
      return;
    }
    action.onClick();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ExternalLink className="h-5 w-5" />
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
          {actions.map((action) => {
            const isBlocked = action.requiresBenefit && !isSuperadmin && !hasBenefit(action.requiresBenefit);
            
            return (
              <Button
                key={action.title}
                variant="outline"
                className={`h-auto p-3 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-all relative border-2 ${action.color} ${
                  isBlocked ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105'
                } min-h-[80px]`}
                onClick={() => handleActionClick(action)}
              >
                <div className="flex items-center justify-center relative">
                  <action.icon className="h-5 w-5 flex-shrink-0" />
                  {isBlocked && (
                    <Lock className="h-3 w-3 absolute -top-1 -right-1 text-orange-500 bg-white rounded-full" />
                  )}
                </div>
                <div className="text-center min-h-[32px] flex flex-col justify-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <p className="text-xs font-semibold leading-tight truncate max-w-full">{action.title}</p>
                    {isBlocked && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-orange-50 text-orange-700 border-orange-200 ml-1">
                        Pro
                      </Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight truncate max-w-full">{action.description}</p>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
