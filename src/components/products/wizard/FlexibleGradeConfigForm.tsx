/**
 * Formulário de Configuração de Grade Flexível
 * 
 * Permite ao gestor configurar múltiplas formas de venda de grades:
 * - Grade Completa
 * - Meia Grade  
 * - Mesclagem Personalizada
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Settings,
  Info,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  FlexibleGradeConfig,
  GradeDistributionMode,
  GradePricingMode,
  TierCalculationMode,
} from "@/types/flexible-grade";
import { DEFAULT_FLEXIBLE_GRADE_CONFIG, calculateHalfGradeInfo } from "@/types/flexible-grade";
import { FlexibleGradeValidator } from "@/lib/validators/flexibleGradeValidator";
import GradeWizardSimplified from "./GradeWizardSimplified";

interface FlexibleGradeConfigFormProps {
  /** Configuração atual (undefined = nova configuração) */
  config?: FlexibleGradeConfig;
  /** Callback quando configuração muda */
  onChange: (config: FlexibleGradeConfig) => void;
  /** Tamanhos da grade completa (para preview) */
  fullGradeSizes?: string[];
  /** Quantidades da grade completa (para preview) */
  fullGradePairs?: number[];
  /** Modelo de preço da loja */
  priceModel?: 'retail_only' | 'simple_wholesale' | 'gradual_wholesale' | 'wholesale_only';
  /** Modo simplificado (menos opções) */
  simplified?: boolean;
}

const FlexibleGradeConfigForm: React.FC<FlexibleGradeConfigFormProps> = ({
  config: initialConfig,
  onChange,
  fullGradeSizes = [],
  fullGradePairs = [],
  priceModel = 'retail_only',
  simplified = false,
}) => {
  // Estado local da configuração
  const [config, setConfig] = useState<FlexibleGradeConfig>(
    initialConfig || DEFAULT_FLEXIBLE_GRADE_CONFIG
  );

  // Tab ativa
  const [activeTab, setActiveTab] = useState<string>("full");

  // Modo de visualização
  const [viewMode, setViewMode] = useState<'advanced' | 'simple'>(simplified ? 'advanced' : 'advanced');
  const [showSimpleWizard, setShowSimpleWizard] = useState(false);

  // Validação
  const [validation, setValidation] = useState<ReturnType<typeof FlexibleGradeValidator.validateConfig>>();

  // Atualizar configuração e propagar mudanças
  const updateConfig = (updates: Partial<FlexibleGradeConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onChange(newConfig);
    
    // Validar
    const validation = FlexibleGradeValidator.validateConfig(newConfig);
    setValidation(validation);
  };

  // Validar ao carregar
  useEffect(() => {
    const validation = FlexibleGradeValidator.validateConfig(config);
    setValidation(validation);
  }, []);

  // Calcular preview de meia grade
  const halfGradePreview = fullGradeSizes.length > 0 && fullGradePairs.length > 0
    ? calculateHalfGradeInfo(fullGradeSizes, fullGradePairs, config)
    : null;

  // Renderizar tooltips de ajuda
  const HelpTooltip: React.FC<{ content: string }> = ({ content }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <HelpCircle className="w-4 h-4 text-gray-400 ml-1" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  // Se wizard simplificado está ativo, renderizar apenas ele
  if (showSimpleWizard) {
    return (
      <GradeWizardSimplified
        onComplete={(newConfig) => {
          updateConfig(newConfig);
          setShowSimpleWizard(false);
        }}
        onCancel={() => setShowSimpleWizard(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Configuração de Venda Flexível
          </h3>
          <p className="text-sm text-gray-600">
            Configure como seus clientes poderão comprar esta grade
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão Modo Simplificado */}
          {!simplified && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSimpleWizard(true)}
              className="flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Modo Rápido
            </Button>
          )}
          
          {validation && !validation.isValid && (
            <Badge variant="destructive">
              {validation.errors.length} erro(s)
            </Badge>
          )}
        </div>
      </div>

      {/* Alertas de Validação */}
      {validation && (validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="space-y-2">
          {validation.errors.map((error, i) => (
            <Alert key={`error-${i}`} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ))}
          {validation.warnings.map((warning, i) => (
            <Alert key={`warning-${i}`}>
              <Info className="h-4 w-4" />
              <AlertDescription>{warning}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Tabs de Configuração */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="full" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Grade Completa
          </TabsTrigger>
          <TabsTrigger value="half" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Meia Grade
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Mesclagem
          </TabsTrigger>
        </TabsList>

        {/* ===== GRADE COMPLETA ===== */}
        <TabsContent value="full" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="w-4 h-4" />
                Grade Completa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="allow_full_grade">Permitir grade completa</Label>
                  <HelpTooltip content="Cliente compra a grade inteira com todos os tamanhos e quantidades definidas" />
                </div>
                <Switch
                  id="allow_full_grade"
                  checked={config.allow_full_grade}
                  onCheckedChange={(checked) => updateConfig({ allow_full_grade: checked })}
                />
              </div>

              {config.allow_full_grade && (
                <>
                  {/* Benefícios */}
                  <Alert>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      <strong>Melhor para o vendedor:</strong> Venda de volume maior, menos complexidade logística
                    </AlertDescription>
                  </Alert>

                  {/* Preview */}
                  {fullGradeSizes.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Preview - Como Cliente Vê:</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Tamanhos:</span>
                          <span className="font-medium">{fullGradeSizes.join(', ')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Quantidades:</span>
                          <span className="font-medium">{fullGradePairs.join(', ')}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold border-t pt-2">
                          <span>Total:</span>
                          <span>{fullGradePairs.reduce((a, b) => a + b, 0)} pares</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== MEIA GRADE ===== */}
        <TabsContent value="half" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Meia Grade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="allow_half_grade">Permitir meia grade</Label>
                  <HelpTooltip content="Cliente compra metade (ou porcentagem definida) da grade completa" />
                </div>
                <Switch
                  id="allow_half_grade"
                  checked={config.allow_half_grade}
                  onCheckedChange={(checked) => {
                    updateConfig({ allow_half_grade: checked });
                    if (checked) setActiveTab("half");
                  }}
                />
              </div>

              {config.allow_half_grade && (
                <>
                  {/* Percentual */}
                  <div className="space-y-2">
                    <Label htmlFor="half_grade_percentage" className="flex items-center gap-2">
                      Percentual da Grade Completa
                      <HelpTooltip content="Quantos % da grade completa será a meia grade (recomendado: 40-60%)" />
                    </Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="half_grade_percentage"
                        type="range"
                        min="25"
                        max="75"
                        step="5"
                        value={config.half_grade_percentage}
                        onChange={(e) => updateConfig({ half_grade_percentage: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                      <Badge variant="outline" className="min-w-[60px] justify-center">
                        {config.half_grade_percentage}%
                      </Badge>
                    </div>
                  </div>

                  {/* Mínimo de Pares */}
                  <div className="space-y-2">
                    <Label htmlFor="half_grade_min_pairs" className="flex items-center gap-2">
                      Mínimo de Pares
                      <HelpTooltip content="Quantidade mínima de pares para meia grade" />
                    </Label>
                    <Input
                      id="half_grade_min_pairs"
                      type="number"
                      min="1"
                      value={config.half_grade_min_pairs}
                      onChange={(e) => updateConfig({ half_grade_min_pairs: parseInt(e.target.value) || 1 })}
                    />
                  </div>

                  {/* Modo de Distribuição */}
                  {!simplified && (
                    <div className="space-y-2">
                      <Label htmlFor="half_grade_distribution" className="flex items-center gap-2">
                        Distribuição de Tamanhos
                        <HelpTooltip content="Como distribuir os tamanhos na meia grade" />
                      </Label>
                      <Select
                        value={config.half_grade_distribution}
                        onValueChange={(value: GradeDistributionMode) => 
                          updateConfig({ half_grade_distribution: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="proportional">
                            Proporcional (recomendado)
                          </SelectItem>
                          <SelectItem value="custom">
                            Personalizada
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Desconto */}
                  <div className="space-y-2">
                    <Label htmlFor="half_grade_discount" className="flex items-center gap-2">
                      Desconto para Meia Grade (%)
                      <HelpTooltip content="Desconto adicional ao comprar meia grade (0 = sem desconto)" />
                    </Label>
                    <Input
                      id="half_grade_discount"
                      type="number"
                      min="0"
                      max="50"
                      step="1"
                      value={config.half_grade_discount_percentage || 0}
                      onChange={(e) => updateConfig({ 
                        half_grade_discount_percentage: parseInt(e.target.value) || 0 
                      })}
                    />
                  </div>

                  {/* Preview */}
                  {halfGradePreview && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-600" />
                        Preview - Como Cliente Vê:
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Tamanhos:</span>
                          <span className="font-medium">{halfGradePreview.sizes.join(', ')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Quantidades:</span>
                          <span className="font-medium">{halfGradePreview.pairs.join(', ')}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold border-t pt-2">
                          <span>Total:</span>
                          <span>{halfGradePreview.totalPairs} pares ({halfGradePreview.percentage}%)</span>
                        </div>
                        {config.half_grade_discount_percentage && config.half_grade_discount_percentage > 0 && (
                          <div className="text-sm text-green-600 font-medium">
                            ✓ Com {config.half_grade_discount_percentage}% de desconto
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== MESCLAGEM PERSONALIZADA ===== */}
        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4" />
                Mesclagem Personalizada
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="allow_custom_mix">Permitir mesclagem personalizada</Label>
                  <HelpTooltip content="Cliente monta sua própria grade escolhendo cores e tamanhos" />
                </div>
                <Switch
                  id="allow_custom_mix"
                  checked={config.allow_custom_mix}
                  onCheckedChange={(checked) => {
                    updateConfig({ allow_custom_mix: checked });
                    if (checked) setActiveTab("custom");
                  }}
                />
              </div>

              {config.allow_custom_mix && (
                <>
                  {/* Mínimo de Pares */}
                  <div className="space-y-2">
                    <Label htmlFor="custom_mix_min_pairs" className="flex items-center gap-2">
                      Mínimo de Pares
                      <HelpTooltip content="Quantidade mínima total para montar grade personalizada" />
                    </Label>
                    <Input
                      id="custom_mix_min_pairs"
                      type="number"
                      min="1"
                      value={config.custom_mix_min_pairs}
                      onChange={(e) => updateConfig({ custom_mix_min_pairs: parseInt(e.target.value) || 1 })}
                    />
                  </div>

                  {/* Máximo de Cores */}
                  <div className="space-y-2">
                    <Label htmlFor="custom_mix_max_colors" className="flex items-center gap-2">
                      Máximo de Cores Diferentes
                      <HelpTooltip content="Quantas cores diferentes o cliente pode misturar" />
                    </Label>
                    <Input
                      id="custom_mix_max_colors"
                      type="number"
                      min="1"
                      max="10"
                      value={config.custom_mix_max_colors}
                      onChange={(e) => updateConfig({ custom_mix_max_colors: parseInt(e.target.value) || 1 })}
                    />
                  </div>

                  {/* Permitir Qualquer Tamanho */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="custom_mix_allow_any_size">Permitir qualquer tamanho</Label>
                      <HelpTooltip content="Se desativado, você pode definir tamanhos específicos permitidos" />
                    </div>
                    <Switch
                      id="custom_mix_allow_any_size"
                      checked={config.custom_mix_allow_any_size}
                      onCheckedChange={(checked) => updateConfig({ custom_mix_allow_any_size: checked })}
                    />
                  </div>

                  {/* Ajuste de Preço */}
                  {!simplified && (
                    <div className="space-y-2">
                      <Label htmlFor="custom_mix_price_adjustment" className="flex items-center gap-2">
                        Ajuste de Preço (R$)
                        <HelpTooltip content="Ajuste no preço unitário para mesclagem (positivo = aumenta, negativo = desconto)" />
                      </Label>
                      <Input
                        id="custom_mix_price_adjustment"
                        type="number"
                        step="0.01"
                        value={config.custom_mix_price_adjustment || 0}
                        onChange={(e) => updateConfig({ 
                          custom_mix_price_adjustment: parseFloat(e.target.value) || 0 
                        })}
                      />
                    </div>
                  )}

                  {/* Benefícios */}
                  <Alert>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      <strong>Melhor para o cliente:</strong> Máxima flexibilidade, compra apenas o que precisa
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configurações Avançadas de Precificação */}
      {!simplified && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configurações de Precificação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Modo de Precificação */}
            <div className="space-y-2">
              <Label htmlFor="pricing_mode" className="flex items-center gap-2">
                Modo de Precificação
                <HelpTooltip content="Como calcular preços para as diferentes opções de compra" />
              </Label>
              <Select
                value={config.pricing_mode}
                onValueChange={(value: GradePricingMode) => updateConfig({ pricing_mode: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unit_based">Baseado no Preço Unitário</SelectItem>
                  <SelectItem value="tier_based">Baseado em Tiers de Quantidade</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Aplicar Tiers */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="apply_quantity_tiers">Aplicar descontos por quantidade</Label>
                <HelpTooltip content="Usar os tiers de preço configurados na loja para calcular descontos" />
              </div>
              <Switch
                id="apply_quantity_tiers"
                checked={config.apply_quantity_tiers}
                onCheckedChange={(checked) => updateConfig({ apply_quantity_tiers: checked })}
              />
            </div>

            {/* Modo de Cálculo de Tier */}
            {config.apply_quantity_tiers && (
              <div className="space-y-2">
                <Label htmlFor="tier_calculation_mode" className="flex items-center gap-2">
                  Calcular Tier Por
                  <HelpTooltip content="Como calcular qual tier aplicar: por par individual ou por grade inteira" />
                </Label>
                <Select
                  value={config.tier_calculation_mode}
                  onValueChange={(value: TierCalculationMode) => updateConfig({ tier_calculation_mode: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per_pair">Por Par</SelectItem>
                    <SelectItem value="per_grade">Por Grade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resumo Final */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" />
            Resumo da Configuração
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              {config.allow_full_grade ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <span className="w-4 h-4" />
              )}
              <span>Grade Completa: {config.allow_full_grade ? 'Habilitada' : 'Desabilitada'}</span>
            </div>
            <div className="flex items-center gap-2">
              {config.allow_half_grade ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <span className="w-4 h-4" />
              )}
              <span>
                Meia Grade: {config.allow_half_grade 
                  ? `Habilitada (${config.half_grade_percentage}%)` 
                  : 'Desabilitada'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {config.allow_custom_mix ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <span className="w-4 h-4" />
              )}
              <span>
                Mesclagem: {config.allow_custom_mix 
                  ? `Habilitada (mín. ${config.custom_mix_min_pairs} pares)` 
                  : 'Desabilitada'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlexibleGradeConfigForm;

