import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const useBannerUpload = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const uploadBannerImage = async (file: File): Promise<string | null> => {
    if (!profile?.store_id) {
      toast({
        title: "Erro",
        description: "Store ID não encontrado",
        variant: "destructive",
      });
      return null;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione apenas imagens",
        variant: "destructive",
      });
      return null;
    }

    try {
      setUploading(true);

      // Sanitizar nome do arquivo (remover caracteres especiais, acentos e espaços)
      const sanitizeFileName = (name: string): string => {
        return name
          .normalize("NFD") // Decompor caracteres acentuados
          .replace(/[\u0300-\u036f]/g, "") // Remover diacríticos
          .replace(/[^a-zA-Z0-9.-]/g, "_") // Substituir caracteres especiais por _
          .replace(/_+/g, "_") // Remover underscores duplos
          .replace(/^_|_$/g, ""); // Remover underscores do início e fim
      };

      // Upload para o bucket banners
      const sanitizedFileName = sanitizeFileName(file.name);
      const fileExtension = sanitizedFileName.split(".").pop() || "jpg";
      const timestamp = Date.now();
      const fileName = `${profile.store_id}/${timestamp}-${
        sanitizedFileName.split(".")[0]
      }.${fileExtension}`;

      const { data, error } = await supabase.storage
        .from("banners")
        .upload(fileName, file);

      if (error) throw error;

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from("banners")
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível carregar a imagem",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadBannerImage,
    uploading,
  };
};
