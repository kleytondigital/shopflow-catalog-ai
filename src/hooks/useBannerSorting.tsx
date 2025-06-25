
import { useState } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useBannerSorting = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = async (
    event: DragEndEvent, 
    banners: any[], 
    setBanners: (banners: any[]) => void,
    refetchBanners?: () => void
  ) => {
    setIsDragging(false);
    
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = banners.findIndex((banner) => banner.id === active.id);
    const newIndex = banners.findIndex((banner) => banner.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Atualização otimista da UI
    const newBanners = arrayMove(banners, oldIndex, newIndex);
    setBanners(newBanners);

    // Salvar no banco
    await saveBannerOrder(newBanners, refetchBanners);
  };

  const saveBannerOrder = async (banners: any[], refetchBanners?: () => void) => {
    setIsSaving(true);
    
    try {
      // Preparar atualizações em lote
      const updates = banners.map((banner, index) => ({
        id: banner.id,
        display_order: index + 1
      }));

      // Executar atualizações em paralelo
      const promises = updates.map(update =>
        supabase
          .from('catalog_banners')
          .update({ display_order: update.display_order })
          .eq('id', update.id)
      );

      const results = await Promise.all(promises);
      
      // Verificar se houve erros
      const errors = results.filter(result => result.error);
      
      if (errors.length > 0) {
        console.error('Erros ao salvar ordem dos banners:', errors);
        throw new Error('Falha ao salvar ordem dos banners');
      }

      // Refetch para garantir sincronização
      if (refetchBanners) {
        setTimeout(() => {
          refetchBanners();
        }, 500);
      }

      toast({
        title: 'Ordem salva!',
        description: 'A ordem dos banners foi atualizada com sucesso.',
      });

    } catch (error) {
      console.error('Erro ao salvar ordem dos banners:', error);
      
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar a nova ordem dos banners.',
        variant: 'destructive',
      });

      // Refetch para reverter mudanças em caso de erro
      if (refetchBanners) {
        refetchBanners();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isDragging,
    isSaving,
    handleDragStart,
    handleDragEnd,
  };
};
