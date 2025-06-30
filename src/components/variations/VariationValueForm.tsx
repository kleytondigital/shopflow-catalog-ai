
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useVariationMasterGroups, VariationMasterGroup, VariationMasterValue } from '@/hooks/useVariationMasterGroups';

interface VariationValueFormProps {
  value?: VariationMasterValue | null;
  groupId?: string | null;
  groups: VariationMasterGroup[];
  onSuccess: () => void;
  onCancel: () => void;
}

const VariationValueForm: React.FC<VariationValueFormProps> = ({
  value,
  groupId,
  groups,
  onSuccess,
  onCancel
}) => {
  const { createValue, updateValue } = useVariationMasterGroups();
  const [formData, setFormData] = useState({
    group_id: groupId || '',
    value: '',
    hex_color: '',
    is_active: true,
    display_order: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (value) {
      setFormData({
        group_id: value.group_id,
        value: value.value,
        hex_color: value.hex_color || '',
        is_active: value.is_active,
        display_order: value.display_order
      });
    } else if (groupId) {
      setFormData(prev => ({ ...prev, group_id: groupId }));
    }
  }, [value, groupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        hex_color: formData.hex_color || null
      };

      let result;
      if (value) {
        result = await updateValue(value.id, submitData);
      } else {
        result = await createValue(submitData);
      }

      if (result.success) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao salvar valor:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedGroup = groups.find(g => g.id === formData.group_id);
  const isColorGroup = selectedGroup?.attribute_key === 'color';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="group_id">Grupo</Label>
        <Select
          value={formData.group_id}
          onValueChange={(value) => setFormData(prev => ({ ...prev, group_id: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o grupo" />
          </SelectTrigger>
          <SelectContent>
            {groups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="value">Valor</Label>
        <Input
          id="value"
          value={formData.value}
          onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
          placeholder="Ex: Preto, 36, Algodão"
          required
        />
      </div>

      {isColorGroup && (
        <div>
          <Label htmlFor="hex_color">Cor (Hexadecimal)</Label>
          <div className="flex gap-2">
            <Input
              id="hex_color"
              value={formData.hex_color}
              onChange={(e) => setFormData(prev => ({ ...prev, hex_color: e.target.value }))}
              placeholder="#000000"
            />
            <input
              type="color"
              value={formData.hex_color || '#000000'}
              onChange={(e) => setFormData(prev => ({ ...prev, hex_color: e.target.value }))}
              className="w-12 h-10 border rounded"
            />
          </div>
        </div>
      )}

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
        <Button type="submit" disabled={loading || !formData.group_id || !formData.value}>
          {loading ? 'Salvando...' : (value ? 'Atualizar' : 'Criar')}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};

export default VariationValueForm;
