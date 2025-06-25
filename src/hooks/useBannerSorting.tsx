
import { useState } from 'react';
import { useBanners, Banner } from '@/hooks/useBanners';
import { useToast } from '@/hooks/use-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export const useBannerSorting = () => {
  const { banners, updateBanner } = useBanners();
  const { toast } = useToast();
  const [isReordering, setIsReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = banners.findIndex((banner) => banner.id === active.id);
    const newIndex = banners.findIndex((banner) => banner.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    try {
      setIsReordering(true);
      
      // Reordenar array localmente
      const reorderedBanners = arrayMove(banners, oldIndex, newIndex);
      
      // Atualizar display_order no banco para todos os banners afetados
      const updatePromises = reorderedBanners.map((banner, index) => 
        updateBanner(banner.id, { display_order: index })
      );

      await Promise.all(updatePromises);

      toast({
        title: 'Ordem dos banners atualizada!',
        description: 'A nova ordem foi salva com sucesso.',
      });

    } catch (error) {
      console.error('Error reordering banners:', error);
      toast({
        title: 'Erro ao reordenar banners',
        description: 'Não foi possível salvar a nova ordem.',
        variant: 'destructive',
      });
    } finally {
      setIsReordering(false);
    }
  };

  return {
    sensors,
    isReordering,
    handleDragEnd,
    DndContext,
    SortableContext,
    verticalListSortingStrategy,
    closestCenter,
  };
};
