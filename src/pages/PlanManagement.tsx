
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { Crown, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import SubscriptionPlansManager from "@/components/admin/SubscriptionPlansManager";
import { SystemBenefitsManager } from "@/components/admin/SystemBenefitsManager";
import { PlanBenefitsSelector } from "@/components/admin/PlanBenefitsSelector";
import PaymentGatewayConfig from "@/components/admin/PaymentGatewayConfig";
import PlanPaymentsTable from "@/components/admin/PlanPaymentsTable";
import SubscriptionManagement from "@/components/admin/SubscriptionManagement";
import ResponsiveAppLayout from "@/components/layout/ResponsiveAppLayout";

const PlanManagement = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("subscriptions");
  const [plans] = useState([
    {
      id: "1",
      name: "Básico",
      description: "Plano básico para lojas pequenas",
      price_monthly: 29.9,
      type: "basic",
      is_active: true,
    },
    {
      id: "2",
      name: "Premium",
      description: "Plano premium com recursos avançados",
      price_monthly: 59.9,
      type: "premium",
      is_active: true,
    },
  ]);

  if (profile?.role !== "superadmin") {
    return (
      <ResponsiveAppLayout title="Acesso Negado">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Acesso Negado
            </h2>
            <p className="text-gray-600">
              Você não tem permissão para acessar esta página.
            </p>
          </div>
        </div>
      </ResponsiveAppLayout>
    );
  }

  const breadcrumbs = [
    { href: "/", label: "Dashboard" },
    { label: "Gestão de Planos e Benefícios", current: true },
  ];

  return (
    <ResponsiveAppLayout
      title="Gestão de Planos e Benefícios"
      subtitle="Configure planos, gateways de pagamento e monitore financeiro do sistema"
      breadcrumbs={breadcrumbs}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
          <TabsTrigger value="plans">Planos</TabsTrigger>
          <TabsTrigger value="benefits">Benefícios</TabsTrigger>
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="gateways">Gateways</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="mt-6">
          <SubscriptionManagement />
        </TabsContent>

        <TabsContent value="plans" className="mt-6">
          <SubscriptionPlansManager />
        </TabsContent>

        <TabsContent value="benefits" className="mt-6">
          <SystemBenefitsManager />
        </TabsContent>

        <TabsContent value="config" className="mt-6">
          <PlanBenefitsSelector />
        </TabsContent>

        <TabsContent value="gateways" className="mt-6">
          <PaymentGatewayConfig />
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <PlanPaymentsTable />
        </TabsContent>
      </Tabs>
    </ResponsiveAppLayout>
  );
};

export default PlanManagement;
