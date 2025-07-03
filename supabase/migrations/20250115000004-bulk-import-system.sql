-- Migration para Sistema de Importação em Massa
-- Cria tabelas para controle e logs da importação

-- Tabela para jobs de importação
CREATE TABLE IF NOT EXISTS bulk_import_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  total_products INTEGER DEFAULT 0,
  processed_products INTEGER DEFAULT 0,
  successful_products INTEGER DEFAULT 0,
  failed_products INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  config JSONB NOT NULL DEFAULT '{}',
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para logs detalhados da importação
CREATE TABLE IF NOT EXISTS bulk_import_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES bulk_import_jobs(id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL,
  product_name TEXT,
  sku TEXT,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'warning')),
  message TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para dados temporários de produtos antes da importação
CREATE TABLE IF NOT EXISTS bulk_import_temp_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES bulk_import_jobs(id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL,
  product_data JSONB NOT NULL,
  variations_data JSONB DEFAULT '[]',
  validation_status TEXT NOT NULL DEFAULT 'pending' CHECK (validation_status IN ('pending', 'valid', 'invalid')),
  validation_errors JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_bulk_import_jobs_store_id ON bulk_import_jobs(store_id);
CREATE INDEX IF NOT EXISTS idx_bulk_import_jobs_user_id ON bulk_import_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_bulk_import_jobs_status ON bulk_import_jobs(status);
CREATE INDEX IF NOT EXISTS idx_bulk_import_jobs_created_at ON bulk_import_jobs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bulk_import_logs_job_id ON bulk_import_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_bulk_import_logs_status ON bulk_import_logs(status);
CREATE INDEX IF NOT EXISTS idx_bulk_import_logs_row_number ON bulk_import_logs(job_id, row_number);

CREATE INDEX IF NOT EXISTS idx_bulk_import_temp_products_job_id ON bulk_import_temp_products(job_id);
CREATE INDEX IF NOT EXISTS idx_bulk_import_temp_products_validation ON bulk_import_temp_products(validation_status);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_bulk_import_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bulk_import_jobs_updated_at
  BEFORE UPDATE ON bulk_import_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_bulk_import_updated_at();

-- RLS (Row Level Security)
ALTER TABLE bulk_import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_import_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_import_temp_products ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view their own bulk import jobs" 
  ON bulk_import_jobs FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create bulk import jobs for their stores" 
  ON bulk_import_jobs FOR INSERT 
  WITH CHECK (
    user_id = auth.uid() 
    AND store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own bulk import jobs" 
  ON bulk_import_jobs FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can view logs of their bulk import jobs" 
  ON bulk_import_logs FOR SELECT 
  USING (
    job_id IN (
      SELECT id FROM bulk_import_jobs WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage bulk import logs" 
  ON bulk_import_logs FOR ALL 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view temp products of their jobs" 
  ON bulk_import_temp_products FOR SELECT 
  USING (
    job_id IN (
      SELECT id FROM bulk_import_jobs WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage temp products" 
  ON bulk_import_temp_products FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Função para limpar dados antigos (jobs concluídos há mais de 30 dias)
CREATE OR REPLACE FUNCTION cleanup_old_bulk_import_data()
RETURNS void AS $$
BEGIN
  DELETE FROM bulk_import_jobs 
  WHERE status IN ('completed', 'failed', 'cancelled') 
    AND completed_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários para documentação
COMMENT ON TABLE bulk_import_jobs IS 'Controla jobs de importação em massa de produtos';
COMMENT ON TABLE bulk_import_logs IS 'Logs detalhados do processo de importação';
COMMENT ON TABLE bulk_import_temp_products IS 'Dados temporários dos produtos antes da importação';

COMMENT ON COLUMN bulk_import_jobs.config IS 'Configurações do job: {createCategories, updateExisting, strictValidation, etc}';
COMMENT ON COLUMN bulk_import_logs.data IS 'Dados adicionais sobre o erro/sucesso';
COMMENT ON COLUMN bulk_import_temp_products.product_data IS 'Dados do produto parseados da planilha';
COMMENT ON COLUMN bulk_import_temp_products.variations_data IS 'Array de variações do produto'; 