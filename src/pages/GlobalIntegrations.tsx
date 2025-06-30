import React from "react";
import { Settings, Zap, Shield } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const GlobalIntegrations = () => {
  const { profile } = useAuth();

  if (profile?.role !== "superadmin") {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrações Globais</h1>
        <p className="text-muted-foreground">
          Configure integrações que serão aplicadas a todas as lojas do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Webhooks Globais
            </CardTitle>
            <CardDescription>
              Configure webhooks que serão acionados para eventos de todas as
              lojas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled>Configurar Webhooks</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Segurança
            </CardTitle>
            <CardDescription>
              Configurações de segurança aplicadas a todo o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled>Configurar Segurança</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              APIs Externas
            </CardTitle>
            <CardDescription>
              Configure APIs externas para todas as lojas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled>Configurar APIs</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GlobalIntegrations;
