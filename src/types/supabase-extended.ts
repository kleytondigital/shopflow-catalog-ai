// Tipos estendidos para as tabelas criadas pelo database_fix.sql
// Este arquivo complementa os tipos gerados automaticamente pelo Supabase

export interface StorePaymentMethod {
  id: string;
  store_id: string;
  name: string;
  type: "pix" | "credit_card" | "debit_card" | "bank_transfer" | "cash" | "crypto";
  is_active: boolean;
  config?: {
    pix_key?: string;
    pix_key_type?: string;
    gateway_config?: any;
    instructions?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface StoreShippingMethod {
  id: string;
  store_id: string;
  name: string;
  type: "pickup" | "delivery" | "correios" | "custom";
  is_active: boolean;
  price: number;
  estimated_days?: number;
  config?: {
    instructions?: string;
    pickup_address?: string;
    delivery_zones?: string[];
    custom_instructions?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface StoreOrderBumpConfig {
  id: string;
  store_id: string;
  product_id: string;
  is_active: boolean;
  discount_percentage: number;
  urgency_text: string;
  social_proof_text: string;
  bundle_price?: number;
  is_limited_time: boolean;
  limited_quantity: number;
  trigger_conditions: any;
  created_at: string;
  updated_at: string;
}

export interface StoreSettings {
  id: string;
  store_id: string;
  checkout_upsell_enabled: boolean;
  urgency_timer_enabled: boolean;
  social_proof_enabled: boolean;
  trust_badges_enabled: boolean;
  quick_add_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Estender o namespace Database do Supabase
declare global {
  namespace Database {
    interface Tables {
      store_payment_methods: {
        Row: StorePaymentMethod;
        Insert: Omit<StorePaymentMethod, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<StorePaymentMethod, 'id' | 'created_at' | 'updated_at'>>;
      };
      store_shipping_methods: {
        Row: StoreShippingMethod;
        Insert: Omit<StoreShippingMethod, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<StoreShippingMethod, 'id' | 'created_at' | 'updated_at'>>;
      };
      store_order_bump_configs: {
        Row: StoreOrderBumpConfig;
        Insert: Omit<StoreOrderBumpConfig, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<StoreOrderBumpConfig, 'id' | 'created_at' | 'updated_at'>>;
      };
      store_settings: {
        Row: StoreSettings;
        Insert: Omit<StoreSettings, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<StoreSettings, 'id' | 'created_at' | 'updated_at'>>;
      };
    }
  }
}
