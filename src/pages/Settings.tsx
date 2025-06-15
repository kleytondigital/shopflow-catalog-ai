
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Store, 
  CreditCard, 
  Truck, 
  MessageSquare, 
  Settings as SettingsIcon,
  Bot,
  Bell,
  Shield,
  ShoppingBag,
  Package,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import StoreInfoSettings from '@/components/settings/StoreInfoSettings';
import ProtectedPaymentSettings from '@/components/settings/ProtectedPaymentSettings';
import ProtectedShippingSettings from '@/components/settings/ProtectedShippingSettings';
import ProtectedDeliverySettings from '@/components/settings/ProtectedDeliverySettings';
import ProtectedWhatsAppSettings from '@/components/settings/ProtectedWhatsAppSettings';
import ProtectedAutomationSettings from '@/components/settings/ProtectedAutomationSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import CatalogSettings from '@/components/settings/CatalogSettings';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('store');
  const navigate = useNavigate();
  const { hasBenefit, isSuperadmin } = usePlanPermissions();

  const breadcrumbs = [
    { href: '/', label: 'Dashboard' },
    { label: 'Configurações', current: true },
  ];

  const tabs = [
    {
      id: 'store',
      label: 'Dados da Loja',
      icon: Store,
      component: StoreInfoSettings,
      isPremium: false
    },
    {
      id: 'catalog',
      label: 'Catálogos',
      icon: ShoppingBag,
      component: CatalogSettings,
      isPremium: false
    },
    {
      id: 'payments',
      label: 'Pagamentos',
      icon: CreditCard,
      component: ProtectedPaymentSettings,
      isPremium: true,
      benefitKey: 'payment_credit_card'
    },
    {
      id: 'shipping',
      label: 'Envios',
      icon: Truck,
      component: ProtectedShippingSettings,
      isPremium: true,
      benefitKey: 'shipping_calculator'
    },
    {
      id: 'delivery',
      label: 'Entregas',
      icon: Package,
      component: ProtectedDeliverySettings,
      isPremium: true,
      benefitKey: 'shipping_calculator'
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageSquare,
      component: ProtectedWhatsAppSettings,
      isPremium: true,
      benefitKey: 'whatsapp_integration'
    },
    {
      id: 'automation',
      label: 'Automações',
      icon: Bot,
      component: ProtectedAutomationSettings,
      isPremium: true,
      benefitKey: 'api_access'
    },
    {
      id: 'notifications',
      label: 'Notificações',
      icon: Bell,
      component: NotificationSettings,
      isPremium: false
    },
    {
      id: 'security',
      label: 'Segurança',
      icon: Shield,
      component: SecuritySettings,
      isPremium: false
    }
  ];

  const handleTabChange = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    
    if (tab?.isPremium && !isSuperadmin && !hasBenefit(tab.benefitKey!)) {
      // Tab premium bloqueada - não permite mudar
      return;
    }
    
    setActiveTab(tabId);
  };

  return (
    <AppLayout 
      title="Configurações da Loja" 
      subtitle="Gerencie todas as configurações do seu catálogo e loja"
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <Button className="btn-primary">
            <SettingsIcon className="mr-2 h-5 w-5" />
            Salvar Todas as Configurações
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9 gap-2 h-auto p-2 bg-white rounded-xl shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isBlocked = tab.isPremium && !isSuperadmin && !hasBenefit(tab.benefitKey!);
              
              return (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  disabled={isBlocked}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white relative ${
                    isBlocked ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="relative">
                    <Icon size={20} />
                    {isBlocked && (
                      <Lock className="h-3 w-3 absolute -top-1 -right-1 text-orange-500" />
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs font-medium">{tab.label}</span>
                    {tab.isPremium && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${isBlocked ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}
                      >
                        Premium
                      </Badge>
                    )}
                  </div>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {tabs.map((tab) => {
            const Component = tab.component;
            return (
              <TabsContent key={tab.id} value={tab.id} className="space-y-6">
                <Card className="card-modern">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <tab.icon className="h-6 w-6 text-blue-600" />
                      Configurações de {tab.label}
                      {tab.isPremium && (
                        <Badge variant="outline" className="ml-2">
                          Premium
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Component />
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Settings;
