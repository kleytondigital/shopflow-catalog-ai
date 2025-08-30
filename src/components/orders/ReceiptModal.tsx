import React, { useState, useEffect } from "react";
import { Order } from "@/hooks/useOrders";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Receipt,
  Printer,
  Download,
  Building,
  User,
  Calendar,
  CreditCard,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReceiptModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({
  order,
  isOpen,
  onClose,
  onPrint,
}) => {
  const [storeData, setStoreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (order && isOpen) {
      fetchStoreData();
    }
  }, [order, isOpen]);

  const fetchStoreData = async () => {
    if (!order?.store_id) return;

    try {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", order.store_id)
        .single();

      if (error) throw error;
      setStoreData(data);
    } catch (error) {
      console.error("Erro ao buscar dados da loja:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    // Criar recibo compacto em uma página
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Recibo de Pagamento - Pedido #${order.id.slice(-8)}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              font-size: 12px; 
              line-height: 1.3;
              padding: 10mm;
              background: white;
              max-width: 210mm;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px; 
              border-bottom: 2px solid #000;
              padding-bottom: 15px;
            }
            .company-name { 
              font-size: 20px; 
              font-weight: bold; 
              margin-bottom: 8px; 
            }
            .company-info { 
              font-size: 10px; 
              color: #666; 
              margin: 2px 0;
            }
            .receipt-title { 
              font-size: 16px; 
              font-weight: bold; 
              background: #000;
              color: white;
              padding: 8px;
              margin: 10px 0;
            }
            .info-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 15px; 
              margin: 15px 0;
              font-size: 11px;
            }
            .section { 
              margin: 15px 0; 
            }
            .section-title { 
              font-weight: bold; 
              margin-bottom: 10px; 
              font-size: 13px;
              border-left: 3px solid #000;
              padding-left: 8px;
            }
            .product-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 8px;
              border-bottom: 1px solid #eee;
              font-size: 11px;
            }
            .product-item:last-child {
              border-bottom: 2px solid #000;
            }
            .product-name {
              font-weight: bold;
              flex: 1;
            }
            .product-details {
              color: #666;
              font-size: 10px;
              margin-top: 2px;
            }
            .product-price {
              font-weight: bold;
              text-align: right;
              min-width: 80px;
            }
            .order-bump-badge {
              background: #ff9800;
              color: white;
              padding: 1px 4px;
              border-radius: 8px;
              font-size: 9px;
              margin-left: 5px;
            }
            .financial-summary {
              background: #f8f8f8;
              padding: 12px;
              border: 1px solid #ddd;
              margin: 15px 0;
            }
            .summary-line {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
              font-size: 11px;
            }
            .total-line {
              font-weight: bold;
              font-size: 14px;
              border-top: 2px solid #000;
              padding-top: 8px;
              margin-top: 8px;
            }
            .footer {
              text-align: center;
              font-size: 9px;
              color: #666;
              margin-top: 20px;
              border-top: 1px solid #ccc;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">${storeData?.name || "Loja"}</div>
            ${
              storeData?.document
                ? `<div class="company-info">CNPJ: ${storeData.document}</div>`
                : ""
            }
            ${
              storeData?.address
                ? `<div class="company-info">${storeData.address}</div>`
                : ""
            }
            ${
              storeData?.phone
                ? `<div class="company-info">Tel: ${storeData.phone}</div>`
                : ""
            }
            ${
              storeData?.email
                ? `<div class="company-info">Email: ${storeData.email}</div>`
                : ""
            }
            
            <div class="receipt-title">RECIBO DE PAGAMENTO</div>
            <div style="font-size: 12px;">Pedido #${order.id.slice(-8)}</div>
          </div>

          <div class="info-grid">
            <div>
              <div class="section-title">👤 Cliente</div>
              <div><strong>Nome:</strong> ${order.customer_name}</div>
              ${
                order.customer_phone
                  ? `<div><strong>Telefone:</strong> ${order.customer_phone}</div>`
                  : ""
              }
              ${
                order.customer_email
                  ? `<div><strong>Email:</strong> ${order.customer_email}</div>`
                  : ""
              }
            </div>
            <div>
              <div class="section-title">📅 Informações do Pedido</div>
              <div><strong>Data:</strong> ${new Date(
                order.created_at
              ).toLocaleDateString("pt-BR")} ${new Date(
      order.created_at
    ).toLocaleTimeString("pt-BR")}</div>
              <div><strong>Status:</strong> ${order.status.toUpperCase()}</div>
              <div><strong>Pagamento:</strong> ${
                order.payment_method || "Não informado"
              }</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">🛍️ Produtos Adquiridos</div>
            ${
              order.items
                ?.map(
                  (item) => `
              <div class="product-item">
                <div style="flex: 1;">
                  <div class="product-name">
                    ${item.product_name || item.name}
                    ${
                      item.is_order_bump
                        ? '<span class="order-bump-badge">🎁 Oferta</span>'
                        : ""
                    }
                  </div>
                  <div class="product-details">
                    Qtd: ${item.quantity}x | Preço unit: R$ ${(
                    item.unit_price ||
                    item.price ||
                    0
                  ).toFixed(2)}
                    ${
                      item.variation_details
                        ? ` | ${item.variation_details.color || ""} ${
                            item.variation_details.size || ""
                          }`
                        : ""
                    }
                    ${
                      item.is_order_bump && item.discount_percentage > 0
                        ? ` | Desconto: ${item.discount_percentage}%`
                        : ""
                    }
                  </div>
                </div>
                <div class="product-price">
                  R$ ${(
                    item.total_price ||
                    (item.unit_price || item.price || 0) * item.quantity
                  ).toFixed(2)}
                </div>
              </div>
            `
                )
                .join("") || ""
            }
          </div>

          <div class="financial-summary">
            <div class="section-title">💰 Resumo Financeiro</div>
            <div class="summary-line">
              <span>Subtotal dos produtos:</span>
              <span>R$ ${(
                order.total_amount - (order.shipping_cost || 0)
              ).toFixed(2)}</span>
            </div>
            ${
              order.shipping_cost && order.shipping_cost > 0
                ? `
              <div class="summary-line">
                <span>Taxa de entrega:</span>
                <span>R$ ${order.shipping_cost.toFixed(2)}</span>
              </div>
            `
                : ""
            }
            <div class="summary-line total-line" style="color: green;">
              <span>TOTAL PAGO:</span>
              <span>R$ ${order.total_amount.toFixed(2)}</span>
            </div>
          </div>

          <div class="footer">
            <div>Este recibo comprova o pagamento dos produtos/serviços descritos acima.</div>
            <div>Emitido em: ${new Date().toLocaleDateString(
              "pt-BR"
            )} às ${new Date().toLocaleTimeString("pt-BR")}</div>
            <div>Documento gerado automaticamente pelo sistema VendeMais.</div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
    onPrint();
  };

  if (!order) return null;

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Receipt className="h-5 w-5" />
            Recibo de Pagamento - Pedido #{order.id.slice(-8)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview do Recibo */}
          <div
            className="bg-white border rounded-lg p-6 space-y-6 print:shadow-none print:border-0"
            id="receipt-content"
          >
            {/* Cabeçalho da Empresa */}
            <div className="text-center border-b-2 border-primary pb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Building className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">
                  {storeData?.name || "Loja"}
                </h1>
              </div>

              {storeData && (
                <div className="text-sm text-gray-600 space-y-1">
                  {storeData.document && <p>CNPJ: {storeData.document}</p>}
                  {storeData.address && <p>{storeData.address}</p>}
                  {storeData.city && storeData.state && (
                    <p>
                      {storeData.city} - {storeData.state}
                    </p>
                  )}
                  {storeData.phone && <p>Tel: {storeData.phone}</p>}
                  {storeData.email && <p>Email: {storeData.email}</p>}
                </div>
              )}

              <div className="bg-primary text-white p-4 rounded-lg mt-4">
                <h2 className="text-xl font-bold">RECIBO DE PAGAMENTO</h2>
                <p className="text-sm opacity-90">
                  Pedido #{order.id.slice(-8)}
                </p>
              </div>
            </div>

            {/* Informações do Cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Cliente
                </h3>
                <div className="text-sm space-y-1">
                  <p>
                    <strong>Nome:</strong> {order.customer_name}
                  </p>
                  {order.customer_phone && (
                    <p>
                      <strong>Telefone:</strong> {order.customer_phone}
                    </p>
                  )}
                  {order.customer_email && (
                    <p>
                      <strong>Email:</strong> {order.customer_email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Informações do Pedido
                </h3>
                <div className="text-sm space-y-1">
                  <p>
                    <strong>Data:</strong>{" "}
                    {format(new Date(order.created_at), "dd/MM/yyyy HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                  <p>
                    <strong>Status:</strong> {order.status.toUpperCase()}
                  </p>
                  <p>
                    <strong>Pagamento:</strong>{" "}
                    {order.payment_method || "Não informado"}
                  </p>
                </div>
              </div>
            </div>

            {/* Produtos */}
            <div>
              <h3 className="font-bold text-lg mb-4">Produtos Adquiridos</h3>
              <div className="space-y-2">
                {order.items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded border"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {item.product_name || item.name}
                        </span>
                        {item.is_order_bump && (
                          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                            🎁 Oferta Especial
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        Qtd: {item.quantity}x | Preço unit: R${" "}
                        {(item.unit_price || item.price || 0).toFixed(2)}
                        {item.variation_details && (
                          <span className="ml-2">
                            | {item.variation_details.color}{" "}
                            {item.variation_details.size}
                          </span>
                        )}
                      </div>
                      {item.is_order_bump && item.discount_percentage > 0 && (
                        <div className="text-xs text-green-600">
                          💰 Desconto de {item.discount_percentage}% aplicado
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        R${" "}
                        {(
                          item.total_price ||
                          (item.unit_price || item.price || 0) * item.quantity
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumo Financeiro */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Resumo Financeiro
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal dos produtos:</span>
                  <span>
                    R${" "}
                    {(order.total_amount - (order.shipping_cost || 0)).toFixed(
                      2
                    )}
                  </span>
                </div>
                {order.shipping_cost && order.shipping_cost > 0 && (
                  <div className="flex justify-between">
                    <span>Taxa de entrega:</span>
                    <span>R$ {order.shipping_cost.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>TOTAL PAGO:</span>
                  <span className="text-green-600">
                    R$ {order.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Informações Legais */}
            <div className="text-center text-xs text-gray-500 space-y-1 border-t pt-4">
              <p>
                Este recibo comprova o pagamento dos produtos/serviços descritos
                acima.
              </p>
              <p>
                Emitido em:{" "}
                {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
              <p>Documento gerado automaticamente pelo sistema VendeMais.</p>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-3 justify-between print:hidden">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <div className="flex gap-3">
              <Button onClick={handlePrint} className="flex items-center gap-2">
                <Printer className="h-4 w-4" />
                Imprimir Recibo
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Baixar PDF
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptModal;
