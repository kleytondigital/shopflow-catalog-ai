import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Monitor, Zap, Sparkles, Crown, Settings } from 'lucide-react';

interface TemplateSettingsCardProps {
  templates: any[];
  selectedTemplate: string;
  onTemplateChange: (value: string) => void;
}

const TemplateSettingsCard: React.FC<TemplateSettingsCardProps> = ({
  templates,
  selectedTemplate,
  onTemplateChange
}) => {
  const getTemplateIcon = (value: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      modern: <Monitor className="h-5 w-5" />,
      minimal: <Zap className="h-5 w-5" />,
      minimal_clean: <Sparkles className="h-5 w-5" />,
      elegant: <Crown className="h-5 w-5" />,
      industrial: <Settings className="h-5 w-5" />,
    };
    return iconMap[value] || <Monitor className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Template do Catálogo</CardTitle>
          <CardDescription>
            Escolha o template visual que melhor representa sua marca. O template será aplicado a todo o catálogo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Template Selector */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Template Atual
            </label>
            <Select value={selectedTemplate} onValueChange={onTemplateChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.value} value={template.value}>
                    <div className="flex items-center gap-2">
                      {getTemplateIcon(template.value)}
                      <span>{template.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Template Preview */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {templates.map((template) => (
              <button
                key={template.value}
                onClick={() => onTemplateChange(template.value)}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${selectedTemplate === template.value 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-primary">
                    {getTemplateIcon(template.value)}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{template.label}</div>
                    <div className="text-xs text-gray-600">{template.description}</div>
                  </div>
                </div>

                {/* Color Palette Preview */}
                <div className="flex gap-1 mb-2">
                  {template.colors.map((color: string, index: number) => (
                    <div
                      key={index}
                      className="w-full h-3 rounded"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                {/* Features */}
                <ul className="text-xs text-gray-600 space-y-1">
                  {template.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center gap-1">
                      <span className="text-primary">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateSettingsCard;
