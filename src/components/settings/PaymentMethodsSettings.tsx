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
  CreditCard,
  Plus,
  Edit,
  Trash2,
  Save,
  AlertCircle,
  DollarSign,
  Smartphone,
  Building,
  Wallet,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PaymentMethod {
  id?: string;
  name: string;
  type:
    | "pix"
    | "credit_card"
    | "debit_card"
    | "bank_transfer"
    | "cash"
    | "crypto";
  is_active: boolean;
  config: {
    pix_key?: string;
    pix_key_type?: string;
    gateway_config?: any;
    instructions?: string;
  };
}

const paymentTypeOptions = [
  {
    value: "pix",
    label: "PIX",
    icon: "💰",
    description: "Pagamento instantâneo",
  },
  {
    value: "credit_card",
    label: "Cartão de Crédito",
    icon: "💳",
    description: "Pagamento com cartão",
  },
  {
    value: "debit_card",
    label: "Cartão de Débito",
    icon: "💳",
    description: "Débito direto",
  },
  {
    value: "bank_transfer",
    label: "Transferência Bancária",
    icon: "🏦",
    description: "DOC/TED",
  },
  {
    value: "cash",
    label: "Dinheiro",
    icon: "💵",
    description: "Pagamento em espécie",
  },
  {
    value: "crypto",
    label: "Criptomoeda",
    icon: "₿",
    description: "Bitcoin, etc.",
  },
];

const PaymentMethodsSettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(
    null
  );

  const [formData, setFormData] = useState<PaymentMethod>({
    name: "",
    type: "pix",
    is_active: true,
    config: {},
  });

  useEffect(() => {
    console.log(
      "PaymentMethodsSettings: useEffect triggered - user:",
      !!user,
      "store_id:",
      user?.store_id
    );
    if (user?.store_id) {
      fetchPaymentMethods();
    } else if (user && !user.store_id) {
      console.warn("PaymentMethodsSettings: User exists but no store_id");
      setLoading(false);
    }
  }, [user?.store_id]);

  const fetchPaymentMethods = async () => {
    if (!user?.store_id) {
      console.log("PaymentMethodsSettings: No store_id found");
      setLoading(false);
      return;
    }

    console.log(
      "PaymentMethodsSettings: Starting fetch with store_id:",
      user.store_id
    );
    setLoading(true);

    // Timeout de segurança
    const timeoutId = setTimeout(() => {
      console.warn(
        "PaymentMethodsSettings: fetchPaymentMethods timeout after 10 seconds"
      );
      setLoading(false);
    }, 10000);

    try {
      const { data, error } = await supabase
        .from("store_payment_methods")
        .select("*")
        .eq("store_id", user.store_id)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Tabela store_payment_methods não encontrada:", error);
        setPaymentMethods([]);
        toast({
          title: "Informação",
          description:
            "Tabela de métodos de pagamento não encontrada. Você pode criar novos métodos.",
          variant: "default",
        });
      } else {
        console.log(
          "PaymentMethodsSettings: Found",
          data?.length || 0,
          "payment methods"
        );
        setPaymentMethods(data || []);
      }

      clearTimeout(timeoutId);
      console.log("PaymentMethodsSettings: fetch completed successfully");
    } catch (error) {
      console.error("PaymentMethodsSettings: Error in fetch:", error);
      setPaymentMethods([]);
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
        config: formData.config,
      };

      if (editingMethod?.id) {
        await supabase
          .from("store_payment_methods")
          .update(dataToSave)
          .eq("id", editingMethod.id);
      } else {
        await supabase.from("store_payment_methods").insert(dataToSave);
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
      name: method.name,
      type: method.type,
      is_active: method.is_active,
      config: method.config || {},
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    // Verificar se há outros métodos ativos
    const activeMethods = paymentMethods.filter(
      (m) => m.is_active && m.id !== id
    );

    if (activeMethods.length === 0) {
      toast({
        title: "Erro",
        description:
          "Não é possível excluir o último método de pagamento ativo. Deve haver pelo menos um método disponível.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Tem certeza que deseja excluir este método de pagamento?"))
      return;

    try {
      await supabase.from("store_payment_methods").delete().eq("id", id);

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

  const handleToggleActive = async (method: PaymentMethod) => {
    // Se está tentando desativar, verificar se há outros métodos ativos
    if (method.is_active) {
      const otherActiveMethods = paymentMethods.filter(
        (m) => m.is_active && m.id !== method.id
      );

      if (otherActiveMethods.length === 0) {
        toast({
          title: "Erro",
          description:
            "Não é possível desativar o último método de pagamento ativo. Deve haver pelo menos um método disponível.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      await supabase
        .from("store_payment_methods")
        .update({ is_active: !method.is_active })
        .eq("id", method.id);

      toast({
        title: "Sucesso!",
        description: `Método ${
          !method.is_active ? "ativado" : "desativado"
        } com sucesso`,
      });

      fetchPaymentMethods();
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
      type: "pix",
      is_active: true,
      config: {},
    });
  };

  const selectedType = paymentTypeOptions.find(
    (option) => option.value === formData.type
  );

  const renderTypeSpecificFields = () => {
    switch (formData.type) {
      case "pix":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Chave PIX</Label>
              <Input
                value={formData.config.pix_key || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, pix_key: e.target.value },
                  })
                }
                placeholder="Sua chave PIX (CPF, CNPJ, email, telefone ou aleatória)"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo da Chave</Label>
              <Select
                value={formData.config.pix_key_type || ""}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, pix_key_type: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpf">CPF</SelectItem>
                  <SelectItem value="cnpj">CNPJ</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="phone">Telefone</SelectItem>
                  <SelectItem value="random">Chave Aleatória</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "bank_transfer":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Dados Bancários</Label>
              <Textarea
                value={formData.config.bank_info || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, bank_info: e.target.value },
                  })
                }
                placeholder="Banco, Agência, Conta, Titular..."
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
            <CreditCard className="h-6 w-6 text-blue-500" />
            Métodos de Pagamento
          </h2>
          <p className="text-gray-600">
            Configure as formas de pagamento aceitas em sua loja
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
                  <Label>Nome do Método *</Label>
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
                      setFormData({ ...formData, type: value, config: {} })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentTypeOptions.map((option) => (
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
                <Card className="bg-blue-50 border-blue-200">
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

              {renderTypeSpecificFields()}

              <div className="space-y-2">
                <Label>Instruções para o Cliente</Label>
                <Textarea
                  value={formData.config.instructions || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: {
                        ...formData.config,
                        instructions: e.target.value,
                      },
                    })
                  }
                  placeholder="Instruções que aparecerão no checkout..."
                  rows={3}
                />
              </div>

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

      {/* Métodos Padrão */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-medium text-green-900 mb-1">
                Métodos Padrão Disponíveis:
              </h4>
              <p className="text-green-800">
                <strong>"A Combinar"</strong> sempre estará disponível como
                opção de pagamento padrão. Os pedidos são enviados via WhatsApp
                para negociação direta.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Métodos */}
      <div className="grid gap-4">
        {paymentMethods.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum método configurado
              </h3>
              <p className="text-gray-600 mb-4">
                Configure métodos de pagamento para facilitar as vendas
              </p>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Método
              </Button>
            </CardContent>
          </Card>
        ) : (
          paymentMethods.map((method) => {
            const typeOption = paymentTypeOptions.find(
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

                      <p className="text-sm text-gray-600 mb-3">
                        {typeOption?.description}
                      </p>

                      {method.type === "pix" && method.config.pix_key && (
                        <div className="text-sm">
                          <p className="text-gray-600">Chave PIX:</p>
                          <p className="font-mono">{method.config.pix_key}</p>
                        </div>
                      )}

                      {method.config.instructions && (
                        <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                          <p className="text-gray-600 font-medium mb-1">
                            Instruções:
                          </p>
                          <p>{method.config.instructions}</p>
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

export default PaymentMethodsSettings;
