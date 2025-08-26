
import { useMemo } from 'react';
import { useCatalogSettings } from './useCatalogSettings';

export interface TemplateColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  gradientFrom: string;
  gradientTo: string;
}

const defaultColorSchemes: Record<string, TemplateColorScheme> = {
  luxury: {
    primary: '#D97706',
    secondary: '#F59E0B',
    accent: '#EAB308',
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F8FAFC',
    textMuted: '#CBD5E1',
    border: '#D97706',
    gradientFrom: '#D97706',
    gradientTo: '#F59E0B'
  },
  tech: {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#06B6D4',
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F8FAFC',
    textMuted: '#94A3B8',
    border: '#3B82F6',
    gradientFrom: '#3B82F6',
    gradientTo: '#8B5CF6'
  },
  fashion: {
    primary: '#EC4899',
    secondary: '#F97316',
    accent: '#EF4444',
    background: '#FDF2F8',
    surface: '#FFFFFF',
    text: '#BE185D',
    textMuted: '#F472B6',
    border: '#F9A8D4',
    gradientFrom: '#EC4899',
    gradientTo: '#F97316'
  },
  health: {
    primary: '#059669',
    secondary: '#0D9488',
    accent: '#3B82F6',
    background: '#ECFDF5',
    surface: '#FFFFFF',
    text: '#064E3B',
    textMuted: '#6B7280',
    border: '#A7F3D0',
    gradientFrom: '#059669',
    gradientTo: '#0D9488'
  },
  sports: {
    primary: '#DC2626',
    secondary: '#EA580C',
    accent: '#EAB308',
    background: '#7F1D1D',
    surface: '#991B1B',
    text: '#FEF2F2',
    textMuted: '#FCA5A5',
    border: '#DC2626',
    gradientFrom: '#DC2626',
    gradientTo: '#EA580C'
  },
  modern: {
    primary: '#0057FF',
    secondary: '#FF6F00',
    accent: '#8E2DE2',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#1E293B',
    textMuted: '#64748B',
    border: '#E2E8F0',
    gradientFrom: '#0057FF',
    gradientTo: '#8E2DE2'
  },
  minimal: {
    primary: '#1F2937',
    secondary: '#059669',
    accent: '#DC2626',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textMuted: '#6B7280',
    border: '#E5E7EB',
    gradientFrom: '#1F2937',
    gradientTo: '#059669'
  },
  elegant: {
    primary: '#D97706',
    secondary: '#92400E',
    accent: '#7C2D12',
    background: '#FFFBEB',
    surface: '#FFFFFF',
    text: '#78350F',
    textMuted: '#A16207',
    border: '#FDE68A',
    gradientFrom: '#D97706',
    gradientTo: '#92400E'
  },
  industrial: {
    primary: '#475569',
    secondary: '#F59E0B',
    accent: '#DC2626',
    background: '#F1F5F9',
    surface: '#FFFFFF',
    text: '#334155',
    textMuted: '#64748B',
    border: '#CBD5E1',
    gradientFrom: '#475569',
    gradientTo: '#F59E0B'
  }
};

export const useTemplateColors = (storeIdentifier?: string) => {
  const { settings } = useCatalogSettings(storeIdentifier);
  
  const colorScheme = useMemo(() => {
    const templateName = settings?.template_name || 'modern';
    const baseColors = defaultColorSchemes[templateName] || defaultColorSchemes.modern;
    
    // Usar cores personalizadas do banco se disponíveis
    if (settings) {
      return {
        primary: settings.primary_color || baseColors.primary,
        secondary: settings.secondary_color || baseColors.secondary,
        accent: settings.accent_color || baseColors.accent,
        background: settings.background_color || baseColors.background,
        surface: '#FFFFFF', // Sempre branco para cards
        text: settings.text_color || baseColors.text,
        textMuted: baseColors.textMuted, // Manter padrão
        border: settings.border_color || baseColors.border,
        gradientFrom: settings.primary_color || baseColors.gradientFrom,
        gradientTo: settings.secondary_color || baseColors.gradientTo,
      };
    }
    
    return baseColors;
  }, [settings]);

  const applyColorsToDocument = () => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      root.style.setProperty('--template-primary', colorScheme.primary);
      root.style.setProperty('--template-secondary', colorScheme.secondary);
      root.style.setProperty('--template-accent', colorScheme.accent);
      root.style.setProperty('--template-background', colorScheme.background);
      root.style.setProperty('--template-surface', colorScheme.surface);
      root.style.setProperty('--template-text', colorScheme.text);
      root.style.setProperty('--template-text-muted', colorScheme.textMuted);
      root.style.setProperty('--template-border', colorScheme.border);
      root.style.setProperty('--template-gradient-from', colorScheme.gradientFrom);
      root.style.setProperty('--template-gradient-to', colorScheme.gradientTo);
      
      console.log('Cores aplicadas ao documento:', colorScheme);
    }
  };

  const resetToTemplateDefaults = (templateName: string) => {
    const defaults = defaultColorSchemes[templateName] || defaultColorSchemes.modern;
    return {
      primary_color: defaults.primary,
      secondary_color: defaults.secondary,
      accent_color: defaults.accent,
      background_color: defaults.background,
      text_color: defaults.text,
      border_color: defaults.border,
    };
  };

  return {
    colorScheme,
    applyColorsToDocument,
    resetToTemplateDefaults,
    templateName: settings?.template_name || 'modern'
  };
};
