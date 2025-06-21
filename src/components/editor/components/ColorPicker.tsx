
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  const [tempColor, setTempColor] = useState(color);

  const presetColors = [
    '#0057FF', '#FF6F00', '#8E2DE2', '#10B981', '#F59E0B',
    '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316',
    '#EC4899', '#6366F1', '#14B8A6', '#F43F5E', '#3B82F6'
  ];

  const handleColorChange = (newColor: string) => {
    setTempColor(newColor);
    onChange(newColor);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full h-9 px-3 justify-start"
        >
          <div
            className="w-4 h-4 rounded border mr-2"
            style={{ backgroundColor: color }}
          />
          {color}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4">
        <div className="space-y-4">
          {/* Input direto da cor */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Código da Cor</label>
            <Input
              value={tempColor}
              onChange={(e) => handleColorChange(e.target.value)}
              placeholder="#000000"
            />
          </div>

          {/* Cores pré-definidas */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Cores Sugeridas</label>
            <div className="grid grid-cols-5 gap-2">
              {presetColors.map((presetColor) => (
                <button
                  key={presetColor}
                  className="w-8 h-8 rounded border-2 hover:scale-110 transition-transform"
                  style={{ 
                    backgroundColor: presetColor,
                    borderColor: color === presetColor ? '#000' : '#e5e7eb'
                  }}
                  onClick={() => handleColorChange(presetColor)}
                />
              ))}
            </div>
          </div>

          {/* Color picker nativo */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Seletor de Cor</label>
            <input
              type="color"
              value={tempColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-full h-10 rounded border cursor-pointer"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColorPicker;
