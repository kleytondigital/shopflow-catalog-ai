
export const generateWhatsAppMessage = (orderData: any) => {
  let message = `🛒 *Novo Pedido*\n\n`;
  message += `👤 *Cliente:* ${orderData.customer_name}\n`;
  if (orderData.customer_email) {
    message += `📧 *Email:* ${orderData.customer_email}\n`;
  }
  message += `📱 *Telefone:* ${orderData.customer_phone}\n\n`;
  
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
    message += `\n📍 *Endereço:* ${orderData.shipping_address.street}, ${orderData.shipping_address.number}, ${orderData.shipping_address.district}, ${orderData.shipping_address.city} - ${orderData.shipping_address.state}`;
  }
  
  if (orderData.notes) {
    message += `\n📝 *Observações:* ${orderData.notes}`;
  }
  
  return message;
};

export const getPaymentMethodName = (method: string) => {
  const methods: { [key: string]: string } = {
    'pix': 'PIX',
    'credit_card': 'Cartão de Crédito',
    'bank_slip': 'Boleto Bancário',
    'cash': 'Dinheiro'
  };
  return methods[method] || method;
};

export const getShippingMethodName = (method: string) => {
  const methods: { [key: string]: string } = {
    'pickup': 'Retirada na Loja',
    'delivery': 'Entrega Local',
    'shipping': 'Correios'
  };
  return methods[method] || method;
};
