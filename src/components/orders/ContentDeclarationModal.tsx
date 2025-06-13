
import React from 'react';
import { Order } from '@/hooks/useOrders';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Printer, 
  Download,
  Package,
  User,
  MapPin,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  onDownloadPdf
}) => {
  if (!order) return null;

  const getShippingMethodText = (method: string | null) => {
    const methods = {
      pickup: 'Retirada na Loja',
      delivery: 'Entrega Local',
      shipping: 'Correios',
      express: 'Entrega Expressa'
    };
    return methods[method as keyof typeof methods] || method || 'Não informado';
  };

  const totalWeight = order.items?.reduce((sum, item) => sum + (item.weight || 0.1) * item.quantity, 0) || 0.5;
  const totalValue = order.items?.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0) || order.total_amount;

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
          <div className="bg-white border rounded-lg p-6 space-y-6" id="declaration-content">
            {/* Cabeçalho */}
            <div className="text-center border-b pb-4">
              <h2 className="text-xl font-bold">DECLARAÇÃO DE CONTEÚDO</h2>
              <p className="text-sm text-gray-600 mt-2">
                Para fins de postagem via {getShippingMethodText(order.shipping_method)}
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
                  <p><strong>Nome:</strong> Sua Loja</p>
                  <p><strong>CNPJ:</strong> 00.000.000/0001-00</p>
                  <p><strong>Endereço:</strong> Rua da Loja, 123</p>
                  <p><strong>Cidade:</strong> São Paulo - SP</p>
                  <p><strong>CEP:</strong> 00000-000</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Destinatário
                </h3>
                <div className="text-sm space-y-1">
                  <p><strong>Nome:</strong> {order.customer_name}</p>
                  {order.customer_phone && (
                    <p><strong>Telefone:</strong> {order.customer_phone}</p>
                  )}
                  {order.shipping_address && (
                    <>
                      <p><strong>Endereço:</strong> {order.shipping_address.street}, {order.shipping_address.number}</p>
                      {order.shipping_address.complement && (
                        <p><strong>Complemento:</strong> {order.shipping_address.complement}</p>
                      )}
                      <p><strong>Bairro:</strong> {order.shipping_address.district}</p>
                      <p><strong>Cidade:</strong> {order.shipping_address.city} - {order.shipping_address.state}</p>
                      <p><strong>CEP:</strong> {order.shipping_address.zip_code}</p>
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
                  <p><strong>Pedido:</strong> #{order.id.slice(-8)}</p>
                </div>
                <div>
                  <p><strong>Data:</strong> {format(new Date(order.created_at), "dd/MM/yyyy", { locale: ptBR })}</p>
                </div>
                <div>
                  <p><strong>Peso Total:</strong> {totalWeight.toFixed(2)} kg</p>
                </div>
                <div>
                  <p><strong>Valor Total:</strong> R$ {totalValue.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Lista de Itens */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">Conteúdo da Encomenda</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-300 px-3 py-2 text-left">Descrição</th>
                      <th className="border border-gray-300 px-3 py-2 text-center">Qtd</th>
                      <th className="border border-gray-300 px-3 py-2 text-center">Peso Unit.</th>
                      <th className="border border-gray-300 px-3 py-2 text-right">Valor Unit.</th>
                      <th className="border border-gray-300 px-3 py-2 text-right">Valor Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2">{item.name}</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">{item.quantity}</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">{(item.weight || 0.1).toFixed(2)} kg</td>
                        <td className="border border-gray-300 px-3 py-2 text-right">R$ {(item.price || 0).toFixed(2)}</td>
                        <td className="border border-gray-300 px-3 py-2 text-right">R$ {((item.price || 0) * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-semibold">
                    <tr>
                      <td className="border border-gray-300 px-3 py-2" colSpan={2}>TOTAL</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">{totalWeight.toFixed(2)} kg</td>
                      <td className="border border-gray-300 px-3 py-2"></td>
                      <td className="border border-gray-300 px-3 py-2 text-right">R$ {totalValue.toFixed(2)}</td>
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
                {order.notes && (
                  <p>• Observações do pedido: {order.notes}</p>
                )}
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
                  <p className="text-sm">Data: {format(new Date(), "dd/MM/yyyy", { locale: ptBR })}</p>
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
              <Button
                onClick={onPrint}
                className="flex items-center gap-2"
              >
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
