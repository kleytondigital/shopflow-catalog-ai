import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface ImportConfig {
  createCategories: boolean;
  updateExisting: boolean;
  strictValidation: boolean;
  uploadImages: boolean;
}

export interface ImportProgress {
  stage:
    | "upload"
    | "processing"
    | "validation"
    | "importing"
    | "completed"
    | "error";
  percentage: number;
  message: string;
  currentItem?: string;
}

export interface ImportResult {
  jobId: string;
  total: number;
  successful: number;
  failed: number;
  logs: Array<{
    rowNumber: number;
    productName: string;
    sku?: string;
    status: "success" | "error" | "warning";
    message: string;
  }>;
}

export interface ImportJob {
  id: string;
  filename: string;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  totalProducts: number;
  processedProducts: number;
  successfulProducts: number;
  failedProducts: number;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

export function useBulkImport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [jobs, setJobs] = useState<ImportJob[]>([]);

  // Upload e iniciar importação
  const startImport = useCallback(
    async (
      file: File,
      storeId: string,
      config: ImportConfig
    ): Promise<{ success: boolean; jobId?: string; error?: string }> => {
      if (!user) {
        return { success: false, error: "Usuário não autenticado" };
      }

      setIsImporting(true);
      setProgress({
        stage: "upload",
        percentage: 0,
        message: "Iniciando upload do arquivo...",
      });

      try {
        // Chamar edge function de upload
        const formData = new FormData();
        formData.append("file", file);
        formData.append("storeId", storeId);
        formData.append("config", JSON.stringify(config));

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("Sessão não encontrada");
        }

        const response = await fetch(
          `${supabase.supabaseUrl}/functions/v1/bulk-import-upload`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
            body: formData,
          }
        );

        const responseData = await response.json();

        if (!response.ok || !responseData.success) {
          throw new Error(responseData.error || "Erro no upload");
        }

        const jobId = responseData.jobId;

        setProgress({
          stage: "processing",
          percentage: 25,
          message: "Arquivo enviado. Processando dados...",
        });

        // Monitorar progresso do job
        await monitorJob(jobId);

        return { success: true, jobId };
      } catch (error: any) {
        setProgress({
          stage: "error",
          percentage: 0,
          message: error.message,
        });
        return { success: false, error: error.message };
      } finally {
        setIsImporting(false);
      }
    },
    [user]
  );

  // Monitorar status do job
  const monitorJob = useCallback(async (jobId: string) => {
    const pollInterval = 2000; // 2 segundos
    const maxAttempts = 150; // 5 minutos máximo

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const status = await getJobStatus(jobId);

        if (!status.success) {
          throw new Error(status.error || "Erro ao verificar status");
        }

        const job = status.data!.job;

        // Atualizar progresso baseado no status
        let percentage = 25;
        let stage: ImportProgress["stage"] = "processing";
        let message = "Processando...";

        switch (job.status) {
          case "processing":
            percentage = 50;
            stage = "validation";
            message = "Validando dados dos produtos...";
            break;
          case "completed":
            percentage = 100;
            stage = "completed";
            message = `Importação concluída! ${job.successfulProducts} produtos importados com sucesso.`;

            // Definir resultado final
            setResult({
              jobId: job.id,
              total: status.data!.statistics.total,
              successful: status.data!.statistics.success,
              failed: status.data!.statistics.errors,
              logs: status.data!.logs,
            });
            return;
          case "failed":
            throw new Error(job.errorMessage || "Importação falhou");
        }

        setProgress({
          stage,
          percentage,
          message,
          currentItem: `${job.processedProducts}/${job.totalProducts} produtos`,
        });

        // Se ainda está processando, aguardar antes da próxima verificação
        if (job.status === "processing" || job.status === "pending") {
          await new Promise((resolve) => setTimeout(resolve, pollInterval));
        }
      } catch (error: any) {
        setProgress({
          stage: "error",
          percentage: 0,
          message: error.message,
        });
        break;
      }
    }
  }, []);

  // Buscar status de um job específico
  const getJobStatus = useCallback(async (jobId: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Sessão não encontrada");
      }

      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/bulk-import-status?jobId=${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();
      return data;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, []);

  // Listar jobs do usuário
  const fetchJobs = useCallback(async (storeId?: string) => {
    try {
      let query = supabase
        .from("bulk_import_jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (storeId) {
        query = query.eq("store_id", storeId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const formattedJobs: ImportJob[] = data.map((job) => ({
        id: job.id,
        filename: job.filename,
        status: job.status,
        totalProducts: job.total_products,
        processedProducts: job.processed_products,
        successfulProducts: job.successful_products,
        failedProducts: job.failed_products,
        startedAt: job.started_at,
        completedAt: job.completed_at,
        errorMessage: job.error_message,
      }));

      setJobs(formattedJobs);
      return { success: true, jobs: formattedJobs };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, []);

  // Baixar template
  const downloadTemplate = useCallback(async () => {
    try {
      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/bulk-import-template`
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erro ao baixar template");
      }

      // Criar arquivo para download
      const content =
        `INSTRUÇÕES:\n${data.data.instrucoes}\n\n` +
        `PRODUTOS (copie para aba PRODUTOS):\n${data.data.produtos}\n\n` +
        `CATEGORIAS (copie para aba CATEGORIAS):\n${data.data.categorias}\n\n` +
        `VARIAÇÕES (copie para aba VARIACOES):\n${data.data.variacoes}`;

      const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "template-importacao-produtos.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, []);

  // Cancelar job (se possível)
  const cancelJob = useCallback(async (jobId: string) => {
    try {
      const { error } = await supabase
        .from("bulk_import_jobs")
        .update({
          status: "cancelled",
          completed_at: new Date().toISOString(),
        })
        .eq("id", jobId)
        .eq("status", "pending"); // Só pode cancelar se ainda estiver pendente

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, []);

  // Reset do estado
  const resetImport = useCallback(() => {
    setProgress(null);
    setResult(null);
    setIsImporting(false);
  }, []);

  return {
    // Estado
    isImporting,
    progress,
    result,
    jobs,

    // Ações
    startImport,
    getJobStatus,
    fetchJobs,
    downloadTemplate,
    cancelJob,
    resetImport,

    // Utilitários
    canStartNewImport: !isImporting,
  };
}
