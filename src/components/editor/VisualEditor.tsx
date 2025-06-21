
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, Tablet, Smartphone, Save, RotateCw, Eye, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EditorSidebar from './components/EditorSidebar';
import EditorPreview from './components/EditorPreview';
import EditorToolbar from './components/EditorToolbar';
import { useEditorStore } from './stores/useEditorStore';
import { useUnifiedEditor } from '@/hooks/useUnifiedEditor';
import { toast } from 'sonner';

const VisualEditor: React.FC = () => {
  const navigate = useNavigate();
  const { 
    currentDevice, 
    setCurrentDevice, 
    isPreviewMode, 
    togglePreviewMode,
    resetToDefault
  } = useEditorStore();
  
  const { saveToDatabase, isConnected, loading, isDirty, applyStylesImmediately } = useUnifiedEditor();
  const [isSaving, setIsSaving] = useState(false);

  // Aplicar estilos quando o editor carregar
  useEffect(() => {
    applyStylesImmediately();
  }, [applyStylesImmediately]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await saveToDatabase();
      toast.success('✅ Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('❌ Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackToDashboard = () => {
    if (isDirty) {
      const shouldLeave = window.confirm('Você tem alterações não salvas. Deseja sair mesmo assim?');
      if (!shouldLeave) return;
    }
    navigate('/');
  };

  const handleReset = () => {
    if (window.confirm('Tem certeza que deseja resetar todas as configurações?')) {
      resetToDefault();
      applyStylesImmediately();
      toast.info('🔄 Configurações resetadas para o padrão');
    }
  };

  const devices = [
    { id: 'desktop', icon: Monitor, label: 'Desktop', width: '100%' },
    { id: 'tablet', icon: Tablet, label: 'Tablet', width: '768px' },
    { id: 'mobile', icon: Smartphone, label: 'Mobile', width: '375px' }
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Toolbar Superior */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToDashboard}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Dashboard
            </Button>
            
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">🎨 Editor Visual</h1>
              {isDirty && (
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                  Não salvo
                </span>
              )}
              {loading && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  Carregando...
                </span>
              )}
              {!isConnected && !loading && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                  Desconectado
                </span>
              )}
              {isConnected && !loading && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  ✅ Conectado
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Modo Preview */}
            <Button
              variant={isPreviewMode ? 'default' : 'outline'}
              size="sm"
              onClick={togglePreviewMode}
              className="flex items-center gap-2"
            >
              <Eye size={16} />
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
                disabled={!isDirty || !isConnected || isSaving}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Save size={16} />
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Painel Lateral */}
        {!isPreviewMode && (
          <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
            <EditorSidebar />
          </div>
        )}

        {/* Área Principal - Preview */}
        <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden">
          {/* Seletor de Dispositivo */}
          <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
            <div className="flex items-center justify-center gap-2">
              {devices.map((device) => {
                const IconComponent = device.icon;
                return (
                  <Button
                    key={device.id}
                    variant={currentDevice === device.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentDevice(device.id as any)}
                    className="flex items-center gap-2"
                  >
                    <IconComponent size={16} />
                    <span className="hidden sm:inline">{device.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Preview Container - Agora com scroll próprio */}
          <div className="flex-1 p-8 overflow-auto">
            <div className="flex items-start justify-center min-h-full">
              <div 
                className="bg-white shadow-2xl rounded-lg overflow-hidden transition-all duration-300"
                style={{ 
                  width: devices.find(d => d.id === currentDevice)?.width,
                  maxWidth: '100%',
                  minHeight: currentDevice === 'mobile' ? '667px' : '800px',
                }}
              >
                <EditorPreview />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualEditor;
