import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface VariationStats {
  totalStock: number;
  totalVariations: number;
  colors: string[];
  sizes: string[];
  materials: string[];
  grades: string[];
  lowStockVariations: number;
  outOfStockVariations: number;
  hasGradeVariations: boolean;
}

export const useVariationStats = (productId: string) => {
  const [stats, setStats] = useState<VariationStats>({
    totalStock: 0,
    totalVariations: 0,
    colors: [],
    sizes: [],
    materials: [],
    grades: [],
    lowStockVariations: 0,
    outOfStockVariations: 0,
    hasGradeVariations: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVariationStats = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data: variations, error: variationsError } = await supabase
          .from("product_variations")
          .select("*")
          .eq("product_id", productId);

        if (variationsError) {
          throw variationsError;
        }

        if (!variations || variations.length === 0) {
          setStats({
            totalStock: 0,
            totalVariations: 0,
            colors: [],
            sizes: [],
            materials: [],
            grades: [],
            lowStockVariations: 0,
            outOfStockVariations: 0,
            hasGradeVariations: false,
          });
          return;
        }

        // Calcular estatísticas
        const totalStock = variations.reduce((sum, variation) => {
          return sum + (variation.stock || 0);
        }, 0);

        const totalVariations = variations.length;

        // Extrair valores únicos
        const colors = Array.from(
          new Set(
            variations
              .map((v) => v.color || (v as any).grade_color)
              .filter(Boolean)
              .map((c) => c.toLowerCase())
          )
        );

        const sizes = Array.from(
          new Set(
            variations
              .flatMap((v) => {
                if (
                  (v as any).grade_sizes &&
                  Array.isArray((v as any).grade_sizes)
                ) {
                  return (v as any).grade_sizes;
                }
                return v.size ? [v.size] : [];
              })
              .filter(Boolean)
              .map((s) => s.toLowerCase())
          )
        );

        const materials = Array.from(
          new Set(
            variations
              .map((v) => (v as any).material)
              .filter(Boolean)
              .map((m) => m.toLowerCase())
          )
        );

        const grades = Array.from(
          new Set(
            variations
              .map((v) => (v as any).grade_name)
              .filter(Boolean)
              .map((g) => g.toLowerCase())
          )
        );

        // Contar variações com problemas de estoque
        const lowStockVariations = variations.filter(
          (v) => (v.stock || 0) > 0 && (v.stock || 0) <= 5
        ).length;

        const outOfStockVariations = variations.filter(
          (v) => (v.stock || 0) === 0
        ).length;

        // Verificar se tem variações de grade
        const hasGradeVariations = variations.some(
          (v) => (v as any).is_grade === true
        );

        setStats({
          totalStock,
          totalVariations,
          colors,
          sizes,
          materials,
          grades,
          lowStockVariations,
          outOfStockVariations,
          hasGradeVariations,
        });
      } catch (err) {
        console.error("Erro ao buscar estatísticas de variações:", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    fetchVariationStats();
  }, [productId]);

  return { stats, loading, error };
};

export default useVariationStats;
