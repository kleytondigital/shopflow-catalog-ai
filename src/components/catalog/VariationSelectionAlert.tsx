
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  Package, 
  Palette,
  ArrowRight 
} from 'lucide-react';

interface VariationSelectionAlertProps {
  type: 'select' | 'info' | 'success' | 'warning';
  variationCount: number;
  hasGrades?: boolean;
  hasColors?: boolean;
  hasSizes?: boolean;
  title?: string;
  description?: string;
}

const VariationSelectionAlert: React.FC<VariationSelectionAlertProps> = ({
  type,
  variationCount,
  hasGrades = false,
  hasColors = false,
  hasSizes = false,
  title,
  description,
}) => {
  const getAlertContent = () => {
    const variationTypes = [];
    if (hasGrades) variationTypes.push('grades');
    if (hasColors) variationTypes.push('cores');
    if (hasSizes) variationTypes.push('tamanhos');

    const defaultMessages = {
      select: {
        title: "Selecione uma variação para continuar",
        description: `Este produto possui ${variationCount} variações disponíveis com ${variationTypes.join(', ')}. Escolha uma opção antes de adicionar ao carrinho.`,
        icon: AlertCircle,
        variant: "default" as const,
      },
      info: {
        title: "Informações sobre as variações",
        description: `Produto com ${variationCount} opções diferentes. Explore todas as possibilidades disponíveis.`,
        icon: Info,
        variant: "default" as const,
      },
      success: {
        title: "Variação selecionada com sucesso!",
        description: "Agora você pode ajustar a quantidade e adicionar ao carrinho.",
        icon: CheckCircle2,
        variant: "default" as const,
      },
      warning: {
        title: "Atenção ao estoque",
        description: "Algumas variações podem ter estoque limitado. Verifique a disponibilidade.",
        icon: AlertCircle,
        variant: "destructive" as const,
      },
    };

    const config = defaultMessages[type];
    const Icon = config.icon;

    return {
      title: title || config.title,
      description: description || config.description,
      icon: Icon,
      variant: config.variant,
    };
  };

  const { title: alertTitle, description: alertDescription, icon: Icon, variant } = getAlertContent();

  return (
    <Alert variant={variant} className="border-l-4">
      <Icon className="h-4 w-4" />
      <AlertDescription className="space-y-3">
        <div>
          <div className="font-medium mb-2">{alertTitle}</div>
          <p className="text-sm">{alertDescription}</p>
        </div>
        
        {type === 'select' && (
          <div className="flex flex-wrap gap-2 pt-2">
            {hasGrades && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Package className="h-3 w-3" />
                Grades disponíveis
              </Badge>
            )}
            {hasColors && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Palette className="h-3 w-3" />
                Cores diferentes
              </Badge>
            )}
            {hasSizes && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Package className="h-3 w-3" />
                Tamanhos variados
              </Badge>
            )}
            <ArrowRight className="h-4 w-4 text-muted-foreground ml-2" />
            <span className="text-xs text-muted-foreground">
              Escolha sua opção preferida
            </span>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default VariationSelectionAlert;
