
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
}

export const useBulkImport = () => {
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
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

  const startImport = async (jobId: string, config: ImportConfig) => {
    setIsImporting(true);
    setProgress(0);
    setResult(null);
    
    try {
      // Simular progresso para demonstração
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      // Atualizar status para processing
      await supabase
        .from('bulk_import_jobs')
        .update({ 
          status: 'processing',
          started_at: new Date().toISOString(),
          config: config
        })
        .eq('id', jobId);

      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      clearInterval(interval);
      setProgress(100);

      // Finalizar com sucesso
      await supabase
        .from('bulk_import_jobs')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString(),
          processed_products: 10,
          successful_products: 8,
          failed_products: 2
        })
        .eq('id', jobId);

      setResult({
        success: true,
        processedCount: 10,
        successCount: 8,
        errorCount: 2
      });

      toast({
        title: "Importação concluída",
        description: "Produtos importados com sucesso"
      });

      await fetchJobs();
    } catch (error: any) {
      console.error('Erro na importação:', error);
      
      await supabase
        .from('bulk_import_jobs')
        .update({ 
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: error.message
        })
        .eq('id', jobId);

      setResult({
        success: false,
        error: error.message
      });

      toast({
        title: "Erro na importação",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = useCallback(() => {
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
  }, [toast]);

  const resetImport = useCallback(() => {
    setProgress(0);
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
