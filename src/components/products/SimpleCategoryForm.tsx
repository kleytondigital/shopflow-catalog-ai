
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCategories, CreateCategoryData } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2 } from 'lucide-react';
import AIContentGenerator from '@/components/ai/AIContentGenerator';

interface SimpleCategoryFormProps {
  onCategoryCreated: (category: any) => void;
  onCancel: () => void;
}

const SimpleCategoryForm = ({ onCategoryCreated, onCancel }: SimpleCategoryFormProps) => {
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
    
    console.log('SimpleCategoryForm: Iniciando submissão da categoria', { name, description, profile });
    
    if (!name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira o nome da categoria",
        variant: "destructive"
      });
      return;
    }

    if (!profile?.store_id) {
      console.error('SimpleCategoryForm: Profile ou store_id não encontrado', { profile });
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

      console.log('SimpleCategoryForm: Dados da categoria a serem criados', categoryData);
      
      const { data, error } = await createCategory(categoryData);

      console.log('SimpleCategoryForm: Resultado da criação', { data, error });

      if (error) {
        console.error('SimpleCategoryForm: Erro ao criar categoria:', error);
        toast({
          title: "Erro ao criar categoria",
          description: "Verifique se o nome não está duplicado",
          variant: "destructive"
        });
      } else if (data) {
        console.log('SimpleCategoryForm: Categoria criada com sucesso:', data);
        toast({
          title: "Categoria criada",
          description: `A categoria "${name}" foi criada com sucesso`
        });
        
        // Limpar formulário
        setName('');
        setDescription('');
        
        // Chamar callback
        onCategoryCreated(data);
      } else {
        console.error('SimpleCategoryForm: Nenhum dado retornado');
        toast({
          title: "Erro",
          description: "Nenhum dado foi retornado",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('SimpleCategoryForm: Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao criar a categoria",
        variant: "destructive"
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
              'Criar Categoria'
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
