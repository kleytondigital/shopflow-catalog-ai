
import React from "react";
import { MoreHorizontal, Brain, Edit, Trash2, Sparkles, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface ProductMobileCardProps {
  product: {
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    status: "active" | "inactive";
    image: string;
    wholesalePrice?: number;
  };
  onEdit: (product: any) => void;
  onDelete: (id: string) => void;
  onGenerateDescription: (id: string) => void;
  onOpenIAModal: (product: any) => void;
}

const getStockBadge = (stock: number) => {
  if(stock === 0) return { color: "bg-red-500 text-white", text: "Esgotado" };
  if(stock <= 5) return { color: "bg-yellow-500 text-white", text: `Últimas ${stock}` };
  return { color: "bg-green-500 text-white", text: `Em estoque: ${stock}` };
};

const ProductMobileCard: React.FC<ProductMobileCardProps> = ({
  product, onEdit, onDelete, onGenerateDescription, onOpenIAModal
}) => {
  const stockBadge = getStockBadge(product.stock);

  return (
    <div className="relative bg-white rounded-xl shadow-md mb-4 border p-0 overflow-hidden">
      {/* Imagem + Badge Estoque */}
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full aspect-[4/3] object-cover"
        />
        <Badge
          className={`absolute top-2 right-2 ${stockBadge.color} px-2 py-0.5 rounded-2xl text-xs shadow font-bold z-10`}
        >
          {stockBadge.text}
        </Badge>
      </div>
      <div className="p-4 flex flex-col justify-between h-full min-h-[120px]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-base text-gray-900">{product.name}</span>
            {product.status === "inactive" && (
              <Badge variant="secondary" className="ml-2">Inativo</Badge>
            )}
          </div>
          <div className="text-xs text-gray-500 mb-2">{product.category}</div>
          <div className="font-bold text-lg text-blue-700 mb-2">R$ {product.price.toFixed(2)}</div>
        </div>
        <div className="flex items-center justify-between mt-2">
          {/* Botão IA centralizado / destacado */}
          <Button
            size="icon"
            variant="outline"
            className="rounded-full w-10 h-10 flex items-center justify-center"
            title="Ferramentas de IA"
            onClick={() => onOpenIAModal(product)}
          >
            <Brain className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                title="Opções"
              >
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(product)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onGenerateDescription(product.id)}>
                <Sparkles className="mr-2 h-4 w-4" />
                Gerar Descrição IA
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(product.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default ProductMobileCard;
