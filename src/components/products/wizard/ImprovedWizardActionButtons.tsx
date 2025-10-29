import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Save, Loader2 } from "lucide-react";

interface ImprovedWizardActionButtonsProps {
  currentStep: number;
  totalSteps: number;
  canProceed: boolean;
  isSaving: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSave: () => void;
  onCancel: () => void;
  isLastStep: boolean;
}

const ImprovedWizardActionButtons: React.FC<
  ImprovedWizardActionButtonsProps
> = ({
  currentStep,
  totalSteps,
  canProceed,
  isSaving,
  onPrevious,
  onNext,
  onSave,
  onCancel,
  isLastStep,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 md:gap-0 p-3 md:p-6 border-t bg-gray-50/50">
      <div className="flex items-center gap-2 md:gap-3 justify-between md:justify-start order-2 md:order-1">
        {/* Previous Button */}
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={currentStep === 0 || isSaving}
          className="flex-1 md:flex-initial md:min-w-[100px]"
          size="sm"
        >
          <ChevronLeft className="h-4 w-4 mr-1 md:mr-2" />
          <span className="hidden sm:inline">Anterior</span>
          <span className="sm:hidden">Ant</span>
        </Button>

        {/* Cancel Button - Hide on mobile */}
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={isSaving}
          className="hidden md:flex md:min-w-[100px]"
          size="sm"
        >
          Cancelar
        </Button>
      </div>

      <div className="flex items-center gap-2 md:gap-3 order-1 md:order-2">
        {/* Cancel Button - Show on mobile */}
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={isSaving}
          className="flex md:hidden flex-1"
          size="sm"
        >
          Cancelar
        </Button>

        {/* Next/Save Button */}
        {isLastStep ? (
          <Button
            onClick={() => {
              console.log("🔘 BOTÃO SALVAR CLICADO - Step:", currentStep);
              onSave();
            }}
            disabled={!canProceed || isSaving}
            className="flex-1 md:flex-initial md:min-w-[130px] bg-primary hover:bg-primary/90"
            size="sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 md:mr-2 animate-spin" />
                <span className="hidden sm:inline">Salvando...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Salvar Produto</span>
                <span className="sm:hidden">Salvar</span>
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={onNext}
            disabled={!canProceed || isSaving}
            className="flex-1 md:flex-initial md:min-w-[100px]"
            size="sm"
          >
            <span className="hidden sm:inline">Próximo</span>
            <span className="sm:hidden">Prox</span>
            <ChevronRight className="h-4 w-4 ml-1 md:ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ImprovedWizardActionButtons;
