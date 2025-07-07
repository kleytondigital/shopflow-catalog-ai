
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
  return (
    <ImprovedProductFormWizard
      isOpen={true}
      onClose={onCancel || (() => {})}
      onSuccess={onComplete}
    />
  );
};

export default SimpleProductWizard;
