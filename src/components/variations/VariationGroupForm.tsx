
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useVariationMasterGroups, VariationMasterGroup } from '@/hooks/useVariationMasterGroups';

interface VariationGroupFormProps {
  group?: VariationMasterGroup | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const VariationGroupForm: React.FC<VariationGroupFormProps> = ({
  group,
  onSuccess,
  onCancel
}) => {
  const { createGroup, updateGroup } = useVariationMasterGroups();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    attribute_key: '',
    is_active: true,
    display_order: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name,
        description: group.description || '',
        attribute_key: group.attribute_key,
        is_active: group.is_active,
        display_order: group.display_order
      });
    }
  }, [group]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (group) {
        result = await updateGroup(group.id, formData);
      } else {
        result = await createGroup(formData);
      }

      if (result.success) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao salvar grupo:', error);
    } finally {
      setLoading(false);
    }
  };

  const attributeOptions = [
    { value: 'color', label: 'Cor' },
    { value: 'size', label: 'Tamanho' },
    { value: 'material', label: 'Material' },
    { value: 'style', label: 'Estilo' },
    { value: 'weight', label: 'Peso' },
    { value: 'flavor', label: 'Sabor' },
    { value: 'pattern', label: 'Padrão' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome do Grupo</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Ex: Cores, Tamanhos, Materiais"
          required
        />
      </div>

      <div>
        <Label htmlFor="attribute_key">Tipo de Atributo</Label>
        <Select
          value={formData.attribute_key}
          onValueChange={(value) => setFormData(prev => ({ ...prev, attribute_key: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo de atributo" />
          </SelectTrigger>
          <SelectContent>
            {attributeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Descrição (opcional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Descreva como este grupo será usado"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="display_order">Ordem de Exibição</Label>
        <Input
          id="display_order"
          type="number"
          value={formData.display_order}
          onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
          min="0"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
        />
        <Label htmlFor="is_active">Ativo</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : (group ? 'Atualizar' : 'Criar')}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};

export default VariationGroupForm;
