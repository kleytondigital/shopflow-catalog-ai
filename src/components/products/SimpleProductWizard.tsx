
import React from 'react';
import ImprovedProductFormWizard from './ImprovedProductFormWizard';

export interface SimpleProductWizardProps {
  onComplete?: (product: any) => void;
  onCancel?: () => void;
}

const SimpleProductWizard: React.FC<SimpleProductWizardProps> = ({
  onComplete,
  onCancel,
}) => {
  const handleSuccess = () => {
    // O ImprovedProductFormWizard não passa o produto no onSuccess
    // então chamamos onComplete sem parâmetros ou com um objeto vazio
    if (onComplete) {
      onComplete({});
    }
  };

  return (
    <ImprovedProductFormWizard
      isOpen={true}
      onClose={onCancel || (() => {})}
      onSuccess={handleSuccess}
    />
  );
};

export default SimpleProductWizard;
