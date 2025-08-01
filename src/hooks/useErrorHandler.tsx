import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export const useErrorHandler = () => {
  const { toast } = useToast();

  const handleSupabaseError = useCallback(
    (error: any, context?: string) => {
      console.error(
        `🚨 Erro Supabase ${context ? `em ${context}` : ""}:`,
        error
      );

      // Tratar erro 406 especificamente
      if (
        error?.status === 406 ||
        error?.code === "406" ||
        error?.message?.includes("406")
      ) {
        console.error("❌ ERRO 406 DETECTADO - Not Acceptable");

        toast({
          title: "🚨 Erro de Acesso (406)",
          description: (
            <div className="space-y-2">
              <p>Problema de permissão detectado.</p>
              <p>
                <strong>Soluções:</strong>
              </p>
              <ul className="list-disc list-inside text-sm">
                <li>Limpe o cache do navegador (Ctrl+Shift+R)</li>
                <li>Recarregue a página completamente</li>
                <li>Faça logout e login novamente</li>
              </ul>
            </div>
          ),
          variant: "destructive",
          duration: 10000,
        });

        // Retornar erro específico para 406
        return {
          type: "PERMISSION_ERROR",
          message: "Erro de permissão (406). Tente limpar o cache.",
          code: "406",
          suggestions: [
            "Limpe o cache do navegador",
            "Recarregue a página",
            "Faça logout e login novamente",
          ],
        };
      }

      // Tratar outros erros comuns do Supabase
      if (error?.code === "PGRST301") {
        toast({
          title: "Erro de Permissão",
          description: "Você não tem permissão para realizar esta ação.",
          variant: "destructive",
          duration: 5000,
        });

        return {
          type: "PERMISSION_ERROR",
          message: "Permissão negada",
          code: "PGRST301",
        };
      }

      if (error?.code === "PGRST116") {
        toast({
          title: "Dados não encontrados",
          description: "O recurso solicitado não foi encontrado.",
          variant: "destructive",
          duration: 5000,
        });

        return {
          type: "NOT_FOUND_ERROR",
          message: "Recurso não encontrado",
          code: "PGRST116",
        };
      }

      // Tratar erros de conexão
      if (
        error?.message?.includes("NetworkError") ||
        error?.message?.includes("Failed to fetch")
      ) {
        toast({
          title: "Erro de Conexão",
          description: "Problema de conectividade. Verifique sua internet.",
          variant: "destructive",
          duration: 5000,
        });

        return {
          type: "NETWORK_ERROR",
          message: "Erro de conexão",
          suggestions: ["Verifique sua conexão com a internet"],
        };
      }

      // Erro genérico
      const errorMessage = error?.message || "Erro desconhecido";

      toast({
        title: "Erro na Operação",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });

      return {
        type: "GENERIC_ERROR",
        message: errorMessage,
        code: error?.code,
      };
    },
    [toast]
  );

  const handleAsyncError = useCallback(
    async function <T>(
      asyncFn: () => Promise<T>,
      context?: string,
      fallbackValue?: T
    ): Promise<T | null> {
      try {
        return await asyncFn();
      } catch (error) {
        handleSupabaseError(error, context);
        return fallbackValue || null;
      }
    },
    [handleSupabaseError]
  );

  const retryWithBackoff = useCallback(
    async function <T>(
      asyncFn: () => Promise<T>,
      maxRetries: number,
      baseDelay: number,
      context?: string
    ): Promise<T | null> {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await asyncFn();
        } catch (error) {
          console.warn(
            `🔄 Tentativa ${attempt}/${maxRetries} falhou ${
              context ? `em ${context}` : ""
            }:`,
            error
          );

          if (attempt === maxRetries) {
            handleSupabaseError(error, context);
            return null;
          }

          // Backoff exponencial
          const delay = baseDelay * Math.pow(2, attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      return null;
    },
    [handleSupabaseError]
  );

  // Versão simplificada sem generics para retryWithBackoff
  const retryOperation = useCallback(
    async (
      asyncFn: () => Promise<any>,
      maxRetries = 3,
      baseDelay = 1000,
      context?: string
    ): Promise<any> => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await asyncFn();
        } catch (error) {
          console.warn(
            `🔄 Tentativa ${attempt}/${maxRetries} falhou ${
              context ? `em ${context}` : ""
            }:`,
            error
          );

          if (attempt === maxRetries) {
            handleSupabaseError(error, context);
            return null;
          }

          // Backoff exponencial
          const delay = baseDelay * Math.pow(2, attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      return null;
    },
    [handleSupabaseError]
  );

  return {
    handleSupabaseError,
    handleAsyncError,
    retryWithBackoff,
    retryOperation,
  };
};

export default useErrorHandler;
