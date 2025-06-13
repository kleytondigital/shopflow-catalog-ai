
-- Criar tabela para movimentação de estoque
CREATE TABLE public.stock_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('reservation', 'sale', 'return', 'adjustment', 'release')),
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE, -- Para reservas que expiram
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE
);

-- Adicionar campos de estoque ao products
ALTER TABLE public.products 
ADD COLUMN reserved_stock INTEGER NOT NULL DEFAULT 0,
ADD COLUMN allow_negative_stock BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN stock_alert_threshold INTEGER DEFAULT 5;

-- Adicionar campos de status de reserva aos orders
ALTER TABLE public.orders
ADD COLUMN stock_reserved BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN reservation_expires_at TIMESTAMP WITH TIME ZONE;

-- Trigger para atualizar updated_at na tabela stock_movements
CREATE TRIGGER update_stock_movements_updated_at
  BEFORE UPDATE ON public.stock_movements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS na tabela stock_movements
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para stock_movements (mesmas regras dos produtos)
CREATE POLICY "Users can view stock movements from their store" ON public.stock_movements
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.profiles prof 
    WHERE prof.id = auth.uid() AND prof.store_id = stock_movements.store_id
  ));

CREATE POLICY "Users can create stock movements for their store" ON public.stock_movements
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles prof 
    WHERE prof.id = auth.uid() AND prof.store_id = stock_movements.store_id
  ));

-- Função para calcular estoque disponível
CREATE OR REPLACE FUNCTION public.get_available_stock(product_uuid UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(
    (SELECT stock FROM public.products WHERE id = product_uuid), 0
  ) - COALESCE(
    (SELECT reserved_stock FROM public.products WHERE id = product_uuid), 0
  );
$$;

-- Função para liberar reservas expiradas
CREATE OR REPLACE FUNCTION public.release_expired_reservations()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  released_count INTEGER := 0;
  expired_reservation RECORD;
BEGIN
  -- Buscar reservas expiradas
  FOR expired_reservation IN 
    SELECT sm.product_id, sm.quantity, sm.order_id
    FROM public.stock_movements sm
    WHERE sm.movement_type = 'reservation'
      AND sm.expires_at < NOW()
      AND NOT EXISTS (
        SELECT 1 FROM public.stock_movements sm2 
        WHERE sm2.order_id = sm.order_id 
        AND sm2.movement_type = 'release'
      )
  LOOP
    -- Liberar estoque reservado
    UPDATE public.products 
    SET reserved_stock = reserved_stock - expired_reservation.quantity
    WHERE id = expired_reservation.product_id;
    
    -- Registrar movimentação de liberação
    INSERT INTO public.stock_movements (
      product_id, order_id, movement_type, quantity, 
      previous_stock, new_stock, notes, store_id
    )
    SELECT 
      expired_reservation.product_id,
      expired_reservation.order_id,
      'release',
      expired_reservation.quantity,
      (SELECT stock FROM public.products WHERE id = expired_reservation.product_id),
      (SELECT stock FROM public.products WHERE id = expired_reservation.product_id),
      'Reserva expirada automaticamente',
      (SELECT store_id FROM public.products WHERE id = expired_reservation.product_id);
    
    released_count := released_count + 1;
  END LOOP;
  
  RETURN released_count;
END;
$$;
