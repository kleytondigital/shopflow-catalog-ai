
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, Tablet, Smartphone, Save, RotateCw, Eye, ArrowLeft, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import EditorSidebar from './components/EditorSidebar';
import EditorPreview from './components/EditorPreview';
import EditorToolbar from './components/EditorToolbar';
import { useEditorStore } from './stores/useEditorStore';
import { useUnifiedEditor } from '@/hooks/useUnifiedEditor';
import { toast } from 'sonner';

const VisualEditor: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
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

  const SidebarContent = () => (
    <div className="h-full">
      <EditorSidebar />
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Toolbar Superior - Responsivo */}
      <div className="bg-white border-b border-gray-200 px-3 md:px-6 py-2 md:py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToDashboard}
              className="flex items-center gap-1 md:gap-2 text-xs md:text-sm"
            >
              <ArrowLeft size={14} className="md:w-4 md:h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
            
            <div className="flex items-center gap-1 md:gap-2">
              <h1 className="text-sm md:text-xl font-bold text-gray-900">
                {isMobile ? '🎨' : '🎨 Editor Visual'}
              </h1>
              {isDirty && (
                <span className="text-xs bg-orange-100 text-orange-700 px-1 md:px-2 py-0.5 md:py-1 rounded-full">
                  {isMobile ? '•' : 'Não salvo'}
                </span>
              )}
              {loading && (
                <span className="text-xs bg-blue-100 text-blue-700 px-1 md:px-2 py-0.5 md:py-1 rounded-full">
                  ⏳
                </span>
              )}
              {!isConnected && !loading && (
                <span className="text-xs bg-red-100 text-red-700 px-1 md:px-2 py-0.5 md:py-1 rounded-full">
                  ❌
                </span>
              )}
              {isConnected && !loading && (
                <span className="text-xs bg-green-100 text-green-700 px-1 md:px-2 py-0.5 md:py-1 rounded-full">
                  ✅
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-3">
            {/* Mobile Sidebar Toggle */}
            {isMobile && !isPreviewMode && (
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="p-2">
                    <Menu size={16} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            )}

            {/* Modo Preview */}
            <Button
              variant={isPreviewMode ? 'default' : 'outline'}
              size="sm"
              onClick={togglePreviewMode}
              className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3"
            >
              <Eye size={14} className="md:w-4 md:h-4" />
              <span className="hidden sm:inline">{isPreviewMode ? 'Editar' : 'Preview'}</span>
            </Button>

            {/* Ações Principais */}
            <div className="flex items-center gap-1 md:gap-2">
              {!isMobile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="flex items-center gap-2 text-xs md:text-sm"
                >
                  <RotateCw size={14} className="md:w-4 md:h-4" />
                  Resetar
                </Button>
              )}
              
              <Button
                onClick={handleSave}
                disabled={!isDirty || !isConnected || isSaving}
                className="flex items-center gap-1 md:gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-xs md:text-sm px-2 md:px-4"
              >
                <Save size={14} className="md:w-4 md:h-4" />
                {isSaving ? (isMobile ? '...' : 'Salvando...') : (isMobile ? 'Salvar' : 'Salvar')}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Painel Lateral - Desktop */}
        {!isPreviewMode && !isMobile && (
          <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
            <SidebarContent />
          </div>
        )}

        {/* Área Principal - Preview */}
        <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden">
          {/* Seletor de Dispositivo - Responsivo */}
          <div className="bg-white border-b border-gray-200 p-2 md:p-4 flex-shrink-0">
            <div className="flex items-center justify-center gap-1 md:gap-2">
              {devices.map((device) => {
                const IconComponent = device.icon;
                return (
                  <Button
                    key={device.id}
                    variant={currentDevice === device.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentDevice(device.id as any)}
                    className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3"
                  >
                    <IconComponent size={14} className="md:w-4 md:h-4" />
                    <span className="hidden sm:inline">{device.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Preview Container - Responsivo */}
          <div className="flex-1 p-2 md:p-8 overflow-auto">
            <div className="flex items-start justify-center min-h-full">
              <div 
                className="bg-white shadow-2xl rounded-lg overflow-hidden transition-all duration-300"
                style={{ 
                  width: isMobile ? '100%' : devices.find(d => d.id === currentDevice)?.width,
                  maxWidth: '100%',
                  minHeight: isMobile ? '400px' : (currentDevice === 'mobile' ? '667px' : '800px'),
                }}
              >
                <EditorPreview />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Reset Button - Floating */}
      {isMobile && (
        <div className="fixed bottom-4 left-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="bg-white shadow-lg border-2 p-2"
          >
            <RotateCw size={16} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default VisualEditor;
