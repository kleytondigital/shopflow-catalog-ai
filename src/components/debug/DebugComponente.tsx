// DIAGNÓSTICO RÁPIDO - Para testar se as tabelas existem
// Cole este código temporariamente em qualquer componente para testar

import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const DiagnosticoRapido = () => {
  const [resultados, setResultados] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testarTabelas = async () => {
      const results: any = {};

      // Testar store_payment_methods
      try {
        const { data, error } = await supabase
          .from("store_payment_methods")
          .select("*")
          .limit(1);

        results.payment_methods = {
          status: error ? "ERRO" : "OK",
          error: error?.message,
          count: data?.length || 0,
        };
      } catch (err: any) {
        results.payment_methods = {
          status: "ERRO",
          error: err.message,
        };
      }

      // Testar store_shipping_methods
      try {
        const { data, error } = await supabase
          .from("store_shipping_methods")
          .select("*")
          .limit(1);

        results.shipping_methods = {
          status: error ? "ERRO" : "OK",
          error: error?.message,
          count: data?.length || 0,
        };
      } catch (err: any) {
        results.shipping_methods = {
          status: "ERRO",
          error: err.message,
        };
      }

      // Testar store_order_bump_configs
      try {
        const { data, error } = await supabase
          .from("store_order_bump_configs")
          .select("*")
          .limit(1);

        results.order_bump_configs = {
          status: error ? "ERRO" : "OK",
          error: error?.message,
          count: data?.length || 0,
        };
      } catch (err: any) {
        results.order_bump_configs = {
          status: "ERRO",
          error: err.message,
        };
      }

      // Testar products (deve existir)
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, name")
          .limit(3);

        results.products = {
          status: error ? "ERRO" : "OK",
          error: error?.message,
          count: data?.length || 0,
        };
      } catch (err: any) {
        results.products = {
          status: "ERRO",
          error: err.message,
        };
      }

      setResultados(results);
      setLoading(false);
    };

    testarTabelas();
  }, []);

  if (loading) {
    return <div>🔍 Testando conexão com o banco...</div>;
  }

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f5f5f5",
        margin: "20px",
        borderRadius: "8px",
      }}
    >
      <h3>🚀 DIAGNÓSTICO RÁPIDO - SUPABASE</h3>

      {Object.entries(resultados).map(([tabela, info]: [string, any]) => (
        <div
          key={tabela}
          style={{
            margin: "10px 0",
            padding: "10px",
            backgroundColor: "white",
            borderRadius: "4px",
          }}
        >
          <strong>{tabela}:</strong>
          <span
            style={{
              color: info.status === "OK" ? "green" : "red",
              marginLeft: "10px",
              fontWeight: "bold",
            }}
          >
            {info.status}
          </span>

          {info.status === "OK" ? (
            <span style={{ marginLeft: "10px", color: "blue" }}>
              ({info.count} registros)
            </span>
          ) : (
            <div style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>
              {info.error}
            </div>
          )}
        </div>
      ))}

      <div
        style={{
          marginTop: "20px",
          padding: "10px",
          backgroundColor: "#e3f2fd",
          borderRadius: "4px",
        }}
      >
        <strong>📋 PRÓXIMOS PASSOS:</strong>
        <ul style={{ marginTop: "10px" }}>
          <li>✅ Se products = OK: Banco conectado</li>
          <li>❌ Se outras tabelas = ERRO: Execute o database_setup.sql</li>
          <li>🔧 Se tudo = ERRO: Verifique configuração do Supabase</li>
        </ul>
      </div>
    </div>
  );
};

export default DiagnosticoRapido;

/* 
COMO USAR:
1. Adicione este componente temporariamente em qualquer página
2. Verifique os resultados
3. Se as tabelas não existem, execute database_setup.sql no Supabase
4. Remove o componente depois do teste
*/
