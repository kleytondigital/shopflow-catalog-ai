import React from "react";
import { HelpCircle, Info, Lightbulb, Package, Shirt } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface GradeHelpTooltipsProps {
  children: React.ReactNode;
}

export const GradeHelpTooltips: React.FC<GradeHelpTooltipsProps> = ({
  children,
}) => {
  return <TooltipProvider>{children}</TooltipProvider>;
};

export const GradeConceptHelp: React.FC = () => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800">
        <HelpCircle className="w-4 h-4" />
        <span className="text-sm">O que é uma Grade?</span>
      </button>
    </TooltipTrigger>
    <TooltipContent className="max-w-sm">
      <div className="space-y-2">
        <p className="font-medium">Grade é um conjunto de tamanhos</p>
        <p className="text-sm">
          Exemplo: "Grade Baixa" = tamanhos 33, 34, 35, 36, 37, 38 vendidos
          juntos. Muito usado em calçados para revendedores.
        </p>
      </div>
    </TooltipContent>
  </Tooltip>
);

export const ColorGradeHelp: React.FC = () => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800">
        <HelpCircle className="w-4 h-4" />
        <span className="text-sm">Como funciona cor + grade?</span>
      </button>
    </TooltipTrigger>
    <TooltipContent className="max-w-sm">
      <div className="space-y-2">
        <p className="font-medium">Cada cor terá todas as grades</p>
        <p className="text-sm">
          Se você tem 3 cores (Preto, Branco, Azul) e 2 grades (Baixa, Alta),
          terá 6 variações: Preto-Baixa, Preto-Alta, Branco-Baixa, etc.
        </p>
      </div>
    </TooltipContent>
  </Tooltip>
);

export const StockGradeHelp: React.FC = () => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button className="inline-flex items-center gap-1 text-green-600 hover:text-green-800">
        <HelpCircle className="w-4 h-4" />
        <span className="text-sm">Como funciona o estoque?</span>
      </button>
    </TooltipTrigger>
    <TooltipContent className="max-w-sm">
      <div className="space-y-2">
        <p className="font-medium">Estoque por grade completa</p>
        <p className="text-sm">
          Se você colocar "2" no estoque, significa que tem 2 grades completas.
          Exemplo: 2 grades de "Preto-Baixa" = 2 kits com todos os tamanhos.
        </p>
      </div>
    </TooltipContent>
  </Tooltip>
);

export const WhenUseGradesHelp: React.FC = () => (
  <Alert>
    <Lightbulb className="h-4 w-4" />
    <AlertDescription>
      <strong>Dica:</strong> Use grades se você vende calçados para
      revendedores, produtos em kits de tamanhos, ou quando seus clientes
      compram múltiplos tamanhos de uma vez.
    </AlertDescription>
  </Alert>
);

export const GradeVsVariationHelp: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="p-4 border rounded-lg bg-blue-50">
      <div className="flex items-center gap-2 mb-2">
        <Package className="w-5 h-5 text-blue-600" />
        <h4 className="font-medium">Produto com Grade</h4>
      </div>
      <p className="text-sm text-gray-600 mb-2">
        Ideal para calçados e produtos vendidos em kits
      </p>
      <ul className="text-xs text-gray-600 space-y-1">
        <li>• Cliente compra conjunto de tamanhos</li>
        <li>• Comum em vendas para revendedores</li>
        <li>• Exemplo: Grade Baixa (33-38)</li>
      </ul>
    </div>

    <div className="p-4 border rounded-lg bg-purple-50">
      <div className="flex items-center gap-2 mb-2">
        <Shirt className="w-5 h-5 text-purple-600" />
        <h4 className="font-medium">Produto com Variações</h4>
      </div>
      <p className="text-sm text-gray-600 mb-2">
        Ideal para roupas e produtos individuais
      </p>
      <ul className="text-xs text-gray-600 space-y-1">
        <li>• Cliente escolhe um tamanho específico</li>
        <li>• Comum em vendas no varejo</li>
        <li>• Exemplo: Camiseta P, M, G</li>
      </ul>
    </div>
  </div>
);

export const SimpleGradeExamples: React.FC = () => (
  <div className="space-y-4">
    <h4 className="font-medium">Exemplos Práticos:</h4>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-3 border rounded-lg bg-gray-50">
        <h5 className="font-medium text-sm mb-2">🟢 Bom para Grades:</h5>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Sapatos femininos (Grade Baixa: 33-38)</li>
          <li>• Tênis masculinos (Grade Alta: 39-44)</li>
          <li>• Sandálias infantis (Grade Kids: 20-30)</li>
          <li>• Chinelos para revenda</li>
        </ul>
      </div>

      <div className="p-3 border rounded-lg bg-gray-50">
        <h5 className="font-medium text-sm mb-2">🔴 Melhor com Variações:</h5>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Camisetas (P, M, G, GG)</li>
          <li>• Vestidos (36, 38, 40, 42)</li>
          <li>• Calças jeans (tamanhos individuais)</li>
          <li>• Acessórios únicos</li>
        </ul>
      </div>
    </div>
  </div>
);
