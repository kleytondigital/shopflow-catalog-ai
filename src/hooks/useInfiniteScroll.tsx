import { useState, useCallback, useRef, useEffect } from "react";

interface UseInfiniteScrollProps<T> {
  items: T[];
  itemsPerPage?: number;
  threshold?: number;
  autoLoad?: boolean;
}

interface UseInfiniteScrollReturn<T> {
  visibleItems: T[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  loadMoreRef: (node: HTMLDivElement | null) => void;
  resetPagination: () => void;
}

export const useInfiniteScroll = <T,>({
  items,
  itemsPerPage = 24,
  threshold = 0.1,
  autoLoad = true,
}: UseInfiniteScrollProps<T>): UseInfiniteScrollReturn<T> => {
  const [visibleCount, setVisibleCount] = useState(itemsPerPage);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    // Simular delay para melhor UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    setVisibleCount((prev) => Math.min(prev + itemsPerPage, items.length));
    setIsLoading(false);
  }, [isLoading, hasMore, itemsPerPage, items.length]);

  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (node && autoLoad && hasMore && !isLoading) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                void loadMore();
              }
            });
          },
          { threshold }
        );

        observerRef.current.observe(node);
      }
    },
    [autoLoad, hasMore, isLoading, loadMore, threshold]
  );

  const resetPagination = useCallback(() => {
    setVisibleCount(itemsPerPage);
    setIsLoading(false);
  }, [itemsPerPage]);

  // Reset paginação quando items mudarem
  useEffect(() => {
    resetPagination();
  }, [items, resetPagination]);

  // Cleanup observer
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    visibleItems,
    isLoading,
    hasMore,
    loadMore,
    loadMoreRef,
    resetPagination,
  };
};
