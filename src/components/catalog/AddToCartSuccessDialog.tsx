/**
 * Dialog Profissional - Produto Adicionado ao Carrinho
 * Substituindo window.confirm por modal bonito
 */

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  ShoppingBag,
  ArrowRight,
  Package,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface AddToCartSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productImage?: string;
  quantity: number;
  variationName?: string;
  unitPrice: number;
  totalPrice: number;
  onContinueShopping: () => void;
  onGoToCart: () => void;
}

const AddToCartSuccessDialog: React.FC<AddToCartSuccessDialogProps> = ({
  isOpen,
  onClose,
  productName,
  productImage,
  quantity,
  variationName,
  unitPrice,
  totalPrice,
  onContinueShopping,
  onGoToCart,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-green-700">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <span>Produto Adicionado!</span>
          </DialogTitle>
        </DialogHeader>

        {/* Detalhes do Produto */}
        <div className="space-y-4">
          <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
            {/* Imagem */}
            {productImage ? (
              <img
                src={productImage}
                alt={productName}
                className="w-20 h-20 object-cover rounded-md"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
            )}

            {/* Info */}
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-gray-900 line-clamp-2">
                {productName}
              </h3>
              
              {variationName && (
                <Badge variant="outline" className="text-xs">
                  {variationName}
                </Badge>
              )}

              <div className="flex items-baseline gap-2">
                <span className="text-sm text-gray-600">
                  {quantity}x {formatCurrency(unitPrice)}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Total */}
          <div className="flex items-center justify-between px-2">
            <span className="text-gray-700 font-medium">Total:</span>
            <span className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalPrice)}
            </span>
          </div>
        </div>

        <Separator />

        <DialogFooter className="flex-col sm:flex-col gap-2">
          {/* Botão Continuar Comprando */}
          <Button
            onClick={() => {
              onContinueShopping();
              onClose();
            }}
            variant="outline"
            className="w-full h-12 text-base"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Continuar Comprando
          </Button>

          {/* Botão Finalizar Pedido */}
          <Button
            onClick={() => {
              onGoToCart();
              onClose();
            }}
            className="w-full h-12 text-base bg-green-600 hover:bg-green-700"
          >
            Finalizar Pedido
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddToCartSuccessDialog;

