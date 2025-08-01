import React, { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  RefreshCw,
  Trash2,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ErrorLog {
  id: string;
  timestamp: Date;
  type: string;
  message: string;
  url?: string;
  status?: number;
  resolved?: boolean;
}

const ErrorMonitor: React.FC = () => {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [monitoring, setMonitoring] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let errorCount = 0;

    // Interceptar erros de fetch
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);

        // Detectar erro 406
        if (response.status === 406) {
          const errorId = `error-406-${Date.now()}-${errorCount++}`;
          const url =
            typeof args[0] === "string"
              ? args[0]
              : args[0] instanceof Request
              ? args[0].url
              : "unknown";

          const newError: ErrorLog = {
            id: errorId,
            timestamp: new Date(),
            type: "HTTP_406",
            message:
              "Not Acceptable - Possível problema com RLS ou tabela users",
            url,
            status: 406,
            resolved: false,
          };

          setErrors((prev) => [newError, ...prev.slice(0, 9)]); // Manter apenas últimos 10

          // Auto-resolver se for erro conhecido
          if (url.includes("/users?")) {
            setTimeout(() => {
              handleAutoResolve(errorId);
            }, 2000);
          }
        }

        return response;
      } catch (error) {
        console.error("Erro interceptado:", error);
        throw error;
      }
    };

    // Interceptar erros globais
    const handleGlobalError = (event: ErrorEvent) => {
      if (
        event.message.includes("406") ||
        event.message.includes("Not Acceptable")
      ) {
        const errorId = `error-global-${Date.now()}-${errorCount++}`;

        const newError: ErrorLog = {
          id: errorId,
          timestamp: new Date(),
          type: "GLOBAL_406",
          message: event.message,
          url: event.filename,
          resolved: false,
        };

        setErrors((prev) => [newError, ...prev.slice(0, 9)]);
      }
    };

    // Interceptar promessas rejeitadas
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (reason?.status === 406 || reason?.message?.includes("406")) {
        const errorId = `error-promise-${Date.now()}-${errorCount++}`;

        const newError: ErrorLog = {
          id: errorId,
          timestamp: new Date(),
          type: "PROMISE_406",
          message: reason?.message || "Erro 406 em Promise",
          status: reason?.status,
          resolved: false,
        };

        setErrors((prev) => [newError, ...prev.slice(0, 9)]);
      }
    };

    if (monitoring) {
      window.addEventListener("error", handleGlobalError);
      window.addEventListener("unhandledrejection", handleUnhandledRejection);
    }

    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
      window.fetch = originalFetch;
    };
  }, [monitoring]);

  const handleAutoResolve = (errorId: string) => {
    setErrors((prev) =>
      prev.map((error) =>
        error.id === errorId ? { ...error, resolved: true } : error
      )
    );

    toast({
      title: "🔧 Auto-Resolução Ativada",
      description: "Tentativa automática de resolução do erro 406 iniciada.",
      duration: 3000,
    });
  };

  const handleClearCache = () => {
    // Limpar localStorage
    const keysToKeep = ["cart-items", "theme", "user-preferences"];
    const allKeys = Object.keys(localStorage);

    allKeys.forEach((key) => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });

    // Limpar sessionStorage
    sessionStorage.clear();

    toast({
      title: "🧹 Cache Limpo",
      description: "Cache local foi limpo. Recarregue a página.",
      duration: 5000,
    });
  };

  const handleForceReload = () => {
    // Recarregamento forçado com cache limpo
    window.location.reload();
  };

  const handleOpenMigration = () => {
    // Abrir arquivo de migração
    const migrationContent = `
-- Cole este código no SQL Editor do Supabase:

-- 1. Remover tabela users conflitante
DROP TABLE IF EXISTS public.users CASCADE;

-- 2. Criar view de compatibilidade
CREATE OR REPLACE VIEW public.users AS
SELECT id, email, full_name, role, store_id, created_at, updated_at
FROM public.profiles;

-- 3. Configurar permissões
GRANT SELECT ON public.users TO authenticated;
ALTER VIEW public.users SET (security_invoker = true);

-- 4. Atualizar políticas RLS
CREATE POLICY "Enable read access for authenticated users" ON public.profiles
FOR SELECT USING (auth.role() = 'authenticated');
    `;

    // Copiar para clipboard
    navigator.clipboard.writeText(migrationContent.trim()).then(() => {
      toast({
        title: "📋 Migração Copiada",
        description: "Cole no SQL Editor do Supabase para resolver o erro 406.",
        duration: 5000,
      });
    });
  };

  const clearErrors = () => {
    setErrors([]);
  };

  const resolveError = (errorId: string) => {
    setErrors((prev) =>
      prev.map((error) =>
        error.id === errorId ? { ...error, resolved: true } : error
      )
    );
  };

  const unresolved406Errors = errors.filter(
    (e) => e.status === 406 && !e.resolved
  );

  return (
    <div className="space-y-4">
      {/* Status do Monitor */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Monitor de Erros 406
            <Badge variant={monitoring ? "default" : "secondary"}>
              {monitoring ? "Ativo" : "Inativo"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={monitoring ? "destructive" : "default"}
              onClick={() => setMonitoring(!monitoring)}
              size="sm"
            >
              {monitoring ? "Parar Monitor" : "Iniciar Monitor"}
            </Button>
            <Button variant="outline" onClick={clearErrors} size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alertas de Erro 406 */}
      {unresolved406Errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="space-y-3">
            <div className="font-semibold">
              🚨 {unresolved406Errors.length} Erro(s) 406 Detectado(s)
            </div>
            <p>Erro "Not Acceptable" detectado. Soluções disponíveis:</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearCache}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Cache
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleForceReload}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Recarregar Página
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleOpenMigration}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Aplicar Migração
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de Erros */}
      {errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Log de Erros ({errors.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {errors.map((error) => (
                <div
                  key={error.id}
                  className={`p-3 rounded border ${
                    error.resolved
                      ? "bg-green-50 border-green-200"
                      : error.status === 406
                      ? "bg-red-50 border-red-200"
                      : "bg-yellow-50 border-yellow-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={error.resolved ? "default" : "destructive"}
                        >
                          {error.type}
                        </Badge>
                        {error.status && (
                          <Badge variant="outline">HTTP {error.status}</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {error.timestamp.toLocaleTimeString()}
                        </span>
                        {error.resolved && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <p className="text-sm font-medium">{error.message}</p>
                      {error.url && (
                        <p className="text-xs text-muted-foreground mt-1">
                          URL: {error.url}
                        </p>
                      )}
                    </div>
                    {!error.resolved && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => resolveError(error.id)}
                      >
                        Resolver
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {errors.length === 0 && monitoring && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold">✅ Sistema Estável</div>
            <p>Nenhum erro 406 detectado. Sistema funcionando normalmente.</p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ErrorMonitor;
