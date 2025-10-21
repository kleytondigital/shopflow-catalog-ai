import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductVariation } from '@/types/product';

interface VariationDebuggerProps {
  variations: ProductVariation[];
  productName: string;
  productId: string;
}

const VariationDebugger: React.FC<VariationDebuggerProps> = ({
  variations,
  productName,
  productId
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [debugData, setDebugData] = useState<any>(null);

  useEffect(() => {
    if (variations.length > 0) {
      const colors = [...new Set(variations.filter(v => v.color).map(v => v.color))];
      const sizes = [...new Set(variations.filter(v => v.size).map(v => v.size))];
      const grades = variations.filter(v => v.is_grade || v.variation_type === 'grade');

      const data = {
        productName,
        productId,
        totalVariations: variations.length,
        colors: {
          count: colors.length,
          values: colors,
          allColorsInVariations: variations.map(v => v.color).filter(Boolean)
        },
        sizes: {
          count: sizes.length,
          values: sizes,
          allSizesInVariations: variations.map(v => v.size).filter(Boolean)
        },
        grades: {
          count: grades.length,
          list: grades.map(g => ({
            id: g.id,
            color: g.color,
            grade_color: g.grade_color,
            grade_name: g.grade_name,
            grade_sizes: g.grade_sizes
          }))
        },
        allVariations: variations.map(v => ({
          id: v.id,
          color: v.color,
          size: v.size,
          is_grade: v.is_grade,
          variation_type: v.variation_type,
          grade_color: v.grade_color,
          grade_name: v.grade_name,
          stock: v.stock,
          is_active: v.is_active
        }))
      };

      setDebugData(data);
      
      // Log apenas se houver problema (menos de 2 cores ou tamanhos)
      if (colors.length < 2 && sizes.length < 2) {
        console.log('🚨 PROBLEMA DETECTADO - Variações insuficientes:', data);
        setIsVisible(true);
      }
    }
  }, [variations, productName, productId]);

  if (!isVisible || !debugData) return null;

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-800 flex items-center gap-2">
          🐛 Debug de Variações
          <Badge variant="destructive">Problema Detectado</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-sm">Produto:</h4>
            <p className="text-sm">{debugData.productName}</p>
            <p className="text-xs text-gray-500">ID: {debugData.productId}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm">Total de Variações:</h4>
            <p className="text-2xl font-bold text-red-600">{debugData.totalVariations}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-sm">Cores Encontradas:</h4>
            <p className="text-lg font-bold text-red-600">{debugData.colors.count}</p>
            <p className="text-xs">Valores: {debugData.colors.values.join(', ') || 'Nenhuma'}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm">Tamanhos Encontrados:</h4>
            <p className="text-lg font-bold text-red-600">{debugData.sizes.count}</p>
            <p className="text-xs">Valores: {debugData.sizes.values.join(', ') || 'Nenhum'}</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-sm">Detalhes das Variações:</h4>
          <div className="max-h-40 overflow-y-auto bg-white p-2 rounded border">
            {debugData.allVariations.map((v: any, idx: number) => (
              <div key={v.id} className="text-xs border-b py-1">
                <strong>#{idx + 1}:</strong> {v.color || 'N/A'} | {v.size || 'N/A'} | 
                {v.is_grade ? ' GRADE' : ' SIMPLES'} | Estoque: {v.stock}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setIsVisible(false)}
          >
            Ocultar
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              console.log('🔍 Debug completo das variações:', debugData);
            }}
          >
            Log no Console
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VariationDebugger;
