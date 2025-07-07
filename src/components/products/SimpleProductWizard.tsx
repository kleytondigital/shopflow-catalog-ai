
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
  const handleSuccess = (product: any) => {
    if (onComplete) {
      onComplete(product);
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
