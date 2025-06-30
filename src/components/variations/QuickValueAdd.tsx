import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useVariationMasterGroups,
  VariationMasterGroup,
} from "@/hooks/useVariationMasterGroups";

interface QuickValueAddProps {
  group: VariationMasterGroup;
  onValueAdded?: () => void;
}

const QuickValueAdd: React.FC<QuickValueAddProps> = ({
  group,
  onValueAdded,
}) => {
  const { createValue } = useVariationMasterGroups();
  const [isOpen, setIsOpen] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [hexColor, setHexColor] = useState("#000000");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue.trim()) return;

    setLoading(true);
    try {
      const valueData = {
        group_id: group.id,
        value: newValue.trim(),
        hex_color: group.attribute_key === "color" ? hexColor : null,
        is_active: true,
        display_order: 999, // Adicionar no final
      };

      const result = await createValue(valueData);
      if (result.success) {
        setNewValue("");
        setHexColor("#000000");
        setIsOpen(false);
        onValueAdded?.();
      } else if (result.error === "feature_unavailable") {
        // Funcionalidade temporariamente indisponível - fechar modal
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Erro ao adicionar valor:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar {group.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="value">Novo valor para {group.name}</Label>
            <Input
              id="value"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder={`Ex: ${
                group.attribute_key === "color"
                  ? "Azul Royal"
                  : group.attribute_key === "size"
                  ? "42"
                  : "Algodão"
              }`}
              required
            />
          </div>

          {group.attribute_key === "color" && (
            <div>
              <Label htmlFor="color">Cor (opcional)</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  value={hexColor}
                  onChange={(e) => setHexColor(e.target.value)}
                  placeholder="#000000"
                />
                <input
                  type="color"
                  value={hexColor}
                  onChange={(e) => setHexColor(e.target.value)}
                  className="w-12 h-10 border rounded"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading || !newValue.trim()}>
              {loading ? "Adicionando..." : "Adicionar"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickValueAdd;
