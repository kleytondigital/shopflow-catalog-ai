import React from "react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Package, Calculator, Info } from "lucide-react";

interface GradePriceDisplayProps {
  retailPrice: number;
  wholesalePrice?: number;
  minWholesaleQty?: number;
  gradeSizes: string[];
  gradePairs: number[];
  gradeQuantity: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  showGradeBreakdown?: boolean;
}

const GradePriceDisplay: React.FC<GradePriceDisplayProps> = ({
  retailPrice,
  wholesalePrice,
  minWholesaleQty,
  gradeSizes,
  gradePairs,
  gradeQuantity,
  size = "md",
  className = "",
  showGradeBreakdown = true,
}) => {
  const sizeClasses = {
    sm: {
      mainPrice: "text-lg font-bold",
      secondaryPrice: "text-sm",
      badge: "text-xs",
      hint: "text-xs",
      breakdown: "text-xs",
    },
    md: {
      mainPrice: "text-xl font-bold",
      secondaryPrice: "text-base",
      badge: "text-sm",
      hint: "text-sm",
      breakdown: "text-sm",
    },
    lg: {
      mainPrice: "text-2xl font-bold",
      secondaryPrice: "text-lg",
      badge: "text-base",
      hint: "text-base",
      breakdown: "text-base",
    },
  };

  const classes = sizeClasses[size];

  // Calcular preços
  const pricePerPair = wholesalePrice || retailPrice;
  const totalGradePrice = pricePerPair * gradeQuantity;

  // Calcular preço por tamanho
  const priceBySize = gradeSizes.map((size, index) => ({
    size,
    pairs: gradePairs[index] || 0,
    totalPrice: pricePerPair * (gradePairs[index] || 0),
  }));

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 🎯 Preço Principal da Grade */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-900">Preço da Grade</span>
          </div>
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-700 border-blue-300"
          >
            {gradeQuantity} pares
          </Badge>
        </div>

        <div className="space-y-2">
          {/* Preço por Par */}
          <div className="flex items-center justify-between">
            <span className={`text-blue-700 ${classes.secondaryPrice}`}>
              Preço por par:
            </span>
            <span
              className={`font-bold text-blue-900 ${classes.secondaryPrice}`}
            >
              {formatCurrency(pricePerPair)}
            </span>
          </div>

          {/* Preço Total da Grade */}
          <div className="flex items-center justify-between pt-2 border-t border-blue-200">
            <span
              className={`text-blue-900 font-semibold ${classes.mainPrice}`}
            >
              Total da Grade:
            </span>
            <span className={`text-blue-900 font-bold ${classes.mainPrice}`}>
              {formatCurrency(totalGradePrice)}
            </span>
          </div>

          {/* Cálculo */}
          <div className="text-center pt-1">
            <span className={`text-blue-600 ${classes.hint}`}>
              {formatCurrency(pricePerPair)} × {gradeQuantity} pares ={" "}
              {formatCurrency(totalGradePrice)}
            </span>
          </div>
        </div>
      </div>

      {/* 🎯 Detalhamento por Tamanho */}
      {showGradeBreakdown && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="h-4 w-4 text-gray-600" />
            <span
              className={`font-semibold text-gray-700 ${classes.secondaryPrice}`}
            >
              Composição da Grade
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {priceBySize.map((item, index) => (
              <div
                key={index}
                className="bg-white p-3 rounded-lg border border-gray-200 text-center"
              >
                <div className="text-lg font-bold text-gray-900">
                  {item.size}
                </div>
                <div className="text-sm text-gray-600">
                  {item.pairs} par{item.pairs !== 1 ? "es" : ""}
                </div>
                <div className="text-sm font-semibold text-green-600 mt-1">
                  {formatCurrency(item.totalPrice)}
                </div>
              </div>
            ))}
          </div>

          {/* Resumo */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total de pares:</span>
              <span className="font-semibold text-gray-900">
                {gradeQuantity}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Preço total:</span>
              <span className="font-bold text-green-600">
                {formatCurrency(totalGradePrice)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 🎯 Informações Adicionais */}
      {wholesalePrice && wholesalePrice !== retailPrice && (
        <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-orange-600" />
            <span
              className={`font-semibold text-orange-800 ${classes.secondaryPrice}`}
            >
              Informações de Atacado
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-orange-700">Preço varejo por par:</span>
              <span className="font-medium">{formatCurrency(retailPrice)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-orange-700">Preço atacado por par:</span>
              <span className="font-bold text-green-600">
                {formatCurrency(wholesalePrice)}
              </span>
            </div>
            {minWholesaleQty && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-orange-700">Quantidade mínima:</span>
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-700"
                >
                  {minWholesaleQty} pares
                </Badge>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GradePriceDisplay;
