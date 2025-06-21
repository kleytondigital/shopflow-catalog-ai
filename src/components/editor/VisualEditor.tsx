
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, Tablet, Smartphone, Save, RotateCw, Eye } from 'lucide-react';
import EditorSidebar from './components/EditorSidebar';
import EditorPreview from './components/EditorPreview';
import EditorToolbar from './components/EditorToolbar';
import { useEditorStore } from './stores/useEditorStore';

const VisualEditor: React.FC = () => {
  const { 
    currentDevice, 
    setCurrentDevice, 
    isPreviewMode, 
    togglePreviewMode,
    saveConfiguration,
    resetToDefault
  } = useEditorStore();

  const devices = [
    { id: 'desktop', icon: Monitor, label: 'Desktop', width: '100%' },
    { id: 'tablet', icon: Tablet, label: 'Tablet', width: '768px' },
    { id: 'mobile', icon: Smartphone, label: 'Mobile', width: '375px' }
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Toolbar Superior */}
      <EditorToolbar />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Painel Lateral */}
        {!isPreviewMode && (
          <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
            <EditorSidebar />
          </div>
        )}

        {/* Área Principal - Preview */}
        <div className="flex-1 flex flex-col bg-gray-100">
          {/* Seletor de Dispositivo */}
          <div className="bg-white border-b border-gray-200 p-4">
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

          {/* Preview Container */}
          <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
            <div 
              className="bg-white shadow-2xl rounded-lg overflow-hidden transition-all duration-300"
              style={{ 
                width: devices.find(d => d.id === currentDevice)?.width,
                maxWidth: '100%',
                height: currentDevice === 'mobile' ? '667px' : 'auto',
                minHeight: currentDevice === 'tablet' ? '1024px' : 'auto'
              }}
            >
              <EditorPreview />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualEditor;
