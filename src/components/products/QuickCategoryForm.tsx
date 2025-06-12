
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCategories, CreateCategoryData } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2 } from 'lucide-react';

interface QuickCategoryFormProps {
  onCategoryCreated: (category: any) => void;
  onCancel: () => void;
}

const QuickCategoryForm = ({ onCategoryCreated, onCancel }: QuickCategoryFormProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { createCategory } = useCategories();
  const { profile } = useAuth();
  const { toast } = useToast();

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
    } else {
      toast({
        title: "Categoria criada",
        description: `A categoria "${name}" foi criada com sucesso`
      });
      onCategoryCreated(data);
      setName('');
      setDescription('');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center gap-2 mb-3">
        <Plus className="h-4 w-4" />
        <h3 className="font-medium">Cadastro Rápido de Categoria</h3>
      </div>
      
      <div>
        <Label htmlFor="categoryName">Nome da Categoria</Label>
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
        <Label htmlFor="categoryDescription">Descrição (Opcional)</Label>
        <Textarea
          id="categoryDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Breve descrição da categoria..."
          rows={2}
          disabled={loading}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando...
            </>
          ) : (
            'Criar Categoria'
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};

export default QuickCategoryForm;
