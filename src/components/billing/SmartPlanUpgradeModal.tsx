
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePaymentGateways } from '@/hooks/usePaymentGateways';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, DollarSign, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { SubscriptionPlan } from '@/hooks/useSubscriptionPlans';

interface SmartPlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: SubscriptionPlan | null;
  currentPlan?: SubscriptionPlan | null;
}

const SmartPlanUpgradeModal: React.FC<SmartPlanUpgradeModalProps> = ({
  isOpen,
  onClose,
  selectedPlan,
  currentPlan
}) => {
  const { activeGateway, loading: gatewayLoading } = usePaymentGateways();
  const { profile } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    if (!selectedPlan || !profile?.store_id || !activeGateway) {
      setError('Dados insuficientes para processar upgrade');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      if (activeGateway.name === 'stripe') {
        // Processar com Stripe
        const { data, error } = await supabase.functions.invoke('create-stripe-payment', {
          body: {
            store_id: profile.store_id,
            plan_id: selectedPlan.id,
            success_url: `${window.location.origin}/billing?upgrade=success`,
            cancel_url: `${window.location.origin}/billing?upgrade=cancelled`
          }
        });

        if (error) throw error;

        if (data.checkout_url) {
          window.location.href = data.checkout_url;
        }

      } else if (activeGateway.name === 'asaas') {
        // Processar com Asaas
        const { data, error } = await supabase.functions.invoke('create-asaas-payment', {
          body: {
            store_id: profile.store_id,
            plan_id: selectedPlan.id,
            customer_data: {
              name: profile.full_name,
              email: profile.email
            }
          }
        });

        if (error) throw error;

        if (data.invoice_url) {
          window.open(data.invoice_url, '_blank');
          onClose();
        }
      }

    } catch (err) {
      console.error('Erro no upgrade:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar upgrade');
    } finally {
      setProcessing(false);
    }
  };

  if (!selectedPlan) return null;

  const isUpgrade = currentPlan && selectedPlan.price_monthly > currentPlan.price_monthly;
  const savings = selectedPlan.price_yearly 
    ? (selectedPlan.price_monthly * 12) - selectedPlan.price_yearly 
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {isUpgrade ? 'Upgrade de Plano' : 'Ativar Plano'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Plano Selecionado */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{selectedPlan.name}</CardTitle>
              {selectedPlan.description && (
                <p className="text-sm text-gray-600">{selectedPlan.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">R$ {selectedPlan.price_monthly.toFixed(2)}</span>
                <span className="text-gray-600">/mês</span>
              </div>
              
              {selectedPlan.price_yearly && savings > 0 && (
                <div className="mt-2 p-2 bg-green-50 rounded border">
                  <div className="text-sm text-green-700">
                    <strong>Plano Anual:</strong> R$ {selectedPlan.price_yearly.toFixed(2)}
                  </div>
                  <div className="text-xs text-green-600">
                    Economize R$ {savings.toFixed(2)} por ano
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status do Gateway */}
          {gatewayLoading ? (
            <div className="text-center py-4">
              <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              <p className="text-sm text-gray-600 mt-2">Verificando gateway de pagamento...</p>
            </div>
          ) : activeGateway ? (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Pagamentos processados via <strong>{activeGateway.name.toUpperCase()}</strong>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Nenhum gateway de pagamento está configurado. Entre em contato com o suporte.
              </AlertDescription>
            </Alert>
          )}

          {/* Trial Information */}
          {selectedPlan.trial_days > 0 && (
            <Alert>
              <AlertDescription>
                <strong>Trial Gratuito:</strong> {selectedPlan.trial_days} dias de teste grátis.
                A cobrança só começará após o período de trial.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleUpgrade}
              disabled={processing || !activeGateway || gatewayLoading}
              className="flex-1"
              size="lg"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  {isUpgrade ? 'Fazer Upgrade' : 'Ativar Plano'}
                </>
              )}
            </Button>
            
            <Button
              onClick={onClose}
              variant="outline"
              disabled={processing}
            >
              Cancelar
            </Button>
          </div>

          {/* Gateway Info */}
          {activeGateway && (
            <div className="text-xs text-gray-500 text-center">
              Processamento seguro via {activeGateway.name.toUpperCase()}
              {activeGateway.config.environment === 'sandbox' && (
                <Badge variant="outline" className="ml-2 border-yellow-500 text-yellow-700">
                  TESTE
                </Badge>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SmartPlanUpgradeModal;
