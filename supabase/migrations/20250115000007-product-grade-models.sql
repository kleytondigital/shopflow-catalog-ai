-- Migration: Criação da tabela de modelos de grade para produtos (product_grade_models)
create table if not exists product_grade_models (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade not null,
  grade_name text not null,
  sizes jsonb not null, -- Ex: [34,35,36,37,38,39]
  quantities jsonb not null, -- Ex: [1,2,3,3,2,1]
  color text, -- Opcional: cor da grade
  min_order integer default 1, -- Pedido mínimo de grades
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Índice para busca rápida por produto
create index if not exists idx_product_grade_models_product_id on product_grade_models(product_id); 