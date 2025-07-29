import { ProductVariation } from "@/types/product";

export interface CategoryTemplate {
  id: string;
  name: string;
  description: string;
  confidence: "high" | "medium" | "low";
  suggestedType: string;
  variations: ProductVariation[];
  keywords: string[];
  categoryKeywords: string[];
  instructions: string[];
}

// Função para gerar variações baseadas em template
const generateVariationsFromTemplate = (
  colors: string[],
  sizes: string[],
  materials: string[],
  type: string
): ProductVariation[] => {
  const variations: ProductVariation[] = [];
  let index = 0;

  if (type === "color_only") {
    colors.forEach((color) => {
      variations.push({
        id: `template-${Date.now()}-${index++}`,
        product_id: "",
        color,
        sku: color.toLowerCase().replace(/\s+/g, "-"),
        stock: 10,
        price_adjustment: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        display_order: index,
        variation_type: "color_only",
      });
    });
  } else if (type === "size_only") {
    sizes.forEach((size) => {
      variations.push({
        id: `template-${Date.now()}-${index++}`,
        product_id: "",
        size,
        sku: `size-${size.toLowerCase()}`,
        stock: 12,
        price_adjustment: size.includes("GG") || size.includes("XG") ? 3 : 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        display_order: index,
        variation_type: "size_only",
      });
    });
  } else if (type === "material_only") {
    materials.forEach((material) => {
      const isPremium = ["prata", "ouro", "couro legítimo", "seda"].some((p) =>
        material.toLowerCase().includes(p)
      );
      variations.push({
        id: `template-${Date.now()}-${index++}`,
        product_id: "",
        material,
        sku: `mat-${material.toLowerCase().replace(/\s+/g, "-")}`,
        stock: 8,
        price_adjustment: isPremium ? 8 : 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        display_order: index,
        variation_type: "material_only",
      });
    });
  } else if (type === "color_size") {
    colors.forEach((color) => {
      sizes.forEach((size) => {
        const priceAdjustment =
          size.includes("GG") || size.includes("XG") ? 2 : 0;
        variations.push({
          id: `template-${Date.now()}-${index++}`,
          product_id: "",
          color,
          size,
          sku: `${color.toLowerCase()}-${size.toLowerCase()}`.replace(
            /\s+/g,
            "-"
          ),
          stock: 6,
          price_adjustment: priceAdjustment,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          display_order: index,
          variation_type: "color_size",
        });
      });
    });
  }

  return variations;
};

// Templates específicos por categoria
export const categoryTemplates: CategoryTemplate[] = [
  // CALÇADOS - Sistema de Grades
  {
    id: "footwear",
    name: "Calçados",
    description: "Sistema de grades otimizado para calçados",
    confidence: "high",
    suggestedType: "grade_system",
    variations: [], // Grades são configuradas diferente
    keywords: [
      "sapato",
      "tênis",
      "sandália",
      "chinelo",
      "bota",
      "sapatilha",
      "scarpin",
    ],
    categoryKeywords: ["calçados", "shoes", "footwear"],
    instructions: [
      "Use o sistema de grades para calçados",
      "Configure cores e grades de tamanhos",
      "Ideal para vendas por atacado",
    ],
  },

  // ROUPAS - Cores + Tamanhos
  {
    id: "clothing",
    name: "Roupas",
    description: "Variações de cor e tamanho para vestuário",
    confidence: "high",
    suggestedType: "color_size",
    variations: generateVariationsFromTemplate(
      ["Preto", "Branco", "Azul"],
      ["P", "M", "G", "GG"],
      [],
      "color_size"
    ),
    keywords: [
      "camiseta",
      "blusa",
      "vestido",
      "calça",
      "short",
      "saia",
      "jaqueta",
    ],
    categoryKeywords: ["roupas", "vestuário", "moda", "fashion"],
    instructions: [
      "Configure cores e tamanhos principais",
      "Mantenha estoque equilibrado",
      "Considere público-alvo",
    ],
  },

  // BIJUTERIAS - Materiais
  {
    id: "jewelry",
    name: "Bijuterias",
    description: "Variações por material e acabamento",
    confidence: "high",
    suggestedType: "material_only",
    variations: generateVariationsFromTemplate(
      [],
      [],
      ["Prata", "Dourado", "Rosé Gold"],
      "material_only"
    ),
    keywords: ["pulseira", "colar", "anel", "brinco", "corrente", "pingente"],
    categoryKeywords: ["bijuterias", "joias", "acessórios"],
    instructions: [
      "Foque em diferentes materiais",
      "Materiais nobres com acréscimo",
      "Ofereça opções para diferentes orçamentos",
    ],
  },

  // PERSONALIZADOS - Apenas Cores
  {
    id: "personalized",
    name: "Produtos Personalizados",
    description: "Variações apenas de cor para produtos customizados",
    confidence: "high",
    suggestedType: "color_only",
    variations: generateVariationsFromTemplate(
      ["Preto", "Branco", "Azul", "Vermelho", "Verde"],
      [],
      [],
      "color_only"
    ),
    keywords: ["caneca", "capinha", "case", "mousepad", "almofada", "quadro"],
    categoryKeywords: ["personalizados", "customizados", "brindes"],
    instructions: [
      "Escolha 3-5 cores populares",
      "Cores neutras vendem mais",
      "Considere sazonalidade",
    ],
  },

  // ÍNTIMAS - Apenas Tamanhos
  {
    id: "underwear",
    name: "Roupas Íntimas",
    description: "Variações apenas por tamanho",
    confidence: "high",
    suggestedType: "size_only",
    variations: generateVariationsFromTemplate(
      [],
      ["P", "M", "G"],
      [],
      "size_only"
    ),
    keywords: ["cueca", "calcinha", "sutiã", "meia", "camiseta íntima"],
    categoryKeywords: ["íntimas", "underwear", "lingerie"],
    instructions: [
      "Foque nos tamanhos essenciais",
      "Estoque equilibrado",
      "Considere tamanhos especiais",
    ],
  },

  // BOLSAS E ACESSÓRIOS - Cores + Materiais
  {
    id: "bags",
    name: "Bolsas e Acessórios",
    description: "Variações de cor e material",
    confidence: "medium",
    suggestedType: "color_material",
    variations: generateVariationsFromTemplate(
      ["Preto", "Marrom", "Bege"],
      [],
      ["Couro Sintético", "Couro Legítimo"],
      "color_material"
    ),
    keywords: ["bolsa", "carteira", "mochila", "necessaire", "porta"],
    categoryKeywords: ["bolsas", "acessórios", "couro"],
    instructions: [
      "Combine cores neutras com materiais",
      "Materiais premium com acréscimo",
      "Considere durabilidade",
    ],
  },

  // ELETRÔNICOS - Cores apenas
  {
    id: "electronics",
    name: "Eletrônicos e Gadgets",
    description: "Variações de cor para dispositivos",
    confidence: "medium",
    suggestedType: "color_only",
    variations: generateVariationsFromTemplate(
      ["Preto", "Branco", "Azul", "Rosa"],
      [],
      [],
      "color_only"
    ),
    keywords: ["fone", "cabo", "carregador", "suporte", "película"],
    categoryKeywords: ["eletrônicos", "gadgets", "tech"],
    instructions: [
      "Cores tecnológicas populares",
      "Preto e branco são essenciais",
      "Considere tendências de cor",
    ],
  },

  // CASA E DECORAÇÃO - Cores
  {
    id: "home_decor",
    name: "Casa e Decoração",
    description: "Variações de cor para decoração",
    confidence: "medium",
    suggestedType: "color_only",
    variations: generateVariationsFromTemplate(
      ["Branco", "Bege", "Cinza", "Azul", "Verde"],
      [],
      [],
      "color_only"
    ),
    keywords: ["vaso", "quadro", "almofada", "tapete", "luminária"],
    categoryKeywords: ["decoração", "casa", "home"],
    instructions: [
      "Cores neutras e harmoniosas",
      "Considere combinações de ambiente",
      "Tendências de decoração",
    ],
  },
];

// Função para detectar categoria baseada em texto
export const detectCategory = (
  productName: string,
  category: string
): CategoryTemplate | null => {
  const text = `${productName} ${category}`.toLowerCase();

  // Procurar match exato primeiro
  for (const template of categoryTemplates) {
    // Verificar palavras-chave do produto
    const productMatch = template.keywords.some((keyword) =>
      text.includes(keyword.toLowerCase())
    );

    // Verificar palavras-chave da categoria
    const categoryMatch = template.categoryKeywords.some((keyword) =>
      text.includes(keyword.toLowerCase())
    );

    if (productMatch || categoryMatch) {
      return template;
    }
  }

  return null;
};

// Função para obter sugestões baseadas em categoria
export const getCategorySuggestions = (
  productName: string,
  category: string
): {
  template: CategoryTemplate | null;
  confidence: number;
  suggestions: string[];
} => {
  const template = detectCategory(productName, category);

  if (!template) {
    return {
      template: null,
      confidence: 0,
      suggestions: [
        "Use a configuração manual para produtos únicos",
        "Considere o tipo de variação mais comum para seu produto",
        "Analise produtos similares no mercado",
      ],
    };
  }

  const text = `${productName} ${category}`.toLowerCase();
  let confidence = 0;

  // Calcular confiança baseada em matches
  template.keywords.forEach((keyword) => {
    if (text.includes(keyword.toLowerCase())) confidence += 30;
  });

  template.categoryKeywords.forEach((keyword) => {
    if (text.includes(keyword.toLowerCase())) confidence += 20;
  });

  // Ajustar pela confiança do template
  if (template.confidence === "high") confidence += 20;
  else if (template.confidence === "medium") confidence += 10;

  confidence = Math.min(confidence, 100);

  return {
    template,
    confidence,
    suggestions: template.instructions,
  };
};
