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

    const url = new URL(req.url);
    const jobId = url.searchParams.get("jobId");

    if (!jobId) {
      throw new Error("Job ID é obrigatório");
    }

    // Buscar dados do job
    const { data: job, error: jobError } = await supabase
      .from("bulk_import_jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      throw new Error("Job não encontrado");
    }

    // Buscar logs do job
    const { data: logs, error: logsError } = await supabase
      .from("bulk_import_logs")
      .select("*")
      .eq("job_id", jobId)
      .order("row_number", { ascending: true });

    if (logsError) {
      throw new Error("Erro ao buscar logs");
    }

    // Calcular estatísticas
    const successLogs = logs.filter((log) => log.status === "success");
    const errorLogs = logs.filter((log) => log.status === "error");
    const warningLogs = logs.filter((log) => log.status === "warning");

    const response = {
      job: {
        id: job.id,
        filename: job.filename,
        status: job.status,
        totalProducts: job.total_products,
        processedProducts: job.processed_products,
        successfulProducts: job.successful_products,
        failedProducts: job.failed_products,
        startedAt: job.started_at,
        completedAt: job.completed_at,
        errorMessage: job.error_message,
      },
      statistics: {
        total: logs.length,
        success: successLogs.length,
        errors: errorLogs.length,
        warnings: warningLogs.length,
        successRate:
          logs.length > 0 ? (successLogs.length / logs.length) * 100 : 0,
      },
      logs: logs.map((log) => ({
        rowNumber: log.row_number,
        productName: log.product_name,
        sku: log.sku,
        status: log.status,
        message: log.message,
        createdAt: log.created_at,
      })),
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: response,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Erro ao buscar status:", error);

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
