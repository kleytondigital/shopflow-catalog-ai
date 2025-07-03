export const generateWhatsAppMessage = (orderData: any) => {
  let message = `🛒 *NOVO PEDIDO*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // Dados do cliente
  message += `👤 *CLIENTE*\n`;
  message += `- Nome: ${orderData.customer_name}\n`;
  if (orderData.customer_email) {
    message += `- Email: ${orderData.customer_email}\n`;
  }
  message += `- WhatsApp: ${orderData.customer_phone}\n\n`;

  // Itens do pedido
  message += `📦 *PRODUTOS*\n`;
  orderData.items.forEach((item: any, index: number) => {
    const itemTotal = item.price * item.quantity;
    message += `${index + 1}. *${item.name}*\n`;
    if (item.variation) {
      message += `   🔸 ${item.variation}\n`;
    }
    message += `   🔸 Qtd: ${item.quantity}x\n`;
    message += `   🔸 Valor: R$ ${item.price.toFixed(2)} cada\n`;
    message += `   🔸 Subtotal: R$ ${itemTotal.toFixed(2)}\n\n`;
  });

  // Resumo financeiro
  message += `💰 *RESUMO FINANCEIRO*\n`;

  const subtotal = orderData.items.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );

  message += `- Subtotal: R$ ${subtotal.toFixed(2)}\n`;

  if (orderData.shipping_cost && orderData.shipping_cost > 0) {
    message += `- Frete: R$ ${orderData.shipping_cost.toFixed(2)}\n`;
  }

  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `✅ *TOTAL: R$ ${orderData.total_amount.toFixed(2)}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // Método de entrega
  message += `🚚 *ENTREGA*\n`;
  message += `- Método: ${getShippingMethodName(orderData.shipping_method)}\n`;

  if (orderData.shipping_address && orderData.shipping_method !== "pickup") {
    message += `- Endereço: ${orderData.shipping_address.street}, ${orderData.shipping_address.number}\n`;
    message += `- Bairro: ${orderData.shipping_address.district}\n`;
    message += `- Cidade: ${orderData.shipping_address.city} - ${orderData.shipping_address.state}\n`;
    message += `- CEP: ${orderData.shipping_address.zip_code}\n`;
  }
  message += `\n`;

  // Pagamento
  message += `💳 *PAGAMENTO*\n`;
  message += `- Método: ${getPaymentMethodName(orderData.payment_method)}\n\n`;

  // Observações
  if (orderData.notes) {
    message += `📝 *OBSERVAÇÕES*\n`;
    message += `${orderData.notes}\n\n`;
  }

  // Rodapé
  message += `⏰ Pedido gerado em: ${new Date().toLocaleString("pt-BR")}\n`;
  message += `🤖 Enviado automaticamente pelo sistema de catálogo`;

  return message;
};

export const getPaymentMethodName = (method: string) => {
  const methods: { [key: string]: string } = {
    pix: "PIX 💸",
    credit_card: "Cartão de Crédito 💳",
    bank_slip: "Boleto Bancário 🧾",
    cash: "Dinheiro 💵",
    whatsapp: "A combinar via WhatsApp 📱",
  };
  return methods[method] || method;
};

export const getShippingMethodName = (method: string) => {
  const methods: { [key: string]: string } = {
    pickup: "Retirada na Loja 🏬",
    delivery: "Entrega Local 🚗",
    shipping: "Correios 📮",
    combine: "A combinar via WhatsApp 📱",
  };
  return methods[method] || method;
};
