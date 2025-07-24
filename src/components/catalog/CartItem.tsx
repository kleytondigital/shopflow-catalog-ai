
import React from "react";
import { Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import CartItemThumbnail from "./checkout/CartItemThumbnail";
import CartItemPriceDisplay from "./CartItemPriceDisplay";

interface CartItemProps {
  item: any;
  onUpdateQuantity: (id: string, quantity: number, modelKey?: string, minQty?: number) => void;
  onRemoveItem: (id: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemoveItem }) => {
  const quantity = item.quantity || 1;
  const stock = item.variation && typeof item.variation.stock === "number"
    ? item.variation.stock
    : item.product?.stock ?? 0;
  const allowNegative = item.product?.allow_negative_stock ?? false;

  // Usar dados enriquecidos do hook useCart
  const modelKey = item.priceModel || "retail_only";
  const minQty = modelKey === "wholesale_only" ? item.product?.min_wholesale_qty || 1 : 1;

  // Validação de estoque
  const estoqueDisponivel = allowNegative ? Infinity : stock;
  const podeAdicionar = allowNegative || quantity < stock;
  const podeRemover = quantity > minQty;
  const erroEstoque = !allowNegative && quantity >= stock;

  // Badge baseado no modelo de preços real da loja
  const getBadgeStyle = (tierName: string, modelKey: string) => {
    if (modelKey === "wholesale_only") {
      return "bg-orange-100 text-orange-800 border-orange-300";
    }
    
    switch (tierName) {
      case "Varejo":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Atacarejo":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "Atacado Pequeno":
        return "bg-green-100 text-green-800 border-green-300";
      case "Atacado Grande":
        return "bg-yellow-100 text-yellow-800 border-yellow-400";
      case "Atacado":
        return "bg-orange-100 text-orange-800 border-orange-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getBadgeText = () => {
    if (modelKey === "wholesale_only") return "Atacado";
    return item.currentTier?.tier_name || "Varejo";
  };

  return (
    <div className={`cart-item-card rounded-xl p-4 border-2 ${
      item.currentTier?.tier_name === "Atacado Grande" ? "border-yellow-400" : "border-gray-200"
    } bg-white flex flex-col gap-2`}>
      
      <div className="flex flex-row gap-4 items-start">
        {/* Imagem */}
        <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center">
          <CartItemThumbnail
            imageUrl={item.product?.image_url}
            productName={item.product?.name || "Produto"}
            size="lg"
          />
        </div>
        
        {/* Infos principais */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex flex-row gap-4 items-start flex-wrap">
            <div className="flex flex-col min-w-0">
              <h4 className="text-base font-semibold text-gray-900 truncate">
                {item.product?.name || "Produto sem nome"}
              </h4>
              
              {/* Badges contextuais */}
              <div className="flex flex-wrap items-center gap-1 mt-1">
                {/* Badge de Grade */}
                {item.gradeInfo && (
                  <Badge className="bg-blue-600 text-white text-xs px-1.5 py-0.5">
                    Grade: {item.gradeInfo.name}
                  </Badge>
                )}
                
                {/* Badge de Modelo de Preços */}
                {modelKey === "gradual_wholesale" && (
                  <Badge className="bg-purple-500 text-white text-xs px-1.5 py-0.5">
                    Atacado Gradativo
                  </Badge>
                )}
                
                {modelKey === "simple_wholesale" && (
                  <Badge className="bg-orange-500 text-white text-xs px-1.5 py-0.5">
                    Varejo + Atacado
                  </Badge>
                )}
                
                {modelKey === "wholesale_only" && (
                  <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5">
                    Atacado Exclusivo
                  </Badge>
                )}
              </div>
              
              {/* Informações de grade */}
              {item.gradeInfo && (
                <div className="flex flex-wrap items-center gap-1 mt-0.5">
                  {item.gradeInfo.sizes && item.gradeInfo.sizes.length > 0 && (
                    <span className="text-[10px] text-blue-900 font-semibold">
                      Tamanhos: {item.gradeInfo.sizes.join(", ")}
                    </span>
                  )}
                  {item.gradeInfo.pairs && item.gradeInfo.pairs.length > 0 && (
                    <span className="text-[10px] text-gray-700 font-normal">
                      Pares: {item.gradeInfo.pairs.join(", ")}
                    </span>
                  )}
                </div>
              )}
              
              {item.variation && (
                <p className="text-xs text-gray-500 truncate">
                  {item.variation.size} {item.variation.color}
                </p>
              )}
            </div>
            
            {/* Bloco de preço/desconto/economia */}
            <div className="flex flex-col gap-1 min-w-[120px] items-end text-right">
              <CartItemPriceDisplay item={item} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Rodapé: botões, badge e incentivo individual */}
      <div className="flex flex-row items-center justify-between mt-3 gap-2 flex-wrap border-t pt-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateQuantity(item.id, quantity - 1, modelKey, minQty)}
            className="h-8 w-8 p-0 rounded-full"
            disabled={!podeRemover}
          >
            <Minus size={12} />
          </Button>
          
          <Input
            type="number"
            min={minQty}
            max={estoqueDisponivel}
            value={quantity}
            onChange={(e) => {
              let val = parseInt(e.target.value) || minQty;
              if (!allowNegative && val > stock) val = stock;
              if (val < minQty) val = minQty;
              onUpdateQuantity(item.id, val, modelKey, minQty);
            }}
            className="w-16 h-8 text-center text-sm font-semibold"
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateQuantity(item.id, quantity + 1, modelKey, minQty)}
            className="h-8 w-8 p-0 rounded-full"
            disabled={!podeAdicionar}
          >
            <Plus size={12} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveItem(item.id)}
            className="text-red-500 hover:text-red-700 h-8 w-8 p-0 rounded-full"
            title="Remover"
          >
            <Trash2 size={14} />
          </Button>
        </div>
        
        {/* Badge contextual no rodapé */}
        <span
          className={`px-3 py-1 rounded-lg text-xs font-bold border ${getBadgeStyle(
            getBadgeText(),
            modelKey
          )}`}
        >
          {getBadgeText()}
        </span>
      </div>
      
      {/* Mensagem de erro de estoque */}
      {erroEstoque && (
        <div className="text-xs text-red-600 mt-1">
          Estoque insuficiente para essa quantidade.
        </div>
      )}
    </div>
  );
};

export default CartItem;
