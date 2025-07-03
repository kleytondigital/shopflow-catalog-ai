import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface ImportConfig {
  createCategories: boolean;
  updateExisting: boolean;
  strictValidation: boolean;
  uploadImages: boolean;
}

interface ProductData {
  nome: string;
  descricao?: string;
  categoria: string;
  preco_varejo?: number;
  preco_atacarejo?: number;
  preco_atacado_pequeno?: number;
  preco_atacado_grande?: number;
  estoque?: number;
  sku?: string;
  codigo_barras?: string;
  peso?: number;
  largura?: number;
  altura?: number;
  profundidade?: number;
  tags?: string;
  ativo?: boolean;
}

interface VariationData {
  sku_produto: string;
  tamanho?: string;
  cor?: string;
  estoque?: number;
  preco_adicional?: number;
}

interface CategoryData {
  nome: string;
  descricao?: string;
  ativo?: boolean;
  ordem?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization")!;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { jobId, fileData, config } = await req.json();

    // Atualizar status do job
    await supabase
      .from("bulk_import_jobs")
      .update({
        status: "processing",
        started_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    // Simular processamento do Excel (aqui você integraria uma lib real de Excel)
    const parsedData = await parseExcelData(fileData, config);

    // Validar dados
    const validationResults = await validateData(
      parsedData,
      supabase,
      jobId,
      config
    );

    // Salvar dados temporários
    await saveTempData(supabase, jobId, validationResults);

    // Atualizar estatísticas do job
    await supabase
      .from("bulk_import_jobs")
      .update({
        total_products: validationResults.products.length,
        processed_products: validationResults.products.length,
      })
      .eq("id", jobId);

    // Se validação passou, iniciar importação real
    if (validationResults.canProceed) {
      // Chamar função de importação final
      await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/bulk-import-execute`,
        {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ jobId }),
        }
      );
    } else {
      await supabase
        .from("bulk_import_jobs")
        .update({
          status: "failed",
          error_message: "Validação falhou",
          completed_at: new Date().toISOString(),
        })
        .eq("id", jobId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        canProceed: validationResults.canProceed,
        summary: validationResults.summary,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Erro no processamento:", error);

    // Marcar job como falhou
    await supabase
      .from("bulk_import_jobs")
      .update({
        status: "failed",
        error_message: error.message,
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

async function parseExcelData(fileData: number[], config: ImportConfig) {
  // Aqui você integraria uma biblioteca real de Excel como xlsx
  // Por enquanto, simulo os dados parseados

  const products: ProductData[] = [
    {
      nome: "Produto Exemplo 1",
      descricao: "Descrição do produto",
      categoria: "Categoria 1",
      preco_varejo: 10.99,
      preco_atacarejo: 9.99,
      preco_atacado_pequeno: 8.99,
      preco_atacado_grande: 7.99,
      estoque: 100,
      sku: "PROD001",
      ativo: true,
    },
  ];

  const categories: CategoryData[] = [
    {
      nome: "Categoria 1",
      descricao: "Descrição da categoria",
      ativo: true,
      ordem: 1,
    },
  ];

  const variations: VariationData[] = [
    {
      sku_produto: "PROD001",
      tamanho: "M",
      cor: "Azul",
      estoque: 50,
      preco_adicional: 0,
    },
  ];

  return { products, categories, variations };
}

async function validateData(
  data: any,
  supabase: any,
  jobId: string,
  config: ImportConfig
) {
  const validProducts: any[] = [];
  const errors: string[] = [];
  let rowNumber = 1;

  for (const product of data.products) {
    rowNumber++;
    const validation = validateProduct(product, rowNumber);

    if (validation.isValid) {
      validProducts.push({
        ...product,
        rowNumber,
      });

      await supabase.from("bulk_import_logs").insert({
        job_id: jobId,
        row_number: rowNumber,
        product_name: product.nome,
        sku: product.sku,
        status: "success",
        message: "Produto validado com sucesso",
      });
    } else {
      errors.push(...validation.errors);

      for (const error of validation.errors) {
        await supabase.from("bulk_import_logs").insert({
          job_id: jobId,
          row_number: rowNumber,
          product_name: product.nome,
          sku: product.sku,
          status: "error",
          message: error,
        });
      }
    }
  }

  return {
    products: validProducts,
    categories: data.categories,
    variations: data.variations,
    canProceed: errors.length === 0 || !config.strictValidation,
    summary: {
      totalProducts: data.products.length,
      validProducts: validProducts.length,
      errors: errors.length,
      errorMessages: errors,
    },
  };
}

function validateProduct(product: ProductData, rowNumber: number) {
  const errors: string[] = [];

  if (!product.nome?.trim()) {
    errors.push(`Linha ${rowNumber}: Nome do produto é obrigatório`);
  }

  if (!product.categoria?.trim()) {
    errors.push(`Linha ${rowNumber}: Categoria é obrigatória`);
  }

  if (product.preco_varejo && product.preco_varejo <= 0) {
    errors.push(`Linha ${rowNumber}: Preço de varejo deve ser maior que zero`);
  }

  if (product.estoque && product.estoque < 0) {
    errors.push(`Linha ${rowNumber}: Estoque não pode ser negativo`);
  }

  // Validação de SKU único seria feita aqui consultando o banco

  return {
    isValid: errors.length === 0,
    errors,
  };
}

async function saveTempData(
  supabase: any,
  jobId: string,
  validationResults: any
) {
  for (const product of validationResults.products) {
    await supabase.from("bulk_import_temp_products").insert({
      job_id: jobId,
      row_number: product.rowNumber,
      product_data: product,
      validation_status: "valid",
    });
  }
}
