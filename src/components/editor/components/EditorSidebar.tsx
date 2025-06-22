
import React, { useState } from 'react';
import { Settings, Layout, Package, ShoppingCart, Grid3X3, FileText } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import GlobalSettings from './settings/GlobalSettings';
import HeaderSettings from './settings/HeaderSettings';
import ProductCardSettings from './settings/ProductCardSettings';
import CheckoutSettings from './settings/CheckoutSettings';
import SectionsManager from './settings/SectionsManager';
import FooterSettings from './settings/FooterSettings';

const EditorSidebar: React.FC = () => {
  const [activeSection, setActiveSection] = useState('global');
  const isMobile = useIsMobile();

  const sections = [
    { id: 'global', label: 'Global', icon: Settings },
    { id: 'header', label: 'Cabeçalho', icon: Layout },
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'footer', label: 'Footer', icon: FileText },
    { id: 'checkout', label: 'Checkout', icon: ShoppingCart },
    { id: 'sections', label: 'Seções', icon: Grid3X3 }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Navigation Tabs - Responsivo */}
      <div className="border-b border-gray-200 p-2 md:p-4">
        <nav className={`flex ${isMobile ? 'flex-row overflow-x-auto pb-2' : 'flex-col'} space-y-0 ${isMobile ? 'space-x-1' : 'space-y-1'}`}>
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex items-center gap-2 px-2 md:px-3 py-2 text-xs md:text-sm rounded-md transition-colors ${isMobile ? 'whitespace-nowrap flex-shrink-0' : ''} ${
                activeSection === id 
                  ? 'bg-blue-50 text-blue-600 font-medium' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={14} className="md:w-4 md:h-4" />
              <span className={isMobile ? 'text-xs' : ''}>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto p-2 md:p-4">
        {activeSection === 'global' && <GlobalSettings />}
        {activeSection === 'header' && <HeaderSettings />}
        {activeSection === 'products' && <ProductCardSettings />}
        {activeSection === 'footer' && <FooterSettings />}
        {activeSection === 'checkout' && <CheckoutSettings />}
        {activeSection === 'sections' && <SectionsManager />}
      </div>
    </div>
  );
};

export default EditorSidebar;
