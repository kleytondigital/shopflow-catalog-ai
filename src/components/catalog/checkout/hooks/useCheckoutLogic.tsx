
import React from 'react';
import { useCallback } from 'react';
import { generateWhatsAppMessage } from '../checkoutUtils';
import { useStoreData } from '@/hooks/useStoreData';
import { useCheckoutContext } from '../context/CheckoutProvider';
import { usePublicCustomer } from "./usePublicCustomer";
import { useMobileWhatsApp } from './useMobileWhatsApp';
import { supabase } from '@/integrations/supabase/client';

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
    clearCart,
    toast,
    setCreatedOrder,
    setCurrentStep,
    setShippingOptions,
    setShippingCost,
    shippingOptions,
    settings,
    currentStore
  } = useCheckoutContext();

  const { store: basicStoreData } = useStoreData();
  const { saveCustomer } = usePublicCustomer();
  const { isMobile, openWhatsApp } = useMobileWhatsApp();

  const handleShippingCalculated = useCallback((options: any[]) => {
    setShippingOptions(options);
    
    if (options.length > 0 && !shippingMethod) {
      const firstOption = options[0];
      setShippingCost(firstOption.price);
    }
  }, [shippingMethod, setShippingOptions, setShippingCost]);

  const handleShippingMethodChange = useCallback((methodId: string) => {
    const selectedOption = shippingOptions.find(opt => opt.id === methodId);
    if (selectedOption) {
      const freeDeliveryAmount = settings?.shipping_options?.free_delivery_amount || 0;
      const isFreeDelivery = freeDeliveryAmount > 0 && 
                           totalAmount >= freeDeliveryAmount && 
                           methodId === 'delivery';
      
      setShippingCost(isFreeDelivery ? 0 : selectedOption.price);
    }
  }, [shippingOptions, settings, totalAmount, setShippingCost]);

  const createOrderViaEdgeFunction = React.useCallback(async (orderData: any) => {
    console.log('🔨 createOrderViaEdgeFunction: Criando pedido via Edge Function', orderData);
    
    try {
      const { data: functionResult, error: functionError } = await supabase.functions.invoke(
        'create-public-order',
        {
          body: { orderData }
        }
      );

      if (functionError) {
        console.error('❌ createOrderViaEdgeFunction: Erro na Edge Function:', functionError);
        throw new Error(`Erro ao processar pedido: ${functionError.message}`);
      }

      if (!functionResult?.success) {
        console.error('❌ createOrderViaEdgeFunction: Edge Function retornou erro:', functionResult?.error);
        throw new Error(functionResult?.error || 'Erro desconhecido ao criar pedido');
      }

      console.log('✅ createOrderViaEdgeFunction: Pedido criado com sucesso via Edge Function:', functionResult.order);
      return functionResult.order;
    } catch (error) {
      console.error('❌ createOrderViaEdgeFunction: Erro geral', error);
      throw error;
    }
  }, []);

  const handleCreateOrder = React.useCallback(async (onClose?: () => void) => {
    console.log('🚀 handleCreateOrder: Iniciando processo de checkout');
    console.log('📊 handleCreateOrder: Estado do contexto', {
      customerName: customerData.name,
      customerPhone: customerData.phone,
      cartItemsCount: cartItems.length,
      totalAmount,
      storeId: currentStore?.id || basicStoreData?.id,
      currentStorePhone: currentStore?.phone,
      basicStorePhone: basicStoreData?.phone,
      settingsWhatsApp: settings?.whatsapp_number,
      isMobile
    });

    try {
      // Validação básica
      if (!customerData.name.trim()) {
        console.warn('⚠️ handleCreateOrder: Nome não informado');
        toast({
          title: "Nome obrigatório",
          description: "Por favor, informe seu nome.",
          variant: "destructive"
        });
        return;
      }

      const phoneNumbers = customerData.phone.replace(/\D/g, '');
      if (!phoneNumbers || phoneNumbers.length < 10) {
        console.warn('⚠️ handleCreateOrder: Telefone inválido', { phone: customerData.phone, numbers: phoneNumbers });
        toast({
          title: "Telefone obrigatório",
          description: "Por favor, informe um telefone válido.",
          variant: "destructive"
        });
        return;
      }

      if (cartItems.length === 0) {
        console.warn('⚠️ handleCreateOrder: Carrinho vazio');
        toast({
          title: "Carrinho vazio",
          description: "Adicione produtos ao carrinho antes de finalizar.",
          variant: "destructive"
        });
        return;
      }

      const storeId = currentStore?.id || basicStoreData?.id;
      console.log('🏪 handleCreateOrder: Store ID determinado', storeId);

      if (!storeId) {
        console.error('❌ handleCreateOrder: Store ID não encontrado');
        toast({
          title: "Erro de configuração",
          description: "Não foi possível identificar a loja.",
          variant: "destructive"
        });
        return;
      }

      // Determinar telefone da loja com prioridade
      const storePhone = currentStore?.phone || basicStoreData?.phone || settings?.whatsapp_number || '';
      console.log('📞 handleCreateOrder: Telefone da loja obtido', { 
        storePhone: storePhone ? storePhone.substring(0, 5) + '***' : 'não encontrado',
        source: currentStore?.phone ? 'currentStore' : basicStoreData?.phone ? 'basicStoreData' : settings?.whatsapp_number ? 'settings' : 'nenhuma'
      });

      if (!storePhone) {
        console.error('❌ handleCreateOrder: WhatsApp da loja não configurado');
        toast({
          title: "WhatsApp não configurado",
          description: "A loja não configurou o WhatsApp.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Criando seu pedido...",
        description: "Preparando para enviar ao WhatsApp...",
      });

      // Salvar cliente
      console.log('👤 handleCreateOrder: Salvando cliente...');
      const savedCustomer = await saveCustomer({
        name: customerData.name.trim(),
        email: customerData.email?.trim() || undefined,
        phone: customerData.phone.trim(),
        storeId: storeId
      });

      if (!savedCustomer) {
        console.error('❌ handleCreateOrder: Falha ao salvar cliente');
        toast({
          title: "Erro ao salvar cliente",
          description: "Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ handleCreateOrder: Cliente salvo', savedCustomer.id);

      // Preparar dados do pedido
      const orderItems = cartItems.map(item => ({
        product_id: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        variation: item.variations
          ? `${item.variations.size || ''} ${item.variations.color || ''}`.trim()
          : undefined
      }));

      const orderData = {
        customer_name: customerData.name.trim(),
        customer_email: customerData.email?.trim() || null,
        customer_phone: customerData.phone.trim(),
        status: "pending" as const,
        order_type: cartItems[0]?.catalogType || "retail",
        total_amount: totalAmount + shippingCost,
        items: orderItems,
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
            : null,
        shipping_method: shippingMethod,
        payment_method: "whatsapp",
        shipping_cost: shippingCost,
        notes: notes.trim() || null,
        store_id: storeId
      };

      console.log('📋 handleCreateOrder: Criando pedido via Edge Function', {
        customer_name: orderData.customer_name,
        total_amount: orderData.total_amount,
        items_count: orderData.items.length,
        store_id: orderData.store_id
      });

      // Criar pedido via Edge Function
      const savedOrder = await createOrderViaEdgeFunction(orderData);
      setCreatedOrder(savedOrder);
      console.log('✅ handleCreateOrder: Pedido criado com sucesso', savedOrder.id);

      // Preparar dados para WhatsApp
      const whatsappOrderData = {
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

      const message = generateWhatsAppMessage(whatsappOrderData);
      console.log('💬 handleCreateOrder: Mensagem WhatsApp gerada', { messageLength: message.length });

      // Limpar carrinho antes de abrir WhatsApp
      clearCart();
      console.log('🛒 handleCreateOrder: Carrinho limpo');

      // Abrir WhatsApp
      toast({
        title: "Pedido criado com sucesso!",
        description: isMobile ? "Redirecionando para o WhatsApp..." : "Abrindo WhatsApp em nova aba...",
        duration: 3000
      });

      const success = openWhatsApp(storePhone, message);
      
      if (success) {
        console.log('✅ handleCreateOrder: WhatsApp aberto com sucesso');
        
        // Fechar modal imediatamente após sucesso
        if (onClose) {
          console.log('🚪 handleCreateOrder: Fechando modal');
          onClose();
        }
      } else {
        console.error('❌ handleCreateOrder: Falha ao abrir WhatsApp');
        toast({
          title: "Erro ao abrir WhatsApp",
          description: "Não foi possível abrir o WhatsApp. Verifique se o aplicativo está instalado.",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('❌ handleCreateOrder: Erro geral', error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao criar pedido",
        description: `${errorMessage}. Tente novamente.`,
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
    notes,
    shippingAddress,
    saveCustomer,
    createOrderViaEdgeFunction,
    setCreatedOrder,
    currentStore,
    basicStoreData,
    settings,
    openWhatsApp,
    clearCart,
    toast,
    isMobile
  ]);

  return {
    handleCreateOrder,
    handleShippingCalculated,
    handleShippingMethodChange,
    isMobile
  };
};
