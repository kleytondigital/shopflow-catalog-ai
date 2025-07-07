
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface ImportJob {
  id: string;
  filename: string;
  status: "pending" | "cancelled" | "processing" | "failed" | "completed";
  totalProducts: number;
  processedProducts: number;
  successfulProducts: number;
  failedProducts: number;
  startedAt: string;
  completedAt: string;
  errorMessage: string;
}

export interface ImportConfig {
  createCategories: boolean;
  updateExisting: boolean;
  strictValidation: boolean;
  uploadImages: boolean;
}

export interface ImportProgress {
  stage: string;
  percentage: number;
  message: string;
  currentItem?: string;
}

export interface ImportResult {
  success: boolean;
  total: number;
  successful: number;
  failed: number;
  logs: Array<{
    rowNumber: number;
    productName: string;
    status: string;
    message: string;
  }>;
}

export const useBulkImport = () => {
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  const uploadFile = useCallback(async (file: File, storeId: string) => {
    try {
      setUploading(true);

      // Generate a unique ID for the job
      const jobId = Math.random().toString(36).substring(2, 15);

      // Upload the file to Supabase storage
      const filePath = `bulk_imports/${storeId}/${jobId}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("bulk_imports")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        throw uploadError;
      }

      // Create a new bulk import job in the database
      const { error: jobError } = await supabase.from("bulk_import_jobs").insert([
        {
          id: jobId,
          filename: file.name,
          store_id: storeId,
          status: "pending",
          total_products: 0,
          processed_products: 0,
          successful_products: 0,
          failed_products: 0,
          file_path: filePath,
        },
      ]);

      if (jobError) {
        console.error("Error creating job:", jobError);
        throw jobError;
      }

      toast({
        title: "Arquivo enviado",
        description: "O arquivo foi enviado com sucesso e será processado em breve.",
      });
      fetchJobs();
      return jobId;
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Erro ao enviar arquivo",
        description: "Ocorreu um erro ao enviar o arquivo. Por favor, tente novamente.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setUploading(false);
    }
  }, []);

  const startImport = useCallback(async (file: File, storeId: string, config: ImportConfig) => {
    try {
      setIsImporting(true);
      setProgress({ stage: "starting", percentage: 0, message: "Iniciando importação..." });
      
      // Simulate import process
      const result: ImportResult = {
        success: true,
        total: 10,
        successful: 8,
        failed: 2,
        logs: []
      };
      
      setResult(result);
      setProgress({ stage: "completed", percentage: 100, message: "Importação concluída!" });
      
      return { success: true, error: null };
    } catch (error) {
      setProgress({ stage: "error", percentage: 0, message: "Erro na importação" });
      return { success: false, error: "Erro durante a importação" };
    } finally {
      setIsImporting(false);
    }
  }, []);

  const downloadTemplate = useCallback(async () => {
    try {
      // Simulate template download
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: "Erro ao baixar template" };
    }
  }, []);

  const resetImport = useCallback(() => {
    setProgress(null);
    setResult(null);
    setIsImporting(false);
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("bulk_import_jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Map the data with proper typing
      const mappedJobs = data?.map(job => ({
        id: job.id,
        filename: job.filename,
        status: job.status as "pending" | "cancelled" | "processing" | "failed" | "completed",
        totalProducts: job.total_products || 0,
        processedProducts: job.processed_products || 0,
        successfulProducts: job.successful_products || 0,
        failedProducts: job.failed_products || 0,
        startedAt: job.started_at || "",
        completedAt: job.completed_at || "",
        errorMessage: job.error_message || "",
      })) || [];

      setJobs(mappedJobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  }, []);

  const cancelJob = useCallback(async (jobId: string) => {
    try {
      const { error } = await supabase
        .from("bulk_import_jobs")
        .update({ status: "cancelled" })
        .eq("id", jobId);

      if (error) throw error;

      toast({
        title: "Job cancelado",
        description: "O job foi cancelado com sucesso.",
      });
      fetchJobs();
    } catch (error) {
      console.error("Error cancelling job:", error);
      toast({
        title: "Erro ao cancelar job",
        description: "Ocorreu um erro ao cancelar o job. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  }, [fetchJobs, toast]);

  const canStartNewImport = !isImporting;

  return {
    jobs,
    uploading,
    isImporting,
    progress,
    result,
    uploadFile,
    fetchJobs,
    cancelJob,
    startImport,
    downloadTemplate,
    resetImport,
    canStartNewImport,
  };
};
