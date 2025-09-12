import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Lock,
  Key,
  Eye,
  AlertTriangle,
  CheckCircle,
  Settings,
} from "lucide-react";

const Security = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Segurança</h1>
          <p className="text-muted-foreground">
            Configure e monitore as configurações de segurança do sistema
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Configurações
        </Button>
      </div>

      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Status de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-lg font-semibold">Seguro</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Todas as verificações OK
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Tentativas de Login
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">Últimas 24 horas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Ataques Bloqueados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">Esta semana</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Sessões Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Usuários online</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configurações de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Lock className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="font-medium">
                        Autenticação de dois fatores
                      </div>
                      <div className="text-sm text-muted-foreground">
                        2FA habilitado
                      </div>
                    </div>
                  </div>
                  <Badge variant="default">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Key className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="font-medium">Senhas fortes</div>
                      <div className="text-sm text-muted-foreground">
                        Mínimo 8 caracteres
                      </div>
                    </div>
                  </div>
                  <Badge variant="default">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Eye className="h-4 w-4 text-yellow-600" />
                    <div>
                      <div className="font-medium">Logs de auditoria</div>
                      <div className="text-sm text-muted-foreground">
                        Logs básicos
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">Parcial</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-red-600" />
                    <div>
                      <div className="font-medium">Firewall</div>
                      <div className="text-sm text-muted-foreground">
                        Configuração básica
                      </div>
                    </div>
                  </div>
                  <Badge variant="destructive">Atenção</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertas de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <div>
                      <div className="font-medium">
                        Tentativa de acesso suspeita
                      </div>
                      <div className="text-sm text-muted-foreground">
                        IP: 192.168.1.100
                      </div>
                    </div>
                  </div>
                  <Badge variant="destructive">Crítico</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <div>
                      <div className="font-medium">Senha fraca detectada</div>
                      <div className="text-sm text-muted-foreground">
                        Usuário: admin@test.com
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">Atenção</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border border-green-200 rounded-lg bg-green-50">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="font-medium">Backup de segurança</div>
                      <div className="text-sm text-muted-foreground">
                        Concluído com sucesso
                      </div>
                    </div>
                  </div>
                  <Badge variant="default">Resolvido</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">Login bem-sucedido</div>
                    <div className="text-sm text-muted-foreground">
                      admin@vendas.com - 192.168.1.50
                    </div>
                    <div className="text-xs text-muted-foreground">
                      2024-01-29 14:30:15
                    </div>
                  </div>
                </div>
                <Badge variant="default">Sucesso</Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <div className="font-medium">
                      Tentativa de login falhada
                    </div>
                    <div className="text-sm text-muted-foreground">
                      hacker@test.com - 192.168.1.100
                    </div>
                    <div className="text-xs text-muted-foreground">
                      2024-01-29 14:25:30
                    </div>
                  </div>
                </div>
                <Badge variant="destructive">Falha</Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">Configuração alterada</div>
                    <div className="text-sm text-muted-foreground">
                      Política de senhas atualizada
                    </div>
                    <div className="text-xs text-muted-foreground">
                      2024-01-29 14:20:45
                    </div>
                  </div>
                </div>
                <Badge variant="default">Configuração</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Security;

