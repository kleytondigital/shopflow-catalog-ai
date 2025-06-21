
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useUnifiedEditor } from '@/hooks/useUnifiedEditor';
import ColorPicker from '../ColorPicker';
import ThemedSwitch from '../ThemedSwitch';

const FooterSettings: React.FC = () => {
  const { configuration, updateConfiguration } = useUnifiedEditor();

  const updateFooterConfig = (updates: any) => {
    updateConfiguration({
      footer: {
        ...configuration.footer,
        ...updates
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configurações do Footer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Ativar/Desativar Footer */}
          <div className="flex items-center justify-between">
            <Label htmlFor="footer-enabled">Mostrar Footer</Label>
            <ThemedSwitch
              id="footer-enabled"
              checked={configuration.sections.footer}
              onCheckedChange={(enabled) => 
                updateConfiguration({
                  sections: {
                    ...configuration.sections,
                    footer: enabled
                  }
                })
              }
            />
          </div>

          {configuration.sections.footer && (
            <>
              {/* Cores do Footer */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cor de Fundo</Label>
                  <ColorPicker
                    color={configuration.footer?.backgroundColor || '#1E293B'}
                    onChange={(color) => updateFooterConfig({ backgroundColor: color })}
                  />
                </div>
                <div>
                  <Label>Cor do Texto</Label>
                  <ColorPicker
                    color={configuration.footer?.textColor || '#FFFFFF'}
                    onChange={(color) => updateFooterConfig({ textColor: color })}
                  />
                </div>
              </div>

              {/* Informações a Mostrar */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Informações a Mostrar</Label>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-contact">Informações de Contato</Label>
                  <ThemedSwitch
                    id="show-contact"
                    checked={configuration.footer?.showContact !== false}
                    onCheckedChange={(show) => updateFooterConfig({ showContact: show })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-social">Redes Sociais</Label>
                  <ThemedSwitch
                    id="show-social"
                    checked={configuration.footer?.showSocial !== false}
                    onCheckedChange={(show) => updateFooterConfig({ showSocial: show })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-links">Links Rápidos</Label>
                  <ThemedSwitch
                    id="show-links"
                    checked={configuration.footer?.showQuickLinks !== false}
                    onCheckedChange={(show) => updateFooterConfig({ showQuickLinks: show })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-business-hours">Horário de Funcionamento</Label>
                  <ThemedSwitch
                    id="show-business-hours"
                    checked={configuration.footer?.showBusinessHours !== false}
                    onCheckedChange={(show) => updateFooterConfig({ showBusinessHours: show })}
                  />
                </div>
              </div>

              {/* Texto Customizado */}
              <div>
                <Label htmlFor="footer-text">Texto Personalizado</Label>
                <Input
                  id="footer-text"
                  placeholder="Ex: Sua loja online com os melhores produtos"
                  value={configuration.footer?.customText || ''}
                  onChange={(e) => updateFooterConfig({ customText: e.target.value })}
                />
              </div>

              {/* Copyright */}
              <div>
                <Label htmlFor="copyright-text">Copyright</Label>
                <Input
                  id="copyright-text"
                  placeholder="Ex: © 2024 Minha Loja. Todos os direitos reservados."
                  value={configuration.footer?.copyrightText || ''}
                  onChange={(e) => updateFooterConfig({ copyrightText: e.target.value })}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FooterSettings;
