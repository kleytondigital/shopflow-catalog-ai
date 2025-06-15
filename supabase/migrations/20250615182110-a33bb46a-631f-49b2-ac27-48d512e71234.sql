
-- Criar tabela para configuração de gateways de pagamento
CREATE TABLE public.payment_gateways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (name IN ('stripe', 'asaas')),
  is_active BOOLEAN NOT NULL DEFAULT false,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela para histórico de pagamentos dos planos
CREATE TABLE public.plan_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  gateway TEXT NOT NULL CHECK (gateway IN ('stripe', 'asaas')),
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
  gateway_payment_id TEXT,
  gateway_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_payments ENABLE ROW LEVEL SECURITY;

-- Políticas para payment_gateways (apenas superadmin)
CREATE POLICY "superadmin_full_access_gateways" ON public.payment_gateways
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'superadmin'
  ));

-- Políticas para plan_payments
CREATE POLICY "superadmin_full_access_payments" ON public.plan_payments
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'superadmin'
  ));

CREATE POLICY "store_view_own_payments" ON public.plan_payments
  FOR SELECT
  USING (
    store_id IN (
      SELECT store_id FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- Trigger para updated_at
CREATE TRIGGER update_payment_gateways_updated_at
  BEFORE UPDATE ON public.payment_gateways
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plan_payments_updated_at
  BEFORE UPDATE ON public.plan_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir gateways padrão
INSERT INTO public.payment_gateways (name, is_active, config) VALUES
('stripe', false, '{"public_key": "", "secret_key": ""}'),
('asaas', false, '{"api_key": "", "environment": "sandbox"}');

-- Constraint para garantir apenas um gateway ativo
CREATE UNIQUE INDEX idx_single_active_gateway ON public.payment_gateways (is_active) 
WHERE is_active = true;

-- Função para gerenciar ativação de gateway único
CREATE OR REPLACE FUNCTION public.ensure_single_active_gateway()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    -- Desativar todos os outros gateways
    UPDATE public.payment_gateways 
    SET is_active = false 
    WHERE id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para garantir apenas um gateway ativo
CREATE TRIGGER ensure_single_active_gateway_trigger
  BEFORE UPDATE ON public.payment_gateways
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION public.ensure_single_active_gateway();
