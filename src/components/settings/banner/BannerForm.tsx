
import React, { useState } from 'react';
import { Upload, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Banner } from '@/hooks/useBanners';
import { useProductsForBanner } from '@/hooks/useProductsForBanner';
import { useBannerUpload } from '@/hooks/useBannerUpload';

interface BannerFormProps {
  editingBanner?: Banner | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

const BannerForm: React.FC<BannerFormProps> = ({
  editingBanner,
  onSubmit,
  onCancel
}) => {
  const { products, loading: productsLoading } = useProductsForBanner();
  const { uploadBannerImage, uploading } = useBannerUpload();
  
  const [sourceType, setSourceType] = useState<'manual' | 'product'>(
    editingBanner?.source_type || 'manual'
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(editingBanner?.image_url || '');
  
  const [formData, setFormData] = useState({
    title: editingBanner?.title || '',
    description: editingBanner?.description || '',
    image_url: editingBanner?.image_url || '',
    link_url: editingBanner?.link_url || '',
    banner_type: editingBanner?.banner_type || 'hero' as Banner['banner_type'],
    position: editingBanner?.position || 0,
    display_order: editingBanner?.display_order || 0,
    is_active: editingBanner?.is_active ?? true,
    start_date: editingBanner?.start_date ? editingBanner.start_date.split('T')[0] : '',
    end_date: editingBanner?.end_date ? editingBanner.end_date.split('T')[0] : '',
    product_id: editingBanner?.product_id || '',
    source_type: editingBanner?.source_type || 'manual' as 'manual' | 'product'
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFormData(prev => ({ ...prev, image_url: '' }));
    }
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setFormData(prev => ({
        ...prev,
        product_id: productId,
        title: product.name,
        image_url: product.image_url || '',
        description: product.description || ''
      }));
      setPreviewUrl(product.image_url || '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalImageUrl = formData.image_url;

    // Upload da imagem se for manual e houver arquivo
    if (sourceType === 'manual' && selectedFile) {
      finalImageUrl = await uploadBannerImage(selectedFile);
      if (!finalImageUrl) return;
    }

    const bannerData = {
      ...formData,
      image_url: finalImageUrl,
      source_type: sourceType,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : undefined,
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : undefined,
      product_id: sourceType === 'product' ? formData.product_id : undefined
    };

    await onSubmit(bannerData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Seletor de Tipo de Fonte */}
      <div className="space-y-4">
        <Label className="text-lg font-semibold">Tipo de Banner</Label>
        <RadioGroup
          value={sourceType}
          onValueChange={(value: 'manual' | 'product') => {
            setSourceType(value);
            setFormData(prev => ({ ...prev, source_type: value }));
            setPreviewUrl('');
            setSelectedFile(null);
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
            sourceType === 'manual' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}>
            <RadioGroupItem value="manual" id="manual" />
            <Label htmlFor="manual" className="flex items-center gap-2 cursor-pointer">
              <Upload className="h-5 w-5" />
              <div>
                <div className="font-medium">Upload Manual</div>
                <div className="text-sm text-gray-600">Enviar imagem personalizada</div>
              </div>
            </Label>
          </div>

          <div className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
            sourceType === 'product' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}>
            <RadioGroupItem value="product" id="product" />
            <Label htmlFor="product" className="flex items-center gap-2 cursor-pointer">
              <Package className="h-5 w-5" />
              <div>
                <div className="font-medium">Produto Existente</div>
                <div className="text-sm text-gray-600">Usar dados de um produto</div>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Configurações Básicas */}
      <div className="grid grid-cols-2 gap-4">
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

        <div className="flex items-center space-x-2 pt-6">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
          />
          <Label htmlFor="is_active">Ativo</Label>
        </div>
      </div>

      {/* Configurações por Tipo */}
      {sourceType === 'manual' && (
        <div className="space-y-4">
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
            <Label htmlFor="file-upload">Imagem do Banner *</Label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary"
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="h-28 w-auto object-contain" />
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-500 mt-2">
                    {uploading ? 'Carregando...' : 'Clique para carregar imagem'}
                  </span>
                </div>
              )}
            </label>
          </div>
        </div>
      )}

      {sourceType === 'product' && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="product_select">Selecionar Produto *</Label>
            <Select
              value={formData.product_id}
              onValueChange={handleProductSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Escolha um produto..." />
              </SelectTrigger>
              <SelectContent>
                {productsLoading ? (
                  <SelectItem value="" disabled>Carregando produtos...</SelectItem>
                ) : (
                  products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - R$ {product.retail_price.toFixed(2)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {previewUrl && (
            <div>
              <Label>Preview do Produto</Label>
              <div className="border rounded-lg p-4">
                <img src={previewUrl} alt="Preview" className="h-32 w-auto object-contain mx-auto" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Configurações Comuns */}
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
        <Label htmlFor="link_url">URL do Link</Label>
        <Input
          id="link_url"
          type="url"
          value={formData.link_url}
          onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
          placeholder="https://exemplo.com"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="position">Posição</Label>
          <Input
            id="position"
            type="number"
            value={formData.position}
            onChange={(e) => setFormData(prev => ({ ...prev, position: parseInt(e.target.value) || 0 }))}
          />
        </div>
        <div>
          <Label htmlFor="display_order">Ordem de Exibição</Label>
          <Input
            id="display_order"
            type="number"
            value={formData.display_order}
            onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
          />
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
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={uploading}>
          {uploading ? 'Carregando...' : editingBanner ? 'Atualizar' : 'Criar'} Banner
        </Button>
      </div>
    </form>
  );
};

export default BannerForm;
