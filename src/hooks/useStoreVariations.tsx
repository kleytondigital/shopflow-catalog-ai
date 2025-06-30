import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

// Interfaces para variações da loja
export interface StoreVariationGroup {
  id: string;
  store_id: string;
  master_group_id?: string;
  name: string;
  description?: string;
  attribute_key: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface StoreVariationValue {
  id: string;
  store_id: string;
  group_id: string;
  master_value_id?: string;
  value: string;
  hex_color?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useStoreVariations = () => {
  const [groups, setGroups] = useState<StoreVariationGroup[]>([]);
  const [values, setValues] = useState<StoreVariationValue[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { profile } = useAuth();

  const fetchGroups = async () => {
    if (!profile?.store_id) return;

    try {
      const { data, error } = await supabase
        .from("store_variation_groups")
        .select("*")
        .eq("store_id", profile.store_id)
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error("Erro ao buscar grupos de variação da loja:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os grupos de variação",
        variant: "destructive",
      });
    }
  };

  const fetchValues = async () => {
    if (!profile?.store_id) return;

    try {
      const { data, error } = await supabase
        .from("store_variation_values")
        .select("*")
        .eq("store_id", profile.store_id)
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      setValues(data || []);
    } catch (error) {
      console.error("Erro ao buscar valores de variação da loja:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os valores de variação",
        variant: "destructive",
      });
    }
  };

  const createGroup = async (
    groupData: Omit<
      StoreVariationGroup,
      "id" | "created_at" | "updated_at" | "store_id"
    >
  ) => {
    if (!profile?.store_id) {
      toast({
        title: "Erro",
        description: "Store ID não encontrado",
        variant: "destructive",
      });
      return { success: false, error: "no_store_id" };
    }

    try {
      const { data, error } = await supabase
        .from("store_variation_groups")
        .insert({
          ...groupData,
          store_id: profile.store_id,
        })
        .select()
        .single();

      if (error) {
        console.error("Erro ao criar grupo da loja:", error);

        if (error.code === "23505") {
          // Unique violation
          toast({
            title: "Erro",
            description: `Já existe um grupo "${groupData.attribute_key}" nesta loja`,
            variant: "destructive",
          });
          return { success: false, error: "duplicate_group" };
        }

        throw error;
      }

      setGroups((prev) =>
        [...prev, data].sort((a, b) => a.display_order - b.display_order)
      );

      toast({
        title: "Sucesso",
        description: "Grupo criado com sucesso",
      });

      return { success: true, data };
    } catch (error) {
      console.error("Erro ao criar grupo da loja:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o grupo",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const createValue = async (
    valueData: Omit<
      StoreVariationValue,
      "id" | "created_at" | "updated_at" | "store_id"
    >
  ) => {
    if (!profile?.store_id) {
      toast({
        title: "Erro",
        description: "Store ID não encontrado",
        variant: "destructive",
      });
      return { success: false, error: "no_store_id" };
    }

    try {
      const { data, error } = await supabase
        .from("store_variation_values")
        .insert({
          ...valueData,
          store_id: profile.store_id,
        })
        .select()
        .single();

      if (error) {
        console.error("Erro ao criar valor da loja:", error);

        if (error.code === "23505") {
          // Unique violation
          toast({
            title: "Erro",
            description: `O valor "${valueData.value}" já existe neste grupo`,
            variant: "destructive",
          });
          return { success: false, error: "duplicate_value" };
        }

        throw error;
      }

      setValues((prev) =>
        [...prev, data].sort((a, b) => a.display_order - b.display_order)
      );

      toast({
        title: "Sucesso",
        description: "Valor criado com sucesso",
      });

      return { success: true, data };
    } catch (error) {
      console.error("Erro ao criar valor da loja:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o valor",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const updateGroup = async (
    id: string,
    groupData: Partial<StoreVariationGroup>
  ) => {
    try {
      const { data, error } = await supabase
        .from("store_variation_groups")
        .update(groupData)
        .eq("id", id)
        .eq("store_id", profile?.store_id) // Garantir que só atualiza da própria loja
        .select()
        .single();

      if (error) throw error;

      setGroups((prev) =>
        prev
          .map((group) => (group.id === id ? data : group))
          .sort((a, b) => a.display_order - b.display_order)
      );

      toast({
        title: "Sucesso",
        description: "Grupo atualizado com sucesso",
      });

      return { success: true, data };
    } catch (error) {
      console.error("Erro ao atualizar grupo da loja:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o grupo",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const updateValue = async (
    id: string,
    valueData: Partial<StoreVariationValue>
  ) => {
    try {
      const { data, error } = await supabase
        .from("store_variation_values")
        .update(valueData)
        .eq("id", id)
        .eq("store_id", profile?.store_id) // Garantir que só atualiza da própria loja
        .select()
        .single();

      if (error) throw error;

      setValues((prev) =>
        prev
          .map((value) => (value.id === id ? data : value))
          .sort((a, b) => a.display_order - b.display_order)
      );

      toast({
        title: "Sucesso",
        description: "Valor atualizado com sucesso",
      });

      return { success: true, data };
    } catch (error) {
      console.error("Erro ao atualizar valor da loja:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o valor",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const deleteGroup = async (id: string) => {
    try {
      const { error } = await supabase
        .from("store_variation_groups")
        .delete()
        .eq("id", id)
        .eq("store_id", profile?.store_id); // Garantir que só deleta da própria loja

      if (error) throw error;

      setGroups((prev) => prev.filter((group) => group.id !== id));
      setValues((prev) => prev.filter((value) => value.group_id !== id));

      toast({
        title: "Sucesso",
        description: "Grupo removido com sucesso",
      });

      return { success: true };
    } catch (error) {
      console.error("Erro ao deletar grupo da loja:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o grupo",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const deleteValue = async (id: string) => {
    try {
      const { error } = await supabase
        .from("store_variation_values")
        .delete()
        .eq("id", id)
        .eq("store_id", profile?.store_id); // Garantir que só deleta da própria loja

      if (error) throw error;

      setValues((prev) => prev.filter((value) => value.id !== id));

      toast({
        title: "Sucesso",
        description: "Valor removido com sucesso",
      });

      return { success: true };
    } catch (error) {
      console.error("Erro ao deletar valor da loja:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o valor",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const getValuesByGroup = (groupId: string) => {
    return values.filter(
      (value) => value.group_id === groupId && value.is_active
    );
  };

  // Função para inicializar variações da loja baseadas nas globais
  const initializeFromGlobalVariations = async () => {
    if (!profile?.store_id) return { success: false, error: "no_store_id" };

    try {
      // Buscar grupos globais
      const { data: globalGroups, error: groupsError } = await supabase
        .from("variation_master_groups")
        .select("*")
        .eq("is_active", true);

      if (groupsError) throw groupsError;

      // Buscar valores globais
      const { data: globalValues, error: valuesError } = await supabase
        .from("variation_master_values")
        .select("*")
        .eq("is_active", true);

      if (valuesError) throw valuesError;

      // Criar grupos da loja
      for (const globalGroup of globalGroups || []) {
        await createGroup({
          master_group_id: globalGroup.id,
          name: globalGroup.name,
          description: globalGroup.description,
          attribute_key: globalGroup.attribute_key,
          is_active: true,
          display_order: globalGroup.display_order,
        });
      }

      // Aguardar um pouco para os grupos serem criados
      await fetchGroups();

      // Criar valores da loja
      for (const globalValue of globalValues || []) {
        const storeGroup = groups.find(
          (g) => g.master_group_id === globalValue.group_id
        );
        if (storeGroup) {
          await createValue({
            group_id: storeGroup.id,
            master_value_id: globalValue.id,
            value: globalValue.value,
            hex_color: globalValue.hex_color,
            is_active: true,
            display_order: globalValue.display_order,
          });
        }
      }

      toast({
        title: "Sucesso",
        description: "Variações inicializadas com base nos padrões globais",
      });

      return { success: true };
    } catch (error) {
      console.error("Erro ao inicializar variações da loja:", error);
      toast({
        title: "Erro",
        description: "Não foi possível inicializar as variações",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!profile?.store_id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      await Promise.all([fetchGroups(), fetchValues()]);
      setLoading(false);
    };

    loadData();
  }, [profile?.store_id]);

  // Inicializar variações automaticamente se a loja não tiver nenhum grupo
  useEffect(() => {
    const autoInitialize = async () => {
      if (!loading && profile?.store_id && groups.length === 0) {
        console.log(
          "🔄 Nenhum grupo de variação encontrado para a loja. Inicializando automaticamente..."
        );

        // Verificar se há grupos globais antes de inicializar
        const { data: globalGroups } = await supabase
          .from("variation_master_groups")
          .select("id")
          .eq("is_active", true)
          .limit(1);

        if (globalGroups && globalGroups.length > 0) {
          await initializeFromGlobalVariations();
        }
      }
    };

    autoInitialize();
  }, [loading, profile?.store_id, groups.length]);

  // Inicializar variações automaticamente se a loja não tiver nenhum grupo
  useEffect(() => {
    const autoInitialize = async () => {
      if (!loading && profile?.store_id && groups.length === 0) {
        console.log(
          "🔄 Nenhum grupo de variação encontrado para a loja. Inicializando automaticamente..."
        );

        // Verificar se há grupos globais antes de inicializar
        const { data: globalGroups } = await supabase
          .from("variation_master_groups")
          .select("id")
          .eq("is_active", true)
          .limit(1);

        if (globalGroups && globalGroups.length > 0) {
          await initializeFromGlobalVariations();
        }
      }
    };

    autoInitialize();
  }, [loading, profile?.store_id, groups.length]);

  return {
    groups: groups.filter((g) => g.is_active),
    values,
    loading,
    createGroup,
    updateGroup,
    deleteGroup,
    createValue,
    updateValue,
    deleteValue,
    getValuesByGroup,
    initializeFromGlobalVariations,
    refetch: () => Promise.all([fetchGroups(), fetchValues()]),
  };
};
