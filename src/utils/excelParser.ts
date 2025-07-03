import * as XLSX from "xlsx";

export interface ProductRow {
  name: string;
  description?: string;
  category: string;
  price_varejo: number;
  price_atacarejo?: number;
  qtd_atacarejo?: number;
  price_atacado_pequeno?: number;
  qtd_atacado_pequeno?: number;
  price_atacado_grande?: number;
  qtd_atacado_grande?: number;
  stock: number;
  sku?: string;
  barcode?: string;
  weight?: number;
  width?: number;
  height?: number;
  length?: number;
  active: boolean;
  featured: boolean;
  allow_negative_stock: boolean;
  tags?: string;
  notes?: string;
}

export interface CategoryRow {
  name: string;
  description?: string;
  active: boolean;
  order?: number;
}

export interface VariationRow {
  product_sku: string;
  size?: string;
  color?: string;
  stock?: number;
  price_additional?: number;
  active: boolean;
}

export interface ParsedExcelData {
  products: ProductRow[];
  categories: CategoryRow[];
  variations: VariationRow[];
  errors: string[];
  warnings: string[];
}

export class ExcelParser {
  private data: ParsedExcelData = {
    products: [],
    categories: [],
    variations: [],
    errors: [],
    warnings: [],
  };

  async parseFile(file: File): Promise<ParsedExcelData> {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "buffer" });

      // Processar cada aba
      this.processSheet(workbook, "PRODUTOS", this.parseProducts.bind(this));
      this.processSheet(
        workbook,
        "CATEGORIAS",
        this.parseCategories.bind(this)
      );
      this.processSheet(workbook, "VARIACOES", this.parseVariations.bind(this));

      // Validar dados
      this.validateData();

      return this.data;
    } catch (error) {
      console.error("Erro ao processar arquivo Excel:", error);
      this.data.errors.push(`Erro ao processar arquivo: ${error}`);
      return this.data;
    }
  }

  private processSheet(
    workbook: XLSX.WorkBook,
    sheetName: string,
    parser: (rows: any[]) => void
  ) {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      this.data.warnings.push(`Aba '${sheetName}' não encontrada`);
      return;
    }

    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    if (rows.length < 2) {
      this.data.warnings.push(`Aba '${sheetName}' está vazia`);
      return;
    }

    // Remover cabeçalho e processar dados
    const dataRows = rows.slice(1);
    parser(dataRows);
  }

  private parseProducts(rows: any[]) {
    rows.forEach((row, index) => {
      try {
        if (!row[0]) return; // Linha vazia

        const product: ProductRow = {
          name: this.cleanString(row[0]),
          description: this.cleanString(row[1]),
          category: this.cleanString(row[2]),
          price_varejo: this.parseNumber(row[3]),
          price_atacarejo: this.parseNumber(row[4]),
          qtd_atacarejo: this.parseInteger(row[5]),
          price_atacado_pequeno: this.parseNumber(row[6]),
          qtd_atacado_pequeno: this.parseInteger(row[7]),
          price_atacado_grande: this.parseNumber(row[8]),
          qtd_atacado_grande: this.parseInteger(row[9]),
          stock: this.parseInteger(row[10]),
          sku: this.cleanString(row[11]),
          barcode: this.cleanString(row[12]),
          weight: this.parseNumber(row[13]),
          width: this.parseNumber(row[14]),
          height: this.parseNumber(row[15]),
          length: this.parseNumber(row[16]),
          active: this.parseBoolean(row[17]),
          featured: this.parseBoolean(row[18]),
          allow_negative_stock: this.parseBoolean(row[19]),
          tags: this.cleanString(row[20]),
          notes: this.cleanString(row[21]),
        };

        this.data.products.push(product);
      } catch (error) {
        this.data.errors.push(
          `Erro na linha ${index + 2} da aba PRODUTOS: ${error}`
        );
      }
    });
  }

  private parseCategories(rows: any[]) {
    rows.forEach((row, index) => {
      try {
        if (!row[0]) return; // Linha vazia

        const category: CategoryRow = {
          name: this.cleanString(row[0]),
          description: this.cleanString(row[1]),
          active: this.parseBoolean(row[2]),
          order: this.parseInteger(row[3]),
        };

        this.data.categories.push(category);
      } catch (error) {
        this.data.errors.push(
          `Erro na linha ${index + 2} da aba CATEGORIAS: ${error}`
        );
      }
    });
  }

  private parseVariations(rows: any[]) {
    rows.forEach((row, index) => {
      try {
        if (!row[0]) return; // Linha vazia

        const variation: VariationRow = {
          product_sku: this.cleanString(row[0]),
          size: this.cleanString(row[1]),
          color: this.cleanString(row[2]),
          stock: this.parseInteger(row[3]),
          price_additional: this.parseNumber(row[4]),
          active: this.parseBoolean(row[5]),
        };

        this.data.variations.push(variation);
      } catch (error) {
        this.data.errors.push(
          `Erro na linha ${index + 2} da aba VARIACOES: ${error}`
        );
      }
    });
  }

  private validateData() {
    // Validar produtos obrigatórios
    this.data.products.forEach((product, index) => {
      if (!product.name) {
        this.data.errors.push(`Produto ${index + 1}: Nome é obrigatório`);
      }
      if (!product.category) {
        this.data.errors.push(
          `Produto ${product.name}: Categoria é obrigatória`
        );
      }
      if (product.price_varejo <= 0) {
        this.data.errors.push(
          `Produto ${product.name}: Preço varejo deve ser maior que zero`
        );
      }
      if (product.stock < 0) {
        this.data.errors.push(
          `Produto ${product.name}: Estoque não pode ser negativo`
        );
      }
    });

    // Validar categorias
    this.data.categories.forEach((category, index) => {
      if (!category.name) {
        this.data.errors.push(`Categoria ${index + 1}: Nome é obrigatório`);
      }
    });

    // Validar variações
    this.data.variations.forEach((variation, index) => {
      if (!variation.product_sku) {
        this.data.errors.push(
          `Variação ${index + 1}: SKU do produto é obrigatório`
        );
      }

      // Verificar se o produto existe
      const productExists = this.data.products.some(
        (p) => p.sku === variation.product_sku
      );
      if (!productExists) {
        this.data.errors.push(
          `Variação ${index + 1}: Produto com SKU '${
            variation.product_sku
          }' não encontrado`
        );
      }
    });

    // Verificar SKUs duplicados
    const skus = this.data.products.map((p) => p.sku).filter(Boolean);
    const duplicateSkus = skus.filter(
      (sku, index) => skus.indexOf(sku) !== index
    );
    if (duplicateSkus.length > 0) {
      this.data.errors.push(
        `SKUs duplicados encontrados: ${duplicateSkus.join(", ")}`
      );
    }
  }

  private cleanString(value: any): string {
    if (!value) return "";
    return String(value).trim();
  }

  private parseNumber(value: any): number | undefined {
    if (!value) return undefined;
    const num = parseFloat(value);
    return isNaN(num) ? undefined : num;
  }

  private parseInteger(value: any): number | undefined {
    if (!value) return undefined;
    const num = parseInt(value);
    return isNaN(num) ? undefined : num;
  }

  private parseBoolean(value: any): boolean {
    if (!value) return true; // Default true
    const str = String(value).toLowerCase().trim();
    return str === "sim" || str === "true" || str === "1" || str === "s";
  }

  // Gerar template Excel
  static generateTemplate(): ArrayBuffer {
    const workbook = XLSX.utils.book_new();

    // Aba PRODUTOS
    const productsData = [
      [
        "Nome*",
        "Descrição",
        "Categoria*",
        "Preço Varejo*",
        "Preço Atacarejo",
        "Qtd Atacarejo",
        "Preço Atacado Pequeno",
        "Qtd Atacado Pequeno",
        "Preço Atacado Grande",
        "Qtd Atacado Grande",
        "Estoque*",
        "SKU",
        "Código de Barras",
        "Peso (kg)",
        "Largura (cm)",
        "Altura (cm)",
        "Comprimento (cm)",
        "Ativo",
        "Destaque",
        "Permite Estoque Negativo",
        "Tags",
        "Observações",
      ],
      [
        "Camiseta Básica",
        "Camiseta 100% algodão",
        "Roupas",
        29.9,
        25.9,
        5,
        22.9,
        10,
        19.9,
        20,
        100,
        "CAM001",
        "7891234567890",
        0.2,
        20,
        30,
        2,
        "SIM",
        "NÃO",
        "NÃO",
        "básica,algodão",
        "Produto básico",
      ],
      [
        "Calça Jeans",
        "Calça jeans masculina",
        "Roupas",
        89.9,
        79.9,
        3,
        69.9,
        8,
        59.9,
        15,
        50,
        "CAL001",
        "7891234567891",
        0.5,
        30,
        40,
        3,
        "SIM",
        "SIM",
        "NÃO",
        "jeans,masculina",
        "Produto premium",
      ],
    ];
    const productsSheet = XLSX.utils.aoa_to_sheet(productsData);
    XLSX.utils.book_append_sheet(workbook, productsSheet, "PRODUTOS");

    // Aba CATEGORIAS
    const categoriesData = [
      ["Nome*", "Descrição", "Ativo", "Ordem"],
      ["Roupas", "Vestuário em geral", "SIM", 1],
      ["Eletrônicos", "Produtos eletrônicos", "SIM", 2],
      ["Casa", "Produtos para casa", "SIM", 3],
    ];
    const categoriesSheet = XLSX.utils.aoa_to_sheet(categoriesData);
    XLSX.utils.book_append_sheet(workbook, categoriesSheet, "CATEGORIAS");

    // Aba VARIACOES
    const variationsData = [
      ["Produto SKU*", "Tamanho", "Cor", "Estoque", "Preço Adicional", "Ativo"],
      ["CAM001", "P", "Azul", 25, 0.0, "SIM"],
      ["CAM001", "M", "Azul", 30, 0.0, "SIM"],
      ["CAM001", "G", "Azul", 20, 0.0, "SIM"],
      ["CAM001", "P", "Branco", 15, 0.0, "SIM"],
      ["CAM001", "M", "Branco", 20, 0.0, "SIM"],
      ["CAM001", "G", "Branco", 10, 0.0, "SIM"],
    ];
    const variationsSheet = XLSX.utils.aoa_to_sheet(variationsData);
    XLSX.utils.book_append_sheet(workbook, variationsSheet, "VARIACOES");

    // Aba INSTRUCOES
    const instructionsData = [
      ["Campo", "Obrigatório", "Descrição", "Exemplo"],
      ["Nome*", "SIM", "Nome do produto", "Camiseta Básica"],
      [
        "Categoria*",
        "SIM",
        "Nome da categoria (deve existir na aba CATEGORIAS)",
        "Roupas",
      ],
      ["Preço Varejo*", "SIM", "Preço para compra unitária", "29.90"],
      ["Estoque*", "SIM", "Quantidade em estoque", "100"],
      ["SKU", "NÃO", "Código único do produto", "CAM001"],
      ["Ativo", "NÃO", "SIM/NÃO - se o produto estará ativo", "SIM"],
      ["Destaque", "NÃO", "SIM/NÃO - se o produto será destacado", "NÃO"],
      [
        "Permite Estoque Negativo",
        "NÃO",
        "SIM/NÃO - permite venda sem estoque",
        "NÃO",
      ],
    ];
    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, "INSTRUCOES");

    return XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  }
}
