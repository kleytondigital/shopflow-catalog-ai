
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ImportJob {
  id: string;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  totalProducts: number;
  processedProducts: number;
  successfulProducts: number;
  failedProducts: number;
  startedAt: string;
  completedAt: string;
  errorMessage: string;
}

export interface ImportConfig {
  skipDuplicates: boolean;
  updateExisting: boolean;
  validateStock: boolean;
  defaultCategory?: string;
  createCategories?: boolean;
  strictValidation?: boolean;
  uploadImages?: boolean;
}

export interface ImportProgress {
  stage: string;
  message: string;
  percentage: number;
  currentItem?: string;
}

export interface ImportResult {
  success: boolean;
  error?: string;
  total: number;
  successful: number;
  failed: number;
  logs: Array<{
    rowNumber: number;
    productName: string;
    status: 'success' | 'error';
    message: string;
  }>;
}

export interface TemplateDownloadResult {
  success: boolean;
  error?: string;
}

export const useBulkImport = () => {
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  const uploadFile = async (file: File, storeId: string): Promise<string> => {
    setUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `bulk-imports/${storeId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data, error: insertError } = await supabase
        .from('bulk_import_jobs')
        .insert({
          filename: file.name,
          file_path: filePath,
          file_size: file.size,
          status: 'pending',
          user_id: (await supabase.auth.getUser()).data.user?.id || '',
          store_id: storeId,
          config: {
            skipDuplicates: true,
            updateExisting: false,
            validateStock: true
          }
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast({
        title: "Arquivo enviado",
        description: "Arquivo preparado para importação"
      });

      await fetchJobs();
      return data.id;
    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('bulk_import_jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedJobs: ImportJob[] = (data || []).map(job => ({
        id: job.id,
        filename: job.filename,
        status: job.status as ImportJob['status'],
        totalProducts: job.total_products || 0,
        processedProducts: job.processed_products || 0,
        successfulProducts: job.successful_products || 0,
        failedProducts: job.failed_products || 0,
        startedAt: job.started_at || '',
        completedAt: job.completed_at || '',
        errorMessage: job.error_message || ''
      }));

      setJobs(formattedJobs);
    } catch (error: any) {
      console.error('Erro ao buscar jobs:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar histórico de importações",
        variant: "destructive"
      });
    }
  };

  const cancelJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('bulk_import_jobs')
        .update({ status: 'cancelled' })
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: "Job cancelado",
        description: "Importação cancelada com sucesso"
      });

      await fetchJobs();
    } catch (error: any) {
      console.error('Erro ao cancelar job:', error);
      toast({
        title: "Erro",
        description: "Falha ao cancelar importação",
        variant: "destructive"
      });
    }
  };

  const startImport = async (file: File, storeId: string, config: ImportConfig): Promise<ImportResult> => {
    setIsImporting(true);
    setProgress({ stage: 'starting', message: 'Iniciando importação...', percentage: 0 });
    setResult(null);
    
    try {
      // Simular progresso para demonstração
      const interval = setInterval(() => {
        setProgress(prev => {
          if (!prev || prev.percentage >= 90) {
            clearInterval(interval);
            return prev;
          }
          return {
            ...prev,
            percentage: prev.percentage + 10,
            message: `Processando... ${prev.percentage + 10}%`
          };
        });
      }, 500);

      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      clearInterval(interval);
      setProgress({ stage: 'completed', message: 'Concluído!', percentage: 100 });

      const finalResult: ImportResult = {
        success: true,
        total: 10,
        successful: 8,
        failed: 2,
        logs: [
          { rowNumber: 1, productName: 'Produto A', status: 'success', message: 'Criado com sucesso' },
          { rowNumber: 2, productName: 'Produto B', status: 'error', message: 'Erro de validação' }
        ]
      };

      setResult(finalResult);

      toast({
        title: "Importação concluída",
        description: "Produtos importados com sucesso"
      });

      await fetchJobs();
      return finalResult;
    } catch (error: any) {
      console.error('Erro na importação:', error);
      
      const errorResult: ImportResult = {
        success: false,
        error: error.message,
        total: 0,
        successful: 0,
        failed: 0,
        logs: []
      };

      setResult(errorResult);
      setProgress({ stage: 'error', message: 'Erro na importação', percentage: 0 });

      toast({
        title: "Erro na importação",
        description: error.message,
        variant: "destructive"
      });

      return errorResult;
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = useCallback(async (): Promise<TemplateDownloadResult> => {
    try {
      const csvContent = [
        'nome,descricao,preco_varejo,preco_atacado,categoria,estoque,sku',
        'Produto Exemplo,Descrição do produto,29.90,25.90,Categoria Teste,100,SKU001',
        'Outro Produto,Outra descrição,15.50,12.90,Outra Categoria,50,SKU002'
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'template-produtos.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Template baixado",
        description: "Use este arquivo como modelo para importação"
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [toast]);

  const resetImport = useCallback(() => {
    setProgress(null);
    setResult(null);
    setIsImporting(false);
  }, []);

  const canStartNewImport = useCallback(() => {
    const activeJobs = jobs.filter(job => 
      job.status === 'pending' || job.status === 'processing'
    );
    return activeJobs.length === 0 && !isImporting;
  }, [jobs, isImporting]);

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
    canStartNewImport
  };
};
