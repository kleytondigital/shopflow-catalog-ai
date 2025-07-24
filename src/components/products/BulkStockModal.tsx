
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import BulkStockManager from './BulkStockManager';
import { Product } from '@/types/product';

interface BulkStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onStockUpdated: () => void;
}

const BulkStockModal: React.FC<BulkStockModalProps> = ({
  isOpen,
  onClose,
  products,
  onStockUpdated
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestão de Estoque em Massa</DialogTitle>
        </DialogHeader>
        <BulkStockManager 
          products={products}
          onStockUpdated={() => {
            onStockUpdated();
            onClose();
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BulkStockModal;
