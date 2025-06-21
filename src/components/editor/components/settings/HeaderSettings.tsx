
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useEditorStore } from '../../stores/useEditorStore';
import ColorPicker from '../ColorPicker';

const HeaderSettings: React.FC = () => {
  const { configuration, updateConfiguration } = useEditorStore();
  const headerConfig = configuration.header;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Cabeçalho (Header)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Layout do Header */}
        <div className="space-y-2">
          <Label htmlFor="header-layout">Layout</Label>
          <Select
            value={headerConfig.layout}
            onValueChange={(value) => updateConfiguration('header.layout', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Logo à Esquerda</SelectItem>
              <SelectItem value="center">Logo Centralizado</SelectItem>
              <SelectItem value="right">Logo à Direita</SelectItem>
              <SelectItem value="split">Logo e Menu Separados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Posição do Logo */}
        <div className="space-y-2">
          <Label htmlFor="logo-position">Posição do Logo</Label>
          <Select
            value={headerConfig.logoPosition}
            onValueChange={(value) => updateConfiguration('header.logoPosition', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Esquerda</SelectItem>
              <SelectItem value="center">Centro</SelectItem>
              <SelectItem value="right">Direita</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Cores */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Cor de Fundo</Label>
            <ColorPicker
              color={headerConfig.backgroundColor}
              onChange={(color) => updateConfiguration('header.backgroundColor', color)}
            />
          </div>
          <div className="space-y-2">
            <Label>Cor do Texto</Label>
            <ColorPicker
              color={headerConfig.textColor}
              onChange={(color) => updateConfiguration('header.textColor', color)}
            />
          </div>
        </div>

        {/* Slogan */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-slogan">Mostrar Slogan</Label>
            <Switch
              id="show-slogan"
              checked={headerConfig.showSlogan}
              onCheckedChange={(checked) => updateConfiguration('header.showSlogan', checked)}
            />
          </div>
          {headerConfig.showSlogan && (
            <Input
              placeholder="Digite o slogan"
              value={headerConfig.slogan}
              onChange={(e) => updateConfiguration('header.slogan', e.target.value)}
            />
          )}
        </div>

        {/* Barra de Busca */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-search">Mostrar Busca</Label>
            <Switch
              id="show-search"
              checked={headerConfig.showSearchBar}
              onCheckedChange={(checked) => updateConfiguration('header.showSearchBar', checked)}
            />
          </div>
          {headerConfig.showSearchBar && (
            <Select
              value={headerConfig.searchBarPosition}
              onValueChange={(value) => updateConfiguration('header.searchBarPosition', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="header">No Header</SelectItem>
                <SelectItem value="below">Abaixo do Header</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Header Fixo */}
        <div className="flex items-center justify-between">
          <Label htmlFor="sticky-header">Header Fixo</Label>
          <Switch
            id="sticky-header"
            checked={headerConfig.isSticky}
            onCheckedChange={(checked) => updateConfiguration('header.isSticky', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default HeaderSettings;
