import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCategories, CreateCategoryData } from "@/hooks/useCategories";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";
import AIContentGenerator from "@/components/ai/AIContentGenerator";
import { supabase } from "@/integrations/supabase/client";

interface SimpleCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryCreated: (category: any) => void;
}

const SimpleCategoryDialog = ({
  open,
  onOpenChange,
  onCategoryCreated,
}: SimpleCategoryDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { createCategory } = useCategories();
  const { profile } = useAuth();
  const { toast } = useToast();

  const handleDescriptionGenerated = (generatedDescription: string) => {
    setDescription(generatedDescription);
  };

  const resetForm = () => {
    setName("");
    setDescription("");
  };

  const handleSubmit = async () => {
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

      // Fechar dialog e limpar form
      resetForm();
      onOpenChange(false);
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

  // Resetar formulário quando o modal for fechado
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !loading) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova Categoria
          </DialogTitle>
        </DialogHeader>

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
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleCategoryDialog;
