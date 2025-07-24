
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ProductVariation } from '@/types/product';
import { Package, Palette, Hash, CheckCircle2, AlertTriangle } from 'lucide-react';

interface VariationInfoPanelProps {
  variation: ProductVariation;
  basePrice: number;
  showAdvancedInfo?: boolean;
}

const VariationInfoPanel: React.FC<VariationInfoPanelProps> = ({
  variation,
  basePrice,
  showAdvancedInfo = true,
}) => {
  const isGrade = variation.is_grade || variation.variation_type === 'grade';
  const finalPrice = basePrice + (variation.price_adjustment || 0);
  const hasStock = variation.stock > 0;

  return (
    <div className="p-4 bg-muted/30 rounded-lg border space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h5 className="font-semibold text-base flex items-center gap-2">
          {isGrade ? (
            <>
              <Package className="h-4 w-4 text-primary" />
              Grade Selecionada
            </>
          ) : (
            <>
              <Palette className="h-4 w-4 text-primary" />
              Variação Selecionada
            </>
          )}
        </h5>
        
        <Badge 
          variant={hasStock ? "default" : "destructive"}
          className="flex items-center gap-1"
        >
          {hasStock ? (
            <>
              <CheckCircle2 className="h-3 w-3" />
              {variation.stock} disponível
            </>
          ) : (
            <>
              <AlertTriangle className="h-3 w-3" />
              Esgotado
            </>
          )}
        </Badge>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        {isGrade ? (
          <>
            {variation.grade_name && (
              <div>
                <span className="text-sm text-muted-foreground">Nome da Grade:</span>
                <p className="font-medium">{variation.grade_name}</p>
              </div>
            )}
            {variation.grade_color && (
              <div>
                <span className="text-sm text-muted-foreground">Cor:</span>
                <p className="font-medium">{variation.grade_color}</p>
              </div>
            )}
          </>
        ) : (
          <>
            {variation.color && (
              <div>
                <span className="text-sm text-muted-foreground">Cor:</span>
                <p className="font-medium">{variation.color}</p>
              </div>
            )}
            {variation.size && (
              <div>
                <span className="text-sm text-muted-foreground">Tamanho:</span>
                <p className="font-medium">{variation.size}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Grade Sizes */}
      {isGrade && variation.grade_sizes && variation.grade_sizes.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm font-medium text-muted-foreground">
            Tamanhos incluídos nesta grade:
          </span>
          <div className="flex flex-wrap gap-2">
            {variation.grade_sizes.map((size, index) => (
              <div 
                key={index}
                className="flex flex-col items-center p-2 bg-background rounded-md border min-w-[3rem]"
              >
                <span className="text-sm font-medium">{size}</span>
                {variation.grade_pairs && variation.grade_pairs[index] && (
                  <span className="text-xs text-muted-foreground">
                    {variation.grade_pairs[index]} pares
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Info */}
      <div className="flex items-center justify-between p-3 bg-background rounded-md border">
        <div>
          <span className="text-sm text-muted-foreground">Preço final:</span>
          <p className="text-lg font-bold text-primary">
            R$ {finalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        
        {variation.price_adjustment !== 0 && (
          <div className="text-right">
            <span className="text-sm text-muted-foreground">Ajuste:</span>
            <p className={`font-medium ${
              variation.price_adjustment > 0 ? 'text-destructive' : 'text-green-600'
            }`}>
              {variation.price_adjustment > 0 ? '+' : ''}
              R$ {variation.price_adjustment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        )}
      </div>

      {/* Advanced Info */}
      {showAdvancedInfo && (
        <div className="grid grid-cols-1 gap-2 pt-2 border-t border-border/50">
          {variation.sku && (
            <div className="flex items-center gap-2">
              <Hash className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-mono text-muted-foreground">
                SKU: {variation.sku}
              </span>
            </div>
          )}
          
          {variation.image_url && (
            <div className="mt-2">
              <span className="text-sm text-muted-foreground block mb-2">
                Imagem da variação:
              </span>
              <img
                src={variation.image_url}
                alt={`${variation.color || variation.grade_name || 'Variação'}`}
                className="w-20 h-20 object-cover rounded border"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VariationInfoPanel;
