import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Gift,
  Plus,
  Edit,
  Trash2,
  Package,
  Percent,
  Clock,
  Users,
  Save,
  AlertCircle,
  Search,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCatalogSettings } from "@/hooks/useCatalogSettings";
import { useStoreResolver } from "@/hooks/useStoreResolver";

interface Product {
  id: string;
  name: string;
  retail_price: number;
  category?: string;
}

interface OrderBumpConfig {
  id?: string;
  product_id: string;
  product?: Product;
  is_active: boolean;
  discount_percentage: number;
  urgency_text: string;
  social_proof_text: string;
  is_limited_time: boolean;
  limited_quantity?: number;
}

const OrderBumpSettings: React.FC = () => {
  const { user } = useAuth();
  const { settings, storeId } = useCatalogSettings();
  const { resolveStoreId } = useStoreResolver();
  const [resolvedStoreId, setResolvedStoreId] = useState<string | null>(null);
  const { toast } = useToast();
  const [orderBumps, setOrderBumps] = useState<OrderBumpConfig[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBump, setEditingBump] = useState<OrderBumpConfig | null>(null);
  const [productSearch, setProductSearch] = useState("");

  const [formData, setFormData] = useState<OrderBumpConfig>({
    product_id: "",
    is_active: true,
    discount_percentage: 10,
    urgency_text: "Oferta por tempo limitado!",
    social_proof_text: "127 pessoas compraram este produto hoje",
    is_limited_time: true,
    limited_quantity: 50,
  });

  // Resolver storeId diretamente se não vier do useCatalogSettings
  useEffect(() => {
    const resolveStore = async () => {
      if (storeId) {
        setResolvedStoreId(storeId);
      } else if (user?.store_id) {
        try {
          const resolved = await resolveStoreId(user.store_id);
          setResolvedStoreId(resolved);
        } catch (error) {
          console.error("Erro ao resolver storeId:", error);
        }
      }
    };

    resolveStore();
  }, [storeId, user?.store_id, resolveStoreId]);

  useEffect(() => {
    if (resolvedStoreId) {
      fetchData();
    }
  }, [user, resolvedStoreId]);

  const fetchData = async () => {
    if (!resolvedStoreId) {
      console.log("OrderBumpSettings: No resolvedStoreId found");
      setLoading(false);
      return;
    }

    setLoading(true);

    // Timeout de segurança
    const timeoutId = setTimeout(() => {
      console.warn("OrderBumpSettings: fetchData timeout after 10 seconds");
      setLoading(false);
    }, 10000);

    try {
      // Buscar produtos da loja
      console.log(
        "OrderBumpSettings: Buscando produtos para resolvedStoreId:",
        resolvedStoreId
      );
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("id, name, retail_price, category, is_active")
        .eq("store_id", resolvedStoreId)
        .eq("is_active", true)
        .order("name");

      if (productsError) {
        console.error(
          "OrderBumpSettings: Erro ao buscar produtos:",
          productsError
        );
        toast({
          title: "Aviso",
          description:
            "Erro ao carregar produtos. Verifique se há produtos cadastrados na loja.",
          variant: "destructive",
        });
        // Não throw aqui, continua mesmo com erro de produtos
      }

      console.log(
        "OrderBumpSettings: Produtos encontrados:",
        productsData?.length || 0
      );

      // Buscar order bumps configurados - sem JOIN para evitar problemas
      let orderBumpsData = [];
      try {
        const { data, error: orderBumpsError } = await supabase
          .from("store_order_bump_configs")
          .select("*")
          .eq("store_id", resolvedStoreId);

        if (orderBumpsError) {
          console.warn(
            "Tabela store_order_bump_configs não encontrada:",
            orderBumpsError
          );
          orderBumpsData = [];
        } else {
          // Adicionar informações do produto manualmente
          const bumpsWithProducts = (data || []).map((bump) => {
            const product = productsData?.find((p) => p.id === bump.product_id);
            return {
              ...bump,
              product: product || null,
            };
          });
          orderBumpsData = bumpsWithProducts;
        }
      } catch (err) {
        console.warn("Erro ao buscar order bumps, usando lista vazia:", err);
        orderBumpsData = [];
      }

      console.log("OrderBumpSettings: Dados carregados com sucesso");

      setProducts(productsData || []);
      setFilteredProducts(productsData || []);
      setOrderBumps(orderBumpsData);

      clearTimeout(timeoutId);
      console.log("OrderBumpSettings: fetchData completed successfully");
    } catch (error) {
      console.error("OrderBumpSettings: Error in fetchData:", error);
      setProducts([]);
      setFilteredProducts([]);
      setOrderBumps([]);
      clearTimeout(timeoutId);
      toast({
        title: "Erro",
        description:
          "Erro ao carregar configurações. Verifique se há produtos cadastrados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar produtos baseado na busca
  useEffect(() => {
    if (!productSearch) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
          product.category?.toLowerCase().includes(productSearch.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [productSearch, products]);

  const handleSave = async () => {
    if (!resolvedStoreId || !formData.product_id) {
      toast({
        title: "Erro",
        description: "Selecione um produto",
        variant: "destructive",
      });
      return;
    }

    // Verificar se já existe order bump para este produto (apenas se não estiver editando)
    if (!editingBump) {
      const existingBump = orderBumps.find(
        (bump) => bump.product_id === formData.product_id
      );
      if (existingBump) {
        toast({
          title: "Produto já configurado",
          description:
            "Este produto já possui um Order Bump configurado. Edite o existente ou escolha outro produto.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const dataToSave = {
        store_id: resolvedStoreId,
        product_id: formData.product_id,
        is_active: formData.is_active,
        discount_percentage: formData.discount_percentage,
        urgency_text: formData.urgency_text,
        social_proof_text: formData.social_proof_text,
        is_limited_time: formData.is_limited_time,
        limited_quantity: formData.limited_quantity,
      };

      // Criar tabela se não existir (DDL automático)
      try {
        if (editingBump?.id) {
          // Editar
          const { error } = await supabase
            .from("store_order_bump_configs")
            .update(dataToSave)
            .eq("id", editingBump.id);

          if (error) throw error;
        } else {
          // Criar novo
          const { error } = await supabase
            .from("store_order_bump_configs")
            .insert(dataToSave);

          if (error) throw error;
        }
      } catch (dbError: any) {
        if (
          dbError.message?.includes(
            'relation "store_order_bump_configs" does not exist'
          )
        ) {
          toast({
            title: "Aviso",
            description:
              "Tabela de order bumps não encontrada. Entre em contato com o suporte para configurar o banco de dados.",
            variant: "destructive",
          });
          return;
        }
        throw dbError;
      }

      toast({
        title: "Sucesso!",
        description: "Order bump salvo com sucesso",
      });

      setIsModalOpen(false);
      setEditingBump(null);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error("Erro ao salvar:", error);

      // Tratar erro de duplicata
      if (
        error?.code === "23505" &&
        error?.message?.includes("unique_store_product")
      ) {
        toast({
          title: "Produto já configurado",
          description:
            "Este produto já possui um Order Bump. Edite o existente ou escolha outro produto.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description:
            "Erro ao salvar configuração. Verifique se o banco de dados está configurado corretamente.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEdit = (bump: OrderBumpConfig) => {
    setEditingBump(bump);
    setFormData({
      product_id: bump.product_id,
      is_active: bump.is_active,
      discount_percentage: bump.discount_percentage,
      urgency_text: bump.urgency_text,
      social_proof_text: bump.social_proof_text,
      is_limited_time: bump.is_limited_time,
      limited_quantity: bump.limited_quantity,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este order bump?")) return;

    try {
      const { error } = await supabase
        .from("store_order_bump_configs")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Erro ao excluir:", error);
        toast({
          title: "Erro",
          description: "Erro ao excluir configuração",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso!",
        description: "Order bump removido",
      });

      fetchData();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir configuração",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (bump: OrderBumpConfig) => {
    if (!bump.id) return;

    try {
      const { error } = await supabase
        .from("store_order_bump_configs")
        .update({ is_active: !bump.is_active })
        .eq("id", bump.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: `Order bump ${
          !bump.is_active ? "ativado" : "desativado"
        } com sucesso`,
      });

      fetchData();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status do order bump",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      product_id: "",
      is_active: true,
      discount_percentage: 10,
      urgency_text: "Oferta por tempo limitado!",
      social_proof_text: "127 pessoas compraram este produto hoje",
      is_limited_time: true,
      limited_quantity: 50,
    });
  };

  const selectedProduct = products.find((p) => p.id === formData.product_id);
  const discountedPrice = selectedProduct
    ? selectedProduct.retail_price * (1 - formData.discount_percentage / 100)
    : 0;

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
            <Gift className="h-6 w-6 text-orange-500" />
            Order Bumps
          </h2>
          <p className="text-gray-600">
            Configure ofertas especiais para aumentar o ticket médio
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm();
                setEditingBump(null);
              }}
              disabled={products.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Order Bump
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBump ? "Editar" : "Novo"} Order Bump
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Seleção de Produto com Busca */}
              <div className="space-y-2">
                <Label>Produto *</Label>
                <div className="space-y-3">
                  {/* Campo de busca */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar produtos..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    {productSearch && (
                      <button
                        onClick={() => setProductSearch("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>

                  {/* Select com produtos filtrados */}
                  <Select
                    value={formData.product_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, product_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {filteredProducts.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          {productSearch
                            ? "Nenhum produto encontrado"
                            : "Nenhum produto disponível"}
                        </div>
                      ) : (
                        filteredProducts.map((product) => {
                          const hasOrderBump = orderBumps.some(
                            (bump) => bump.product_id === product.id
                          );
                          const isCurrentEdit =
                            editingBump?.product_id === product.id;

                          return (
                            <SelectItem
                              key={product.id}
                              value={product.id}
                              disabled={hasOrderBump && !isCurrentEdit}
                            >
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {product.name}
                                  </span>
                                  {hasOrderBump && !isCurrentEdit && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      Já configurado
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-sm text-gray-500">
                                  R$ {product.retail_price.toFixed(2)}
                                  {product.category && ` • ${product.category}`}
                                </span>
                              </div>
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Preview do Produto */}
              {selectedProduct && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Preview da Oferta:</h4>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{selectedProduct.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 line-through">
                            R$ {selectedProduct.retail_price.toFixed(2)}
                          </span>
                          <span className="font-bold text-green-600">
                            R$ {discountedPrice.toFixed(2)}
                          </span>
                          <Badge className="bg-red-500">
                            -{formData.discount_percentage}% OFF
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-green-600">
                          Economize R${" "}
                          {(
                            selectedProduct.retail_price - discountedPrice
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Desconto */}
                <div className="space-y-2">
                  <Label>Desconto (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount_percentage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount_percentage: Number(e.target.value),
                      })
                    }
                  />
                </div>

                {/* Quantidade Limitada */}
                <div className="space-y-2">
                  <Label>Quantidade Limitada</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.limited_quantity || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        limited_quantity: Number(e.target.value),
                      })
                    }
                    placeholder="Ex: 50"
                  />
                </div>
              </div>

              {/* Texto de Urgência */}
              <div className="space-y-2">
                <Label>Texto de Urgência</Label>
                <Input
                  value={formData.urgency_text}
                  onChange={(e) =>
                    setFormData({ ...formData, urgency_text: e.target.value })
                  }
                  placeholder="Ex: Oferta por tempo limitado!"
                />
              </div>

              {/* Social Proof */}
              <div className="space-y-2">
                <Label>Social Proof</Label>
                <Input
                  value={formData.social_proof_text}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      social_proof_text: e.target.value,
                    })
                  }
                  placeholder="Ex: 127 pessoas compraram hoje"
                />
              </div>

              {/* Switches */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Oferta por Tempo Limitado</Label>
                    <p className="text-sm text-gray-600">
                      Exibe timer de urgência
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_limited_time}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_limited_time: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Ativo</Label>
                    <p className="text-sm text-gray-600">
                      Order bump ativo no checkout
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                </div>
              </div>

              {/* Botões */}
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

      {/* Aviso se não há produtos */}
      {products.length === 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <h4 className="font-medium text-yellow-900 mb-1">
                  Nenhum produto encontrado
                </h4>
                <p className="text-yellow-800">
                  Para configurar Order Bumps, você precisa ter produtos
                  cadastrados e ativos em sua loja.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Order Bumps */}
      <div className="grid gap-4">
        {orderBumps.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum Order Bump configurado
              </h3>
              <p className="text-gray-600 mb-4">
                Configure ofertas especiais para aumentar suas vendas
              </p>
              <Button
                onClick={() => setIsModalOpen(true)}
                disabled={products.length === 0}
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Order Bump
              </Button>
            </CardContent>
          </Card>
        ) : (
          orderBumps.map((bump) => (
            <Card key={bump.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{bump.product?.name}</h3>
                      <Badge variant={bump.is_active ? "default" : "secondary"}>
                        {bump.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                      {bump.discount_percentage > 0 && (
                        <Badge className="bg-red-500">
                          -{bump.discount_percentage}% OFF
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Preço Original:</p>
                        <p className="font-medium">
                          R$ {bump.product?.retail_price.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Preço com Desconto:</p>
                        <p className="font-medium text-green-600">
                          R${" "}
                          {(
                            (bump.product?.retail_price || 0) *
                            (1 - bump.discount_percentage / 100)
                          ).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Economia:</p>
                        <p className="font-medium text-orange-600">
                          R${" "}
                          {(
                            (bump.product?.retail_price || 0) *
                            (bump.discount_percentage / 100)
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {bump.urgency_text && (
                      <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-sm">
                        <Clock className="h-4 w-4 inline mr-1 text-orange-600" />
                        {bump.urgency_text}
                      </div>
                    )}

                    {bump.social_proof_text && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                        <Users className="h-4 w-4 inline mr-1 text-green-600" />
                        {bump.social_proof_text}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(bump)}
                      className={
                        bump.is_active
                          ? "text-orange-600 hover:text-orange-700"
                          : "text-green-600 hover:text-green-700"
                      }
                    >
                      {bump.is_active ? "Desativar" : "Ativar"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(bump)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => bump.id && handleDelete(bump.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Informações importantes */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-medium text-blue-900 mb-1">
                Dicas para Order Bumps eficazes:
              </h4>
              <ul className="text-blue-800 space-y-1">
                <li>• Use descontos entre 10-30% para melhor conversão</li>
                <li>• Escolha produtos complementares ao carrinho</li>
                <li>• Textos de urgência aumentam a conversão</li>
                <li>• Social proof gera confiança nos clientes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderBumpSettings;
