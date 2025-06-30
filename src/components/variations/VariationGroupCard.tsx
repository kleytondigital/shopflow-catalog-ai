
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useVariationMasterGroups, VariationMasterGroup } from '@/hooks/useVariationMasterGroups';

interface VariationGroupCardProps {
  group: VariationMasterGroup;
  valuesCount: number;
  icon: React.ReactNode;
  onEdit: () => void;
  onSelect: () => void;
}

const VariationGroupCard: React.FC<VariationGroupCardProps> = ({
  group,
  valuesCount,
  icon,
  onEdit,
  onSelect
}) => {
  const { deleteGroup } = useVariationMasterGroups();

  const handleDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir o grupo "${group.name}"?`)) {
      await deleteGroup(group.id);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              {icon}
            </div>
            <div>
              <h3 className="font-semibold">{group.name}</h3>
              <p className="text-sm text-muted-foreground">
                {group.attribute_key}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-destructive"
              >
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {group.description && (
          <p className="text-sm text-muted-foreground mb-3">
            {group.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <Badge variant="secondary">
            {valuesCount} valor{valuesCount !== 1 ? 'es' : ''}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={onSelect}
          >
            Ver valores
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VariationGroupCard;
