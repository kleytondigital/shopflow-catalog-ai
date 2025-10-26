/**
 * OptimizedCTA - Botão de Compra Otimizado para Conversão
 * Design verde vibrante com animações e copy persuasivo
 */

import React from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowRight, Lock, Zap } from "lucide-react";

interface OptimizedCTAProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  price: number;
  buttonText?: string;
  showSecurityBadge?: boolean;
  isSticky?: boolean;
}

const OptimizedCTA: React.FC<OptimizedCTAProps> = ({
  onClick,
  disabled = false,
  isLoading = false,
  price,
  buttonText = "COMPRAR AGORA",
  showSecurityBadge = true,
  isSticky = true,
}) => {
  return (
    <div className={`bg-white rounded-lg ${isSticky ? 'sticky top-24' : ''}`}>
      <div className="space-y-4">
        {/* Botão Principal - Verde Vibrante */}
        <Button
          onClick={onClick}
          disabled={disabled || isLoading}
          className="w-full h-16 text-xl font-bold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
        >
          {isLoading ? (
            <>
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Adicionando...
            </>
          ) : (
            <>
              <ShoppingCart className="w-6 h-6 mr-2" />
              {buttonText}
              <ArrowRight className="w-6 h-6 ml-2" />
            </>
          )}
        </Button>

        {/* Badge de Segurança */}
        {showSecurityBadge && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Lock className="w-4 h-4 text-green-600" />
            <span>Compra 100% segura e protegida</span>
          </div>
        )}

        {/* Benefício Adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-900">
            <Zap className="w-5 h-5 text-blue-600" />
            <div className="text-sm">
              <span className="font-bold">Aproveite!</span> Estoque limitado
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizedCTA;

