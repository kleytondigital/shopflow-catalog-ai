import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Truck,
  Plus,
  Edit,
  Trash2,
  Settings,
  Save,
  X,
  AlertCircle,
  Package,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCatalogSettings } from "@/hooks/useCatalogSettings";

interface ShippingMethod {
  id: string;
  name: string;
  type: "pickup" | "delivery" | "correios" | "custom";
  is_active: boolean;
  price: number;
  estimated_days?: number;
  config?: {
    instructions?: string;
    pickup_address?: string;
    delivery_zones?: string[];
    custom_instructions?: string;
  };
}

const ShippingMethodsSettings: React.FC = () => {
  const { profile } = useAuth();
  const { storeId } = useCatalogSettings();
  const { toast } = useToast();
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(
    null
  );

  const [formData, setFormData] = useState<ShippingMethod>({
    id: "",
    name: "",
    type: "delivery",
    is_active: true,
    price: 0,
    estimated_days: 1,
    config: {},
  });

  const currentStoreId = storeId || profile?.store_id;

  useEffect(() => {
    if (currentStoreId) {
      fetchShippingMethods();
    }
  }, [currentStoreId]);

  const fetchShippingMethods = async () => {
    if (!currentStoreId) return;

    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("store_shipping_methods")
        .select("*")
        .eq("store_id", currentStoreId)
        .order("name");

      if (error) {
        console.error("Erro ao buscar métodos de entrega:", error);
        toast({
          title: "Erro",
          description: "Erro ao carregar métodos de entrega",
          variant: "destructive",
        });
        return;
      }

      setShippingMethods(data || []);
    } catch (error) {
      console.error("Erro inesperado:", error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentStoreId || !formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      const dataToSave = {
        store_id: currentStoreId,
        name: formData.name.trim(),
        type: formData.type,
        is_active: formData.is_active,
        price: formData.price,
        estimated_days: formData.estimated_days,
        config: formData.config || {},
      };

      if (editingMethod?.id) {
        await (supabase as any)
          .from("store_shipping_methods")
          .update(dataToSave)
          .eq("id", editingMethod.id);
      } else {
        await (supabase as any)
          .from("store_shipping_methods")
          .insert(dataToSave);
      }

      toast({
        title: "Sucesso!",
        description: "Método de entrega salvo com sucesso",
      });

      setIsModalOpen(false);
      setEditingMethod(null);
      resetForm();
      fetchShippingMethods();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar método de entrega",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (method: ShippingMethod) => {
    setEditingMethod(method);
    setFormData({
      id: method.id,
      name: method.name,
      type: method.type,
      is_active: method.is_active,
      price: method.price,
      estimated_days: method.estimated_days,
      config: method.config || {},
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este método de entrega?"))
      return;

    try {
      await (supabase as any)
        .from("store_shipping_methods")
        .delete()
        .eq("id", id);

      toast({
        title: "Sucesso!",
        description: "Método de entrega removido",
      });

      fetchShippingMethods();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir método de entrega",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await (supabase as any)
        .from("store_shipping_methods")
        .update({ is_active: !isActive })
        .eq("id", id);

      toast({
        title: "Sucesso!",
        description: `Método de entrega ${
          !isActive ? "ativado" : "desativado"
        } com sucesso`,
      });

      fetchShippingMethods();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status do método de entrega",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      type: "delivery",
      is_active: true,
      price: 0,
      estimated_days: 1,
      config: {},
    });
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      pickup: "Retirada na Loja",
      delivery: "Entrega",
      correios: "Correios",
      custom: "Personalizado",
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      pickup: "🏪",
      delivery: "🚚",
      correios: "📮",
      custom: "⚙️",
    };
    return icons[type] || "🚚";
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "Grátis";
    return `R$ ${price.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Truck className="h-6 w-6 text-green-500" />
            Métodos de Entrega
          </h2>
          <p className="text-gray-600">
            Configure as opções de entrega disponíveis para seus clientes
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm();
                setEditingMethod(null);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Método
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingMethod ? "Editar" : "Novo"} Método de Entrega
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ex: Entrega Padrão, Retirada na Loja"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pickup">Retirada na Loja</SelectItem>
                      <SelectItem value="delivery">Entrega</SelectItem>
                      <SelectItem value="correios">Correios</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preço (R$) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Prazo Estimado (dias)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.estimated_days}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estimated_days: parseInt(e.target.value) || 1,
                      })
                    }
                    placeholder="1"
                  />
                </div>
              </div>

              {formData.type === "pickup" && (
                <div className="space-y-2">
                  <Label>Endereço para Retirada</Label>
                  <Input
                    value={formData.config?.pickup_address || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          pickup_address: e.target.value,
                        },
                      })
                    }
                    placeholder="Endereço da loja para retirada"
                  />
                </div>
              )}

              {formData.type === "delivery" && (
                <div className="space-y-2">
                  <Label>Zonas de Entrega</Label>
                  <Input
                    value={formData.config?.delivery_zones?.join(", ") || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: {
                          ...formData.config,
                          delivery_zones: e.target.value.split(", "),
                        },
                      })
                    }
                    placeholder="Centro, Zona Sul, Zona Norte (separadas por vírgula)"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Instruções</Label>
                <Input
                  value={formData.config?.instructions || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: {
                        ...formData.config,
                        instructions: e.target.value,
                      },
                    })
                  }
                  placeholder="Instruções para o cliente"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Ativo</Label>
                  <p className="text-sm text-gray-600">
                    Método disponível para clientes
                  </p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button onClick={handleSave} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {shippingMethods.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum método de entrega configurado
            </h3>
            <p className="text-gray-600 mb-4">
              Configure as opções de entrega para seus clientes
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Método
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {shippingMethods.map((method) => (
            <Card key={method.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">
                        {getTypeIcon(method.type)}
                      </span>
                      <div>
                        <h3 className="font-semibold">{method.name}</h3>
                        <p className="text-sm text-gray-500">
                          {getTypeLabel(method.type)}
                        </p>
                      </div>
                      <Badge
                        variant={method.is_active ? "default" : "secondary"}
                      >
                        {method.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                      <span className="font-medium">
                        {formatPrice(method.price)}
                      </span>
                      {method.estimated_days && (
                        <span>• {method.estimated_days} dia(s)</span>
                      )}
                    </div>

                    {method.config?.instructions && (
                      <p className="text-sm text-gray-600 mt-2">
                        {method.config.instructions}
                      </p>
                    )}

                    {method.config?.pickup_address && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                        <strong>Endereço:</strong>{" "}
                        {method.config.pickup_address}
                      </div>
                    )}

                    {method.config?.delivery_zones &&
                      method.config.delivery_zones.length > 0 && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                          <strong>Zonas:</strong>{" "}
                          {method.config.delivery_zones.join(", ")}
                        </div>
                      )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleToggleActive(method.id, method.is_active)
                      }
                      className={
                        method.is_active
                          ? "text-orange-600 hover:text-orange-700"
                          : "text-green-600 hover:text-green-700"
                      }
                    >
                      {method.is_active ? "Desativar" : "Ativar"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(method)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(method.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-medium text-green-900 mb-1">
                Dicas para métodos de entrega:
              </h4>
              <ul className="text-green-700 space-y-1">
                <li>• Retirada na loja é gratuita e rápida</li>
                <li>• Entrega local aumenta a conversão</li>
                <li>• Correios para clientes distantes</li>
                <li>• Prazos realistas evitam problemas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShippingMethodsSettings;
