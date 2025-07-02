import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCategories, CreateCategoryData } from "@/hooks/useCategories";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2 } from "lucide-react";
import AIContentGenerator from "@/components/ai/AIContentGenerator";
import { supabase } from "@/integrations/supabase/client";

interface SimpleCategoryFormProps {
  onCategoryCreated: (category: any) => void;
  onCancel: () => void;
}

const SimpleCategoryForm = ({
  onCategoryCreated,
  onCancel,
}: SimpleCategoryFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { createCategory } = useCategories();
  const { profile } = useAuth();
  const { toast } = useToast();

  const handleDescriptionGenerated = (generatedDescription: string) => {
    setDescription(generatedDescription);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da categoria é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      const categoryData = {
        name: name.trim(),
        description: description.trim() || null,
        store_id: profile?.store_id,
        is_active: true,
      };

      const { data, error } = await supabase
        .from("categories")
        .insert([categoryData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso!",
        description: `Categoria "${name}" criada com sucesso`,
      });

      if (onCategoryCreated) {
        onCategoryCreated(data);
      }

      // Limpar form
      setName("");
      setDescription("");
    } catch (error: any) {
      console.error("Erro ao criar categoria:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar categoria",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
      <div className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        <h3 className="font-medium">Nova Categoria</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="categoryName">Nome da Categoria *</Label>
          <Input
            id="categoryName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Roupas, Eletrônicos, Acessórios..."
            disabled={loading}
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="categoryDescription">Descrição</Label>
            <AIContentGenerator
              productName={`Categoria: ${name}`}
              category="categoria de produtos"
              onDescriptionGenerated={handleDescriptionGenerated}
              disabled={!name.trim() || loading}
              variant="description"
              size="sm"
            />
          </div>
          <Textarea
            id="categoryDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Breve descrição da categoria..."
            rows={3}
            disabled={loading}
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={loading || !name.trim()}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              "Criar Categoria"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SimpleCategoryForm;
