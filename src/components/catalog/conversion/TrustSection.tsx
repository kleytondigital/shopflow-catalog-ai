/**
 * TrustSection - Seção de Confiança e Garantias
 * Reduz objeções e aumenta confiança na compra
 */

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Shield, 
  Truck, 
  RefreshCcw, 
  Lock, 
  CheckCircle,
  Award,
  Clock,
  Package,
} from "lucide-react";

interface TrustSectionProps {
  hasFreeShipping?: boolean;
  hasMoneyBackGuarantee?: boolean;
  hasFastDelivery?: boolean;
  hasSecurePayment?: boolean;
  deliveryDays?: string;
  returnDays?: number;
  isAuthorizedDealer?: boolean;
  brandName?: string;
}

const TrustSection: React.FC<TrustSectionProps> = ({
  hasFreeShipping = true,
  hasMoneyBackGuarantee = true,
  hasFastDelivery = true,
  hasSecurePayment = true,
  deliveryDays = "2-5",
  returnDays = 7,
  isAuthorizedDealer = false,
  brandName,
}) => {
  return (
    <div className="space-y-4">
      {/* Badge de Distribuidor Autorizado (se aplicável) */}
      {isAuthorizedDealer && brandName && (
        <div className="bg-gradient-to-r from-black to-gray-800 text-white px-6 py-4 rounded-lg flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8" />
          <div>
            <div className="font-bold text-lg">DISTRIBUIDOR AUTORIZADO</div>
            <div className="text-sm opacity-90">{brandName}</div>
          </div>
        </div>
      )}

      {/* Selo de Satisfação Garantida */}
      {hasMoneyBackGuarantee && (
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-400 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
              <Award className="w-10 h-10 text-yellow-900" />
            </div>
            <div>
              <div className="font-bold text-yellow-900 text-xl">
                100% Satisfação Garantida
              </div>
              <div className="text-sm text-yellow-800">
                Devolução grátis em até {returnDays} dias se não gostar
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid de Benefícios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Frete Grátis */}
        {hasFreeShipping && (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div className="font-bold text-green-900">Frete Grátis</div>
              <div className="text-sm text-green-700">Para todo o Brasil</div>
            </CardContent>
          </Card>
        )}

        {/* Entrega Rápida */}
        {hasFastDelivery && (
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="font-bold text-blue-900">Entrega Rápida</div>
              <div className="text-sm text-blue-700">{deliveryDays} dias úteis</div>
            </CardContent>
          </Card>
        )}

        {/* Compra Segura */}
        {hasSecurePayment && (
          <Card className="border-2 border-purple-200 bg-purple-50">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div className="font-bold text-purple-900">Compra Segura</div>
              <div className="text-sm text-purple-700">Dados protegidos</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Lista de Garantias Adicional */}
      <Card className="bg-gray-50">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-gray-700">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-sm">Produto original e de qualidade</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-sm">Embalagem original lacrada</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-sm">Nota fiscal em todas as compras</span>
          </div>
          {hasMoneyBackGuarantee && (
            <div className="flex items-center gap-2 text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-sm">Devolução grátis em {returnDays} dias</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrustSection;

