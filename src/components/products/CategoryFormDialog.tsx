
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCategories, CreateCategoryData } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2 } from 'lucide-react';
import AIContentGenerator from '@/components/ai/AIContentGenerator';

interface CategoryFormDialogProps {
  onCategoryCreated: (category: any) => void;
}

const CategoryFormDialog = ({ onCategoryCreated }: CategoryFormDialogProps) => {
  const [open, setOpen] = useState(false);
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
    e.stopPropagation();
    
    console.log('CategoryFormDialog: Iniciando submissão da categoria', { name, description, profile });
    
    if (!name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira o nome da categoria",
        variant: "destructive"
      });
      return;
    }

    if (!profile?.store_id) {
      console.error('CategoryFormDialog: Profile ou store_id não encontrado', { profile });
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

      console.log('CategoryFormDialog: Dados da categoria a serem criados', categoryData);
      
      const { data, error } = await createCategory(categoryData);

      console.log('CategoryFormDialog: Resultado da criação', { data, error });

      if (error) {
        console.error('CategoryFormDialog: Erro ao criar categoria:', error);
        toast({
          title: "Erro ao criar categoria",
          description: "Verifique se o nome não está duplicado",
          variant: "destructive"
        });
      } else if (data) {
        console.log('CategoryFormDialog: Categoria criada com sucesso:', data);
        toast({
          title: "Categoria criada",
          description: `A categoria "${name}" foi criada com sucesso`
        });
        
        // Limpar formulário
        setName('');
        setDescription('');
        
        // Fechar dialog
        setOpen(false);
        
        // Chamar callback
        onCategoryCreated(data);
      } else {
        console.error('CategoryFormDialog: Nenhum dado retornado');
        toast({
          title: "Erro",
          description: "Nenhum dado foi retornado",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('CategoryFormDialog: Erro inesperado:', error);
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
      setOpen(newOpen);
      if (!newOpen) {
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Categoria
        </Button>
      </DialogTrigger>
      
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
              onClick={() => setOpen(false)} 
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

export default CategoryFormDialog;
