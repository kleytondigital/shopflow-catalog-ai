
import React from 'react';
import SimpleProductWizard from './SimpleProductWizard';

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: any) => Promise<void>;
  initialData?: any;
  mode: 'create' | 'edit';
}

const ProductFormModal = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode
}: ProductFormModalProps) => {
  const handleSuccess = () => {
    onOpenChange(false);
    
    if (onSubmit) {
      onSubmit({}).catch(console.error);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <SimpleProductWizard
      isOpen={open}
      onClose={handleClose}
      editingProduct={mode === 'edit' ? initialData : undefined}
      onSuccess={handleSuccess}
    />
  );
};

export default ProductFormModal;
