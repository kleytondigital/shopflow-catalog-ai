import React from 'react';
import { useCallback } from 'react';
import { generateWhatsAppMessage } from '../checkoutUtils';
import { useStoreData } from '@/hooks/useStoreData';
import { useCheckoutContext } from '../context/CheckoutProvider';
import { usePublicCustomer } from "./usePublicCustomer";

export const useCheckoutLogic = () => {
  const {
    customerData,
    cartItems,
    totalAmount,
    shippingCost,
    shippingMethod,
    paymentMethod,
    checkoutType,
    shippingAddress,
    notes,
    createOrderAsync,
    clearCart,
    toast,
    setCreatedOrder,
    setCurrentStep,
    setShippingOptions,
    setShippingCost,
    shippingOptions,
    settings
  } = useCheckoutContext();

  const { store: basicStoreData } = useStoreData();

  const { saveCustomer } = usePublicCustomer();

  const handleShippingCalculated = useCallback((options: any[]) => {
    setShippingOptions(options);
    
    // Auto-selecionar primeira opção se não houver seleção
    if (options.length > 0 && !shippingMethod) {
      const firstOption = options[0];
      // setShippingMethod será chamado pelo componente pai
      setShippingCost(firstOption.price);
    }
  }, [shippingMethod, setShippingOptions, setShippingCost]);

  const handleShippingMethodChange = useCallback((methodId: string) => {
    const selectedOption = shippingOptions.find(opt => opt.id === methodId);
    if (selectedOption) {
      // Verificar se é frete grátis
      const freeDeliveryAmount = settings?.shipping_options?.free_delivery_amount || 0;
      const isFreeDelivery = freeDeliveryAmount > 0 && 
                           totalAmount >= freeDeliveryAmount && 
                           methodId === 'delivery';
      
      setShippingCost(isFreeDelivery ? 0 : selectedOption.price);
    }
  }, [shippingOptions, settings, totalAmount, setShippingCost]);

  // Envia para o WhatsApp o resumo do pedido, abrindo no navegador do cliente
  const handleWhatsAppCheckout = React.useCallback(
    (order: any) => {
      // Gera o resumo (já pronto após criar pedido e salvar cliente)
      const orderData = {
        customer_name: customerData.name,
        customer_phone: customerData.phone,
        customer_email: customerData.email,
        total_amount: totalAmount + shippingCost,
        items: cartItems.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
          variation: item.variations
            ? `${item.variations.size || ''} ${item.variations.color || ''}`.trim()
            : undefined
        })),
        shipping_method: shippingMethod,
        payment_method: 'whatsapp',
        shipping_cost: shippingCost,
        notes: notes
      };

      // Gera mensagem de texto formatada (mantém função existente)
      const message = generateWhatsAppMessage(orderData);

      // Telefone da loja
      const basicPhoneRaw = basicStoreData?.phone || '';
      const formattedPhone = basicPhoneRaw.replace(/\D/g, '');
      const phoneForLink =
        formattedPhone.length >= 10
          ? formattedPhone.startsWith('55')
            ? formattedPhone
            : `55${formattedPhone}`
          : '';

      const destinationNumber = phoneForLink;

      // Notifica usuário
      toast({
        title: "Pedido enviado!",
        description: "Redirecionando para o WhatsApp da loja.",
        duration: 4000
      });

      setTimeout(() => {
        if (!destinationNumber) {
          toast({
            title: "WhatsApp da loja não configurado",
            description: "A loja não configurou o WhatsApp corretamente.",
            variant: "destructive"
          });
          return;
        }
        // Abrir WhatsApp com o resumo do pedido no navegador do cliente
        window.open(`https://wa.me/${destinationNumber}?text=${encodeURIComponent(message)}`, '_blank');
      }, 1200);

      clearCart(); // Limpar carrinho ao final
    },
    [
      customerData,
      cartItems,
      totalAmount,
      shippingCost,
      shippingMethod,
      notes,
      basicStoreData,
      toast,
      clearCart
    ]
  );

  // --------- FLUXO PRINCIPAL DE CHECKOUT ---------------
  const handleCreateOrder = React.useCallback(async () => {
    try {
      // Validação básica antes de tudo (nome, telefone)
      if (!customerData.name.trim()) {
        toast({
          title: "Nome obrigatório",
          description: "Por favor, informe seu nome.",
          variant: "destructive"
        });
        return;
      }
      if (!customerData.phone.trim()) {
        toast({
          title: "Telefone obrigatório",
          description: "Por favor, informe seu telefone.",
          variant: "destructive"
        });
        return;
      }
      if (cartItems.length === 0) {
        toast({
          title: "Carrinho vazio",
          description: "Adicione produtos ao carrinho antes de finalizar.",
          variant: "destructive"
        });
        return;
      }

      // ------- Salvar cliente ANTES de criar pedido -------
      // Salva o cliente (com storeId) e apenas prossegue se não existir erro
      const savedCustomer = await saveCustomer({
        name: customerData.name.trim(),
        email: customerData.email?.trim() || undefined,
        phone: customerData.phone.trim(),
        storeId: basicStoreData?.id
      });
      if (!savedCustomer) {
        toast({
          title: "Erro ao salvar cliente",
          description: "Não foi possível salvar os dados do cliente. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      // ------- Cria pedido normalmente -------
      toast({
        title: "Enviando seu pedido...",
        description: "Só um instante! Redirecionando para o WhatsApp...",
      });

      const orderData = {
        customer_name: customerData.name.trim(),
        customer_email: customerData.email?.trim() || undefined,
        customer_phone: customerData.phone.trim(),
        status: "pending" as const,
        order_type: cartItems[0]?.catalogType || "retail",
        total_amount: totalAmount + shippingCost,
        items: cartItems.map(item => ({
          id: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
          variation: item.variations
            ? `${item.variations.size || ''} ${item.variations.color || ''}`.trim()
            : undefined
        })),
        shipping_address:
          shippingMethod !== "pickup"
            ? {
                street: shippingAddress.street,
                number: shippingAddress.number,
                district: shippingAddress.neighborhood,
                city: shippingAddress.city,
                state: shippingAddress.state,
                zip_code: shippingAddress.zipCode
              }
            : undefined,
        shipping_method: shippingMethod,
        payment_method: checkoutType === "whatsapp_only" ? "whatsapp" : paymentMethod,
        shipping_cost: shippingCost,
        notes: notes.trim() || undefined,
        store_id: basicStoreData?.id
      };

      // Cria o pedido async na Supabase
      const savedOrder = await createOrderAsync(orderData);
      setCreatedOrder(savedOrder);

      // Agora trata os fluxos de acordo com o tipo de checkout
      if (checkoutType === "whatsapp_only") {
        // Checkout público: redireciona WhatsApp imediatamente
        handleWhatsAppCheckout(savedOrder);
      } else if (["pix", "credit_card", "bank_slip"].includes(paymentMethod)) {
        setCurrentStep("payment");
      }
      // No fluxo premium outros métodos podem ser usados aqui
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "❌ Erro ao criar pedido",
        description: `Não foi possível criar seu pedido: ${errorMessage}. Tente novamente.`,
        variant: "destructive",
        duration: 7000
      });
    }
  }, [
    customerData,
    cartItems,
    totalAmount,
    shippingCost,
    shippingMethod,
    paymentMethod,
    checkoutType,
    shippingAddress,
    notes,
    createOrderAsync,
    toast,
    setCreatedOrder,
    setCurrentStep,
    saveCustomer,
    basicStoreData,
    handleWhatsAppCheckout
  ]);

  return {
    handleCreateOrder,
    handleWhatsAppCheckout,
    handleShippingCalculated,
    handleShippingMethodChange
  };
};
