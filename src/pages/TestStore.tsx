import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const TestStore = () => {
  const [slug, setSlug] = useState("cheio-de-desejo-1");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testStore = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Buscar por slug
      const { data: storeBySlug, error: slugError } = await supabase
        .from("stores")
        .select("*")
        .eq("url_slug", slug)
        .eq("is_active", true)
        .single();

      if (slugError) {
        console.error("Erro ao buscar por slug:", slugError);
        // Tentar buscar todas as lojas ativas
        const { data: allStores, error: allError } = await supabase
          .from("stores")
          .select("*")
          .eq("is_active", true);

        setResult({
          error: slugError.message,
          allActiveStores: allStores || [],
          searchedSlug: slug,
        });
      } else {
        setResult({
          success: true,
          store: storeBySlug,
          searchedSlug: slug,
        });
      }
    } catch (error) {
      setResult({
        error: "Erro geral: " + error,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Teste de Loja</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Slug da loja"
            />
            <Button onClick={testStore} disabled={loading}>
              {loading ? "Testando..." : "Testar"}
            </Button>
          </div>

          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestStore;
