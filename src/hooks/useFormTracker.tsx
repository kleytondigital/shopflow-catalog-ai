
import { useEffect, useState, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface UseFormTrackerProps {
  form: UseFormReturn<any>;
  onUnsavedChanges?: (hasChanges: boolean) => void;
}

export const useFormTracker = ({ form, onUnsavedChanges }: UseFormTrackerProps) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const initialValuesRef = useRef<any>(null);
  const isDirtyRef = useRef(false);

  // Capturar valores iniciais quando o formulário é resetado
  useEffect(() => {
    const subscription = form.watch((values) => {
      if (!initialValuesRef.current) {
        initialValuesRef.current = { ...values };
        return;
      }

      // Comparar valores atuais com os iniciais
      const currentValues = { ...values };
      const hasChanges = JSON.stringify(currentValues) !== JSON.stringify(initialValuesRef.current);
      
      if (hasChanges !== hasUnsavedChanges) {
        setHasUnsavedChanges(hasChanges);
        onUnsavedChanges?.(hasChanges);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, hasUnsavedChanges, onUnsavedChanges]);

  const markAsSaved = () => {
    const currentValues = form.getValues();
    initialValuesRef.current = { ...currentValues };
    setHasUnsavedChanges(false);
    onUnsavedChanges?.(false);
  };

  const reset = () => {
    initialValuesRef.current = null;
    setHasUnsavedChanges(false);
    onUnsavedChanges?.(false);
  };

  return {
    hasUnsavedChanges,
    markAsSaved,
    reset
  };
};
