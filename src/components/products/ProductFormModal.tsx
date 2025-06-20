
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProductFormWizard from './ProductFormWizard';

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="
        w-[100vw] h-[100vh] max-w-none max-h-none m-0 p-0 
        sm:w-[95vw] sm:h-[95vh] sm:max-w-5xl sm:max-h-[95vh] sm:m-auto sm:rounded-lg
        overflow-hidden flex flex-col
      ">
        <DialogHeader className="px-6 py-4 border-b bg-background/95 backdrop-blur shrink-0">
          <DialogTitle className="text-xl font-semibold">
            {mode === 'edit' ? 'Editar Produto' : 'Novo Produto'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden p-6">
          <ProductFormWizard
            onSubmit={onSubmit}
            initialData={initialData}
            mode={mode}
            onClose={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormModal;
