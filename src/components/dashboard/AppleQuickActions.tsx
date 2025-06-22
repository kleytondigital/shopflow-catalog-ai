
import React from 'react';
import { Plus, Package, ShoppingCart, Users, Settings } from 'lucide-react';

interface AppleQuickActionsProps {
  onNewProduct?: () => void;
}

const AppleQuickActions: React.FC<AppleQuickActionsProps> = ({ onNewProduct }) => {
  const actions = [
    {
      label: 'Novo Produto',
      icon: Plus,
      onClick: onNewProduct,
      primary: true
    },
    {
      label: 'Gerenciar Estoque',
      icon: Package,
      onClick: () => {},
      href: '/products'
    },
    {
      label: 'Ver Pedidos',
      icon: ShoppingCart,
      onClick: () => {},
      href: '/orders'
    },
    {
      label: 'Configurações',
      icon: Settings,
      onClick: () => {},
      href: '/settings'
    }
  ];

  return (
    <div className="apple-card">
      <div className="apple-card-header">
        <h3 className="apple-card-title">Ações Rápidas</h3>
        <p className="apple-card-subtitle">Acesso rápido às funcionalidades principais</p>
      </div>
      <div className="apple-card-content">
        <div className="apple-grid apple-grid-cols-2 apple-grid-lg-4">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`apple-button ${action.primary ? 'apple-button-primary' : 'apple-button-secondary'} w-full justify-center py-4`}
            >
              <action.icon size={18} />
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppleQuickActions;
