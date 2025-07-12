import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Edit,
  Trash2,
  Palette,
  Shirt,
  Package,
  Sparkles,
  Save,
  X,
} from "lucide-react";
import { useVariationMasterGroups } from "@/hooks/useVariationMasterGroups";
import VariationGroupCard from "@/components/variations/VariationGroupCard";
import VariationGroupForm from "@/components/variations/VariationGroupForm";
import VariationValueForm from "@/components/variations/VariationValueForm";

const VariationGroups: React.FC = () => {
  const { groups, values, loading, getValuesByGroup } =
    useVariationMasterGroups();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [isGroupFormOpen, setIsGroupFormOpen] = useState(false);
  const [isValueFormOpen, setIsValueFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [editingValue, setEditingValue] = useState<any>(null);
  const [isValuesModalOpen, setIsValuesModalOpen] = useState(false);
  const [editingValueId, setEditingValueId] = useState<string | null>(null);
  const [editingValueData, setEditingValueData] = useState<any>(null);
  // Inicialização de newValueData
  const [newValueData, setNewValueData] = useState({
    value: "",
    hex_color: "",
    grade_sizes: "",
    grade_pairs: "",
  });

  const { updateValue, deleteValue, createValue } = useVariationMasterGroups();

  // Abrir modal ao selecionar grupo
  useEffect(() => {
    if (selectedGroup) setIsValuesModalOpen(true);
  }, [selectedGroup]);

  const handleCloseValuesModal = () => {
    setIsValuesModalOpen(false);
    setSelectedGroup(null);
  };

  const getGroupIcon = (attributeKey: string) => {
    switch (attributeKey) {
      case "color":
        return <Palette className="w-5 h-5" />;
      case "size":
        return <Shirt className="w-5 h-5" />;
      case "material":
        return <Package className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
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

  const handleEditValueInline = (value: any) => {
    setEditingValueId(value.id);
    setEditingValueData({ ...value });
  };

  const handleSaveValueInline = async () => {
    if (editingValueData && editingValueId) {
      if (isGradeGroup) {
        await updateValue(editingValueId, {
          value: editingValueData.value,
          grade_sizes: editingValueData.grade_sizes,
          grade_pairs: editingValueData.grade_pairs,
          is_active: true,
          display_order: 0,
        });
      } else {
        await updateValue(editingValueId, {
          value: editingValueData.value,
          hex_color: editingValueData.hex_color,
          is_active: true,
          display_order: 0,
        });
      }
      setEditingValueId(null);
      setEditingValueData(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingValueId(null);
    setEditingValueData(null);
  };

  const handleAddNewValue = async () => {
    if (newValueData.value && selectedGroup) {
      if (isGradeGroup) {
        // Parse tamanhos
        const sizes = (newValueData.grade_sizes || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        // Parse pares
        let pairs = {};
        if (newValueData.grade_pairs) {
          newValueData.grade_pairs.split(",").forEach((pair) => {
            const [size, qty] = pair.split("=");
            if (size && qty) pairs[size.trim()] = parseInt(qty.trim());
          });
        }
        await createValue({
          group_id: selectedGroup,
          value: newValueData.value,
          grade_sizes: sizes,
          grade_pairs: pairs,
          is_active: true,
          display_order: 0,
        });
        setNewValueData({
          value: "",
          hex_color: "",
          grade_sizes: "",
          grade_pairs: "",
        });
      } else {
        await createValue({
          group_id: selectedGroup,
          value: newValueData.value,
          hex_color: newValueData.hex_color,
          is_active: true,
          display_order: 0,
        });
        setNewValueData({
          value: "",
          hex_color: "",
          grade_sizes: "",
          grade_pairs: "",
        });
      }
    }
  };

  const handleDeleteValue = async (valueId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este valor?")) {
      await deleteValue(valueId);
    }
  };

  const isGradeGroup =
    groups.find((g) => g.id === selectedGroup)?.attribute_key === "grade";

  const gradeModels = [
    {
      name: "Baixa",
      sizes: "33,34,35,36,37,38,39",
      pairs: "33=1,34=2,35=3,36=3,37=3,38=2,39=1",
    },
    {
      name: "Alta",
      sizes: "35,36,37,38,39,40,41,42,43",
      pairs: "35=1,36=2,37=3,38=3,39=3,40=3,41=3,42=2,43=1",
    },
    {
      name: "Masculina",
      sizes: "39,40,41,42,43,44,45,46",
      pairs: "39=1,40=2,41=3,42=3,43=3,44=2,45=1,46=1",
    },
    {
      name: "Feminina",
      sizes: "33,34,35,36,37,38,39",
      pairs: "33=1,34=2,35=3,36=3,37=3,38=3,39=2",
    },
    {
      name: "Infantil",
      sizes: "25,26,27,28,29,30,31,32",
      pairs: "25=1,26=1,27=2,28=2,29=2,30=2,31=1,32=1",
    },
  ];
  const [showGradeModelModal, setShowGradeModelModal] = useState(false);

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
            Gerencie os grupos e valores de variações que podem ser usados nos
            produtos
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
                {editingGroup ? "Editar Grupo" : "Novo Grupo de Variações"}
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
            Valores ({values.filter((v) => v.is_active).length})
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
          {/* Modal de edição de valores da grade */}
          <Dialog open={isValuesModalOpen} onOpenChange={setIsValuesModalOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar valores da grade</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium text-lg">
                    {groups.find((g) => g.id === selectedGroup)?.name}
                  </span>
                  <Button size="sm" onClick={() => setIsValueFormOpen(true)}>
                    <Plus className="w-4 h-4 mr-1" /> Novo valor
                  </Button>
                </div>

                {/* Adicionar novo valor inline */}
                <Card className="border-dashed">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Input
                        placeholder="Novo valor..."
                        value={newValueData.value ?? ""}
                        onChange={(e) =>
                          setNewValueData({
                            ...newValueData,
                            value: e.target.value,
                          })
                        }
                        className="flex-1"
                      />
                      <Input
                        type="color"
                        value={newValueData.hex_color ?? ""}
                        onChange={(e) =>
                          setNewValueData({
                            ...newValueData,
                            hex_color: e.target.value,
                          })
                        }
                        className="w-12 h-10"
                      />
                      <Button
                        size="sm"
                        onClick={handleAddNewValue}
                        disabled={!newValueData.value}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {isGradeGroup && (
                  <Card className="border-dashed mb-4">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-2">
                        <Label>Nome da Grade</Label>
                        <Input
                          placeholder="Ex: Baixa, Alta, Masculina"
                          value={newValueData.value ?? ""}
                          onChange={(e) =>
                            setNewValueData({
                              ...newValueData,
                              value: e.target.value,
                            })
                          }
                        />
                        <Label className="mt-2">
                          Tamanhos da Grade (separados por vírgula)
                        </Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            placeholder="Ex: 33,34,35,36,37,38"
                            value={newValueData.grade_sizes ?? ""}
                            onChange={(e) =>
                              setNewValueData({
                                ...newValueData,
                                grade_sizes: e.target.value,
                              })
                            }
                            inputMode="text"
                            pattern="[0-9,]*"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowGradeModelModal(true)}
                          >
                            Gerar tamanhos e pares
                          </Button>
                        </div>
                        <Label className="mt-2">
                          Pares por Tamanho (opcional, ex: 33=1,34=2,35=3)
                        </Label>
                        <Input
                          placeholder="Ex: 33=1,34=2,35=3"
                          value={newValueData.grade_pairs ?? ""}
                          onChange={(e) =>
                            setNewValueData({
                              ...newValueData,
                              grade_pairs: e.target.value,
                            })
                          }
                        />
                        <Button
                          size="sm"
                          className="mt-2"
                          onClick={async () => {
                            // Parse tamanhos
                            const sizes = (newValueData.grade_sizes || "")
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean);
                            // Parse pares
                            let pairs = {};
                            if (newValueData.grade_pairs) {
                              newValueData.grade_pairs
                                .split(",")
                                .forEach((pair) => {
                                  const [size, qty] = pair.split("=");
                                  if (size && qty)
                                    pairs[size.trim()] = parseInt(qty.trim());
                                });
                            }
                            await createValue({
                              group_id: selectedGroup,
                              value: newValueData.value,
                              grade_sizes: sizes,
                              grade_pairs: pairs,
                              is_active: true,
                              display_order: 0,
                            });
                            setNewValueData({
                              value: "",
                              grade_sizes: "",
                              grade_pairs: "",
                            });
                          }}
                          disabled={
                            !newValueData.value || !newValueData.grade_sizes
                          }
                        >
                          <Plus className="w-4 h-4" /> Cadastrar Grade
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Lista de valores existentes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {values
                    .filter((v) => v.group_id === selectedGroup && v.is_active)
                    .map((value) => (
                      <Card
                        key={value.id}
                        className="hover:shadow transition-shadow"
                      >
                        <CardContent className="p-3">
                          {editingValueId === value.id ? (
                            // Modo edição
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Input
                                  value={editingValueData?.value ?? ""}
                                  onChange={(e) =>
                                    setEditingValueData({
                                      ...editingValueData,
                                      value: e.target.value,
                                    })
                                  }
                                  className="flex-1"
                                />
                                <Input
                                  type="color"
                                  value={editingValueData?.hex_color ?? ""}
                                  onChange={(e) =>
                                    setEditingValueData({
                                      ...editingValueData,
                                      hex_color: e.target.value,
                                    })
                                  }
                                  className="w-10 h-8"
                                />
                              </div>
                              {isGradeGroup && (
                                <>
                                  <Label className="mt-2">
                                    Tamanhos da Grade (separados por vírgula)
                                  </Label>
                                  <Input
                                    placeholder="Ex: 33,34,35,36,37,38"
                                    value={
                                      editingValueData?.grade_sizes
                                        ? Array.isArray(
                                            editingValueData.grade_sizes
                                          )
                                          ? editingValueData.grade_sizes.join(
                                              ","
                                            )
                                          : editingValueData.grade_sizes
                                        : ""
                                    }
                                    onChange={(e) =>
                                      setEditingValueData({
                                        ...editingValueData,
                                        grade_sizes: e.target.value
                                          .split(",")
                                          .map((s) => s.trim())
                                          .filter(Boolean),
                                      })
                                    }
                                  />
                                  <Label className="mt-2">
                                    Pares por Tamanho (opcional, ex:
                                    33=1,34=2,35=3)
                                  </Label>
                                  <Input
                                    placeholder="Ex: 33=1,34=2,35=3"
                                    value={
                                      editingValueData?.grade_pairs
                                        ? typeof editingValueData.grade_pairs ===
                                          "string"
                                          ? editingValueData.grade_pairs
                                          : Object.entries(
                                              editingValueData.grade_pairs
                                            )
                                              .map(
                                                ([size, qty]) =>
                                                  `${size}=${qty}`
                                              )
                                              .join(",")
                                        : ""
                                    }
                                    onChange={(e) => {
                                      let pairs = {};
                                      e.target.value
                                        .split(",")
                                        .forEach((pair) => {
                                          const [size, qty] = pair.split("=");
                                          if (size && qty)
                                            pairs[size.trim()] = parseInt(
                                              qty.trim()
                                            );
                                        });
                                      setEditingValueData({
                                        ...editingValueData,
                                        grade_pairs: pairs,
                                      });
                                    }}
                                  />
                                </>
                              )}
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={handleSaveValueInline}
                                >
                                  <Save className="w-3 h-3 mr-1" /> Salvar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                >
                                  <X className="w-3 h-3 mr-1" /> Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // Modo visualização
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {value.hex_color && (
                                  <div
                                    className="w-4 h-4 rounded-full border"
                                    style={{ backgroundColor: value.hex_color }}
                                  />
                                )}
                                <span className="font-medium">
                                  {value.value}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditValueInline(value)}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteValue(value.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                          {isGradeGroup && value.grade_sizes && (
                            <div className="text-xs text-gray-500 mt-1">
                              Tamanhos: {value.grade_sizes.join(", ")}
                              {value.grade_pairs && (
                                <span>
                                  {" "}
                                  | Pares:{" "}
                                  {Object.entries(value.grade_pairs)
                                    .map(([size, qty]) => `${size}=${qty}`)
                                    .join(", ")}
                                </span>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </div>
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={handleCloseValuesModal}
                >
                  Fechar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="values" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Label>Filtrar por grupo:</Label>
              <select
                value={selectedGroup || ""}
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
                    {editingValue ? "Editar Valor" : "Novo Valor de Variação"}
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
              .filter(
                (value) =>
                  value.is_active &&
                  (!selectedGroup || value.group_id === selectedGroup)
              )
              .map((value) => {
                const group = groups.find((g) => g.id === value.group_id);
                return (
                  <Card
                    key={value.id}
                    className="hover:shadow-md transition-shadow"
                  >
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
      {/* Modal de modelos de grade */}
      <Dialog open={showGradeModelModal} onOpenChange={setShowGradeModelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modelos de Grade</DialogTitle>
            <DialogDescription>
              Selecione um modelo para preencher automaticamente os tamanhos e
              pares.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {gradeModels.map((model) => (
              <Button
                key={model.name}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setNewValueData({
                    ...newValueData,
                    grade_sizes: model.sizes,
                    grade_pairs: model.pairs,
                    hex_color: newValueData.hex_color || "",
                  });
                  setShowGradeModelModal(false);
                }}
              >
                {model.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VariationGroups;
