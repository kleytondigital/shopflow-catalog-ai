import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface ImportConfig {
  createCategories: boolean;
  updateExisting: boolean;
  strictValidation: boolean;
  uploadImages: boolean;
}

interface ParsedData {
  products: any[];
  categories: any[];
  variations: any[];
  summary: {
    totalRows: number;
    validRows: number;
    errors: string[];
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verificar autenticação
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error("Não autorizado");
    }

    if (req.method !== "POST") {
      throw new Error("Método não permitido");
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const storeId = formData.get("storeId") as string;
    const config = JSON.parse(formData.get("config") as string) as ImportConfig;

    if (!file) {
      throw new Error("Arquivo não fornecido");
    }

    if (!storeId) {
      throw new Error("ID da loja não fornecido");
    }

    // Verificar se o usuário possui acesso à loja
    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("id, owner_id")
      .eq("id", storeId)
      .eq("owner_id", user.id)
      .single();

    if (storeError || !store) {
      throw new Error("Loja não encontrada ou sem permissão");
    }

    // Validar tipo de arquivo
    if (!file.name.endsWith(".xlsx")) {
      throw new Error("Apenas arquivos .xlsx são suportados");
    }

    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("Arquivo muito grande. Máximo 10MB");
    }

    // Criar job de importação
    const { data: job, error: jobError } = await supabase
      .from("bulk_import_jobs")
      .insert({
        store_id: storeId,
        user_id: user.id,
        filename: file.name,
        file_size: file.size,
        status: "pending",
        config: config,
      })
      .select()
      .single();

    if (jobError) {
      throw new Error("Erro ao criar job de importação");
    }

    // Converter arquivo para base64 e processar
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Chamar função de processamento em background
    const processingResponse = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/bulk-import-process`,
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: job.id,
          fileData: Array.from(uint8Array),
          config: config,
        }),
      }
    );

    if (!processingResponse.ok) {
      // Marcar job como falhou
      await supabase
        .from("bulk_import_jobs")
        .update({
          status: "failed",
          error_message: "Erro ao iniciar processamento",
        })
        .eq("id", job.id);

      throw new Error("Erro ao iniciar processamento");
    }

    return new Response(
      JSON.stringify({
        success: true,
        jobId: job.id,
        message: "Upload realizado com sucesso. Processamento iniciado.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Erro no upload:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
