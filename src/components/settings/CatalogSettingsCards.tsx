import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Eye, 
  Smartphone, 
  Gift, 
  Zap, 
  Sparkles, 
  Share2,
  Package,
  ChevronLeft,
  CheckCircle2
} from 'lucide-react';

interface CatalogSettingsCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  component: React.ComponentType<any>;
  badge?: string;
}

interface CatalogSettingsCardsProps {
  cards: CatalogSettingsCard[];
  onCardSelect: (cardId: string) => void;
  selectedCard: string | null;
}

const CatalogSettingsCards: React.FC<CatalogSettingsCardsProps> = ({ 
  cards, 
  onCardSelect, 
  selectedCard 
}) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  if (selectedCard) {
    const card = cards.find(c => c.id === selectedCard);
    
    if (!card) return null;

    const CardComponent = card.component;

    return (
      <div className="space-y-6">
        {/* Botão Voltar */}
        <Button
          variant="ghost"
          onClick={() => onCardSelect(null)}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar para Configurações
        </Button>

        {/* Conteúdo do Card */}
        <div className="space-y-4">
          {/* Header do Card */}
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className={`p-2 rounded-lg ${card.color}`}>
              {card.icon}
            </div>
            <div>
              <h3 className="text-xl font-semibold">{card.title}</h3>
              <p className="text-sm text-gray-600">{card.description}</p>
            </div>
          </div>

          {/* Componente Específico */}
          <CardComponent />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Card
            key={card.id}
            className={`
              cursor-pointer transition-all duration-200 hover:shadow-lg
              ${hoveredCard === card.id ? 'ring-2 ring-primary' : ''}
            `}
            onMouseEnter={() => setHoveredCard(card.id)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => onCardSelect(card.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-lg ${card.color} mb-3`}>
                  {card.icon}
                </div>
                {card.badge && (
                  <Badge variant="secondary" className="ml-auto">
                    {card.badge}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-base">{card.title}</CardTitle>
              <CardDescription className="text-sm line-clamp-2">
                {card.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary font-medium">
                  Configurar
                </span>
                <ChevronLeft className="h-4 w-4 text-gray-400 rotate-180" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dica */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <Zap className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 mb-1">
              Configurações Rápidas
            </p>
            <p className="text-sm text-blue-700">
              Clique em qualquer card acima para configurar as opções de forma detalhada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogSettingsCards;
