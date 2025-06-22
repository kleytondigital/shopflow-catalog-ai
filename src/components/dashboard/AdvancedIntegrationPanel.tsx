
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Zap, 
  Link, 
  Settings, 
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Database,
  Smartphone,
  Globe
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'payment' | 'shipping' | 'marketing' | 'analytics' | 'social';
  status: 'connected' | 'disconnected' | 'error';
  isActive: boolean;
  lastSync?: string;
}

const AdvancedIntegrationPanel: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'MercadoPago API',
      description: 'Processamento de pagamentos',
      category: 'payment',
      status: 'connected',
      isActive: true,
      lastSync: '5 min atrás'
    },
    {
      id: '2',
      name: 'Correios API',
      description: 'Cálculo de frete automático',
      category: 'shipping',
      status: 'connected',
      isActive: true,
      lastSync: '1 hora atrás'
    },
    {
      id: '3',
      name: 'Google Analytics',
      description: 'Análise de comportamento',
      category: 'analytics',
      status: 'disconnected',
      isActive: false
    },
    {
      id: '4',
      name: 'Instagram Business',
      description: 'Sincronização de produtos',
      category: 'social',
      status: 'error',
      isActive: false
    },
    {
      id: '5',
      name: 'RD Station',
      description: 'Automação de marketing',
      category: 'marketing',
      status: 'disconnected',
      isActive: false
    }
  ]);

  const toggleIntegration = (id: string) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === id ? { ...integration, isActive: !integration.isActive } : integration
      )
    );
  };

  const getStatusColor = (status: string) => {
    const colors = {
      connected: 'text-green-600 bg-green-100',
      disconnected: 'text-gray-600 bg-gray-100',
      error: 'text-red-600 bg-red-100'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      payment: Database,
      shipping: ExternalLink,
      marketing: Smartphone,
      analytics: Globe,
      social: Link
    };
    const Icon = icons[category as keyof typeof icons] || Link;
    return <Icon className="h-4 w-4" />;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      connected: CheckCircle,
      disconnected: AlertCircle,
      error: AlertCircle
    };
    const Icon = icons[status as keyof typeof icons] || AlertCircle;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Integrações Avançadas
          </div>
          <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-blue-50">
            {integrations.filter(i => i.status === 'connected').length}/{integrations.length} ativas
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 bg-muted rounded-lg">
                {getCategoryIcon(integration.category)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium truncate">{integration.name}</h4>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(integration.status)}`}>
                    {getStatusIcon(integration.status)}
                    {integration.status}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                  {integration.description}
                </p>
                {integration.lastSync && (
                  <p className="text-xs text-muted-foreground">
                    Última sincronização: {integration.lastSync}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={integration.isActive}
                onCheckedChange={() => toggleIntegration(integration.id)}
                disabled={integration.status !== 'connected'}
              />
              <Button size="sm" variant="ghost">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        <div className="pt-3 border-t grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm">
            <Link className="h-4 w-4 mr-2" />
            Nova Integração
          </Button>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Marketplace
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedIntegrationPanel;
