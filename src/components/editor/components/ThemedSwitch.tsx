
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { useEditorStore } from '../stores/useEditorStore';

interface ThemedSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
}

const ThemedSwitch: React.FC<ThemedSwitchProps> = ({
  checked,
  onCheckedChange,
  disabled = false,
  id,
  className = ''
}) => {
  const { configuration } = useEditorStore();

  const switchStyle = {
    '--switch-primary': configuration.colors.primary,
    '--switch-secondary': configuration.colors.secondary,
    '--switch-accent': configuration.colors.accent,
  } as React.CSSProperties;

  return (
    <div style={switchStyle}>
      <style>
        {`
          .themed-switch[data-state="checked"] {
            background-color: var(--switch-primary) !important;
          }
          
          .themed-switch[data-state="unchecked"] {
            background-color: #e2e8f0 !important;
          }
          
          .themed-switch:hover[data-state="checked"] {
            background-color: var(--switch-secondary) !important;
          }
          
          .themed-switch .switch-thumb[data-state="checked"] {
            transform: translateX(18px);
          }
        `}
      </style>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        id={id}
        className={`themed-switch ${className}`}
      />
    </div>
  );
};

export default ThemedSwitch;
