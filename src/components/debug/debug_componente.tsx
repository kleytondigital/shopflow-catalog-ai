// COMPONENTE DE DEBUG - Para identificar o problema exato
// Adicione temporariamente em uma página para testar

import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const DebugComponente = () => {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const debugar = async () => {
      const info: any = {
        user: user,
        store_id: user?.store_id,
        timestamp: new Date().toISOString(),
      };

      // 1. Testar autenticação
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();
        info.auth = {
          status: authError ? "ERRO" : "OK",
          user_id: authData?.user?.id,
          error: authError?.message,
        };
      } catch (err: any) {
        info.auth = {
          status: "ERRO",
          error: err.message,
        };
      }

      // 2. Testar tabelas com store_id
      if (user?.store_id) {
        // Testar products (baseline)
        try {
          const { data: products, error: prodError } = await supabase
            .from("products")
            .select("id, name")
            .eq("store_id", user.store_id)
            .limit(3);

          info.products_test = {
            status: prodError ? "ERRO" : "OK",
            count: products?.length || 0,
            error: prodError?.message,
            store_id_usado: user.store_id,
          };
        } catch (err: any) {
          info.products_test = {
            status: "ERRO",
            error: err.message,
          };
        }

        // Testar payment_methods
        try {
          const { data: payments, error: payError } = await supabase
            .from("store_payment_methods")
            .select("*")
            .eq("store_id", user.store_id);

          info.payment_methods_test = {
            status: payError ? "ERRO" : "OK",
            count: payments?.length || 0,
            error: payError?.message,
            raw_data: payments,
          };
        } catch (err: any) {
          info.payment_methods_test = {
            status: "ERRO",
            error: err.message,
          };
        }

        // Testar shipping_methods
        try {
          const { data: shipping, error: shipError } = await supabase
            .from("store_shipping_methods")
            .select("*")
            .eq("store_id", user.store_id);

          info.shipping_methods_test = {
            status: shipError ? "ERRO" : "OK",
            count: shipping?.length || 0,
            error: shipError?.message,
            raw_data: shipping,
          };
        } catch (err: any) {
          info.shipping_methods_test = {
            status: "ERRO",
            error: err.message,
          };
        }

        // Testar order_bump_configs
        try {
          const { data: orderBumps, error: bumpError } = await supabase
            .from("store_order_bump_configs")
            .select("*")
            .eq("store_id", user.store_id);

          info.order_bump_configs_test = {
            status: bumpError ? "ERRO" : "OK",
            count: orderBumps?.length || 0,
            error: bumpError?.message,
            raw_data: orderBumps,
          };
        } catch (err: any) {
          info.order_bump_configs_test = {
            status: "ERRO",
            error: err.message,
          };
        }
      } else {
        info.no_store_id = true;
      }

      // 3. Testar query sem filtro (para ver se há dados)
      try {
        const { data: allPayments, error: allPayError } = await supabase
          .from("store_payment_methods")
          .select("*")
          .limit(5);

        info.all_payments_test = {
          status: allPayError ? "ERRO" : "OK",
          count: allPayments?.length || 0,
          error: allPayError?.message,
          sample_data: allPayments,
        };
      } catch (err: any) {
        info.all_payments_test = {
          status: "ERRO",
          error: err.message,
        };
      }

      setDebugInfo(info);
      setLoading(false);
    };

    debugar();
  }, [user]);

  if (loading) {
    return <div>🔍 Debugando problema...</div>;
  }

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f5f5f5",
        margin: "20px",
        borderRadius: "8px",
        maxHeight: "80vh",
        overflow: "auto",
      }}
    >
      <h3>🐛 DEBUG - PROBLEMA DE CARREGAMENTO</h3>

      <div style={{ marginBottom: "20px" }}>
        <h4>📱 INFORMAÇÕES DO USUÁRIO:</h4>
        <pre
          style={{
            backgroundColor: "white",
            padding: "10px",
            borderRadius: "4px",
            fontSize: "12px",
            overflow: "auto",
          }}
        >
          {JSON.stringify(
            {
              user_exists: !!debugInfo.user,
              store_id: debugInfo.store_id,
              user_email: debugInfo.user?.email,
            },
            null,
            2
          )}
        </pre>
      </div>

      {Object.entries(debugInfo).map(([key, value]: [string, any]) => (
        <div
          key={key}
          style={{
            margin: "10px 0",
            padding: "10px",
            backgroundColor: "white",
            borderRadius: "4px",
          }}
        >
          <strong>{key}:</strong>
          <pre
            style={{
              fontSize: "12px",
              marginTop: "5px",
              overflow: "auto",
              maxHeight: "150px",
            }}
          >
            {typeof value === "object"
              ? JSON.stringify(value, null, 2)
              : String(value)}
          </pre>
        </div>
      ))}

      <div
        style={{
          marginTop: "20px",
          padding: "10px",
          backgroundColor: "#ffebee",
          borderRadius: "4px",
        }}
      >
        <strong>🎯 DIAGNÓSTICO:</strong>
        <ul style={{ marginTop: "10px" }}>
          <li>🔐 Se auth = ERRO: Problema de autenticação</li>
          <li>🏪 Se store_id = null: Usuário sem loja associada</li>
          <li>📋 Se products_test = ERRO: Problema com banco/permissões</li>
          <li>
            ⚙️ Se payment_methods_test = OK mas count = 0: Tabelas vazias
            (normal)
          </li>
          <li>
            🚨 Se payment_methods_test = ERRO: Problema com as novas tabelas
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DebugComponente;
