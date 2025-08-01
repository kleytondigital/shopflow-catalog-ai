import { useState, useCallback, useMemo } from "react";
import { ProductVariation } from "@/types/product";
import { useToast } from "@/hooks/use-toast";

interface UseGradeVariationsProps {
  initialVariations?: ProductVariation[];
  onVariationsChange?: (variations: ProductVariation[]) => void;
  productId?: string;
  storeId?: string;
}

export const useGradeVariations = ({
  initialVariations = [],
  onVariationsChange,
  productId,
  storeId,
}: UseGradeVariationsProps) => {
  const [variations, setVariations] =
    useState<ProductVariation[]>(initialVariations);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Filtrar apenas variações de grade
  const gradeVariations = useMemo(
    () => variations.filter((v) => v.variation_type === "grade" || v.is_grade),
    [variations]
  );

  // Filtrar variações tradicionais
  const traditionalVariations = useMemo(
    () => variations.filter((v) => !v.is_grade && v.variation_type !== "grade"),
    [variations]
  );

  // Atualizar variações
  const updateVariations = useCallback(
    (newVariations: ProductVariation[]) => {
      console.log(
        "🎯 GRADE HOOK - Atualizando variações:",
        newVariations.length
      );

      setVariations(newVariations);

      if (onVariationsChange) {
        console.log(
          "✅ GRADE HOOK - Chamando onVariationsChange com",
          newVariations.length,
          "variações"
        );
        onVariationsChange(newVariations);
      } else {
        console.warn("⚠️ GRADE HOOK - onVariationsChange não fornecido");
      }
    },
    [onVariationsChange]
  );

  // Adicionar variações de grade
  const addGradeVariations = useCallback(
    (gradeVariations: ProductVariation[]) => {
      console.log(
        "🎯 GRADE HOOK - Adicionando grades:",
        gradeVariations.length
      );

      setIsGenerating(true);

      try {
        // Validar variações de grade
        const validGrades = gradeVariations.filter(
          (v) => v.color && v.is_grade && v.grade_sizes && v.grade_pairs
        );

        if (validGrades.length === 0) {
          throw new Error("Nenhuma variação de grade válida foi fornecida");
        }

        // Combinar variações existentes com novas grades
        const existingTraditional = traditionalVariations;
        const allVariations = [...existingTraditional, ...validGrades];

        updateVariations(allVariations);

        toast({
          title: "✅ Grades adicionadas!",
          description: `${validGrades.length} grade(s) foram adicionadas com sucesso.`,
        });

        return validGrades;
      } catch (error) {
        console.error("❌ Erro ao adicionar grades:", error);
        toast({
          title: "❌ Erro ao adicionar grades",
          description:
            error instanceof Error ? error.message : "Erro desconhecido",
          variant: "destructive",
        });
        return [];
      } finally {
        setIsGenerating(false);
      }
    },
    [traditionalVariations, updateVariations, toast]
  );

  // Remover variações de grade
  const removeGradeVariations = useCallback(() => {
    console.log("🎯 GRADE HOOK - Removendo todas as grades");

    const remainingVariations = traditionalVariations;
    updateVariations(remainingVariations);

    toast({
      title: "✅ Grades removidas!",
      description: "Todas as variações de grade foram removidas.",
    });
  }, [traditionalVariations, updateVariations, toast]);

  // Substituir todas as variações por grades
  const replaceWithGrades = useCallback(
    (gradeVariations: ProductVariation[]) => {
      console.log(
        "🎯 GRADE HOOK - Substituindo por grades:",
        gradeVariations.length
      );

      setIsGenerating(true);

      try {
        // Validar variações de grade
        const validGrades = gradeVariations.filter(
          (v) => v.color && v.is_grade && v.grade_sizes && v.grade_pairs
        );

        console.log(
          "✅ GRADE HOOK - Grades válidas encontradas:",
          validGrades.length
        );

        if (validGrades.length === 0) {
          throw new Error("Nenhuma variação de grade válida foi fornecida");
        }

        // Substituir todas as variações pelas grades
        console.log(
          "✅ GRADE HOOK - Chamando updateVariations com",
          validGrades.length,
          "grades"
        );
        updateVariations(validGrades);

        toast({
          title: "✅ Grades aplicadas!",
          description: `${validGrades.length} grade(s) substituíram todas as variações existentes.`,
        });

        return validGrades;
      } catch (error) {
        console.error("❌ Erro ao substituir por grades:", error);
        toast({
          title: "❌ Erro ao aplicar grades",
          description:
            error instanceof Error ? error.message : "Erro desconhecido",
          variant: "destructive",
        });
        return [];
      } finally {
        setIsGenerating(false);
      }
    },
    [updateVariations, toast]
  );

  // Verificar se há variações de grade
  const hasGradeVariations = useMemo(
    () => gradeVariations.length > 0,
    [gradeVariations]
  );

  // Obter estatísticas
  const getStatistics = useCallback(() => {
    return {
      total: variations.length,
      grades: gradeVariations.length,
      traditional: traditionalVariations.length,
      totalPairs: gradeVariations.reduce(
        (sum, v) => sum + (v.grade_quantity || 0),
        0
      ),
      totalStock: variations.reduce((sum, v) => sum + (v.stock || 0), 0),
    };
  }, [variations, gradeVariations, traditionalVariations]);

  return {
    // Estado
    variations,
    gradeVariations,
    traditionalVariations,
    isGenerating,
    hasGradeVariations,

    // Ações
    updateVariations,
    addGradeVariations,
    removeGradeVariations,
    replaceWithGrades,

    // Utilitários
    getStatistics,
  };
};
