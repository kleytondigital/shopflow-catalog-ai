
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  deliveryTime: string;
  carrier: string;
}

interface AddressData {
  zipCode: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

export const useShippingCalculator = () => {
  const [loading, setLoading] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const { toast } = useToast();

  const validateZipCode = (zipCode: string): boolean => {
    const cleanZip = zipCode.replace(/\D/g, '');
    return cleanZip.length === 8;
  };

  const fetchAddressByZipCode = async (zipCode: string): Promise<AddressData | null> => {
    try {
      const cleanZip = zipCode.replace(/\D/g, '');
      
      if (!validateZipCode(cleanZip)) {
        throw new Error('CEP deve ter 8 dígitos');
      }

      const response = await fetch(`https://viacep.com.br/ws/${cleanZip}/json/`);
      const data = await response.json();

      if (data.erro) {
        throw new Error('CEP não encontrado');
      }

      return {
        zipCode: cleanZip,
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || ''
      };
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast({
        title: "Erro ao buscar CEP",
        description: error instanceof Error ? error.message : "CEP inválido",
        variant: "destructive",
      });
      return null;
    }
  };

  const calculateShipping = async (
    destinyZipCode: string,
    weight: number = 0.5,
    storeSettings?: any
  ): Promise<ShippingOption[]> => {
    try {
      setLoading(true);
      setShippingOptions([]);

      const cleanDestinyZip = destinyZipCode.replace(/\D/g, '');
      
      if (!validateZipCode(cleanDestinyZip)) {
        throw new Error('CEP de destino inválido');
      }

      const options: ShippingOption[] = [];

      // Retirada no local (sempre disponível se configurado)
      if (storeSettings?.shipping_options?.pickup) {
        options.push({
          id: 'pickup',
          name: 'Retirada na Loja',
          price: 0,
          deliveryTime: 'Disponível hoje',
          carrier: 'Loja'
        });
      }

      // Entrega local (baseada no raio configurado)
      if (storeSettings?.shipping_options?.delivery) {
        const deliveryFee = storeSettings.shipping_options.delivery_fee || 0;
        const freeDeliveryAmount = storeSettings.shipping_options.free_delivery_amount || 0;
        
        options.push({
          id: 'delivery',
          name: 'Entrega Local',
          price: freeDeliveryAmount > 0 ? deliveryFee : deliveryFee,
          deliveryTime: '1-2 dias úteis',
          carrier: 'Entrega Própria'
        });
      }

      // Correios (simulação - na implementação real usaria API dos Correios)
      if (storeSettings?.shipping_options?.shipping) {
        // Simulação de diferentes serviços dos Correios
        const basePrice = 15.50;
        const distanceFactor = Math.random() * 0.5 + 0.8; // Fator de distância simulado
        
        options.push({
          id: 'pac',
          name: 'PAC',
          price: Math.round(basePrice * distanceFactor * 100) / 100,
          deliveryTime: '8-12 dias úteis',
          carrier: 'Correios'
        });

        options.push({
          id: 'sedex',
          name: 'SEDEX',
          price: Math.round(basePrice * distanceFactor * 1.8 * 100) / 100,
          deliveryTime: '2-4 dias úteis',
          carrier: 'Correios'
        });
      }

      setShippingOptions(options);
      return options;

    } catch (error) {
      console.error('Erro ao calcular frete:', error);
      toast({
        title: "Erro no cálculo de frete",
        description: error instanceof Error ? error.message : "Não foi possível calcular o frete",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const clearShippingOptions = () => {
    setShippingOptions([]);
  };

  return {
    loading,
    shippingOptions,
    validateZipCode,
    fetchAddressByZipCode,
    calculateShipping,
    clearShippingOptions
  };
};
