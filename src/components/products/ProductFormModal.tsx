
import React from "react";
import ImprovedProductFormWizard from "./ImprovedProductFormWizard";

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: any) => Promise<void>;
  initialData?: any;
  mode: "create" | "edit";
}

const ProductFormModal = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: ProductFormModalProps) => {
  if (!open) return null;

  const handleSuccess = () => {
    if (onSubmit) {
      try {
        onSubmit({});
      } catch (error) {
        console.error("❌ Erro ao atualizar lista:", error);
      }
    }

    setTimeout(() => {
      onOpenChange(false);
    }, 100);
  };

  return (
    <ImprovedProductFormWizard
      isOpen={open}
      onClose={() => onOpenChange(false)}
      editingProduct={initialData}
      onSuccess={handleSuccess}
    />
  );
};

export default ProductFormModal;
