
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Save, AlertTriangle } from 'lucide-react';
import { ProductVariation } from '@/components/products/ProductVariationsManager';

interface WizardActionButtonsProps {
  currentStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  hasUnsavedChanges: boolean;
  canProceedToNext: () => boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSave: () => void;
  mode: 'create' | 'edit';
  variations: ProductVariation[];
}

const WizardActionButtons: React.FC<WizardActionButtonsProps> = ({
  currentStep,
  totalSteps,
  isSubmitting,
  hasUnsavedChanges,
  canProceedToNext,
  onPrevious,
  onNext,
  onSave,
  mode,
  variations
}) => {
  // Log antes do salvamento
  const handleSaveClick = () => {
    console.log('🚨 BOTÃO SALVAR CLICADO - Estado das variações:', {
      variationsLength: variations.length,
      currentStep,
      mode,
      timestamp: new Date().toISOString(),
      variations: variations.map(v => ({ 
        id: v.id, 
        color: v.color, 
        size: v.size, 
        stock: v.stock 
      }))
    });
    onSave();
  };

  return (
    <div className="shrink-0 pt-6 border-t bg-background/95 backdrop-blur">
      <div className="flex justify-between gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={currentStep === 1}
          className="min-w-[100px]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>

        <div className="flex gap-2">
          {hasUnsavedChanges && (
            <Button
              type="button"
              onClick={handleSaveClick}
              disabled={isSubmitting}
              className="min-w-[100px] bg-blue-600 hover:bg-blue-700"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          )}
          
          {currentStep < totalSteps ? (
            <Button
              type="button"
              onClick={onNext}
              disabled={!canProceedToNext()}
              className="min-w-[100px]"
            >
              Próximo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSaveClick}
              disabled={isSubmitting}
              className="min-w-[120px] bg-green-600 hover:bg-green-700"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Salvando...' : mode === 'edit' ? 'Finalizar' : 'Criar Produto'}
            </Button>
          )}
        </div>
      </div>
      
      {/* Debug melhorado: Estado das variações */}
      {variations.length > 0 && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
          <strong>✅ VARIAÇÕES ATIVAS:</strong> {variations.length} variações no estado
          <div className="text-green-600 mt-1">
            {variations.slice(0, 3).map((v, i) => (
              <span key={i} className="mr-2">
                {v.color && `${v.color}`}{v.size && ` (${v.size})`} - Stock: {v.stock}
              </span>
            ))}
            {variations.length > 3 && '...'}
          </div>
        </div>
      )}

      {/* Aviso quando não há variações */}
      {variations.length === 0 && currentStep === 4 && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
          <strong>⚠️ NENHUMA VARIAÇÃO:</strong> Adicione variações no step atual
        </div>
      )}

      {/* Indicador de mudanças não salvas */}
      {hasUnsavedChanges && (
        <div className="mt-2 bg-yellow-100 border border-yellow-300 text-yellow-800 px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4" />
          Alterações não salvas
        </div>
      )}
    </div>
  );
};

export default WizardActionButtons;
