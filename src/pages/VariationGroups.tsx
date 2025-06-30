
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Palette, Shirt, Package, Sparkles } from 'lucide-react';
import { useVariationMasterGroups } from '@/hooks/useVariationMasterGroups';
import VariationGroupCard from '@/components/variations/VariationGroupCard';
import VariationGroupForm from '@/components/variations/VariationGroupForm';
import VariationValueForm from '@/components/variations/VariationValueForm';

const VariationGroups: React.FC = () => {
  const { groups, values, loading, getValuesByGroup } = useVariationMasterGroups();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [isGroupFormOpen, setIsGroupFormOpen] = useState(false);
  const [isValueFormOpen, setIsValueFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [editingValue, setEditingValue] = useState<any>(null);

  const getGroupIcon = (attributeKey: string) => {
    switch (attributeKey) {
      case 'color': return <Palette className="w-5 h-5" />;
      case 'size': return <Shirt className="w-5 h-5" />;
      case 'material': return <Package className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const handleEditGroup = (group: any) => {
    setEditingGroup(group);
    setIsGroupFormOpen(true);
  };

  const handleEditValue = (value: any) => {
    setEditingValue(value);
    setIsValueFormOpen(true);
  };

  const handleCloseGroupForm = () => {
    setIsGroupFormOpen(false);
    setEditingGroup(null);
  };

  const handleCloseValueForm = () => {
    setIsValueFormOpen(false);
    setEditingValue(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Grupos de Variações</h1>
          <p className="text-muted-foreground">
            Gerencie os grupos e valores de variações que podem ser usados nos produtos
          </p>
        </div>
        <Dialog open={isGroupFormOpen} onOpenChange={setIsGroupFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingGroup(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Grupo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingGroup ? 'Editar Grupo' : 'Novo Grupo de Variações'}
              </DialogTitle>
            </DialogHeader>
            <VariationGroupForm
              group={editingGroup}
              onSuccess={handleCloseGroupForm}
              onCancel={handleCloseGroupForm}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="groups" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="groups">Grupos ({groups.length})</TabsTrigger>
          <TabsTrigger value="values">
            Valores ({values.filter(v => v.is_active).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <VariationGroupCard
                key={group.id}
                group={group}
                valuesCount={getValuesByGroup(group.id).length}
                icon={getGroupIcon(group.attribute_key)}
                onEdit={() => handleEditGroup(group)}
                onSelect={() => setSelectedGroup(group.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="values" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Label>Filtrar por grupo:</Label>
              <select
                value={selectedGroup || ''}
                onChange={(e) => setSelectedGroup(e.target.value || null)}
                className="border rounded px-3 py-1"
              >
                <option value="">Todos os grupos</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            <Dialog open={isValueFormOpen} onOpenChange={setIsValueFormOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => setEditingValue(null)}
                  disabled={!selectedGroup}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Valor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingValue ? 'Editar Valor' : 'Novo Valor de Variação'}
                  </DialogTitle>
                </DialogHeader>
                <VariationValueForm
                  value={editingValue}
                  groupId={selectedGroup}
                  groups={groups}
                  onSuccess={handleCloseValueForm}
                  onCancel={handleCloseValueForm}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {values
              .filter(value => 
                value.is_active && 
                (!selectedGroup || value.group_id === selectedGroup)
              )
              .map((value) => {
                const group = groups.find(g => g.id === value.group_id);
                return (
                  <Card key={value.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {value.hex_color && (
                            <div 
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: value.hex_color }}
                            />
                          )}
                          <span className="font-medium">{value.value}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditValue(value)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {group?.name}
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VariationGroups;
