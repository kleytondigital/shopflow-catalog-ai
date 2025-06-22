
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Bell, 
  Workflow, 
  Settings,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  type: 'stock' | 'sales' | 'customer' | 'marketing';
  isActive: boolean;
  lastTriggered?: string;
}

const SmartAutomationHub: React.FC = () => {
  const [automations, setAutomations] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'Alerta Estoque Baixo',
      description: 'Notificar quando estoque < 5 unidades',
      type: 'stock',
      isActive: true,
      lastTriggered: '2 horas atrás'
    },
    {
      id: '2',
      name: 'Carrinho Abandonado',
      description: 'Enviar WhatsApp após 1h de abandono',
      type: 'marketing',
      isActive: false
    },
    {
      id: '3',
      name: 'Desconto Automático',
      description: 'Aplicar 10% após 3 compras',
      type: 'customer',
      isActive: true
    },
    {
      id: '4',
      name: 'Relatório Diário',
      description: 'Enviar resumo às 18h',
      type: 'sales',
      isActive: true,
      lastTriggered: 'ontem'
    }
  ]);

  const toggleAutomation = (id: string) => {
    setAutomations(prev => 
      prev.map(auto => 
        auto.id === id ? { ...auto, isActive: !auto.isActive } : auto
      )
    );
  };

  const getTypeColor = (type: string) => {
    const colors = {
      stock: 'bg-blue-100 text-blue-700',
      sales: 'bg-green-100 text-green-700',
      customer: 'bg-purple-100 text-purple-700',
      marketing: 'bg-orange-100 text-orange-700'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      stock: CheckCircle,
      sales: Zap,
      customer: Bell,
      marketing: Workflow
    };
    const Icon = icons[type as keyof typeof icons] || Settings;
    return <Icon className="h-3 w-3" />;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Automações Inteligentes
          </div>
          <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-purple-50">
            {automations.filter(a => a.isActive).length} ativas
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {automations.map((automation) => (
          <div
            key={automation.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start gap-3 flex-1">
              <div className={`p-1.5 rounded-full ${getTypeColor(automation.type)}`}>
                {getTypeIcon(automation.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium truncate">{automation.name}</h4>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getTypeColor(automation.type)} border-current`}
                  >
                    {automation.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                  {automation.description}
                </p>
                {automation.lastTriggered && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Último: {automation.lastTriggered}
                  </div>
                )}
              </div>
            </div>
            <Switch
              checked={automation.isActive}
              onCheckedChange={() => toggleAutomation(automation.id)}
            />
          </div>
        ))}

        <div className="pt-3 border-t">
          <Button variant="outline" size="sm" className="w-full">
            <Settings className="h-4 w-4 mr-2" />
            Configurar Automações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartAutomationHub;
