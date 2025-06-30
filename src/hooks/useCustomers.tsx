import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  created_at: string;
  updated_at: string;
  store_id: string;
  orders_count?: number;
  total_spent?: number;
}

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { profile } = useAuth();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("useCustomers: Buscando clientes...");

      let query = supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      // Se não for superadmin, filtrar pela loja do usuário
      if (profile?.role !== "superadmin" && profile?.store_id) {
        query = query.eq("store_id", profile.store_id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error("Erro ao buscar clientes:", fetchError);
        setError(fetchError.message);
        setCustomers([]);
        return;
      }

      console.log("useCustomers: Clientes encontrados:", data?.length);
      setCustomers(data || []);
    } catch (error) {
      console.error("Erro inesperado ao buscar clientes:", error);
      setError(error instanceof Error ? error.message : "Erro desconhecido");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar clientes baseado no termo de busca
  const filteredCustomers = customers.filter((customer) => {
    const search = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(search) ||
      customer.phone.includes(search) ||
      customer.email?.toLowerCase().includes(search)
    );
  });

  // Carregar clientes ao montar o componente
  useEffect(() => {
    if (profile) {
      fetchCustomers();
    }
  }, [profile]);

  return {
    customers: filteredCustomers,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    fetchCustomers,
  };
};
