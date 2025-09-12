-- Migration: Corrigir RLS da tabela orders para permitir inserção de dados de teste
-- Data: 2025-01-30

-- Temporariamente desabilitar RLS para inserção de dados de teste
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- Inserir dados de teste
INSERT INTO public.orders (
  store_id,
  customer_name,
  customer_email,
  customer_phone,
  total_amount,
  status,
  order_type,
  items,
  shipping_address,
  created_at,
  updated_at
) VALUES 
-- Pedidos da loja 1
('c3dd0247-54ec-4bfc-a841-3562e0a69bac', 'João Silva', 'joao@email.com', '11999990001', 150.00, 'delivered', 'retail', '[{"product_id": "prod-1", "product_name": "Produto A", "quantity": 2, "price": 75.00}]', '{"street": "Rua A", "number": "123", "city": "São Paulo", "state": "SP", "zipCode": "01000-000"}', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('c3dd0247-54ec-4bfc-a841-3562e0a69bac', 'Maria Santos', 'maria@email.com', '11999990002', 300.00, 'delivered', 'retail', '[{"product_id": "prod-2", "product_name": "Produto B", "quantity": 1, "price": 300.00}]', '{"street": "Rua B", "number": "456", "city": "São Paulo", "state": "SP", "zipCode": "02000-000"}', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('c3dd0247-54ec-4bfc-a841-3562e0a69bac', 'Pedro Costa', 'pedro@email.com', '11999990003', 450.00, 'delivered', 'retail', '[{"product_id": "prod-3", "product_name": "Produto C", "quantity": 3, "price": 150.00}]', '{"street": "Rua C", "number": "789", "city": "São Paulo", "state": "SP", "zipCode": "03000-000"}', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

-- Pedidos da loja 2
('54f270de-184c-454e-8301-81d7b1c23ecd', 'Ana Oliveira', 'ana@email.com', '11999990004', 200.00, 'delivered', 'retail', '[{"product_id": "prod-4", "product_name": "Produto D", "quantity": 1, "price": 200.00}]', '{"street": "Rua D", "number": "321", "city": "São Paulo", "state": "SP", "zipCode": "04000-000"}', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
('54f270de-184c-454e-8301-81d7b1c23ecd', 'Carlos Lima', 'carlos@email.com', '11999990005', 600.00, 'delivered', 'retail', '[{"product_id": "prod-5", "product_name": "Produto E", "quantity": 2, "price": 300.00}]', '{"street": "Rua E", "number": "654", "city": "São Paulo", "state": "SP", "zipCode": "05000-000"}', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),

-- Pedidos da loja 3
('64516568-bbd8-4e9c-993b-cc53a267adf5', 'Lucia Ferreira', 'lucia@email.com', '11999990006', 800.00, 'delivered', 'retail', '[{"product_id": "prod-6", "product_name": "Produto F", "quantity": 1, "price": 800.00}]', '{"street": "Rua F", "number": "987", "city": "São Paulo", "state": "SP", "zipCode": "06000-000"}', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
('64516568-bbd8-4e9c-993b-cc53a267adf5', 'Roberto Alves', 'roberto@email.com', '11999990007', 1200.00, 'delivered', 'retail', '[{"product_id": "prod-7", "product_name": "Produto G", "quantity": 4, "price": 300.00}]', '{"street": "Rua G", "number": "147", "city": "São Paulo", "state": "SP", "zipCode": "07000-000"}', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),

-- Pedidos da loja 4
('503c0969-e815-419e-9370-eb974002839e', 'Fernanda Rocha', 'fernanda@email.com', '11999990008', 350.00, 'delivered', 'retail', '[{"product_id": "prod-8", "product_name": "Produto H", "quantity": 2, "price": 175.00}]', '{"street": "Rua H", "number": "258", "city": "São Paulo", "state": "SP", "zipCode": "08000-000"}', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
('503c0969-e815-419e-9370-eb974002839e', 'Marcos Souza', 'marcos@email.com', '11999990009', 900.00, 'delivered', 'retail', '[{"product_id": "prod-9", "product_name": "Produto I", "quantity": 3, "price": 300.00}]', '{"street": "Rua I", "number": "369", "city": "São Paulo", "state": "SP", "zipCode": "09000-000"}', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'),

-- Pedidos da loja 5
('8a91baf1-62c6-49a8-8770-530f312972da', 'Patricia Mendes', 'patricia@email.com', '11999990010', 500.00, 'delivered', 'retail', '[{"product_id": "prod-10", "product_name": "Produto J", "quantity": 1, "price": 500.00}]', '{"street": "Rua J", "number": "741", "city": "São Paulo", "state": "SP", "zipCode": "10000-000"}', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
('8a91baf1-62c6-49a8-8770-530f312972da', 'Antonio Silva', 'antonio@email.com', '11999990011', 750.00, 'delivered', 'retail', '[{"product_id": "prod-11", "product_name": "Produto K", "quantity": 2, "price": 375.00}]', '{"street": "Rua K", "number": "852", "city": "São Paulo", "state": "SP", "zipCode": "11000-000"}', NOW() - INTERVAL '11 days', NOW() - INTERVAL '11 days'),

-- Pedidos com status diferentes
('c3dd0247-54ec-4bfc-a841-3562e0a69bac', 'Cliente Pendente', 'pendente@email.com', '11999990012', 100.00, 'pending', 'retail', '[{"product_id": "prod-12", "product_name": "Produto L", "quantity": 1, "price": 100.00}]', '{"street": "Rua L", "number": "963", "city": "São Paulo", "state": "SP", "zipCode": "12000-000"}', NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours'),
('54f270de-184c-454e-8301-81d7b1c23ecd', 'Cliente Confirmado', 'confirmado@email.com', '11999990013', 250.00, 'confirmed', 'retail', '[{"product_id": "prod-13", "product_name": "Produto M", "quantity": 1, "price": 250.00}]', '{"street": "Rua M", "number": "159", "city": "São Paulo", "state": "SP", "zipCode": "13000-000"}', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),
('64516568-bbd8-4e9c-993b-cc53a267adf5', 'Cliente Preparando', 'preparando@email.com', '11999990014', 400.00, 'preparing', 'retail', '[{"product_id": "prod-14", "product_name": "Produto N", "quantity": 2, "price": 200.00}]', '{"street": "Rua N", "number": "357", "city": "São Paulo", "state": "SP", "zipCode": "14000-000"}', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),
('503c0969-e815-419e-9370-eb974002839e', 'Cliente Enviando', 'enviando@email.com', '11999990015', 650.00, 'shipping', 'retail', '[{"product_id": "prod-15", "product_name": "Produto O", "quantity": 1, "price": 650.00}]', '{"street": "Rua O", "number": "753", "city": "São Paulo", "state": "SP", "zipCode": "15000-000"}', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),
('8a91baf1-62c6-49a8-8770-530f312972da', 'Cliente Cancelado', 'cancelado@email.com', '11999990016', 300.00, 'cancelled', 'retail', '[{"product_id": "prod-16", "product_name": "Produto P", "quantity": 1, "price": 300.00}]', '{"street": "Rua P", "number": "951", "city": "São Paulo", "state": "SP", "zipCode": "16000-000"}', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours');

-- Reabilitar RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Verificar se os dados foram inseridos
SELECT 
  COUNT(*) as total_orders,
  COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
  SUM(CASE WHEN status = 'delivered' THEN total_amount ELSE 0 END) as total_revenue
FROM public.orders;

