
import React from 'react';
import { useEditorStore } from '../stores/useEditorStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { CatalogPreview } from './CatalogPreview';
import { CheckoutPreview } from './CheckoutPreview';

const EditorPreview: React.FC = () => {
  const { activeTab, setActiveTab } = useEditorStore();
  const isMobile = useIsMobile();

  const tabs = [
    { id: 'catalog', label: 'Catálogo' },
    { id: 'checkout', label: 'Checkout' }
  ];

  return (
    <div className="h-full flex flex-col min-h-[400px] md:min-h-[600px]">
      {/* Preview Tabs - Responsivo */}
      <div className="border-b border-gray-200 px-2 md:px-4 py-1 md:py-2 flex-shrink-0">
        <div className="flex gap-1 md:gap-2">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm rounded-md transition-colors ${
                activeTab === id 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {isMobile && label === 'Catálogo' ? 'Cat.' : (isMobile && label === 'Checkout' ? 'Check.' : label)}
            </button>
          ))}
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'catalog' && <CatalogPreview />}
        {activeTab === 'checkout' && <CheckoutPreview />}
      </div>
    </div>
  );
};

export default EditorPreview;
