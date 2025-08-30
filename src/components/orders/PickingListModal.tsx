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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Package,
  Printer,
  Download,
  CheckSquare,
  Building,
  MapPin,
  Calendar,
  User,
  Hash,
  Truck,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PickingListModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
  onMarkComplete: () => void;
}

const PickingListModal: React.FC<PickingListModalProps> = ({
  order,
  isOpen,
  onClose,
  onPrint,
  onMarkComplete,
}) => {
  const [storeData, setStoreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (order && isOpen) {
      fetchStoreData();
      setCheckedItems(new Set());
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

  const handleItemCheck = (index: number, checked: boolean) => {
    const newCheckedItems = new Set(checkedItems);
    if (checked) {
      newCheckedItems.add(index);
    } else {
      newCheckedItems.delete(index);
    }
    setCheckedItems(newCheckedItems);
  };

  const handlePrint = () => {
    // Criar romaneio com formatação profissional
    const pickingListHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Romaneio de Separação - Pedido #${order.id.slice(-8)}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              font-size: 12px; 
              line-height: 1.4;
              padding: 15mm;
              background: white;
            }
            .header { 
              text-align: center; 
              margin-bottom: 25px; 
              border-bottom: 3px solid #000;
              padding-bottom: 20px;
            }
            .company-name { 
              font-size: 24px; 
              font-weight: bold; 
              margin-bottom: 10px; 
            }
            .document-title { 
              font-size: 18px; 
              font-weight: bold; 
              background: #000;
              color: white;
              padding: 10px;
              margin: 15px 0;
            }
            .order-info { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 20px; 
              margin: 15px 0;
              background: #f8f8f8;
              padding: 15px;
              border: 1px solid #ddd;
            }
            .section { 
              margin: 20px 0; 
              border: 1px solid #ddd;
              padding: 15px;
            }
            .section-title { 
              font-weight: bold; 
              margin-bottom: 15px; 
              font-size: 14px;
              background: #f0f0f0;
              padding: 8px;
              border-left: 4px solid #000;
            }
            .customer-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
            }
            .item-card {
              border: 2px solid #ddd;
              margin: 10px 0;
              padding: 15px;
              background: white;
            }
            .item-header {
              display: flex;
              align-items: center;
              gap: 10px;
              margin-bottom: 10px;
              font-size: 14px;
              font-weight: bold;
            }
            .item-details {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
              margin: 10px 0;
              text-align: center;
            }
            .item-detail {
              text-align: center;
            }
            .item-detail-label {
              font-weight: bold;
              font-size: 10px;
              color: #666;
              margin-bottom: 3px;
            }
            .item-detail-value {
              font-size: 14px;
              font-weight: bold;
            }
            .quantity-big {
              font-size: 24px;
              font-weight: bold;
              color: #000;
            }
            .checkbox-area {
              float: left;
              width: 20px;
              height: 20px;
              border: 2px solid #000;
              margin-right: 10px;
              margin-top: 2px;
            }
            .observation-line {
              border-bottom: 1px solid #ccc;
              height: 25px;
              margin: 10px 0;
            }
            .summary {
              background: #f8f8f8;
              padding: 15px;
              border: 2px solid #000;
              margin: 20px 0;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
              text-align: center;
            }
            .summary-item {
              text-align: center;
            }
            .summary-label {
              font-size: 10px;
              color: #666;
              margin-bottom: 5px;
            }
            .summary-value {
              font-size: 16px;
              font-weight: bold;
            }
            .signatures {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-top: 50px;
            }
            .signature-box {
              text-align: center;
              border-top: 2px solid #000;
              padding-top: 10px;
              margin-top: 40px;
            }
            .delivery-info {
              background: #e3f2fd;
              padding: 15px;
              border-left: 4px solid #2196f3;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">${
              storeData?.name || "Prime Calçados"
            }</div>
            <div class="document-title">ROMANEIO DE SEPARAÇÃO</div>
            <div class="order-info">
              <div>
                <strong>Pedido:</strong> #${order.id.slice(-8)}<br>
                <strong>Data:</strong> ${new Date(
                  order.created_at
                ).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div>
                <strong>Status:</strong> ${order.status.toUpperCase()}<br>
                <strong>Tipo:</strong> ${
                  order.order_type === "retail" ? "Varejo" : "Atacado"
                }
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">👤 DADOS DO CLIENTE</div>
            <div class="customer-info">
              <div>
                <strong>Nome:</strong> ${order.customer_name}<br>
                ${
                  order.customer_phone
                    ? `<strong>Telefone:</strong> ${order.customer_phone}<br>`
                    : ""
                }
                ${
                  order.customer_email
                    ? `<strong>Email:</strong> ${order.customer_email}`
                    : ""
                }
              </div>
              <div>
                ${
                  order.shipping_address
                    ? `
                  <strong>Endereço de Entrega:</strong><br>
                  ${order.shipping_address.street}, ${
                        order.shipping_address.number
                      }<br>
                  ${
                    order.shipping_address.complement
                      ? `${order.shipping_address.complement}<br>`
                      : ""
                  }
                  ${order.shipping_address.neighborhood}<br>
                  ${order.shipping_address.city} - ${
                        order.shipping_address.state
                      }<br>
                  CEP: ${order.shipping_address.zip_code}
                `
                    : ""
                }
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">📦 ITENS PARA SEPARAÇÃO</div>
            ${
              order.items
                ?.map(
                  (item, index) => `
              <div class="item-card">
                <div class="item-header">
                  <div class="checkbox-area"></div>
                  <span>${item.product_name || item.name}</span>
                  ${
                    item.is_order_bump
                      ? '<span style="background: #ff9800; color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px;">🎁 Order Bump</span>'
                      : ""
                  }
                </div>
                
                <div class="item-details">
                  <div class="item-detail">
                    <div class="item-detail-label">QUANTIDADE</div>
                    <div class="quantity-big">${item.quantity}x</div>
                  </div>
                  
                  ${
                    item.variation_details
                      ? `
                    <div class="item-detail">
                      <div class="item-detail-label">VARIAÇÃO</div>
                      <div class="item-detail-value">${
                        item.variation_details.color || ""
                      } ${item.variation_details.size || ""}</div>
                    </div>
                  `
                      : "<div></div>"
                  }
                  
                  <div class="item-detail">
                    <div class="item-detail-label">PREÇO UNIT.</div>
                    <div class="item-detail-value">R$ ${(
                      item.unit_price ||
                      item.price ||
                      0
                    ).toFixed(2)}</div>
                  </div>
                  
                  <div class="item-detail">
                    <div class="item-detail-label">SUBTOTAL</div>
                    <div class="item-detail-value">R$ ${(
                      item.total_price ||
                      (item.unit_price || item.price || 0) * item.quantity
                    ).toFixed(2)}</div>
                  </div>
                </div>

                <div style="margin-top: 15px;">
                  <div class="item-detail-label">OBSERVAÇÕES DE SEPARAÇÃO:</div>
                  <div class="observation-line"></div>
                  <div class="observation-line"></div>
                </div>
              </div>
            `
                )
                .join("") || ""
            }
          </div>

          <div class="summary">
            <div style="font-weight: bold; margin-bottom: 15px; text-align: center; font-size: 14px;">
              📊 RESUMO DO PEDIDO
            </div>
            <div class="summary-grid">
              <div class="summary-item">
                <div class="summary-label">TOTAL DE ITENS</div>
                <div class="summary-value">${
                  order.items?.reduce((sum, item) => sum + item.quantity, 0) ||
                  0
                }</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">SUBTOTAL</div>
                <div class="summary-value">R$ ${(
                  order.total_amount - (order.shipping_cost || 0)
                ).toFixed(2)}</div>
              </div>
              ${
                order.shipping_cost && order.shipping_cost > 0
                  ? `
                <div class="summary-item">
                  <div class="summary-label">FRETE</div>
                  <div class="summary-value">R$ ${order.shipping_cost.toFixed(
                    2
                  )}</div>
                </div>
              `
                  : "<div></div>"
              }
              <div class="summary-item">
                <div class="summary-label">TOTAL GERAL</div>
                <div class="summary-value" style="color: green;">R$ ${order.total_amount.toFixed(
                  2
                )}</div>
              </div>
            </div>
          </div>

          <div class="delivery-info">
            <div style="font-weight: bold; margin-bottom: 10px;">🚚 INFORMAÇÕES DE ENTREGA</div>
            <div><strong>Método de Entrega:</strong> ${
              order.shipping_method || "Não informado"
            }</div>
            <div><strong>Método de Pagamento:</strong> ${
              order.payment_method || "Não informado"
            }</div>
            ${
              order.tracking_code
                ? `<div><strong>Código de Rastreio:</strong> ${order.tracking_code}</div>`
                : ""
            }
            ${
              order.notes
                ? `<div style="margin-top: 10px;"><strong>Observações:</strong><br>${order.notes}</div>`
                : ""
            }
          </div>

          <div class="signatures">
            <div>
              <div class="signature-box">
                <div style="font-weight: bold;">SEPARADO POR</div>
                <div style="font-size: 10px; color: #666; margin-top: 5px;">Nome legível e assinatura</div>
                <div style="margin-top: 15px; font-size: 10px;">Data: ___/___/______</div>
              </div>
            </div>
            <div>
              <div class="signature-box">
                <div style="font-weight: bold;">CONFERIDO POR</div>
                <div style="font-size: 10px; color: #666; margin-top: 5px;">Nome legível e assinatura</div>
                <div style="margin-top: 15px; font-size: 10px;">Data: ___/___/______</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(pickingListHTML);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
    onPrint();
  };

  const allItemsChecked = order?.items
    ? checkedItems.size === order.items.length
    : false;

  if (!order) return null;

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Package className="h-5 w-5" />
            Romaneio de Separação - Pedido #{order.id.slice(-8)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview do Romaneio */}
          <div
            className="bg-white border rounded-lg p-6 space-y-6 print:shadow-none"
            id="picking-list-content"
          >
            {/* Cabeçalho da Empresa */}
            <div className="text-center border-b-2 border-primary pb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Building className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">
                  {storeData?.name || "Loja"}
                </h1>
              </div>

              <div className="bg-primary text-white p-4 rounded-lg">
                <h2 className="text-xl font-bold mb-2">
                  ROMANEIO DE SEPARAÇÃO
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p>
                      <strong>Pedido:</strong> #{order.id.slice(-8)}
                    </p>
                    <p>
                      <strong>Data:</strong>{" "}
                      {format(new Date(order.created_at), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Status:</strong> {order.status.toUpperCase()}
                    </p>
                    <p>
                      <strong>Tipo:</strong>{" "}
                      {order.order_type === "retail" ? "Varejo" : "Atacado"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações do Cliente */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <User className="h-5 w-5" />
                Dados do Cliente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
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
                <div>
                  {order.shipping_address && (
                    <div>
                      <p>
                        <strong>Endereço de Entrega:</strong>
                      </p>
                      <p>
                        {order.shipping_address.street},{" "}
                        {order.shipping_address.number}
                      </p>
                      {order.shipping_address.complement && (
                        <p>{order.shipping_address.complement}</p>
                      )}
                      <p>{order.shipping_address.neighborhood}</p>
                      <p>
                        {order.shipping_address.city} -{" "}
                        {order.shipping_address.state}
                      </p>
                      <p>CEP: {order.shipping_address.zip_code}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Lista de Produtos para Separação */}
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                Itens para Separação
              </h3>

              <div className="space-y-3">
                {order.items?.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-start gap-4">
                      <div className="print:hidden">
                        <Checkbox
                          checked={checkedItems.has(index)}
                          onCheckedChange={(checked) =>
                            handleItemCheck(index, checked as boolean)
                          }
                          className="mt-1"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg">
                            {item.product_name || item.name}
                          </h4>
                          {item.is_order_bump && (
                            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                              🎁 Order Bump
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p>
                              <strong>Quantidade:</strong>
                            </p>
                            <p className="text-2xl font-bold text-primary">
                              {item.quantity}x
                            </p>
                          </div>

                          {item.variation_details && (
                            <div>
                              <p>
                                <strong>Variação:</strong>
                              </p>
                              <p>
                                {item.variation_details.color}{" "}
                                {item.variation_details.size}
                              </p>
                            </div>
                          )}

                          <div>
                            <p>
                              <strong>Preço Unit.:</strong>
                            </p>
                            <p>
                              R${" "}
                              {(item.unit_price || item.price || 0).toFixed(2)}
                            </p>
                          </div>

                          <div>
                            <p>
                              <strong>Subtotal:</strong>
                            </p>
                            <p className="font-semibold">
                              R${" "}
                              {(
                                item.total_price ||
                                (item.unit_price || item.price || 0) *
                                  item.quantity
                              ).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Espaço para observações de separação */}
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Observações de Separação:</strong>
                          </p>
                          <div className="border-b border-gray-300 h-6"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumo do Pedido */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-3">Resumo do Pedido</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p>
                    <strong>Total de Itens:</strong>
                  </p>
                  <p className="text-xl font-bold">
                    {order.items?.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    ) || 0}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Subtotal:</strong>
                  </p>
                  <p>
                    R${" "}
                    {(order.total_amount - (order.shipping_cost || 0)).toFixed(
                      2
                    )}
                  </p>
                </div>
                {order.shipping_cost && order.shipping_cost > 0 && (
                  <div>
                    <p>
                      <strong>Frete:</strong>
                    </p>
                    <p>R$ {order.shipping_cost.toFixed(2)}</p>
                  </div>
                )}
                <div>
                  <p>
                    <strong>Total Geral:</strong>
                  </p>
                  <p className="text-xl font-bold text-green-600">
                    R$ {order.total_amount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Informações de Entrega */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Informações de Entrega
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p>
                    <strong>Método de Entrega:</strong>{" "}
                    {order.shipping_method || "Não informado"}
                  </p>
                  <p>
                    <strong>Método de Pagamento:</strong>{" "}
                    {order.payment_method || "Não informado"}
                  </p>
                </div>
                <div>
                  {order.tracking_code && (
                    <p>
                      <strong>Código de Rastreio:</strong> {order.tracking_code}
                    </p>
                  )}
                  {order.notes && (
                    <div>
                      <p>
                        <strong>Observações:</strong>
                      </p>
                      <p className="bg-white p-2 rounded border">
                        {order.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Assinaturas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t-2">
              <div className="text-center">
                <div className="border-t border-gray-400 pt-2 mt-16">
                  <p className="text-sm font-semibold">Separado por</p>
                  <p className="text-xs text-gray-600">
                    Nome legível e assinatura
                  </p>
                </div>
                <p className="text-xs mt-2">Data: ___/___/______</p>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-400 pt-2 mt-16">
                  <p className="text-sm font-semibold">Conferido por</p>
                  <p className="text-xs text-gray-600">
                    Nome legível e assinatura
                  </p>
                </div>
                <p className="text-xs mt-2">Data: ___/___/______</p>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between print:hidden">
            <div className="flex gap-3">
              <Button onClick={handlePrint} className="flex items-center gap-2">
                <Printer className="h-4 w-4" />
                Imprimir
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Baixar PDF
              </Button>
            </div>

            <div className="flex gap-3">
              {allItemsChecked && (
                <Button
                  onClick={onMarkComplete}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <CheckSquare className="h-4 w-4" />
                  Marcar como Separado
                </Button>
              )}
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PickingListModal;
