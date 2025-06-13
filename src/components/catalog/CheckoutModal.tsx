
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
      <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] overflow-hidden p-0">
        <div className="flex flex-col h-full">
          <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-primary to-accent">
            <DialogTitle className="text-2xl font-bold text-white text-center">
              Finalizar Pedido
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 p-6">
              {/* Formulário */}
              <div className="xl:col-span-2 space-y-6">
                {/* Dados do Cliente */}
                <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                        <span className="text-white font-bold">1</span>
                      </div>
                      Dados do Cliente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium">Nome Completo</Label>
                      <Input
                        id="name"
                        placeholder="Seu nome completo"
                        value={customerData.name}
                        onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={customerData.email}
                          onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone" className="text-sm font-medium">Telefone</Label>
                        <Input
                          id="phone"
                          placeholder="(11) 99999-9999"
                          value={customerData.phone}
                          onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Método de Entrega */}
                <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                        <span className="text-white font-bold">2</span>
                      </div>
                      Método de Entrega
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={shippingMethod} onValueChange={setShippingMethod} className="space-y-3">
                      <div className="flex items-center space-x-4 p-4 border-2 rounded-xl hover:bg-blue-50 hover:border-primary transition-all cursor-pointer">
                        <RadioGroupItem value="pickup" id="pickup" />
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <MapPin size={20} className="text-primary" />
                            <label htmlFor="pickup" className="font-semibold cursor-pointer text-lg">
                              Retirar na Loja
                            </label>
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                              Grátis
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 ml-8">Retire gratuitamente em nossa loja</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 p-4 border-2 rounded-xl hover:bg-blue-50 hover:border-primary transition-all cursor-pointer">
                        <RadioGroupItem value="shipping" id="shipping" />
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <Truck size={20} className="text-primary" />
                            <label htmlFor="shipping" className="font-semibold cursor-pointer text-lg">
                              Correios
                            </label>
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                              R$ {shippingCost.toFixed(2)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 ml-8">Entrega em todo o Brasil</p>
                        </div>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Endereço (se necessário) */}
                {shippingMethod === 'shipping' && (
                  <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                          <span className="text-white font-bold">3</span>
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
                          className="flex-1"
                        />
                        <Button variant="outline" onClick={calculateShipping} disabled={loading} className="px-4">
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
                <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                        <span className="text-white font-bold">4</span>
                      </div>
                      Método de Pagamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                      <div className="flex items-center space-x-4 p-4 border-2 rounded-xl hover:bg-blue-50 hover:border-primary transition-all cursor-pointer">
                        <RadioGroupItem value="pix" id="pix" />
                        <div className="flex items-center gap-3">
                          <Smartphone size={20} className="text-primary" />
                          <label htmlFor="pix" className="font-semibold cursor-pointer text-lg">PIX</label>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 p-4 border-2 rounded-xl hover:bg-blue-50 hover:border-primary transition-all cursor-pointer">
                        <RadioGroupItem value="credit_card" id="credit_card" />
                        <div className="flex items-center gap-3">
                          <CreditCard size={20} className="text-primary" />
                          <label htmlFor="credit_card" className="font-semibold cursor-pointer text-lg">Cartão de Crédito</label>
                        </div>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Observações */}
                <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Observações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Observações sobre o pedido (opcional)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Resumo do Pedido */}
              <div className="space-y-6">
                <Card className="sticky top-0 shadow-xl border-0 bg-gradient-to-br from-white to-blue-50">
                  <CardHeader className="bg-gradient-to-r from-primary to-accent text-white rounded-t-lg">
                    <CardTitle className="text-xl font-bold text-center">Resumo do Pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="max-h-60 overflow-y-auto space-y-3 border-b pb-4">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between items-start text-sm bg-gray-50 p-3 rounded-lg">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{item.product.name}</p>
                            <p className="text-gray-600">
                              {item.quantity}x R$ {item.price.toFixed(2)}
                            </p>
                          </div>
                          <p className="font-bold text-primary">
                            R$ {(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-lg">
                        <span className="font-medium">Subtotal:</span>
                        <span className="font-bold">R$ {totalAmount.toFixed(2)}</span>
                      </div>
                      
                      {shippingCost > 0 && (
                        <div className="flex justify-between text-lg">
                          <span className="font-medium">Frete:</span>
                          <span className="font-bold text-blue-600">R$ {shippingCost.toFixed(2)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-xl font-bold border-t pt-3">
                        <span>Total:</span>
                        <span className="text-primary">R$ {finalTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleSubmit}
                      disabled={loading || !customerData.name || !customerData.phone}
                      className="w-full bg-gradient-to-r from-primary to-accent hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 text-lg rounded-xl shadow-lg transition-all"
                      size="lg"
                    >
                      {loading ? 'Processando...' : 'Finalizar Pedido'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
