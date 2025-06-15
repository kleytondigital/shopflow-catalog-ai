
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateStoreData } from '@/hooks/useStores';

interface StoreFormProps {
  onSubmit: (data: CreateStoreData) => Promise<void>;
  onCancel: () => void;
}

const StoreForm: React.FC<StoreFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<CreateStoreData>>({
    name: '',
    description: '',
    plan_type: 'basic',
    monthly_fee: 29.90,
    phone: '',
    email: '',
    address: '',
    cnpj: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.owner_id) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData as CreateStoreData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da Loja *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Digite o nome da loja"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Breve descrição da loja"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="plan_type">Plano</Label>
          <Select 
            value={formData.plan_type} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, plan_type: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Básico</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="monthly_fee">Mensalidade (R$)</Label>
          <Input
            id="monthly_fee"
            type="number"
            step="0.01"
            min="0"
            value={formData.monthly_fee}
            onChange={(e) => setFormData(prev => ({ ...prev, monthly_fee: parseFloat(e.target.value) }))}
            placeholder="29.90"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="contato@loja.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="(11) 99999-9999"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cnpj">CNPJ</Label>
        <Input
          id="cnpj"
          value={formData.cnpj}
          onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
          placeholder="00.000.000/0000-00"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Endereço</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          placeholder="Endereço completo da loja"
          rows={2}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || !formData.name} className="flex-1">
          {loading ? 'Criando...' : 'Criar Loja'}
        </Button>
      </div>
    </form>
  );
};

export default StoreForm;
