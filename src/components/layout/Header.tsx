
import React from 'react';
import { Bell, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  title: string;
  showAddButton?: boolean;
  onAddClick?: () => void;
  addButtonText?: string;
}

const Header = ({ title, showAddButton, onAddClick, addButtonText = "Adicionar" }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input 
              placeholder="Buscar..." 
              className="pl-10 w-80 input-modern"
            />
          </div>
          
          {showAddButton && (
            <Button 
              onClick={onAddClick}
              className="btn-primary gap-2"
            >
              <Plus size={20} />
              {addButtonText}
            </Button>
          )}
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full text-xs"></span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
