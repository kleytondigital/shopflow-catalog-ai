
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useEditorStore } from '../../stores/useEditorStore';
import { TemplateSelector } from '../TemplateSelector';

const GlobalSettings: React.FC = () => {
  const { configuration, updateConfiguration } = useEditorStore();

  return (
    <div className="space-y-6">
      {/* Template Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Template</CardTitle>
        </CardHeader>
        <CardContent>
          <TemplateSelector />
        </CardContent>
      </Card>

      {/* Tipografia */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Tipografia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Família da Fonte</Label>
            <Select 
              value={configuration.global.fontFamily} 
              onValueChange={(value) => updateConfiguration('global.fontFamily', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
                <SelectItem value="Poppins, sans-serif">Poppins</SelectItem>
                <SelectItem value="Montserrat, sans-serif">Montserrat</SelectItem>
                <SelectItem value="Open Sans, sans-serif">Open Sans</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tamanho da Fonte - Pequeno: {configuration.global.fontSize.small}px</Label>
            <Slider
              value={[configuration.global.fontSize.small]}
              onValueChange={([value]) => updateConfiguration('global.fontSize.small', value)}
              min={10}
              max={16}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Tamanho da Fonte - Médio: {configuration.global.fontSize.medium}px</Label>
            <Slider
              value={[configuration.global.fontSize.medium]}
              onValueChange={([value]) => updateConfiguration('global.fontSize.medium', value)}
              min={14}
              max={24}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Tamanho da Fonte - Grande: {configuration.global.fontSize.large}px</Label>
            <Slider
              value={[configuration.global.fontSize.large]}
              onValueChange={([value]) => updateConfiguration('global.fontSize.large', value)}
              min={20}
              max={36}
              step={1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Layout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Espaçamento: {configuration.global.layoutSpacing}px</Label>
            <Slider
              value={[configuration.global.layoutSpacing]}
              onValueChange={([value]) => updateConfiguration('global.layoutSpacing', value)}
              min={8}
              max={32}
              step={4}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Raio da Borda: {configuration.global.borderRadius}px</Label>
            <Slider
              value={[configuration.global.borderRadius]}
              onValueChange={([value]) => updateConfiguration('global.borderRadius', value)}
              min={0}
              max={24}
              step={2}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Espaçamento Pequeno: {configuration.global.spacing.small}px</Label>
            <Slider
              value={[configuration.global.spacing.small]}
              onValueChange={([value]) => updateConfiguration('global.spacing.small', value)}
              min={4}
              max={16}
              step={2}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Espaçamento Médio: {configuration.global.spacing.medium}px</Label>
            <Slider
              value={[configuration.global.spacing.medium]}
              onValueChange={([value]) => updateConfiguration('global.spacing.medium', value)}
              min={8}
              max={24}
              step={2}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Espaçamento Grande: {configuration.global.spacing.large}px</Label>
            <Slider
              value={[configuration.global.spacing.large]}
              onValueChange={([value]) => updateConfiguration('global.spacing.large', value)}
              min={16}
              max={48}
              step={4}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalSettings;
