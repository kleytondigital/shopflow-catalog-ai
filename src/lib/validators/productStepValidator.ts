/**
 * Validador de Etapas do Formulário de Produto
 * 
 * Valida cada etapa antes de permitir navegação
 * Garante que campos obrigatórios sejam preenchidos
 */

import type { ProductFormData } from "@/hooks/useProductFormWizard";

export interface StepValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingFields: string[];
}

/**
 * Classe de validação por etapa
 */
export class ProductStepValidator {
  /**
   * Valida etapa de Informações Básicas
   */
  static validateBasicInfo(formData: ProductFormData, priceModel?: string): StepValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingFields: string[] = [];

    const priceModelType = priceModel || formData.price_model || 'retail_only';

    // Campos obrigatórios - Nome
    if (!formData.name || formData.name.trim() === '') {
      errors.push('Nome do produto é obrigatório');
      missingFields.push('Nome');
    }

    if (formData.name && formData.name.trim().length < 3) {
      errors.push('Nome deve ter pelo menos 3 caracteres');
    }

    // Categoria obrigatória
    if (!formData.category || formData.category.trim() === '') {
      errors.push('Categoria é obrigatória');
      missingFields.push('Categoria');
    }

    // Estoque obrigatório
    if (formData.stock === undefined || formData.stock === null) {
      errors.push('Estoque inicial é obrigatório');
      missingFields.push('Estoque');
    }

    // Validação de Preços baseada no Price Model
    if (priceModelType === 'retail_only') {
      // Apenas Varejo: só retail_price é obrigatório
      if (!formData.retail_price || formData.retail_price <= 0) {
        errors.push('Preço de varejo é obrigatório e deve ser maior que zero');
        missingFields.push('Preço de Varejo');
      }
    } else if (priceModelType === 'wholesale_only') {
      // Apenas Atacado: só wholesale_price é obrigatório
      if (!formData.wholesale_price || formData.wholesale_price <= 0) {
        errors.push('Preço de atacado é obrigatório e deve ser maior que zero');
        missingFields.push('Preço de Atacado');
      }
      if (!formData.min_wholesale_qty || formData.min_wholesale_qty < 1) {
        errors.push('Quantidade mínima de atacado é obrigatória');
        missingFields.push('Quantidade Mínima');
      }
    } else {
      // Híbrido (simple_wholesale ou gradual_wholesale): ambos obrigatórios
      if (!formData.retail_price || formData.retail_price <= 0) {
        errors.push('Preço de varejo é obrigatório e deve ser maior que zero');
        missingFields.push('Preço de Varejo');
      }
      if (!formData.wholesale_price || formData.wholesale_price <= 0) {
        errors.push('Preço de atacado é obrigatório e deve ser maior que zero');
        missingFields.push('Preço de Atacado');
      }
      if (!formData.min_wholesale_qty || formData.min_wholesale_qty < 1) {
        errors.push('Quantidade mínima de atacado é obrigatória');
        missingFields.push('Quantidade Mínima');
      }

      // Validação de negócio: atacado < varejo
      if (formData.wholesale_price && formData.retail_price && 
          formData.wholesale_price >= formData.retail_price) {
        errors.push('Preço de atacado deve ser menor que o preço de varejo');
      }
    }

    // Avisos
    if (!formData.description || formData.description.trim() === '') {
      warnings.push('Adicionar uma descrição melhora as vendas em até 40%');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      missingFields,
    };
  }

  /**
   * Valida etapa de Imagens
   */
  static validateImages(formData: ProductFormData): StepValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingFields: string[] = [];

    // Imagens não são obrigatórias, mas recomendadas
    // TODO: Validar imagens quando houver campo apropriado
    // if (!formData.image_url && (!formData.variations || formData.variations.length === 0)) {
    //   warnings.push('Adicionar pelo menos uma imagem melhora significativamente as vendas');
    //   warnings.push('Produtos sem imagem têm 70% menos conversão');
    // }

    // Sempre válido (imagens são opcionais)
    return {
      isValid: true,
      errors,
      warnings,
      missingFields,
    };
  }

  /**
   * Valida etapa de Variações
   */
  static validateVariations(formData: ProductFormData): StepValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingFields: string[] = [];

    // Variações são opcionais
    if (!formData.variations || formData.variations.length === 0) {
      warnings.push('Produto sem variações. Se houver cores/tamanhos, considere adicionar.');
    }

    // Validar variações se existirem
    if (formData.variations && formData.variations.length > 0) {
      const variationsWithoutSKU = formData.variations.filter(v => !v.sku || v.sku.trim() === '');
      if (variationsWithoutSKU.length > 0) {
        warnings.push(`${variationsWithoutSKU.length} variação(ões) sem SKU. Serão gerados automaticamente.`);
      }

      const variationsWithoutStock = formData.variations.filter(v => !v.stock && v.stock !== 0);
      if (variationsWithoutStock.length > 0) {
        warnings.push(`${variationsWithoutStock.length} variação(ões) sem estoque definido.`);
      }

      // Validar variações de grade
      const gradeVariations = formData.variations.filter(v => v.is_grade);
      gradeVariations.forEach((grade, index) => {
        if (!grade.grade_sizes || grade.grade_sizes.length === 0) {
          errors.push(`Grade ${index + 1} (${grade.grade_name || 'sem nome'}) sem tamanhos definidos`);
        }

        if (!grade.grade_pairs || grade.grade_pairs.length === 0) {
          errors.push(`Grade ${index + 1} (${grade.grade_name || 'sem nome'}) sem quantidades definidas`);
        }

        if (grade.grade_sizes && grade.grade_pairs && 
            grade.grade_sizes.length !== grade.grade_pairs.length) {
          errors.push(`Grade ${index + 1} - Número de tamanhos e quantidades deve ser igual`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      missingFields,
    };
  }

  /**
   * Valida etapa de SEO
   */
  static validateSEO(formData: ProductFormData): StepValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingFields: string[] = [];

    // SEO é opcional mas recomendado
    if (!formData.meta_title || formData.meta_title.trim() === '') {
      warnings.push('Meta Title ajuda no posicionamento em buscadores');
    }

    if (!formData.meta_description || formData.meta_description.trim() === '') {
      warnings.push('Meta Description melhora a taxa de cliques em resultados de busca');
    }

    if (!formData.keywords || formData.keywords.trim() === '') {
      warnings.push('Palavras-chave ajudam clientes a encontrar seu produto');
    }

    // Validações de tamanho
    if (formData.meta_title && formData.meta_title.length > 60) {
      warnings.push('Meta Title muito longo (ideal: até 60 caracteres)');
    }

    if (formData.meta_description && formData.meta_description.length > 160) {
      warnings.push('Meta Description muito longa (ideal: até 160 caracteres)');
    }

    // SEO sempre válido (é opcional)
    return {
      isValid: true,
      errors,
      warnings,
      missingFields,
    };
  }

  /**
   * Valida se pode salvar o produto (todas as etapas)
   */
  static validateForSave(formData: ProductFormData, priceModel?: string): StepValidationResult {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];
    const allMissingFields: string[] = [];

    // Validar etapa básica (sempre obrigatória)
    const basicValidation = this.validateBasicInfo(formData, priceModel);
    allErrors.push(...basicValidation.errors);
    allWarnings.push(...basicValidation.warnings);
    allMissingFields.push(...basicValidation.missingFields);

    // Validar variações (se existirem)
    const variationsValidation = this.validateVariations(formData);
    allErrors.push(...variationsValidation.errors);
    allWarnings.push(...variationsValidation.warnings);

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      missingFields: allMissingFields,
    };
  }

  /**
   * Obter validação para uma etapa específica
   */
  static validateStep(stepId: string, formData: ProductFormData, priceModel?: string): StepValidationResult {
    switch (stepId) {
      case 'basic':
        return this.validateBasicInfo(formData, priceModel);
      
      case 'images':
        return this.validateImages(formData);
      
      case 'variations':
        return this.validateVariations(formData);
      
      case 'seo':
        return this.validateSEO(formData);
      
      default:
        return {
          isValid: true,
          errors: [],
          warnings: [],
          missingFields: [],
        };
    }
  }

  /**
   * Verificar se pode avançar para próxima etapa
   */
  static canAdvanceToNextStep(currentStepId: string, formData: ProductFormData): {
    canAdvance: boolean;
    reason?: string;
  } {
    const validation = this.validateStep(currentStepId, formData);

    if (!validation.isValid) {
      return {
        canAdvance: false,
        reason: validation.errors[0] || 'Complete os campos obrigatórios',
      };
    }

    return { canAdvance: true };
  }

  /**
   * Obter porcentagem de completude de uma etapa
   */
  static getStepCompleteness(stepId: string, formData: ProductFormData): number {
    switch (stepId) {
      case 'basic': {
        let completed = 0;
        const total = 4; // Nome, Preço, Categoria, Estoque

        if (formData.name && formData.name.trim() !== '') completed++;
        if (formData.retail_price > 0) completed++;
        if (formData.category && formData.category.trim() !== '') completed++;
        if (formData.stock !== undefined && formData.stock !== null) completed++;

        return (completed / total) * 100;
      }

      case 'images': {
        // TODO: Validar imagens quando houver campo apropriado
        return 100; // Sempre completo por enquanto
      }

      case 'variations': {
        return formData.variations && formData.variations.length > 0 ? 100 : 0;
      }

      case 'seo': {
        let completed = 0;
        const total = 3; // Meta title, description, keywords

        if (formData.meta_title && formData.meta_title.trim() !== '') completed++;
        if (formData.meta_description && formData.meta_description.trim() !== '') completed++;
        if (formData.keywords && formData.keywords.trim() !== '') completed++;

        return (completed / total) * 100;
      }

      default:
        return 0;
    }
  }
}

