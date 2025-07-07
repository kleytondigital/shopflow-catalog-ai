
import React, { useState } from "react";
import { Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import BulkImportModal from "./BulkImportModal";
import { useAuth } from "@/hooks/useAuth";

const ProductsPage = () => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const { profile } = useAuth();
  const currentStore = profile?.store_id;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600">Gerencie seus produtos e estoque</p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Importar em Massa
          </Button>

          <Button
            onClick={() => setShowProductModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Modal de Importação */}
      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        storeId={currentStore}
      />
    </div>
  );
};

export default ProductsPage;
