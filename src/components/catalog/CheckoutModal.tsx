
import React, { useState } from 'react';
import { X, Truck, MapPin, CreditCard, Smartphone, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeSettings: any;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, storeSettings }) => {
  const { items, totalAmount, clearCart } = useCart();
  const { toast } = useToast();
  
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  const [shippingMethod, setShippingMethod] = useState('pickup');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [shippingAddress, setShippingAddress] = useState({
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  });
  
  const [shippingCost, setShippingCost] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const finalTotal = totalAmount + shippingCost;

  const calculateShipping = async () => {
    if (shippingMethod === 'shipping' && shippingAddress.zipCode.length === 8) {
      setLoading(true);
      try {
        // TODO: Integração com Melhor Envio
        setTimeout(() => {
          setShippingCost(15.50);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Erro ao calcular frete:', error);
        setLoading(false);
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const orderData = {
        customer: customerData,
        items: items.map(item => ({
          product_id: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
          catalog_type: item.catalogType
        })),
        shipping_method: shippingMethod,
        shipping_address: shippingMethod !== 'pickup' ? shippingAddress : null,
        payment_method: paymentMethod,
        total_amount: finalTotal,
        shipping_cost: shippingCost,
        notes
      };

      // Generate WhatsApp message
      if (storeSettings?.whatsapp_number) {
        const message = generateWhatsAppMessage(orderData);
        window.open(`https://wa.me/${storeSettings.whatsapp_number}?text=${encodeURIComponent(message)}`, '_blank');
      }

      // TODO: Save order to database
      console.log('Pedido criado:', orderData);

      clearCart();
      toast({
        title: "Pedido enviado!",
        description: "Seu pedido foi enviado com sucesso via WhatsApp.",
      });
      onClose();
    } catch (error) {
      console.error('Erro ao processar pedido:', error);
      toast({
        title: "Erro ao processar pedido",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateWhatsAppMessage = (orderData: any) => {
    let message = `🛒 *Novo Pedido*\n\n`;
    message += `👤 *Cliente:* ${orderData.customer.name}\n`;
    message += `📧 *Email:* ${orderData.customer.email}\n`;
    message += `📱 *Telefone:* ${orderData.customer.phone}\n\n`;
    
    message += `📦 *Itens:*\n`;
    orderData.items.forEach((item: any) => {
      message += `• ${item.name} (${item.quantity}x) - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\n💰 *Total:* R$ ${orderData.total_amount.toFixed(2)}`;
    
    if (orderData.shipping_cost > 0) {
      message += `\n🚚 *Frete:* R$ ${orderData.shipping_cost.toFixed(2)}`;
    }
    
    message += `\n📋 *Pagamento:* ${getPaymentMethodName(orderData.payment_method)}`;
    message += `\n🚚 *Entrega:* ${getShippingMethodName(orderData.shipping_method)}`;
    
    if (orderData.shipping_address && orderData.shipping_method !== 'pickup') {
      message += `\n📍 *Endereço:* ${orderData.shipping_address.street}, ${orderData.shipping_address.number}, ${orderData.shipping_address.neighborhood}, ${orderData.shipping_address.city} - ${orderData.shipping_address.state}`;
    }
    
    if (orderData.notes) {
      message += `\n📝 *Observações:* ${orderData.notes}`;
    }
    
    return message;
  };

  const getPaymentMethodName = (method: string) => {
    const methods: { [key: string]: string } = {
      'pix': 'PIX',
      'credit_card': 'Cartão de Crédito',
      'bank_slip': 'Boleto Bancário',
      'cash': 'Dinheiro'
    };
    return methods[method] || method;
  };

  const getShippingMethodName = (method: string) => {
    const methods: { [key: string]: string } = {
      'pickup': 'Retirada na Loja',
      'delivery': 'Entrega Local',
      'shipping': 'Correios'
    };
    return methods[method] || method;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Finalizar Pedido</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dados do Cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  Dados do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    placeholder="Seu nome completo"
                    value={customerData.name}
                    onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={customerData.email}
                      onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      placeholder="(11) 99999-9999"
                      value={customerData.phone}
                      onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Método de Entrega */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">2</span>
                  </div>
                  Método de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-blue-600" />
                        <label htmlFor="pickup" className="font-medium cursor-pointer">
                          Retirar na Loja
                        </label>
                        <span className="text-green-600 font-bold">Grátis</span>
                      </div>
                      <p className="text-sm text-gray-600">Retire gratuitamente em nossa loja</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="shipping" id="shipping" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Truck size={18} className="text-blue-600" />
                        <label htmlFor="shipping" className="font-medium cursor-pointer">
                          Correios
                        </label>
                        <span className="text-blue-600 font-bold">
                          R$ {shippingCost.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Entrega em todo o Brasil</p>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Endereço (se necessário) */}
            {shippingMethod === 'shipping' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">3</span>
                    </div>
                    Endereço de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="CEP"
                      value={shippingAddress.zipCode}
                      onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                      onBlur={calculateShipping}
                    />
                    <Button variant="outline" onClick={calculateShipping} disabled={loading}>
                      <Calculator size={16} />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Input
                        placeholder="Rua"
                        value={shippingAddress.street}
                        onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                      />
                    </div>
                    <Input
                      placeholder="Número"
                      value={shippingAddress.number}
                      onChange={(e) => setShippingAddress({...shippingAddress, number: e.target.value})}
                    />
                  </div>

                  <Input
                    placeholder="Complemento"
                    value={shippingAddress.complement}
                    onChange={(e) => setShippingAddress({...shippingAddress, complement: e.target.value})}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      placeholder="Bairro"
                      value={shippingAddress.neighborhood}
                      onChange={(e) => setShippingAddress({...shippingAddress, neighborhood: e.target.value})}
                    />
                    <Input
                      placeholder="Cidade"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                    />
                    <Input
                      placeholder="Estado"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Método de Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">4</span>
                  </div>
                  Método de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="pix" id="pix" />
                    <div className="flex items-center gap-2">
                      <Smartphone size={18} className="text-blue-600" />
                      <label htmlFor="pix" className="font-medium cursor-pointer">PIX</label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="credit_card" id="credit_card" />
                    <div className="flex items-center gap-2">
                      <CreditCard size={18} className="text-blue-600" />
                      <label htmlFor="credit_card" className="font-medium cursor-pointer">Cartão de Crédito</label>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Observações */}
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Observações sobre o pedido (opcional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Resumo do Pedido */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-60 overflow-y-auto space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start text-sm">
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-gray-600">
                          {item.quantity}x R$ {item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-bold">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {totalAmount.toFixed(2)}</span>
                  </div>
                  
                  {shippingCost > 0 && (
                    <div className="flex justify-between">
                      <span>Frete:</span>
                      <span>R$ {shippingCost.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-blue-600">R$ {finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={loading || !customerData.name || !customerData.phone}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  size="lg"
                >
                  {loading ? 'Processando...' : 'Finalizar Pedido'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
