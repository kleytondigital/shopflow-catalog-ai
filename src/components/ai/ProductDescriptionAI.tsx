
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import ImprovedAIToolsModal from '@/components/products/ImprovedAIToolsModal';

interface ProductDescriptionAIProps {
  productName: string;
  category: string;
  onDescriptionGenerated: (description: string) => void;
  disabled?: boolean;
}

const ProductDescriptionAI: React.FC<ProductDescriptionAIProps> = ({
  productName,
  category,
  onDescriptionGenerated,
  disabled = false
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setModalOpen(true)}
        disabled={disabled}
        className="flex items-center gap-2"
      >
        <Sparkles className="h-4 w-4" />
        IA
      </Button>

      <ImprovedAIToolsModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        productName={productName}
        category={category}
        onDescriptionGenerated={onDescriptionGenerated}
      />
    </>
  );
};

export default ProductDescriptionAI;
