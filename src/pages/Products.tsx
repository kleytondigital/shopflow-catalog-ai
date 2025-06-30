import React, { useState, useEffect } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductList from "@/components/products/ProductList";
import ProductFormModal from "@/components/products/ProductFormModal";
import ImprovedAIToolsModal from "@/components/products/ImprovedAIToolsModal";
import { useProducts } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/types/product";

const Products = () => {
  const [showProductForm, setShowProductForm] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const {
    products,
    loading,
    deleteProduct,
    fetchProducts,
    createProduct,
    updateProduct,
  } = useProducts();
  const { toast } = useToast();

  // Auto-refresh da lista quando necessário
  useEffect(() => {
    const interval = setInterval(() => {
      if (!showProductForm && !loading) {
        fetchProducts();
      }
    }, 30000); // Refresh a cada 30 segundos quando não estiver editando

    return () => clearInterval(interval);
  }, [showProductForm, loading, fetchProducts]);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      const { error } = await deleteProduct(id);
      if (error) {
        toast({
          title: "Erro ao excluir produto",
          description: error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Produto excluído com sucesso",
        });
        // Refresh imediato após exclusão
        fetchProducts();
      }
    }
  };

  const handleGenerateDescription = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    setSelectedProduct(product);
    setShowAIModal(true);
  };

  const handleAIContentApply = async (content: any) => {
    console.log("Aplicando conteúdo IA:", content);
    setShowAIModal(false);
    toast({
      title: "Conteúdo aplicado com sucesso",
      description: "O conteúdo gerado pela IA foi aplicado ao produto.",
    });
    // Refresh após aplicar IA
    fetchProducts();
  };

  const handleProductSubmit = async (data: any) => {
    try {
      console.log("📝 Products.tsx - Salvando produto:", data);

      let result;
      if (editingProduct) {
        // Atualizar produto existente
        console.log("✏️ Atualizando produto ID:", editingProduct.id);
        result = await updateProduct({ ...data, id: editingProduct.id });
      } else {
        // Criar novo produto
        console.log("➕ Criando novo produto");
        result = await createProduct(data);
      }

      if (result.error) {
        throw new Error(result.error);
      }

      console.log("✅ Produto salvo com sucesso, atualizando lista...");

      toast({
        title: editingProduct
          ? "Produto atualizado com sucesso"
          : "Produto criado com sucesso",
        description: `${data.name} foi ${
          editingProduct ? "atualizado" : "criado"
        } com sucesso.`,
      });

      // Fechar modal primeiro
      setShowProductForm(false);
      setEditingProduct(null);

      // Refresh garantido da lista
      await fetchProducts();
      console.log("🔄 Lista de produtos recarregada");
    } catch (error) {
      console.error("💥 Erro ao salvar produto:", error);
      toast({
        title: "Erro ao salvar produto",
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const handleCloseModal = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <div className="text-center">Carregando produtos...</div>
        </div>
      </div>
    );
  }

  // Mapear produtos para garantir compatibilidade com ProductList
  const mappedProducts: Product[] = products.map((product) => ({
    ...product,
    description: product.description || "",
    category: product.category || "",
  }));

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Buscar produtos..." className="pl-10" />
          </div>
          <Button variant="outline" className="shrink-0">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>
        <Button onClick={() => setShowProductForm(true)} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      {/* Lista de produtos */}
      <ProductList
        products={mappedProducts}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onGenerateDescription={handleGenerateDescription}
      />

      {/* Modal do formulário de produto */}
      <ProductFormModal
        open={showProductForm}
        onOpenChange={handleCloseModal}
        onSubmit={handleProductSubmit}
        initialData={editingProduct}
        mode={editingProduct ? "edit" : "create"}
      />

      {/* Modal de IA com informações do produto */}
      {showAIModal && selectedProduct && (
        <ImprovedAIToolsModal
          open={showAIModal}
          onOpenChange={setShowAIModal}
          productName={selectedProduct.name || "Produto"}
          category={selectedProduct.category || "Categoria"}
          onDescriptionGenerated={(description) => {
            console.log("Descrição gerada:", description);
            handleAIContentApply({ description });
          }}
          onTitleGenerated={(title) => {
            console.log("Título gerado:", title);
            handleAIContentApply({ title });
          }}
          onTagsGenerated={(tags) => {
            console.log("Tags geradas:", tags);
            handleAIContentApply({ tags });
          }}
          onAdCopyGenerated={(adCopy) => {
            console.log("Texto publicitário gerado:", adCopy);
            handleAIContentApply({ adCopy });
          }}
          onSocialMediaGenerated={(socialMedia) => {
            console.log("Conteúdo redes sociais gerado:", socialMedia);
            handleAIContentApply({ socialMedia });
          }}
          onSeoGenerated={(seo) => {
            console.log("SEO gerado:", seo);
            handleAIContentApply({ seo });
          }}
        />
      )}
    </div>
  );
};

export default Products;
