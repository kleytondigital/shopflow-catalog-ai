-- Migration: Criar tabelas de analytics para tracking real
-- Data: 2025-01-30

-- Tabela para tracking de visualizações
CREATE TABLE public.analytics_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  page_path TEXT NOT NULL,
  page_title TEXT,
  user_agent TEXT,
  ip_address INET,
  referrer TEXT,
  view_count INTEGER NOT NULL DEFAULT 1,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para métricas de analytics
CREATE TABLE public.analytics_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL, -- 'page_view', 'product_view', 'cart_add', 'checkout_start', 'purchase'
  metric_value DECIMAL(10,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para notificações de analytics
CREATE TABLE public.analytics_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'high_revenue', 'low_stock', 'new_customer', 'abandoned_cart'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para configurações de alertas
CREATE TABLE public.analytics_alerts_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  threshold_value DECIMAL(10,2),
  is_enabled BOOLEAN DEFAULT true,
  notification_methods JSONB DEFAULT '["email", "dashboard"]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.analytics_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_alerts_config ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para analytics_views
CREATE POLICY "Superadmins can view all analytics views" 
  ON public.analytics_views 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Store admins can view their store analytics" 
  ON public.analytics_views 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'store_admin' AND store_id = analytics_views.store_id
    )
  );

-- Políticas RLS para analytics_metrics
CREATE POLICY "Superadmins can view all analytics metrics" 
  ON public.analytics_metrics 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Store admins can view their store metrics" 
  ON public.analytics_metrics 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'store_admin' AND store_id = analytics_metrics.store_id
    )
  );

-- Políticas RLS para analytics_notifications
CREATE POLICY "Superadmins can view all notifications" 
  ON public.analytics_notifications 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Store admins can view their notifications" 
  ON public.analytics_notifications 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'store_admin' AND store_id = analytics_notifications.store_id
    )
  );

-- Políticas RLS para analytics_alerts_config
CREATE POLICY "Superadmins can manage all alert configs" 
  ON public.analytics_alerts_config 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Store admins can manage their alert configs" 
  ON public.analytics_alerts_config 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'store_admin' AND store_id = analytics_alerts_config.store_id
    )
  );

-- Índices para performance
CREATE INDEX idx_analytics_views_store_id ON public.analytics_views(store_id);
CREATE INDEX idx_analytics_views_created_at ON public.analytics_views(created_at);
CREATE INDEX idx_analytics_views_page_path ON public.analytics_views(page_path);

CREATE INDEX idx_analytics_metrics_store_id ON public.analytics_metrics(store_id);
CREATE INDEX idx_analytics_metrics_type ON public.analytics_metrics(metric_type);
CREATE INDEX idx_analytics_metrics_created_at ON public.analytics_metrics(created_at);

CREATE INDEX idx_analytics_notifications_store_id ON public.analytics_notifications(store_id);
CREATE INDEX idx_analytics_notifications_is_read ON public.analytics_notifications(is_read);
CREATE INDEX idx_analytics_notifications_created_at ON public.analytics_notifications(created_at);

-- Triggers para updated_at
CREATE TRIGGER update_analytics_alerts_config_updated_at 
  BEFORE UPDATE ON public.analytics_alerts_config 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

