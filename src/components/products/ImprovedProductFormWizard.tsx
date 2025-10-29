import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useImprovedProductFormWizard } from "@/hooks/useImprovedProductFormWizard";
import {
  DraftImagesProvider,
  useDraftImagesContext,
} from "@/contexts/DraftImagesContext";
import ImprovedWizardStepNavigation from "./wizard/ImprovedWizardStepNavigation";
import WizardStepContent from "./wizard/WizardStepContent";
import ImprovedWizardActionButtons from "./wizard/ImprovedWizardActionButtons";

interface ImprovedProductFormWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (productId: string) => void;
  editingProduct?: any;
}

const ImprovedProductFormWizardContent: React.FC<
  ImprovedProductFormWizardProps
> = ({ isOpen, onClose, onSuccess, editingProduct }) => {
  const {
    formData,
    updateFormData,
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    canProceed,
    loading,
    resetForm,
    steps,
    saveProduct,
    loadProductForEditing,
  } = useImprovedProductFormWizard(editingProduct, onSuccess); // 🎯 PASSAR PARÂMETROS

  const { uploadAllImages, clearDraftImages, loadExistingImages } =
    useDraftImagesContext();

  React.useEffect(() => {
    console.log("🧙 WIZARD - useEffect triggered:", {
      editingProduct: !!editingProduct,
      isOpen,
    });

    if (editingProduct && isOpen) {
      console.log(
        "🧙 WIZARD - Carregando dados do produto para edição:",
        editingProduct.id
      );

      // **NOVA ABORDAGEM**: Carregar produto com callback para imagens
      loadProductForEditing(editingProduct, loadExistingImages);
    }
  }, [editingProduct, isOpen, loadProductForEditing, loadExistingImages]);

  const handleSave = async () => {
    try {
      console.log("🔄 WIZARD - Iniciando salvamento do produto");
      const productId = await saveProduct(editingProduct?.id, uploadAllImages);

      if (productId) {
        console.log("✅ WIZARD - Produto salvo com sucesso:", productId);
        clearDraftImages();
        resetForm();
        onClose();
        if (onSuccess) {
          onSuccess(productId);
        }
      }
    } catch (error) {
      console.error("❌ WIZARD - Erro ao salvar produto:", error);
    }
  };

  const handleClose = () => {
    clearDraftImages();
    resetForm();
    onClose();
  };

  const isLastStep = currentStep === steps.length - 1;

  // Convert steps to match expected interface
  const navigationSteps = steps.map((step) => ({
    id: step.id.toString(),
    title: step.label,
    description: step.description,
  }));

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] md:max-w-4xl max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col p-4 md:p-6">
        <DialogHeader className="pb-2 md:pb-4">
          <DialogTitle className="text-lg md:text-xl font-semibold">
            {editingProduct ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0 gap-2 md:gap-4">
          {/* Step Navigation */}
          <ImprovedWizardStepNavigation
            steps={navigationSteps}
            currentStep={currentStep}
            onStepClick={goToStep}
          />

          {/* Step Content */}
          <div className="flex-1 overflow-y-auto px-1 md:px-6 py-2 md:py-4">
            <WizardStepContent
              currentStep={currentStep}
              formData={formData}
              updateFormData={updateFormData}
              productId={editingProduct?.id}
              isEditing={!!editingProduct}
            />
          </div>

          {/* Action Buttons */}
          <ImprovedWizardActionButtons
            currentStep={currentStep}
            totalSteps={steps.length}
            canProceed={canProceed()}
            isSaving={loading}
            onPrevious={prevStep}
            onNext={nextStep}
            onSave={handleSave}
            onCancel={handleClose}
            isLastStep={isLastStep}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ImprovedProductFormWizard: React.FC<ImprovedProductFormWizardProps> = (
  props
) => {
  return (
    <DraftImagesProvider>
      <ImprovedProductFormWizardContent {...props} />
    </DraftImagesProvider>
  );
};

export default ImprovedProductFormWizard;
