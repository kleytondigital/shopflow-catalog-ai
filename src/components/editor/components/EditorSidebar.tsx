
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Layout, Palette, Settings, Layers } from 'lucide-react';
import HeaderSettings from './settings/HeaderSettings';
import ProductCardSettings from './settings/ProductCardSettings';
import CheckoutSettings from './settings/CheckoutSettings';
import GlobalSettings from './settings/GlobalSettings';
import SectionsManager from './settings/SectionsManager';

const EditorSidebar: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Configurações</h2>
        <p className="text-sm text-gray-600">Personalize sua loja</p>
      </div>

      <Tabs defaultValue="layout" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4 m-4">
          <TabsTrigger value="layout" className="flex flex-col gap-1 py-3">
            <Layout size={16} />
            <span className="text-xs">Layout</span>
          </TabsTrigger>
          <TabsTrigger value="style" className="flex flex-col gap-1 py-3">
            <Palette size={16} />
            <span className="text-xs">Estilo</span>
          </TabsTrigger>
          <TabsTrigger value="sections" className="flex flex-col gap-1 py-3">
            <Layers size={16} />
            <span className="text-xs">Seções</span>
          </TabsTrigger>
          <TabsTrigger value="global" className="flex flex-col gap-1 py-3">
            <Settings size={16} />
            <span className="text-xs">Global</span>
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            <TabsContent value="layout" className="space-y-6 mt-0">
              <HeaderSettings />
              <ProductCardSettings />
              <CheckoutSettings />
            </TabsContent>

            <TabsContent value="style" className="space-y-6 mt-0">
              <GlobalSettings />
            </TabsContent>

            <TabsContent value="sections" className="space-y-6 mt-0">
              <SectionsManager />
            </TabsContent>

            <TabsContent value="global" className="space-y-6 mt-0">
              <GlobalSettings />
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default EditorSidebar;
