import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

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

    const { jobId } = await req.json();

    // Buscar dados do job
    const { data: job, error: jobError } = await supabase
      .from("bulk_import_jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      throw new Error("Job não encontrado");
    }

    // Buscar produtos temporários validados
    const { data: tempProducts, error: tempError } = await supabase
      .from("bulk_import_temp_products")
      .select("*")
      .eq("job_id", jobId)
      .eq("validation_status", "valid");

    if (tempError) {
      throw new Error("Erro ao buscar produtos temporários");
    }

    let successCount = 0;
    let errorCount = 0;

    // Importar cada produto
    for (const tempProduct of tempProducts) {
      try {
        await importProduct(supabase, tempProduct, job);
        successCount++;

        await supabase.from("bulk_import_logs").insert({
          job_id: jobId,
          row_number: tempProduct.row_number,
          product_name: tempProduct.product_data.nome,
          sku: tempProduct.product_data.sku,
          status: "success",
          message: "Produto importado com sucesso",
        });
      } catch (error) {
        errorCount++;

        await supabase.from("bulk_import_logs").insert({
          job_id: jobId,
          row_number: tempProduct.row_number,
          product_name: tempProduct.product_data.nome,
          sku: tempProduct.product_data.sku,
          status: "error",
          message: `Erro na importação: ${error.message}`,
        });
      }
    }

    // Atualizar estatísticas finais
    await supabase
      .from("bulk_import_jobs")
      .update({
        status: "completed",
        successful_products: successCount,
        failed_products: errorCount,
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    // Limpar dados temporários
    await supabase
      .from("bulk_import_temp_products")
      .delete()
      .eq("job_id", jobId);

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total: tempProducts.length,
          successful: successCount,
          failed: errorCount,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Erro na execução:", error);

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

async function importProduct(supabase: any, tempProduct: any, job: any) {
  const productData = tempProduct.product_data;

  // Verificar/criar categoria
  let categoryId = null;
  if (productData.categoria) {
    const { data: existingCategory } = await supabase
      .from("categories")
      .select("id")
      .eq("name", productData.categoria)
      .eq("store_id", job.store_id)
      .single();

    if (existingCategory) {
      categoryId = existingCategory.id;
    } else if (job.config.createCategories) {
      const { data: newCategory, error: categoryError } = await supabase
        .from("categories")
        .insert({
          name: productData.categoria,
          store_id: job.store_id,
          description: productData.categoria,
          is_active: true,
        })
        .select("id")
        .single();

      if (!categoryError) {
        categoryId = newCategory.id;
      }
    }
  }

  // Verificar se produto já existe (por SKU)
  let existingProduct = null;
  if (productData.sku) {
    const { data } = await supabase
      .from("products")
      .select("id")
      .eq("sku", productData.sku)
      .eq("store_id", job.store_id)
      .single();

    existingProduct = data;
  }

  // Preparar dados do produto
  const productPayload = {
    name: productData.nome,
    description: productData.descricao || "",
    category_id: categoryId,
    sku: productData.sku,
    barcode: productData.codigo_barras,
    weight: productData.peso,
    width: productData.largura,
    height: productData.altura,
    depth: productData.profundidade,
    tags: productData.tags
      ? productData.tags.split(",").map((t) => t.trim())
      : [],
    is_active: productData.ativo !== false,
    store_id: job.store_id,
    stock_quantity: productData.estoque || 0,
    price: productData.preco_varejo || 0,
    wholesale_price: productData.preco_atacarejo,
    bulk_price_small: productData.preco_atacado_pequeno,
    bulk_price_large: productData.preco_atacado_grande,
  };

  if (existingProduct && job.config.updateExisting) {
    // Atualizar produto existente
    const { error } = await supabase
      .from("products")
      .update(productPayload)
      .eq("id", existingProduct.id);

    if (error) {
      throw new Error(`Erro ao atualizar produto: ${error.message}`);
    }
  } else if (!existingProduct) {
    // Criar novo produto
    const { data: newProduct, error } = await supabase
      .from("products")
      .insert(productPayload)
      .select("id")
      .single();

    if (error) {
      throw new Error(`Erro ao criar produto: ${error.message}`);
    }

    // TODO: Importar variações se existirem
    // await importProductVariations(supabase, newProduct.id, tempProduct.variations_data)
  } else {
    throw new Error("Produto já existe e atualização não está habilitada");
  }
}

async function importProductVariations(
  supabase: any,
  productId: string,
  variationsData: any[]
) {
  // Implementar importação de variações
  for (const variation of variationsData) {
    const variationPayload = {
      product_id: productId,
      size: variation.tamanho,
      color: variation.cor,
      stock_quantity: variation.estoque || 0,
      price_adjustment: variation.preco_adicional || 0,
    };

    await supabase.from("product_variations").insert(variationPayload);
  }
}
