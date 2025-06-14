
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCategories, CreateCategoryData } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus } from 'lucide-react';
import AIContentGenerator from '@/components/ai/AIContentGenerator';

interface SimpleCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryCreated: (category: any) => void;
}

const SimpleCategoryDialog = ({ open, onOpenChange, onCategoryCreated }: SimpleCategoryDialogProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
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
        title: "Nome obrigatório",
        description: "Por favor, insira o nome da categoria",
        variant: "destructive"
      });
      return;
    }

    if (!profile?.store_id) {
      toast({
        title: "Erro",
        description: "Loja não identificada",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const categoryData: CreateCategoryData = {
        store_id: profile.store_id,
        name: name.trim(),
        description: description.trim() || undefined,
        is_active: true
      };

      const { data, error } = await createCategory(categoryData);

      if (error) {
        toast({
          title: "Erro ao criar categoria",
          description: "Verifique se o nome não está duplicado",
          variant: "destructive"
        });
      } else if (data) {
        toast({
          title: "Categoria criada",
          description: `A categoria "${name}" foi criada com sucesso`
        });
        
        setName('');
        setDescription('');
        onCategoryCreated(data);
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao criar a categoria",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      onOpenChange(newOpen);
      if (!newOpen) resetForm();
    }}>
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
                'Criar Categoria'
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
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
