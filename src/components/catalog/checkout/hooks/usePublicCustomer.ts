
import { supabase } from "@/integrations/supabase/client";

export interface CustomerInfo {
  name: string;
  email?: string;
  phone: string;
  storeId: string;
}

export const usePublicCustomer = () => {
  const saveCustomer = async ({ name, email, phone, storeId }: CustomerInfo) => {
    if (!name.trim() || !phone.trim() || !storeId) return null;

    // Busca se existe cliente com esse telefone para a loja
    const { data: existing, error: searchError } = await supabase
      .from("customers")
      .select("*")
      .eq("phone", phone)
      .eq("store_id", storeId)
      .limit(1)
      .maybeSingle();

    if (!existing) {
      // Salva novo cliente
      const { data, error } = await supabase.from("customers").insert([{
        name,
        email,
        phone,
        store_id: storeId,
      }]);
      if (error) {
        console.error("Erro ao salvar cliente:", error);
      }
      return data?.[0] ?? null;
    } else {
      // Já existe: opcionalmente, atualiza email/nome se mudarem
      if ((existing.name !== name) || (email && existing.email !== email)) {
        await supabase.from("customers")
          .update({ name, email })
          .eq("id", existing.id);
      }
      return existing;
    }
  };

  return { saveCustomer };
};
