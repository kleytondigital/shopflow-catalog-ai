import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Sparkles, DollarSign, Package, AlertCircle, AlertTriangle } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import CategoryFormDialog from "@/components/products/CategoryFormDialog";
import { WizardFormData } from "@/hooks/useImprovedProductFormWizard";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useStorePriceModel } from "@/hooks/useStorePriceModel";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CurrencyInput } from "@/components/ui/currency-input";

interface BasicInfoStepProps {
  formData: WizardFormData;
  updateFormData: (updates: Partial<WizardFormData>) => void;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  formData,
  updateFormData,
}) => {
  const { profile } = useAuth();
  const { priceModel, loading: priceModelLoading } = useStorePriceModel(profile?.store_id);
  const { categories, loading: categoriesLoading } = useCategories();
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const { toast } = useToast();

  // Determinar quais campos de preço mostrar baseado no price model
  const priceModelType = priceModel?.price_model || 'retail_only';
  const showRetailPrice = priceModelType !== 'wholesale_only';
  const showWholesalePrice = priceModelType !== 'retail_only';
  const showMinWholesaleQty = showWholesalePrice;

  const handleCategoryCreated = (newCategory: any) => {
    updateFormData({ category: newCategory.name });
    setShowCategoryDialog(false);
  };

  const generateDescription = async () => {
    if (!formData.name?.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite o nome do produto antes de gerar a descrição",
        variant: "destructive",
      });
      return;
    }

    setGeneratingDescription(true);

    try {
      console.log("🤖 Gerando descrição para:", formData.name);

      // Usar a função genérica que respeita as configurações globais
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.functions.invoke(
        "ai-content-generator",
        {
          body: {
            productName: formData.name.trim(),
            category: formData.category || "Produto",
            contentType: "description",
            storeId: "global", // Usar configurações globais
          },
        }
      );

      console.log("🤖 Resposta da função:", { data, error });

      if (error) {
        console.error("❌ Erro na função:", error);
        throw new Error(error.message || "Erro ao chamar função IA");
      }

      if (data?.content) {
        console.log(
          "✅ Descrição gerada com sucesso:",
          data.content.length,
          "caracteres"
        );
        console.log("🤖 Provedor usado:", data.provider, "Modelo:", data.model);
        updateFormData({ description: data.content });
        toast({
          title: "Descrição gerada!",
          description: `A IA criou uma descrição otimizada usando ${data.provider?.toUpperCase()}.`,
        });
      } else {
        console.error("❌ Descrição não retornada:", data);
        throw new Error("Descrição não foi gerada pela IA");
      }
    } catch (error: any) {
      console.error("💥 Erro ao gerar descrição:", error);
      toast({
        title: "Erro na geração",
        description:
          error.message ||
          "Não foi possível gerar a descrição. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setGeneratingDescription(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Informações Básicas</h3>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <Label htmlFor="productName" className="text-sm font-medium">
            Nome do Produto *
          </Label>
          <Input
            id="productName"
            type="text"
            value={formData.name || ""}
            onChange={(e) => updateFormData({ name: e.target.value })}
            placeholder="Digite o nome do produto"
            className={`${!formData.name?.trim() ? "border-red-300" : ""}`}
          />
          {!formData.name?.trim() && (
            <p className="text-xs text-red-500">
              Nome do produto é obrigatório
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium">
            Categoria *
          </Label>
          <div className="flex gap-2">
            <Select
              value={formData.category || ""}
              onValueChange={(value) => updateFormData({ category: value })}
            >
              <SelectTrigger
                className={`flex-1 ${
                  !formData.category?.trim() ? "border-red-300" : ""
                }`}
              >
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categoriesLoading ? (
                  <SelectItem value="loading" disabled>
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Carregando...
                    </div>
                  </SelectItem>
                ) : categories.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    Nenhuma categoria encontrada
                  </SelectItem>
                ) : (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCategoryDialog(true)}
              className="flex items-center gap-2 px-3"
            >
              <Plus className="h-4 w-4" />
              Nova
            </Button>
          </div>
          {!formData.category?.trim() && (
            <p className="text-xs text-red-500">Categoria é obrigatória</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="description" className="text-sm font-medium">
              Descrição
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generateDescription}
              disabled={!formData.name?.trim() || generatingDescription}
              className="flex items-center gap-2"
            >
              {generatingDescription ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Gerar Descrição
                </>
              )}
            </Button>
          </div>
          <Textarea
            id="description"
            value={formData.description || ""}
            onChange={(e) => updateFormData({ description: e.target.value })}
            placeholder="Descreva o produto ou use o botão para gerar automaticamente"
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Uma boa descrição ajuda os clientes a entenderem o produto
          </p>
        </div>

        {/* 🎯 FASE 2: Informações do Produto (gênero, tipo, material) */}
        <div className="border-t pt-6 mt-6">
          <h4 className="text-md font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Informações do Produto
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gênero */}
            <div className="space-y-2">
              <Label htmlFor="productGender" className="text-sm font-medium">
                Gênero do Produto
              </Label>
              <Select
                value={formData.product_gender || ""}
                onValueChange={(value) => updateFormData({ product_gender: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o gênero" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">👔 Masculino</SelectItem>
                  <SelectItem value="feminino">👗 Feminino</SelectItem>
                  <SelectItem value="unissex">👕 Unissex</SelectItem>
                  <SelectItem value="infantil">👶 Infantil</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Usado para gerar tabela de medidas automática
              </p>
            </div>

            {/* Tipo de Categoria */}
            <div className="space-y-2">
              <Label htmlFor="categoryType" className="text-sm font-medium">
                Tipo de Produto
              </Label>
              <Select
                value={formData.product_category_type || ""}
                onValueChange={(value) => updateFormData({ product_category_type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="calcado">👟 Calçado</SelectItem>
                  <SelectItem value="roupa_superior">👕 Roupa Superior (camiseta, blusa)</SelectItem>
                  <SelectItem value="roupa_inferior">👖 Roupa Inferior (calça, short)</SelectItem>
                  <SelectItem value="acessorio">🎒 Acessório</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Define qual tabela de medidas será exibida
              </p>
            </div>

            {/* Material */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="material" className="text-sm font-medium">
                Material
              </Label>
              <Input
                id="material"
                type="text"
                value={formData.material || ""}
                onChange={(e) => updateFormData({ material: e.target.value })}
                placeholder="Ex: Couro sintético e tecido mesh"
              />
              <p className="text-xs text-muted-foreground">
                Exibido na seção de cuidados do produto
              </p>
            </div>
          </div>
        </div>

        {/* Seção de Preços */}
        <div className="border-t pt-6 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h4 className="text-md font-semibold">Precificação</h4>
          </div>

          {/* Alert informativo sobre o modelo de preço */}
          {!priceModelLoading && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Modelo de Preço da Loja:</strong>{' '}
                {priceModelType === 'retail_only' && 'Apenas Varejo'}
                {priceModelType === 'wholesale_only' && 'Apenas Atacado'}
                {priceModelType === 'simple_wholesale' && 'Varejo + Atacado'}
                {priceModelType === 'gradual_wholesale' && 'Atacado Gradativo'}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Preço de Varejo */}
            {showRetailPrice && (
              <div className="space-y-2">
                <Label htmlFor="retail_price" className="text-sm font-medium">
                  Preço de Varejo *
                </Label>
                <CurrencyInput
                  id="retail_price"
                  value={formData.retail_price || 0}
                  onChange={(value) => updateFormData({ retail_price: value })}
                  placeholder="0,00"
                  className={`${!formData.retail_price || formData.retail_price <= 0 ? "border-red-300" : ""}`}
                />
                {(!formData.retail_price || formData.retail_price <= 0) && (
                  <p className="text-xs text-red-500">
                    Preço de varejo é obrigatório
                  </p>
                )}
              </div>
            )}

            {/* Preço de Atacado */}
            {showWholesalePrice && (
              <div className="space-y-2">
                <Label htmlFor="wholesale_price" className="text-sm font-medium">
                  Preço de Atacado *
                </Label>
                <CurrencyInput
                  id="wholesale_price"
                  value={formData.wholesale_price || 0}
                  onChange={(value) => updateFormData({ wholesale_price: value })}
                  placeholder="0,00"
                  className={`${!formData.wholesale_price || formData.wholesale_price <= 0 ? "border-red-300" : ""}`}
                />
                {(!formData.wholesale_price || formData.wholesale_price <= 0) && (
                  <p className="text-xs text-red-500">
                    Preço de atacado é obrigatório
                  </p>
                )}
              </div>
            )}

            {/* Quantidade Mínima de Atacado */}
            {showMinWholesaleQty && (
              <div className="space-y-2">
                <Label htmlFor="min_wholesale_qty" className="text-sm font-medium">
                  Quantidade Mínima (Atacado)
                </Label>
                <Input
                  id="min_wholesale_qty"
                  type="number"
                  min="1"
                  value={formData.min_wholesale_qty || 1}
                  onChange={(e) => updateFormData({ min_wholesale_qty: parseInt(e.target.value) || 1 })}
                  placeholder="1"
                />
                <p className="text-xs text-muted-foreground">
                  Quantidade mínima para preço de atacado
                </p>
              </div>
            )}

            {/* Estoque Inicial */}
            <div className="space-y-2">
              <Label htmlFor="stock" className="text-sm font-medium flex items-center gap-2">
                <Package className="w-4 h-4" />
                Estoque Inicial *
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock !== undefined && formData.stock !== null ? formData.stock : ''}
                onChange={(e) => updateFormData({ stock: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className={`${formData.stock === undefined || formData.stock === null ? "border-red-300" : ""}`}
              />
              {(formData.stock === undefined || formData.stock === null) && (
                <p className="text-xs text-red-500">
                  Estoque inicial é obrigatório
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Quantidade disponível em estoque
              </p>
            </div>
          </div>

          {/* Validação de preços */}
          {showRetailPrice && showWholesalePrice && 
           formData.retail_price > 0 && formData.wholesale_price > 0 &&
           formData.wholesale_price >= formData.retail_price && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                O preço de atacado deve ser menor que o preço de varejo
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      <CategoryFormDialog
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
        onCategoryCreated={handleCategoryCreated}
      />
    </div>
  );
};

export default BasicInfoStep;
