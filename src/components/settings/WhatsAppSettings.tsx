import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Phone, Bot } from 'lucide-react';
import { WhatsAppIntegration } from '@/components/settings/WhatsAppIntegration';
import { Badge } from '@/components/ui/badge';

const WhatsAppSettings = () => {
  return (
    <div className="space-y-6">
      {/* Integração WhatsApp Automática */}
      <WhatsAppIntegration />
      
      <Separator />

      {/* Aviso sobre diferença: */}
      <Card className="bg-yellow-50 border-yellow-300">
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-green-600" />
              Atenção: diferença entre WhatsApp Básico e Integração Premium
              <Badge className="ml-2 bg-green-200 text-green-800 border-green-300">Básico</Badge>
              <Badge className="ml-2 bg-blue-200 text-blue-800 border-blue-300">Premium</Badge>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div>
            <span className="font-bold text-green-700">Plano Básico:</span>{" "}
            O checkout via WhatsApp usará o <strong>telefone cadastrado nos Dados da Loja</strong> para receber pedidos dos clientes.
          </div>
          <div>
            <span className="font-bold text-blue-700">Integração Premium:</span>{" "}
            Ative a integração automática para notificações e automações pelo WhatsApp. O número usado será o configurado da integração, as notificações de status e automações (recuperação de carrinho, etc) <strong>só funcionam nesta modalidade.</strong>
          </div>
        </CardContent>
      </Card>

      {/* Configurações manuais (legacy) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Configurações Manuais do WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="whatsapp_number">Número do WhatsApp</Label>
            <Input
              id="whatsapp_number"
              placeholder="(11) 99999-9999"
              type="tel"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Integração Manual Ativa</Label>
              <p className="text-sm text-muted-foreground">
                Ativar redirecionamento manual para WhatsApp
              </p>
            </div>
            <Switch />
          </div>

          <div className="pt-4">
            <Button>Salvar Configurações</Button>
          </div>
        </CardContent>
      </Card>

      {/* Informações sobre tipos de integração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Tipos de Integração WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-green-600 mb-2">🤖 Integração Automática</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Notificações automáticas de pedidos</li>
                <li>• QR Code para conexão</li>
                <li>• Mensagens personalizadas</li>
                <li>• Status em tempo real</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-blue-600 mb-2">📱 Integração Manual</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Redirecionamento para WhatsApp</li>
                <li>• Número fixo configurado</li>
                <li>• Mensagem básica de pedido</li>
                <li>• Processo manual</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppSettings;
