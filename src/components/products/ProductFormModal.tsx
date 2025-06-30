import React from "react";
import SimpleProductWizard from "./SimpleProductWizard";

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
  const handleSuccess = async () => {
    console.log("🎉 ProductFormModal - Produto salvo com sucesso");

    // Sempre chamar onSubmit para refresh da lista
    if (onSubmit) {
      try {
        await onSubmit({});
        console.log("✅ Lista de produtos atualizada com sucesso");
      } catch (error) {
        console.error("❌ Erro ao atualizar lista:", error);
      }
    }

    // Aguardar um pouco antes de fechar para garantir que o refresh terminou
    setTimeout(() => {
      onOpenChange(false);
    }, 100);
  };

  return (
    <SimpleProductWizard
      isOpen={open}
      onClose={() => onOpenChange(false)}
      editingProduct={mode === "edit" ? initialData : undefined}
      onSuccess={handleSuccess}
    />
  );
};

export default ProductFormModal;
