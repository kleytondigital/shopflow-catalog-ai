
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Crown } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface PlanUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PlanUpgradeModal: React.FC<PlanUpgradeModalProps> = ({
  open,
  onOpenChange
}) => {
  const { subscription } = useSubscription();

  const basicFeatures = [
    'Recebimento do pedido via WhatsApp',
    'Pedidos ilimitados sem taxas',
    'Cadastro de produtos ilimitados',
    'Controle de pedidos e clientes',
    '5 fotos por produto',
    'Personalização de cores e logo',
    'Desativação temporária da loja',
    'Controle de estoque',
    'Pagamento via PIX'
  ];

  const premiumFeatures = [
    ...basicFeatures,
    '10 fotos por produto',
    'Recebimento por Cartão e Link de cobrança',
    'Cálculo do valor e prazo de entrega',
    'Conectado com plataformas de pagamento',
    'Criação de cupons de desconto',
    'Cadastro de vendedores e franqueados',
    'Conecte o sistema da sua loja via API',
    'Conecte seu domínio (ex: www.sualoja.com.br)',
    'Login para seu cliente acessar preços e pedidos',
    'Cadastro de descontos por preço ou quantidade',
    'Recuperação de carrinhos abandonados a um clique',
    'Disponibilidade de Agente de IA no seu painel',
    'Atendimento exclusivo e suporte dedicado',
    'Cadastre membros da sua equipe',
    'Seleção de produtos com múltiplas variações',
    'Cadastro de pontos de encontro para excursão'
  ];

  const handleUpgrade = () => {
    // TODO: Implementar integração com MercadoPago
    console.log('Iniciando processo de upgrade...');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            Escolha o Melhor Plano para sua Loja
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Plano Básico */}
          <Card className={`relative ${subscription?.plan.type === 'basic' ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                Plano Básico
              </CardTitle>
              {subscription?.plan.type === 'basic' && (
                <Badge variant="default" className="mx-auto">
                  Plano Atual
                </Badge>
              )}
              <div className="text-3xl font-bold">
                R$ 19,90
                <span className="text-base font-normal text-muted-foreground">/mês</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Ideal para começar sua loja online
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {basicFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Plano Premium */}
          <Card className={`relative ${subscription?.plan.type === 'premium' ? 'ring-2 ring-primary' : 'ring-2 ring-orange-500'}`}>
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-orange-500 text-white">
                Mais Popular
              </Badge>
            </div>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Crown className="h-5 w-5 text-orange-500" />
                Plano Premium
              </CardTitle>
              {subscription?.plan.type === 'premium' && (
                <Badge variant="default" className="mx-auto">
                  Plano Atual
                </Badge>
              )}
              <div className="text-3xl font-bold">
                R$ 49,90
                <span className="text-base font-normal text-muted-foreground">/mês</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Para lojas que querem crescer e vender mais
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 max-h-96 overflow-y-auto">
                {premiumFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className={index >= basicFeatures.length ? 'font-medium text-orange-700' : ''}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              
              {subscription?.plan.type !== 'premium' && (
                <Button 
                  className="w-full mt-4 bg-orange-500 hover:bg-orange-600"
                  onClick={handleUpgrade}
                >
                  Fazer Upgrade Agora
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>
            Todos os planos incluem 7 dias de teste grátis. Cancele a qualquer momento.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
