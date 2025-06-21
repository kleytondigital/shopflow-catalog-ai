
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Image, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useBanners, Banner } from '@/hooks/useBanners';
import { useToast } from '@/hooks/use-toast';

const BannerManager: React.FC = () => {
  const { banners, loading, createBanner, updateBanner, deleteBanner } = useBanners();
  const { toast } = useToast();
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    banner_type: 'hero' as Banner['banner_type'],
    position: 0,
    display_order: 0,
    is_active: true,
    start_date: '',
    end_date: ''
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      link_url: '',
      banner_type: 'hero',
      position: 0,
      display_order: 0,
      is_active: true,
      start_date: '',
      end_date: ''
    });
    setEditingBanner(null);
    setShowForm(false);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description || '',
      image_url: banner.image_url,
      link_url: banner.link_url || '',
      banner_type: banner.banner_type,
      position: banner.position,
      display_order: banner.display_order,
      is_active: banner.is_active,
      start_date: banner.start_date ? banner.start_date.split('T')[0] : '',
      end_date: banner.end_date ? banner.end_date.split('T')[0] : ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const bannerData = {
      ...formData,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : undefined,
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : undefined
    };

    try {
      if (editingBanner) {
        const { error } = await updateBanner(editingBanner.id, bannerData);
        if (error) throw error;
        toast({ title: 'Banner atualizado com sucesso!' });
      } else {
        const { error } = await createBanner({
          ...bannerData,
          store_id: '', // Será preenchido pelo hook
        } as any);
        if (error) throw error;
        toast({ title: 'Banner criado com sucesso!' });
      }
      resetForm();
    } catch (error) {
      toast({
        title: 'Erro ao salvar banner',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este banner?')) return;

    try {
      const { error } = await deleteBanner(id);
      if (error) throw error;
      toast({ title: 'Banner excluído com sucesso!' });
    } catch (error) {
      toast({
        title: 'Erro ao excluir banner',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      });
    }
  };

  const getBannerTypeLabel = (type: string) => {
    const types = {
      hero: 'Principal',
      category: 'Categoria',
      sidebar: 'Lateral',
      promotional: 'Promocional'
    };
    return types[type as keyof typeof types] || type;
  };

  const getBannerTypeColor = (type: string) => {
    const colors = {
      hero: 'bg-blue-100 text-blue-800',
      category: 'bg-green-100 text-green-800',
      sidebar: 'bg-orange-100 text-orange-800',
      promotional: 'bg-red-100 text-red-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Gerenciar Banners
          </CardTitle>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Banner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingBanner ? 'Editar Banner' : 'Novo Banner'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="banner_type">Tipo de Banner *</Label>
                    <Select
                      value={formData.banner_type}
                      onValueChange={(value: Banner['banner_type']) => 
                        setFormData(prev => ({ ...prev, banner_type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hero">Principal (Hero)</SelectItem>
                        <SelectItem value="category">Categoria</SelectItem>
                        <SelectItem value="sidebar">Lateral</SelectItem>
                        <SelectItem value="promotional">Promocional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="image_url">URL da Imagem *</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="link_url">URL do Link</Label>
                  <Input
                    id="link_url"
                    type="url"
                    value={formData.link_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="position">Posição</Label>
                    <Input
                      id="position"
                      type="number"
                      value={formData.position}
                      onChange={(e) => setFormData(prev => ({ ...prev, position: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="display_order">Ordem de Exibição</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="is_active">Ativo</Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Data de Início</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">Data de Fim</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingBanner ? 'Atualizar' : 'Criar'} Banner
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {banners.length === 0 ? (
          <div className="text-center py-8">
            <Image className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Nenhum banner criado ainda.</p>
            <p className="text-sm text-gray-400">Crie seu primeiro banner para personalizar o catálogo.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {banners.map((banner) => (
              <div key={banner.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="w-24 h-16 bg-gray-100 rounded overflow-hidden">
                  <img
                    src={banner.image_url}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{banner.title}</h4>
                    <Badge className={getBannerTypeColor(banner.banner_type)}>
                      {getBannerTypeLabel(banner.banner_type)}
                    </Badge>
                    {banner.is_active ? (
                      <Badge className="bg-green-100 text-green-800">
                        <Eye className="h-3 w-3 mr-1" />
                        Ativo
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">
                        <EyeOff className="h-3 w-3 mr-1" />
                        Inativo
                      </Badge>
                    )}
                  </div>
                  
                  {banner.description && (
                    <p className="text-sm text-gray-600 mb-2">{banner.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Posição: {banner.position}</span>
                    <span>Ordem: {banner.display_order}</span>
                    {banner.start_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(banner.start_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(banner)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(banner.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BannerManager;
