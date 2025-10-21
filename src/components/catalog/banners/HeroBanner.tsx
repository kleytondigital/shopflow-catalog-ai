
import React, { useEffect } from 'react';
import { useBanners } from '@/hooks/useBanners';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';

interface HeroBannerProps {
  storeId: string;
  className?: string;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ storeId, className = '' }) => {
  const { banners, loading } = useBanners(storeId, 'hero');
  const [api, setApi] = React.useState<CarouselApi>();

  // Implementar autoplay usando useEffect
  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [api]);

  if (loading || banners.length === 0) {
    return null;
  }

  // Se há apenas um banner, renderizar diretamente sem carousel
  if (banners.length === 1) {
    const heroBanner = banners[0];
    return (
      <div className={`hero-banner relative ${className}`}>
        {heroBanner.link_url ? (
          <a 
            href={heroBanner.link_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block"
          >
            <div className="relative overflow-hidden rounded-xl">
              <img
                src={heroBanner.image_url}
                alt={heroBanner.title}
                className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover object-center hover:scale-105 transition-transform duration-300"
                loading="eager"
              />
              {/* Título e descrição removidos - apenas a imagem do banner é exibida */}
            </div>
          </a>
        ) : (
          <div className="relative overflow-hidden rounded-xl">
            <img
              src={heroBanner.image_url}
              alt={heroBanner.title}
              className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover object-center"
              loading="eager"
            />
            {/* Título e descrição removidos - apenas a imagem do banner é exibida */}
          </div>
        )}
      </div>
    );
  }

  // Se há múltiplos banners, usar carousel com autoplay
  return (
    <div className={`hero-banner relative ${className}`}>
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {banners.map((banner, index) => (
            <CarouselItem key={banner.id}>
              {banner.link_url ? (
                <a 
                  href={banner.link_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover object-center hover:scale-105 transition-transform duration-300"
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                    {/* Título e descrição removidos - apenas a imagem do banner é exibida */}
                  </div>
                </a>
              ) : (
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    src={banner.image_url}
                    alt={banner.title}
                    className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover object-center"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                  {/* Título e descrição removidos - apenas a imagem do banner é exibida */}
                </div>
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Botões de navegação - ocultos no mobile */}
        <CarouselPrevious className="hidden sm:flex left-4 bg-white/20 border-white/30 text-white hover:bg-white/30 hover:text-white" />
        <CarouselNext className="hidden sm:flex right-4 bg-white/20 border-white/30 text-white hover:bg-white/30 hover:text-white" />
        
        {/* Indicadores de pontos */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          {banners.map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full bg-white/60 transition-colors duration-200"
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
};

export default HeroBanner;
