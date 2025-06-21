
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, RotateCw, Eye, EyeOff, Undo, Redo } from 'lucide-react';
import { useEditorStore } from '../stores/useEditorStore';
import { toast } from 'sonner';

const EditorToolbar: React.FC = () => {
  const { 
    isPreviewMode, 
    togglePreviewMode, 
    resetToDefault, 
    isDirty 
  } = useEditorStore();

  const handleSave = async () => {
    try {
      // Esta função será implementada quando necessário
      console.log('Salvando configurações...');
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    }
  };

  const handleReset = () => {
    if (window.confirm('Tem certeza que deseja resetar todas as configurações?')) {
      resetToDefault();
      toast.info('Configurações resetadas para o padrão');
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-gray-900">Editor Visual</h1>
          {isDirty && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
              Não salvo
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Ações de Edição */}
          <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
            <Button variant="ghost" size="sm" disabled>
              <Undo size={16} />
            </Button>
            <Button variant="ghost" size="sm" disabled>
              <Redo size={16} />
            </Button>
          </div>

          {/* Modo Preview */}
          <Button
            variant={isPreviewMode ? 'default' : 'outline'}
            size="sm"
            onClick={togglePreviewMode}
            className="flex items-center gap-2"
          >
            {isPreviewMode ? <EyeOff size={16} /> : <Eye size={16} />}
            {isPreviewMode ? 'Editar' : 'Preview'}
          </Button>

          {/* Ações Principais */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCw size={16} />
              Resetar
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={!isDirty}
              className="flex items-center gap-2"
            >
              <Save size={16} />
              Salvar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorToolbar;
