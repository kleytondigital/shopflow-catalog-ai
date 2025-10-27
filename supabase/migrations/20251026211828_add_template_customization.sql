-- Migration: Add Template Customization Fields to catalog_settings
-- Created: 2025-10-26
-- Description: Adds fields for advanced template customization including color palette extraction,
--              button styles, footer customization, and header badges

-- Add new columns to catalog_settings table
ALTER TABLE catalog_settings
ADD COLUMN IF NOT EXISTS logo_color_palette jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS auto_extract_colors boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS button_style text DEFAULT 'modern' CHECK (button_style IN ('flat', 'modern', 'rounded')),
ADD COLUMN IF NOT EXISTS footer_style text DEFAULT 'dark' CHECK (footer_style IN ('dark', 'light', 'gradient')),
ADD COLUMN IF NOT EXISTS footer_bg_color text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS footer_text_color text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS header_badges_enabled boolean DEFAULT true;

-- Add comments for documentation
COMMENT ON COLUMN catalog_settings.logo_color_palette IS 'JSON object containing extracted color palette from logo: {primary, secondary, accent, neutral, text, background}';
COMMENT ON COLUMN catalog_settings.auto_extract_colors IS 'Enable automatic color extraction from store logo';
COMMENT ON COLUMN catalog_settings.button_style IS 'Global button style for catalog: flat (minimal), modern (rounded with shadows), rounded (very rounded)';
COMMENT ON COLUMN catalog_settings.footer_style IS 'Footer appearance style: dark, light, or gradient';
COMMENT ON COLUMN catalog_settings.footer_bg_color IS 'Custom background color for footer (overrides footer_style)';
COMMENT ON COLUMN catalog_settings.footer_text_color IS 'Custom text color for footer (overrides footer_style)';
COMMENT ON COLUMN catalog_settings.header_badges_enabled IS 'Show conversion badges in header (Fast Delivery, Free Shipping, Secure Checkout)';

-- Create index on button_style for faster queries
CREATE INDEX IF NOT EXISTS idx_catalog_settings_button_style ON catalog_settings(button_style);

-- Create index on footer_style for faster queries
CREATE INDEX IF NOT EXISTS idx_catalog_settings_footer_style ON catalog_settings(footer_style);

-- Update existing records to have default values
UPDATE catalog_settings
SET 
  button_style = COALESCE(button_style, 'modern'),
  footer_style = COALESCE(footer_style, 'dark'),
  header_badges_enabled = COALESCE(header_badges_enabled, true),
  auto_extract_colors = COALESCE(auto_extract_colors, false)
WHERE button_style IS NULL 
   OR footer_style IS NULL 
   OR header_badges_enabled IS NULL 
   OR auto_extract_colors IS NULL;

