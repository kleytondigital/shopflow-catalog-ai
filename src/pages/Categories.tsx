
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Folder, Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react';
import { useCategories, Category } from '@/hooks/useCategories';
import CategoryFormDialog from '@/components/products/CategoryFormDialog';
import { useToast } from '@/hooks/use-toast';

const Categories: React.FC = () => {
  const { categories, loading, createCategory, updateCategory, deleteCategory, fetchCategories } = useCategories();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Category | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(c =>
      c.name.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q)
    );
  }, [categories, search]);

  const handleDelete = async (category: Category) => {
    const confirmed = window.confirm(`Deseja realmente excluir a categoria "${category.name}"?`);
    if (!confirmed) return;
    const { error } = await deleteCategory(category.id);
    if (error) {
      toast({ title: 'Erro ao excluir', description: 'Tente novamente em instantes.', variant: 'destructive' });
    } else {
      toast({ title: 'Categoria excluída', description: `"${category.name}" foi desativada.` });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-6 bg-white rounded-lg border">
        <div className="flex items-center gap-4">
          <Folder className="w-8 h-8 text-orange-600" />
          <div>
            <h2 className="text-lg font-semibold">Gestão de Categorias</h2>
            <p className="text-gray-600">Estruture e organize seu catálogo</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar categorias..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-[260px]"
            />
          </div>
          <CategoryFormDialog onCategoryCreated={() => fetchCategories()} open={isCreateOpen} onOpenChange={setIsCreateOpen} />
          <Button className="hidden md:inline-flex" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Nova Categoria
          </Button>
        </div>
      </div>

      {/* Lista */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle>Categorias</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">Nenhuma categoria encontrada.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((cat) => (
                <div key={cat.id} className="p-4 rounded-lg border bg-white hover:shadow-sm transition">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                        {!cat.is_active && <Badge variant="secondary">Inativa</Badge>}
                      </div>
                      {cat.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{cat.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => setEditing(cat)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(cat)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editar */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
          </DialogHeader>
          {editing && (
            <CategoryEditForm
              category={editing}
              onClose={() => setEditing(null)}
              onSaved={() => {
                setEditing(null);
                fetchCategories();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface CategoryEditFormProps {
  category: Category;
  onClose: () => void;
  onSaved: () => void;
}

const CategoryEditForm: React.FC<CategoryEditFormProps> = ({ category, onClose, onSaved }) => {
  const { updateCategory } = useCategories();
  const { toast } = useToast();
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await updateCategory(category.id, { name: name.trim(), description: description.trim() });
    setSaving(false);
    if (error) {
      toast({ title: 'Erro ao salvar', description: 'Tente novamente.', variant: 'destructive' });
    } else {
      toast({ title: 'Categoria atualizada', description: `"${name}" salva com sucesso.` });
      onSaved();
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da categoria" required />
      </div>
      <div>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição (opcional)" />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button type="submit" disabled={saving}>
          {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Salvando...</> : 'Salvar'}
        </Button>
      </div>
    </form>
  );
};

export default Categories;
