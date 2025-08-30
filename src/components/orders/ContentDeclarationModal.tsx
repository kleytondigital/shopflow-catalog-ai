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
  FileText,
  Printer,
  Download,
  Package,
  User,
  MapPin,
  Calendar,
  Building,
  Phone,
  Mail,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ContentDeclarationModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
  onDownloadPdf: () => void;
}

const ContentDeclarationModal: React.FC<ContentDeclarationModalProps> = ({
  order,
  isOpen,
  onClose,
  onPrint,
  onDownloadPdf,
}) => {
  const [storeData, setStoreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (order && isOpen) {
      console.log(
        "ContentDeclarationModal: Modal aberto para pedido:",
        order.id
      );
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
    try {
      console.log("ContentDeclarationModal: Iniciando impressão da declaração");
      console.log("Dados do pedido:", order);
      console.log("Dados da loja:", storeData);

      if (!order) {
        console.error("Erro: Pedido não encontrado");
        return;
      }

      // Criar conteúdo da declaração com formatação completa
      const declarationHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Declaração de Conteúdo - Pedido #${order.id.slice(
              -8
            )}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: Arial, sans-serif; 
                font-size: 11px; 
                line-height: 1.4;
                padding: 15mm;
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
                font-size: 18px; 
                font-weight: bold; 
                margin-bottom: 5px; 
              }
              .company-info { 
                font-size: 10px; 
                color: #666; 
                margin-bottom: 10px; 
              }
              .declaration-title { 
                font-size: 16px; 
                font-weight: bold; 
                margin: 10px 0; 
              }
              .section { 
                margin: 15px 0; 
              }
              .section-title { 
                font-weight: bold; 
                margin-bottom: 8px; 
                font-size: 12px;
              }
              .grid { 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 20px; 
                margin: 15px 0; 
              }
              .info-line { 
                margin: 3px 0; 
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 10px 0; 
                font-size: 10px;
              }
              th, td { 
                border: 1px solid #000; 
                padding: 6px; 
                text-align: left; 
              }
              th { 
                background-color: #f0f0f0; 
                font-weight: bold; 
                text-align: center;
              }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .footer { 
                margin-top: 30px; 
                font-size: 9px; 
                color: #666; 
              }
              .signature { 
                margin-top: 40px; 
                text-align: center; 
              }
              .signature-line { 
                border-top: 1px solid #000; 
                width: 200px; 
                margin: 30px auto 5px; 
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-name">${
                storeData?.name || "Nome da Loja"
              }</div>
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
                storeData?.city && storeData?.state
                  ? `<div class="company-info">${storeData.city} - ${storeData.state}</div>`
                  : ""
              }
              ${
                storeData?.phone
                  ? `<div class="company-info">Tel: ${storeData.phone}</div>`
                  : ""
              }
              
              <div class="declaration-title">DECLARAÇÃO DE CONTEÚDO</div>
              <div>Para fins de postagem - Pedido #${order.id.slice(-8)}</div>
            </div>

            <div class="grid">
              <div>
                <div class="section-title">REMETENTE</div>
                <div class="info-line"><strong>Nome:</strong> ${
                  storeData?.name || "Nome da Loja"
                }</div>
                ${
                  storeData?.document
                    ? `<div class="info-line"><strong>CNPJ:</strong> ${storeData.document}</div>`
                    : ""
                }
                ${
                  storeData?.address
                    ? `<div class="info-line"><strong>Endereço:</strong> ${storeData.address}</div>`
                    : ""
                }
                ${
                  storeData?.city && storeData?.state
                    ? `<div class="info-line"><strong>Cidade:</strong> ${storeData.city} - ${storeData.state}</div>`
                    : ""
                }
                ${
                  storeData?.zip_code
                    ? `<div class="info-line"><strong>CEP:</strong> ${storeData.zip_code}</div>`
                    : ""
                }
              </div>
              
              <div>
                <div class="section-title">DESTINATÁRIO</div>
                <div class="info-line"><strong>Nome:</strong> ${
                  order.customer_name
                }</div>
                ${
                  order.customer_phone
                    ? `<div class="info-line"><strong>Telefone:</strong> ${order.customer_phone}</div>`
                    : ""
                }
                ${
                  order.shipping_address
                    ? `
                  <div class="info-line"><strong>Endereço:</strong> ${
                    order.shipping_address.street
                  }, ${order.shipping_address.number}</div>
                  ${
                    order.shipping_address.complement
                      ? `<div class="info-line">${order.shipping_address.complement}</div>`
                      : ""
                  }
                  <div class="info-line">${
                    order.shipping_address.neighborhood
                  }</div>
                  <div class="info-line">${order.shipping_address.city} - ${
                        order.shipping_address.state
                      }</div>
                  <div class="info-line">CEP: ${
                    order.shipping_address.zip_code
                  }</div>
                `
                    : ""
                }
              </div>
            </div>

            <div class="section">
              <div class="section-title">CONTEÚDO DA ENCOMENDA</div>
              <table>
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Qtd</th>
                    <th>Peso Unit.</th>
                    <th>Valor Unit.</th>
                    <th>Valor Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    order.items
                      ?.map(
                        (item) => `
                    <tr>
                      <td>${item.product_name || item.name}${
                          item.is_order_bump ? " (Order Bump)" : ""
                        }</td>
                      <td class="text-center">${item.quantity}</td>
                      <td class="text-center">${(item.weight || 0.1).toFixed(
                        2
                      )} kg</td>
                      <td class="text-right">R$ ${(
                        item.unit_price ||
                        item.price ||
                        0
                      ).toFixed(2)}</td>
                      <td class="text-right">R$ ${(
                        item.total_price ||
                        (item.unit_price || item.price || 0) * item.quantity
                      ).toFixed(2)}</td>
                    </tr>
                  `
                      )
                      .join("") || ""
                  }
                </tbody>
                <tfoot>
                  <tr style="background-color: #f0f0f0; font-weight: bold;">
                    <td colspan="2">TOTAL</td>
                    <td class="text-center">${totalWeight.toFixed(2)} kg</td>
                    <td></td>
                    <td class="text-right">R$ ${totalValue.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div class="section">
              <div class="section-title">INFORMAÇÕES ADICIONAIS</div>
              <div class="info-line">• Pedido: #${order.id.slice(-8)}</div>
              <div class="info-line">• Data: ${new Date(
                order.created_at
              ).toLocaleDateString("pt-BR")}</div>
              <div class="info-line">• Peso Total: ${totalWeight.toFixed(
                2
              )} kg</div>
              <div class="info-line">• Valor Total: R$ ${totalValue.toFixed(
                2
              )}</div>
              <div class="info-line">• Declaração preenchida conforme Lei nº 6.538/78</div>
              ${
                order.notes
                  ? `<div class="info-line">• Observações: ${order.notes}</div>`
                  : ""
              }
            </div>

            <div class="signature">
              <div class="signature-line"></div>
              <div>Assinatura do Responsável</div>
              <div style="font-size: 9px; margin-top: 10px;">
                Data: ${new Date().toLocaleDateString("pt-BR")}
              </div>
            </div>

            <div class="footer">
              <div style="text-align: center; margin-top: 20px;">
                Documento gerado automaticamente pelo sistema VendeMais
              </div>
            </div>
          </body>
        </html>
      `;

      console.log("HTML da declaração gerado com sucesso");

      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(declarationHTML);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
        console.log("Declaração impressa com sucesso");
      } else {
        console.error("Erro: Não foi possível abrir a janela de impressão");
      }
    } catch (error) {
      console.error("Erro ao imprimir declaração:", error);
    }

    onPrint();
  };

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

  const getShippingMethodText = (method: string | null) => {
    const methods = {
      pickup: "Retirada na Loja",
      delivery: "Entrega Local",
      shipping: "Correios",
      express: "Entrega Expressa",
    };
    return methods[method as keyof typeof methods] || method || "Não informado";
  };

  const totalWeight =
    order.items?.reduce(
      (sum, item) => sum + (item.weight || 0.1) * item.quantity,
      0
    ) || 0.5;
  const totalValue =
    order.items?.reduce(
      (sum, item) =>
        sum +
        (item.total_price ||
          (item.unit_price || item.price || 0) * item.quantity),
      0
    ) || order.total_amount;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <FileText className="h-5 w-5" />
            Declaração de Conteúdo - Pedido #{order.id.slice(-8)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview da Declaração */}
          <div
            className="bg-white border rounded-lg p-6 space-y-6"
            id="declaration-content"
          >
            {/* Cabeçalho */}
            <div className="text-center border-b pb-4">
              <h2 className="text-xl font-bold">DECLARAÇÃO DE CONTEÚDO</h2>
              <p className="text-sm text-gray-600 mt-2">
                Para fins de postagem via{" "}
                {getShippingMethodText(order.shipping_method)}
              </p>
            </div>

            {/* Informações do Remetente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Remetente
                </h3>
                <div className="text-sm space-y-1">
                  <p>
                    <strong>Nome:</strong> {storeData?.name || "Nome da Loja"}
                  </p>
                  {storeData?.document && (
                    <p>
                      <strong>CNPJ:</strong> {storeData.document}
                    </p>
                  )}
                  {storeData?.address && (
                    <p>
                      <strong>Endereço:</strong> {storeData.address}
                    </p>
                  )}
                  {storeData?.city && storeData?.state && (
                    <p>
                      <strong>Cidade:</strong> {storeData.city} -{" "}
                      {storeData.state}
                    </p>
                  )}
                  {storeData?.zip_code && (
                    <p>
                      <strong>CEP:</strong> {storeData.zip_code}
                    </p>
                  )}
                  {storeData?.phone && (
                    <p>
                      <strong>Telefone:</strong> {storeData.phone}
                    </p>
                  )}
                  {storeData?.email && (
                    <p>
                      <strong>Email:</strong> {storeData.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Destinatário
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
                  {order.shipping_address && (
                    <>
                      <p>
                        <strong>Endereço:</strong>{" "}
                        {order.shipping_address.street},{" "}
                        {order.shipping_address.number}
                      </p>
                      {order.shipping_address.complement && (
                        <p>
                          <strong>Complemento:</strong>{" "}
                          {order.shipping_address.complement}
                        </p>
                      )}
                      <p>
                        <strong>Bairro:</strong>{" "}
                        {order.shipping_address.district}
                      </p>
                      <p>
                        <strong>Cidade:</strong> {order.shipping_address.city} -{" "}
                        {order.shipping_address.state}
                      </p>
                      <p>
                        <strong>CEP:</strong> {order.shipping_address.zip_code}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Informações do Pedido */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Informações do Pedido
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p>
                    <strong>Pedido:</strong> #{order.id.slice(-8)}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Data:</strong>{" "}
                    {format(new Date(order.created_at), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Peso Total:</strong> {totalWeight.toFixed(2)} kg
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Valor Total:</strong> R$ {totalValue.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Lista de Itens */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">
                Conteúdo da Encomenda
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-300 px-3 py-2 text-left">
                        Descrição
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-center">
                        Qtd
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-center">
                        Peso Unit.
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-right">
                        Valor Unit.
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-right">
                        Valor Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2">
                          {item.product_name || item.name}
                          {item.is_order_bump && (
                            <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-1 py-0.5 rounded">
                              Order Bump
                            </span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          {item.quantity}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          {(item.weight || 0.1).toFixed(2)} kg
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-right">
                          R$ {(item.unit_price || item.price || 0).toFixed(2)}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-right">
                          R${" "}
                          {(
                            item.total_price ||
                            (item.unit_price || item.price || 0) * item.quantity
                          ).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-semibold">
                    <tr>
                      <td
                        className="border border-gray-300 px-3 py-2"
                        colSpan={2}
                      >
                        TOTAL
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {totalWeight.toFixed(2)} kg
                      </td>
                      <td className="border border-gray-300 px-3 py-2"></td>
                      <td className="border border-gray-300 px-3 py-2 text-right">
                        R$ {totalValue.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">Observações</h3>
              <div className="text-sm bg-gray-50 p-3 rounded">
                <p>• Conteúdo sujeito à verificação pelos Correios</p>
                <p>• Declaração preenchida conforme Lei nº 6.538/78</p>
                <p>• Valor declarado para fins de postagem</p>
                {order.notes && <p>• Observações do pedido: {order.notes}</p>}
              </div>
            </div>

            {/* Assinatura */}
            <div className="mt-8 pt-6 border-t">
              <div className="flex justify-between items-end">
                <div className="text-center">
                  <div className="border-t border-gray-400 w-48 mx-auto mb-2"></div>
                  <p className="text-sm">Assinatura do Remetente</p>
                </div>
                <div className="text-center">
                  <p className="text-sm">
                    Data: {format(new Date(), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <div className="flex gap-3">
              <Button
                onClick={onDownloadPdf}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Download className="h-4 w-4" />
                Salvar PDF
              </Button>
              <Button onClick={onPrint} className="flex items-center gap-2">
                <Printer className="h-4 w-4" />
                Imprimir
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContentDeclarationModal;
