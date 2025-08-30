import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
  Save,
  AlertCircle,
  MapPin,
  Clock,
  Package,
  Home,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ShippingMethod {
  id?: string;
  name: string;
  type: "pickup" | "delivery" | "correios" | "custom";
  is_active: boolean;
  price: number;
  estimated_days?: number;
  config: {
    pickup_address?: string;
    delivery_radius?: number;
    custom_instructions?: string;
  };
}

const shippingTypeOptions = [
  {
    value: "pickup",
    label: "Retirada na Loja",
    icon: "🏪",
    description: "Cliente busca no local",
  },
  {
    value: "delivery",
    label: "Entrega Local",
    icon: "🚚",
    description: "Entrega na região",
  },
  {
    value: "correios",
    label: "Correios",
    icon: "📫",
    description: "Envio pelos Correios",
  },
  {
    value: "custom",
    label: "Personalizado",
    icon: "⚙️",
    description: "Método customizado",
  },
];

const ShippingMethodsSettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(
    null
  );

  const [formData, setFormData] = useState<ShippingMethod>({
    name: "",
    type: "pickup",
    is_active: true,
    price: 0,
    estimated_days: 1,
    config: {},
  });

  useEffect(() => {
    console.log(
      "ShippingMethodsSettings: useEffect triggered - user:",
      !!user,
      "store_id:",
      user?.store_id
    );
    if (user?.store_id) {
      fetchShippingMethods();
    } else if (user && !user.store_id) {
      console.warn("ShippingMethodsSettings: User exists but no store_id");
      setLoading(false);
    }
  }, [user?.store_id]);

  const fetchShippingMethods = async () => {
    if (!user?.store_id) {
      console.log("ShippingMethodsSettings: No store_id found");
      setLoading(false);
      return;
    }

    console.log(
      "ShippingMethodsSettings: Starting fetch with store_id:",
      user.store_id
    );
    setLoading(true);

    // Timeout de segurança
    const timeoutId = setTimeout(() => {
      console.warn(
        "ShippingMethodsSettings: fetchShippingMethods timeout after 10 seconds"
      );
      setLoading(false);
    }, 10000);

    try {
      const { data, error } = await supabase
        .from("store_shipping_methods")
        .select("*")
        .eq("store_id", user.store_id)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Tabela store_shipping_methods não encontrada:", error);
        setShippingMethods([]);
        toast({
          title: "Informação",
          description:
            "Tabela de métodos de entrega não encontrada. Você pode criar novos métodos.",
          variant: "default",
        });
      } else {
        console.log(
          "ShippingMethodsSettings: Found",
          data?.length || 0,
          "shipping methods"
        );
        setShippingMethods(data || []);
      }

      clearTimeout(timeoutId);
      console.log("ShippingMethodsSettings: fetch completed successfully");
    } catch (error) {
      console.error("ShippingMethodsSettings: Error in fetch:", error);
      setShippingMethods([]);
      clearTimeout(timeoutId);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.store_id || !formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      const dataToSave = {
        store_id: user.store_id,
        name: formData.name,
        type: formData.type,
        is_active: formData.is_active,
        price: formData.price,
        estimated_days: formData.estimated_days,
        config: formData.config,
      };

      if (editingMethod?.id) {
        await supabase
          .from("store_shipping_methods")
          .update(dataToSave)
          .eq("id", editingMethod.id);
      } else {
        await supabase.from("store_shipping_methods").insert(dataToSave);
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
    // Verificar se há outros métodos ativos
    const activeMethods = shippingMethods.filter(
      (m) => m.is_active && m.id !== id
    );

    if (activeMethods.length === 0) {
      toast({
        title: "Erro",
        description:
          "Não é possível excluir o último método de entrega ativo. Deve haver pelo menos um método disponível.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Tem certeza que deseja excluir este método de entrega?"))
      return;

    try {
      await supabase.from("store_shipping_methods").delete().eq("id", id);

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

  const handleToggleActive = async (method: ShippingMethod) => {
    // Se está tentando desativar, verificar se há outros métodos ativos
    if (method.is_active) {
      const otherActiveMethods = shippingMethods.filter(
        (m) => m.is_active && m.id !== method.id
      );

      if (otherActiveMethods.length === 0) {
        toast({
          title: "Erro",
          description:
            "Não é possível desativar o último método de entrega ativo. Deve haver pelo menos um método disponível.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      await supabase
        .from("store_shipping_methods")
        .update({ is_active: !method.is_active })
        .eq("id", method.id);

      toast({
        title: "Sucesso!",
        description: `Método ${
          !method.is_active ? "ativado" : "desativado"
        } com sucesso`,
      });

      fetchShippingMethods();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status do método",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "pickup",
      is_active: true,
      price: 0,
      estimated_days: 1,
      config: {},
    });
  };

  const selectedType = shippingTypeOptions.find(
    (option) => option.value === formData.type
  );

  const renderTypeSpecificFields = () => {
    switch (formData.type) {
      case "pickup":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Endereço para Retirada</Label>
              <Textarea
                value={formData.config.pickup_address || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: {
                      ...formData.config,
                      pickup_address: e.target.value,
                    },
                  })
                }
                placeholder="Endereço completo da loja..."
                rows={3}
              />
            </div>
          </div>
        );

      case "delivery":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Raio de Entrega (km)</Label>
              <Input
                type="number"
                min="1"
                value={formData.config.delivery_radius || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: {
                      ...formData.config,
                      delivery_radius: Number(e.target.value),
                    },
                  })
                }
                placeholder="Ex: 10"
              />
            </div>
          </div>
        );

      case "custom":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Instruções Personalizadas</Label>
              <Textarea
                value={formData.config.custom_instructions || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: {
                      ...formData.config,
                      custom_instructions: e.target.value,
                    },
                  })
                }
                placeholder="Instruções específicas deste método..."
                rows={4}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
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
                  <Label>Nome do Método *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ex: Retirada na Loja"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, type: value, config: {} })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {shippingTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <span>{option.icon}</span>
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedType && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{selectedType.icon}</span>
                      <h4 className="font-medium">{selectedType.label}</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      {selectedType.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preço (R$)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: Number(e.target.value),
                      })
                    }
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-600">
                    Use 0 para frete grátis
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Prazo (dias úteis)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.estimated_days || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estimated_days: Number(e.target.value),
                      })
                    }
                    placeholder="1"
                  />
                </div>
              </div>

              {renderTypeSpecificFields()}

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>Método Ativo</Label>
                  <p className="text-sm text-gray-600">
                    Disponível no checkout
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

      {/* Método Padrão */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-medium text-blue-900 mb-1">
                Método Padrão Disponível:
              </h4>
              <p className="text-blue-800">
                <strong>"A Combinar"</strong> sempre estará disponível como
                opção de entrega padrão. Os detalhes da entrega serão negociados
                diretamente via WhatsApp.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Métodos */}
      <div className="grid gap-4">
        {shippingMethods.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum método configurado
              </h3>
              <p className="text-gray-600 mb-4">
                Configure métodos de entrega para facilitar as vendas
              </p>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Método
              </Button>
            </CardContent>
          </Card>
        ) : (
          shippingMethods.map((method) => {
            const typeOption = shippingTypeOptions.find(
              (opt) => opt.value === method.type
            );
            return (
              <Card
                key={method.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg">{typeOption?.icon}</span>
                        <h3 className="font-semibold">{method.name}</h3>
                        <Badge
                          variant={method.is_active ? "default" : "secondary"}
                        >
                          {method.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-gray-600">Preço:</p>
                          <p className="font-medium text-green-600">
                            {method.price === 0
                              ? "Grátis"
                              : `R$ ${method.price.toFixed(2)}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Prazo:</p>
                          <p className="font-medium">
                            {method.estimated_days}{" "}
                            {method.estimated_days === 1 ? "dia" : "dias"} úteis
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Tipo:</p>
                          <p className="font-medium">
                            {typeOption?.description}
                          </p>
                        </div>
                      </div>

                      {method.type === "pickup" &&
                        method.config.pickup_address && (
                          <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                            <p className="text-gray-600 font-medium mb-1 flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              Endereço:
                            </p>
                            <p>{method.config.pickup_address}</p>
                          </div>
                        )}

                      {method.type === "delivery" &&
                        method.config.delivery_radius && (
                          <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                            <p className="text-gray-600 font-medium mb-1 flex items-center gap-1">
                              <Home className="h-4 w-4" />
                              Raio de entrega:
                            </p>
                            <p>{method.config.delivery_radius} km</p>
                          </div>
                        )}

                      {method.config.custom_instructions && (
                        <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                          <p className="text-gray-600 font-medium mb-1">
                            Instruções:
                          </p>
                          <p>{method.config.custom_instructions}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(method)}
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
                        onClick={() => method.id && handleDelete(method.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ShippingMethodsSettings;
