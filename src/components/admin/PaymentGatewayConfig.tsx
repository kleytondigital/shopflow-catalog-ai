
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePaymentGateways, PaymentGateway } from '@/hooks/usePaymentGateways';
import { CreditCard, Key, Shield, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';

const PaymentGatewayConfig = () => {
  const { gateways, activeGateway, loading, updateGateway, testGatewayConnection, hasValidCredentials } = usePaymentGateways();
  const [editingGateway, setEditingGateway] = useState<string | null>(null);
  const [formData, setFormData] = useState<PaymentGateway['config']>({});
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  const handleEdit = (gateway: PaymentGateway) => {
    setEditingGateway(gateway.id);
    setFormData(gateway.config);
  };

  const handleSave = async (gatewayId: string) => {
    await updateGateway(gatewayId, { config: formData });
    setEditingGateway(null);
    setFormData({});
  };

  const handleCancel = () => {
    setEditingGateway(null);
    setFormData({});
  };

  const handleActivate = async (gateway: PaymentGateway) => {
    if (!hasValidCredentials(gateway)) {
      alert('Configure as credenciais antes de ativar o gateway');
      return;
    }
    await updateGateway(gateway.id, { is_active: !gateway.is_active });
  };

  const handleTestConnection = async (gateway: PaymentGateway) => {
    setTestingConnection(gateway.id);
    const result = await testGatewayConnection(gateway);
    
    if (result.success) {
      alert(`✅ ${result.message}`);
    } else {
      alert(`❌ ${result.message}`);
    }
    
    setTestingConnection(null);
  };

  const toggleSecretVisibility = (fieldKey: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey]
    }));
  };

  if (loading) {
    return <div className="text-center py-6">Carregando gateways...</div>;
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Configure apenas um gateway de pagamento ativo por vez. Todas as lojas usarão este gateway para upgrades de plano.
        </AlertDescription>
      </Alert>

      {activeGateway && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>{activeGateway.name.toUpperCase()}</strong> está ativo e processando pagamentos.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {gateways.map((gateway) => (
          <Card key={gateway.id} className={`${gateway.is_active ? 'border-green-500 bg-green-50' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {gateway.name.toUpperCase()}
                </div>
                <div className="flex items-center gap-2">
                  {gateway.is_active && (
                    <Badge variant="default" className="bg-green-100 text-green-700">
                      Ativo
                    </Badge>
                  )}
                  {hasValidCredentials(gateway) && (
                    <Badge variant="outline" className="border-blue-200 text-blue-700">
                      Configurado
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {editingGateway === gateway.id ? (
                <div className="space-y-4">
                  {gateway.name === 'stripe' && (
                    <>
                      <div>
                        <Label htmlFor={`stripe-public-${gateway.id}`}>Public Key</Label>
                        <Input
                          id={`stripe-public-${gateway.id}`}
                          placeholder="pk_test_..."
                          value={formData.public_key || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, public_key: e.target.value }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`stripe-secret-${gateway.id}`}>Secret Key</Label>
                        <div className="relative">
                          <Input
                            id={`stripe-secret-${gateway.id}`}
                            type={showSecrets[`stripe-secret-${gateway.id}`] ? 'text' : 'password'}
                            placeholder="sk_test_..."
                            value={formData.secret_key || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, secret_key: e.target.value }))}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                            onClick={() => toggleSecretVisibility(`stripe-secret-${gateway.id}`)}
                          >
                            {showSecrets[`stripe-secret-${gateway.id}`] ? 
                              <EyeOff className="h-4 w-4" /> : 
                              <Eye className="h-4 w-4" />
                            }
                          </Button>
                        </div>
                      </div>
                    </>
                  )}

                  {gateway.name === 'asaas' && (
                    <>
                      <div>
                        <Label htmlFor={`asaas-api-${gateway.id}`}>API Key</Label>
                        <div className="relative">
                          <Input
                            id={`asaas-api-${gateway.id}`}
                            type={showSecrets[`asaas-api-${gateway.id}`] ? 'text' : 'password'}
                            placeholder="$aact_..."
                            value={formData.api_key || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                            onClick={() => toggleSecretVisibility(`asaas-api-${gateway.id}`)}
                          >
                            {showSecrets[`asaas-api-${gateway.id}`] ? 
                              <EyeOff className="h-4 w-4" /> : 
                              <Eye className="h-4 w-4" />
                            }
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor={`asaas-env-${gateway.id}`}>Ambiente</Label>
                        <select
                          id={`asaas-env-${gateway.id}`}
                          className="w-full p-2 border rounded-md"
                          value={formData.environment || 'sandbox'}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            environment: e.target.value as 'sandbox' | 'production'
                          }))}
                        >
                          <option value="sandbox">Sandbox (Teste)</option>
                          <option value="production">Produção</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={() => handleSave(gateway.id)} size="sm">
                      Salvar
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    {gateway.name === 'stripe' && (
                      <div>
                        <p><strong>Public Key:</strong> {gateway.config.public_key ? '••••••••' : 'Não configurado'}</p>
                        <p><strong>Secret Key:</strong> {gateway.config.secret_key ? '••••••••' : 'Não configurado'}</p>
                      </div>
                    )}
                    
                    {gateway.name === 'asaas' && (
                      <div>
                        <p><strong>API Key:</strong> {gateway.config.api_key ? '••••••••' : 'Não configurado'}</p>
                        <p><strong>Ambiente:</strong> {gateway.config.environment || 'sandbox'}</p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex flex-wrap gap-2">
                    <Button 
                      onClick={() => handleEdit(gateway)} 
                      variant="outline" 
                      size="sm"
                    >
                      <Key className="h-4 w-4 mr-1" />
                      Configurar
                    </Button>
                    
                    {hasValidCredentials(gateway) && (
                      <>
                        <Button
                          onClick={() => handleTestConnection(gateway)}
                          variant="outline"
                          size="sm"
                          disabled={testingConnection === gateway.id}
                        >
                          {testingConnection === gateway.id ? 'Testando...' : 'Testar'}
                        </Button>
                        
                        <Button
                          onClick={() => handleActivate(gateway)}
                          variant={gateway.is_active ? "destructive" : "default"}
                          size="sm"
                        >
                          {gateway.is_active ? 'Desativar' : 'Ativar'}
                        </Button>
                      </>
                    )}
                  </div>

                  {!hasValidCredentials(gateway) && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Configure as credenciais para ativar este gateway.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PaymentGatewayConfig;
