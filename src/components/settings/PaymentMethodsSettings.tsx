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
  CreditCard,
  Plus,
  Edit,
  Trash2,
  Settings,
  Save,
  X,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCatalogSettings } from "@/hooks/useCatalogSettings";

interface PaymentMethod {
  id: string;
  name: string;
  type:
    | "pix"
    | "credit_card"
    | "debit_card"
    | "bank_transfer"
    | "cash"
    | "crypto";
  is_active: boolean;
  config?: {
    pix_key?: string;
    pix_key_type?: string;
    gateway_config?: any;
    instructions?: string;
  };
}

const PaymentMethodsSettings: React.FC = () => {
  const { profile } = useAuth();
  const { storeId } = useCatalogSettings();
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(
    null
  );

  const [formData, setFormData] = useState<PaymentMethod>({
    id: "",
    name: "",
    type: "pix",
    is_active: true,
    config: {},
  });

  const currentStoreId = storeId || profile?.store_id;

  useEffect(() => {
    if (currentStoreId) {
      fetchPaymentMethods();
    }
  }, [currentStoreId]);

  const fetchPaymentMethods = async () => {
    if (!currentStoreId) return;

    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("store_payment_methods")
        .select("*")
        .eq("store_id", currentStoreId)
        .order("name");

      if (error) {
        console.error("Erro ao buscar métodos de pagamento:", error);
        toast({
          title: "Erro",
          description: "Erro ao carregar métodos de pagamento",
          variant: "destructive",
        });
        return;
      }

      setPaymentMethods(data || []);
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
        config: formData.config || {},
      };

      if (editingMethod?.id) {
        await (supabase as any)
          .from("store_payment_methods")
          .update(dataToSave)
          .eq("id", editingMethod.id);
      } else {
        await (supabase as any)
          .from("store_payment_methods")
          .insert(dataToSave);
      }

      toast({
        title: "Sucesso!",
        description: "Método de pagamento salvo com sucesso",
      });

      setIsModalOpen(false);
      setEditingMethod(null);
      resetForm();
      fetchPaymentMethods();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar método de pagamento",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      id: method.id,
      name: method.name,
      type: method.type,
      is_active: method.is_active,
      config: method.config || {},
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este método de pagamento?"))
      return;

    try {
      await (supabase as any)
        .from("store_payment_methods")
        .delete()
        .eq("id", id);

      toast({
        title: "Sucesso!",
        description: "Método de pagamento removido",
      });

      fetchPaymentMethods();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir método de pagamento",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await (supabase as any)
        .from("store_payment_methods")
        .update({ is_active: !isActive })
        .eq("id", id);

      toast({
        title: "Sucesso!",
        description: `Método de pagamento ${
          !isActive ? "ativado" : "desativado"
        } com sucesso`,
      });

      fetchPaymentMethods();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status do método de pagamento",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      type: "pix",
      is_active: true,
      config: {},
    });
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      pix: "PIX",
      credit_card: "Cartão de Crédito",
      debit_card: "Cartão de Débito",
      bank_transfer: "Transferência Bancária",
      cash: "Dinheiro",
      crypto: "Criptomoeda",
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      pix: "💳",
      credit_card: "💳",
      debit_card: "💳",
      bank_transfer: "🏦",
      cash: "💰",
      crypto: "₿",
    };
    return icons[type] || "💳";
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
            <CreditCard className="h-6 w-6 text-blue-500" />
            Métodos de Pagamento
          </h2>
          <p className="text-gray-600">
            Configure as formas de pagamento aceitas pela sua loja
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
                {editingMethod ? "Editar" : "Novo"} Método de Pagamento
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
                    placeholder="Ex: PIX, Cartão de Crédito"
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
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="credit_card">
                        Cartão de Crédito
                      </SelectItem>
                      <SelectItem value="debit_card">
                        Cartão de Débito
                      </SelectItem>
                      <SelectItem value="bank_transfer">
                        Transferência Bancária
                      </SelectItem>
                      <SelectItem value="cash">Dinheiro</SelectItem>
                      <SelectItem value="crypto">Criptomoeda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.type === "pix" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Chave PIX</Label>
                      <Input
                        value={formData.config?.pix_key || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            config: {
                              ...formData.config,
                              pix_key: e.target.value,
                            },
                          })
                        }
                        placeholder="Sua chave PIX"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tipo de Chave</Label>
                      <Select
                        value={formData.config?.pix_key_type || "cpf"}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            config: { ...formData.config, pix_key_type: value },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cpf">CPF</SelectItem>
                          <SelectItem value="cnpj">CNPJ</SelectItem>
                          <SelectItem value="email">E-mail</SelectItem>
                          <SelectItem value="phone">Telefone</SelectItem>
                          <SelectItem value="random">
                            Chave Aleatória
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
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

      {paymentMethods.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum método de pagamento configurado
            </h3>
            <p className="text-gray-600 mb-4">
              Configure as formas de pagamento aceitas pela sua loja
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Método
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {paymentMethods.map((method) => (
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

                    {method.config?.instructions && (
                      <p className="text-sm text-gray-600 mt-2">
                        {method.config.instructions}
                      </p>
                    )}

                    {method.config?.pix_key && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                        <strong>Chave PIX:</strong> {method.config.pix_key}
                        {method.config.pix_key_type && (
                          <span className="ml-2 text-gray-500">
                            ({method.config.pix_key_type})
                          </span>
                        )}
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

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-medium text-blue-900 mb-1">
                Dicas para métodos de pagamento:
              </h4>
              <ul className="text-blue-700 space-y-1">
                <li>• PIX é a forma mais rápida e econômica</li>
                <li>• Cartões de crédito aumentam o ticket médio</li>
                <li>• Mantenha pelo menos 2 opções ativas</li>
                <li>• Instruções claras melhoram a experiência</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentMethodsSettings;
