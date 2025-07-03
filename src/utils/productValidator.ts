import { ProductRow, CategoryRow, VariationRow } from "./excelParser";

export interface ValidationError {
  type: "error" | "warning";
  message: string;
  row?: number;
  field?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export class ProductValidator {
  private errors: ValidationError[] = [];
  private warnings: ValidationError[] = [];

  validateProducts(
    products: ProductRow[],
    categories: CategoryRow[]
  ): ValidationResult {
    this.errors = [];
    this.warnings = [];

    // Validar cada produto
    products.forEach((product, index) => {
      this.validateProduct(product, index + 2, categories); // +2 porque index 0 é cabeçalho e começamos do 1
    });

    // Validações globais
    this.validateGlobalRules(products);

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
    };
  }

  validateCategories(categories: CategoryRow[]): ValidationResult {
    this.errors = [];
    this.warnings = [];

    categories.forEach((category, index) => {
      this.validateCategory(category, index + 2);
    });

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
    };
  }

  validateVariations(
    variations: VariationRow[],
    products: ProductRow[]
  ): ValidationResult {
    this.errors = [];
    this.warnings = [];

    variations.forEach((variation, index) => {
      this.validateVariation(variation, index + 2, products);
    });

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
    };
  }

  private validateProduct(
    product: ProductRow,
    row: number,
    categories: CategoryRow[]
  ) {
    // Nome
    if (!product.name || product.name.trim().length === 0) {
      this.addError("Nome do produto é obrigatório", row, "Nome");
    } else if (product.name.length > 100) {
      this.addError(
        "Nome do produto deve ter no máximo 100 caracteres",
        row,
        "Nome"
      );
    }

    // Descrição
    if (product.description && product.description.length > 500) {
      this.addError(
        "Descrição deve ter no máximo 500 caracteres",
        row,
        "Descrição"
      );
    }

    // Categoria
    if (!product.category || product.category.trim().length === 0) {
      this.addError("Categoria é obrigatória", row, "Categoria");
    } else {
      const categoryExists = categories.some(
        (cat) => cat.name.toLowerCase() === product.category.toLowerCase()
      );
      if (!categoryExists) {
        this.addWarning(
          `Categoria '${product.category}' não existe e será criada automaticamente`,
          row,
          "Categoria"
        );
      }
    }

    // Preço Varejo
    if (!product.price_varejo || product.price_varejo <= 0) {
      this.addError(
        "Preço varejo deve ser maior que zero",
        row,
        "Preço Varejo"
      );
    }

    // Preços de atacado
    if (
      product.price_atacarejo &&
      product.price_atacarejo >= product.price_varejo
    ) {
      this.addError(
        "Preço atacarejo deve ser menor que o preço varejo",
        row,
        "Preço Atacarejo"
      );
    }

    if (
      product.price_atacado_pequeno &&
      product.price_atacado_pequeno >= product.price_varejo
    ) {
      this.addError(
        "Preço atacado pequeno deve ser menor que o preço varejo",
        row,
        "Preço Atacado Pequeno"
      );
    }

    if (
      product.price_atacado_grande &&
      product.price_atacado_grande >= product.price_varejo
    ) {
      this.addError(
        "Preço atacado grande deve ser menor que o preço varejo",
        row,
        "Preço Atacado Grande"
      );
    }

    // Quantidades de atacado
    if (product.qtd_atacarejo && product.qtd_atacarejo < 2) {
      this.addError(
        "Quantidade mínima para atacarejo deve ser 2 ou mais",
        row,
        "Qtd Atacarejo"
      );
    }

    if (product.qtd_atacado_pequeno && product.qtd_atacado_pequeno < 5) {
      this.addError(
        "Quantidade mínima para atacado pequeno deve ser 5 ou mais",
        row,
        "Qtd Atacado Pequeno"
      );
    }

    if (product.qtd_atacado_grande && product.qtd_atacado_grande < 10) {
      this.addError(
        "Quantidade mínima para atacado grande deve ser 10 ou mais",
        row,
        "Qtd Atacado Grande"
      );
    }

    // Estoque
    if (product.stock < 0 && !product.allow_negative_stock) {
      this.addError("Estoque não pode ser negativo", row, "Estoque");
    }

    // SKU
    if (product.sku) {
      if (product.sku.length > 50) {
        this.addError("SKU deve ter no máximo 50 caracteres", row, "SKU");
      }

      // Verificar se SKU contém apenas caracteres válidos
      if (!/^[a-zA-Z0-9-_]+$/.test(product.sku)) {
        this.addError(
          "SKU deve conter apenas letras, números, hífen e underscore",
          row,
          "SKU"
        );
      }
    }

    // Código de barras
    if (product.barcode && product.barcode.length > 20) {
      this.addError(
        "Código de barras deve ter no máximo 20 caracteres",
        row,
        "Código de Barras"
      );
    }

    // Dimensões
    if (product.weight && product.weight <= 0) {
      this.addError("Peso deve ser maior que zero", row, "Peso");
    }

    if (product.width && product.width <= 0) {
      this.addError("Largura deve ser maior que zero", row, "Largura");
    }

    if (product.height && product.height <= 0) {
      this.addError("Altura deve ser maior que zero", row, "Altura");
    }

    if (product.length && product.length <= 0) {
      this.addError("Comprimento deve ser maior que zero", row, "Comprimento");
    }

    // Tags
    if (product.tags && product.tags.length > 200) {
      this.addError("Tags devem ter no máximo 200 caracteres", row, "Tags");
    }
  }

  private validateCategory(category: CategoryRow, row: number) {
    // Nome
    if (!category.name || category.name.trim().length === 0) {
      this.addError("Nome da categoria é obrigatório", row, "Nome");
    } else if (category.name.length > 100) {
      this.addError(
        "Nome da categoria deve ter no máximo 100 caracteres",
        row,
        "Nome"
      );
    }

    // Descrição
    if (category.description && category.description.length > 500) {
      this.addError(
        "Descrição da categoria deve ter no máximo 500 caracteres",
        row,
        "Descrição"
      );
    }

    // Ordem
    if (category.order && category.order < 0) {
      this.addError(
        "Ordem da categoria deve ser maior ou igual a zero",
        row,
        "Ordem"
      );
    }
  }

  private validateVariation(
    variation: VariationRow,
    row: number,
    products: ProductRow[]
  ) {
    // SKU do produto
    if (!variation.product_sku || variation.product_sku.trim().length === 0) {
      this.addError("SKU do produto é obrigatório", row, "Produto SKU");
    } else {
      const productExists = products.some(
        (p) => p.sku === variation.product_sku
      );
      if (!productExists) {
        this.addError(
          `Produto com SKU '${variation.product_sku}' não encontrado`,
          row,
          "Produto SKU"
        );
      }
    }

    // Tamanho ou Cor
    if (!variation.size && !variation.color) {
      this.addWarning(
        "Variação deve ter pelo menos tamanho ou cor",
        row,
        "Tamanho/Cor"
      );
    }

    // Estoque
    if (variation.stock && variation.stock < 0) {
      this.addError(
        "Estoque da variação não pode ser negativo",
        row,
        "Estoque"
      );
    }

    // Preço adicional
    if (variation.price_additional && variation.price_additional < 0) {
      this.addError(
        "Preço adicional não pode ser negativo",
        row,
        "Preço Adicional"
      );
    }
  }

  private validateGlobalRules(products: ProductRow[]) {
    // Verificar SKUs duplicados
    const skus = products.map((p) => p.sku).filter(Boolean);
    const duplicateSkus = skus.filter(
      (sku, index) => skus.indexOf(sku) !== index
    );

    if (duplicateSkus.length > 0) {
      const uniqueDuplicates = [...new Set(duplicateSkus)];
      this.addError(
        `SKUs duplicados encontrados: ${uniqueDuplicates.join(", ")}`
      );
    }

    // Verificar nomes duplicados
    const names = products.map((p) => p.name.toLowerCase());
    const duplicateNames = names.filter(
      (name, index) => names.indexOf(name) !== index
    );

    if (duplicateNames.length > 0) {
      const uniqueDuplicates = [...new Set(duplicateNames)];
      this.addWarning(
        `Nomes de produtos duplicados encontrados: ${uniqueDuplicates.join(
          ", "
        )}`
      );
    }

    // Verificar se há produtos sem SKU
    const productsWithoutSku = products.filter((p) => !p.sku);
    if (productsWithoutSku.length > 0) {
      this.addWarning(
        `${productsWithoutSku.length} produtos sem SKU - SKUs serão gerados automaticamente`
      );
    }
  }

  private addError(message: string, row?: number, field?: string) {
    this.errors.push({
      type: "error",
      message,
      row,
      field,
    });
  }

  private addWarning(message: string, row?: number, field?: string) {
    this.warnings.push({
      type: "warning",
      message,
      row,
      field,
    });
  }

  // Gerar relatório de validação
  generateValidationReport(validationResult: ValidationResult): string {
    let report = "📋 RELATÓRIO DE VALIDAÇÃO\n";
    report += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

    if (
      validationResult.errors.length === 0 &&
      validationResult.warnings.length === 0
    ) {
      report += "✅ Todos os dados estão válidos!\n";
      return report;
    }

    if (validationResult.errors.length > 0) {
      report += `❌ ERROS ENCONTRADOS (${validationResult.errors.length}):\n`;
      validationResult.errors.forEach((error, index) => {
        const location = error.row ? `Linha ${error.row}` : "";
        const field = error.field ? `Campo: ${error.field}` : "";
        const details = [location, field].filter(Boolean).join(" - ");
        report += `${index + 1}. ${error.message}${
          details ? ` (${details})` : ""
        }\n`;
      });
      report += "\n";
    }

    if (validationResult.warnings.length > 0) {
      report += `⚠️ AVISOS (${validationResult.warnings.length}):\n`;
      validationResult.warnings.forEach((warning, index) => {
        const location = warning.row ? `Linha ${warning.row}` : "";
        const field = warning.field ? `Campo: ${warning.field}` : "";
        const details = [location, field].filter(Boolean).join(" - ");
        report += `${index + 1}. ${warning.message}${
          details ? ` (${details})` : ""
        }\n`;
      });
      report += "\n";
    }

    report += `📊 RESUMO:\n`;
    report += `- Total de erros: ${validationResult.errors.length}\n`;
    report += `- Total de avisos: ${validationResult.warnings.length}\n`;
    report += `- Status: ${
      validationResult.isValid ? "✅ Válido" : "❌ Inválido"
    }\n`;

    return report;
  }
}
