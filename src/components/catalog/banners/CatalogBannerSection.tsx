import React from "react";
import { useBanners, Banner } from "@/hooks/useBanners";

interface CatalogBannerSectionProps {
  storeId: string;
  bannerType: Banner["banner_type"];
  className?: string;
  compact?: boolean;
}

const CatalogBannerSection: React.FC<CatalogBannerSectionProps> = ({
  storeId,
  bannerType,
  className = "",
  compact = false,
}) => {
  const { banners, loading } = useBanners(storeId, bannerType);

  if (loading || banners.length === 0) {
    return null;
  }

  return (
    <div
      className={`banner-section ${className} ${
        compact ? "compact-banner" : ""
      }`}
    >
      {banners.map((banner) => (
        <div
          key={banner.id}
          className={`banner-item ${compact ? "mb-3" : "mb-6"}`}
        >
          {banner.link_url ? (
            <a
              href={banner.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <img
                src={banner.image_url}
                alt={banner.title}
                className={`w-full ${
                  compact ? "h-24 sm:h-32 md:h-40" : "h-auto"
                } object-cover rounded-lg group-hover:opacity-90 transition-opacity duration-200`}
                loading="lazy"
              />
            </a>
          ) : (
            <img
              src={banner.image_url}
              alt={banner.title}
              className={`w-full ${
                compact ? "h-24 sm:h-32 md:h-40" : "h-auto"
              } object-cover rounded-lg`}
              loading="lazy"
            />
          )}

          {/* Título e descrição removidos - apenas a imagem do banner é exibida */}
        </div>
      ))}
    </div>
  );
};

export default CatalogBannerSection;
