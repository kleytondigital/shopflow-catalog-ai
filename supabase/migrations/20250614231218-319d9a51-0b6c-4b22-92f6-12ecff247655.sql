
-- Adicionar campos de entrega na tabela orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'preparing',
ADD COLUMN IF NOT EXISTS estimated_delivery_date DATE,
ADD COLUMN IF NOT EXISTS carrier TEXT,
ADD COLUMN IF NOT EXISTS delivery_address JSONB;

-- Criar índices para melhorar performance nas consultas de entrega
CREATE INDEX IF NOT EXISTS idx_orders_delivery_status ON public.orders(delivery_status);
CREATE INDEX IF NOT EXISTS idx_orders_store_delivery ON public.orders(store_id, delivery_status);

-- Adicionar comentários para documentar os novos campos
COMMENT ON COLUMN public.orders.delivery_status IS 'Status da entrega: preparing, in_transit, delivered, problem';
COMMENT ON COLUMN public.orders.estimated_delivery_date IS 'Data estimada de entrega';
COMMENT ON COLUMN public.orders.carrier IS 'Transportadora responsável';
COMMENT ON COLUMN public.orders.delivery_address IS 'Endereço completo de entrega formatado';
