
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, EyeOff, Calendar, Package, GripVertical } from 'lucide-react';
import { Banner } from '@/hooks/useBanners';

interface SortableBannerItemProps {
  banner: Banner;
  onEdit: (banner: Banner) => void;
  onDelete: (id: string) => void;
  getBannerTypeLabel: (type: string) => string;
  getBannerTypeColor: (type: string) => string;
}

const SortableBannerItem: React.FC<SortableBannerItemProps> = ({
  banner,
  onEdit,
  onDelete,
  getBannerTypeLabel,
  getBannerTypeColor
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: banner.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 border rounded-lg bg-white ${
        isDragging ? 'shadow-lg z-50' : 'hover:shadow-md'
      } transition-shadow`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      {/* Banner Image */}
      <div className="w-24 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
        <img
          src={banner.image_url}
          alt={banner.title}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Banner Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h4 className="font-semibold truncate">{banner.title}</h4>
          <Badge className={getBannerTypeColor(banner.banner_type)}>
            {getBannerTypeLabel(banner.banner_type)}
          </Badge>
          {banner.source_type === 'product' && (
            <Badge variant="outline" className="text-purple-600 border-purple-200">
              <Package className="h-3 w-3 mr-1" />
              Produto
            </Badge>
          )}
          {banner.is_active ? (
            <Badge className="bg-green-100 text-green-800">
              <Eye className="h-3 w-3 mr-1" />
              Ativo
            </Badge>
          ) : (
            <Badge className="bg-gray-100 text-gray-800">
              <EyeOff className="h-3 w-3 mr-1" />
              Inativo
            </Badge>
          )}
        </div>
        
        {banner.description && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{banner.description}</p>
        )}
        
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>Posição: {banner.position}</span>
          <span>Ordem: {banner.display_order}</span>
          {banner.start_date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(banner.start_date).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEdit(banner)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDelete(banner.id)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SortableBannerItem;
