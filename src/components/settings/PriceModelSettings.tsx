import React, { useState } from "react";
import { useStorePriceModel } from "../../hooks/useStorePriceModel";
import {
  PRICE_MODEL_CONFIGS,
  DEFAULT_TIER_CONFIGS,
  PriceModelType,
  TierConfig,
} from "../../types/price-models";

interface PriceModelSettingsProps {
  storeId: string;
}

const PriceModelSettings: React.FC<PriceModelSettingsProps> = ({ storeId }) => {
  const {
    priceModel,
    loading,
    error,
    changePriceModel,
    updatePriceModel,
    getSettings,
    refetch,
  } = useStorePriceModel(storeId);

  const settings = getSettings();
  const [saving, setSaving] = useState(false);
  const [localModel, setLocalModel] = useState<PriceModelType | null>(null);
  const [localTiers, setLocalTiers] =
    useState<TierConfig[]>(DEFAULT_TIER_CONFIGS);

  React.useEffect(() => {
    if (settings) {
      setLocalModel(settings.selectedModel);
      // Atualiza tiers locais conforme modelo selecionado
      const tiers: TierConfig[] = DEFAULT_TIER_CONFIGS.map((tier, idx) => ({
        ...tier,
        enabled:
          settings.gradualWholesale.tiers[idx + 1]?.enabled ?? tier.enabled,
        name: settings.gradualWholesale.tiers[idx + 1]?.name ?? tier.name,
        defaultMinQty:
          settings.gradualWholesale.tiers[idx + 1]?.defaultMinQty ??
          tier.defaultMinQty,
      }));
      setLocalTiers(tiers);
    }
  }, [settings]);

  const handleModelChange = async (model: PriceModelType) => {
    setLocalModel(model);
    setSaving(true);
    await changePriceModel(model);
    setSaving(false);
    refetch();
  };

  const handleTierChange = (
    idx: number,
    field: keyof TierConfig,
    value: any
  ) => {
    setLocalTiers((prev) =>
      prev.map((tier, i) => (i === idx ? { ...tier, [field]: value } : tier))
    );
  };

  const handleSaveTiers = async () => {
    if (!priceModel) return;
    setSaving(true);
    await updatePriceModel({
      tier_1_name: localTiers[0].name,
      tier_2_name: localTiers[1].name,
      tier_3_name: localTiers[2].name,
      tier_4_name: localTiers[3].name,
      tier_1_enabled: localTiers[0].enabled,
      tier_2_enabled: localTiers[1].enabled,
      tier_3_enabled: localTiers[2].enabled,
      tier_4_enabled: localTiers[3].enabled,
    });
    setSaving(false);
    refetch();
  };

  if (loading) return <div>Carregando modelo de preço...</div>;
  if (error) return <div style={{ color: "red" }}>Erro: {error}</div>;
  if (!settings) return <div>Nenhuma configuração encontrada.</div>;

  return (
    <div>
      <h2>Modelo de Preço da Loja</h2>
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        {Object.values(PRICE_MODEL_CONFIGS).map((model) => (
          <button
            key={model.model}
            onClick={() => handleModelChange(model.model)}
            disabled={saving || localModel === model.model}
            style={{
              padding: 12,
              border:
                localModel === model.model
                  ? "2px solid #0070f3"
                  : "1px solid #ccc",
              background: localModel === model.model ? "#e6f0ff" : "#fff",
              borderRadius: 8,
              minWidth: 160,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            <strong>{model.displayName}</strong>
            <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
              {model.description}
            </div>
          </button>
        ))}
      </div>

      {localModel === "simple_wholesale" && (
        <div style={{ marginBottom: 24 }}>
          <h4>Configuração do Atacado Simples</h4>
          <label>
            Nome do nível atacado:
            <input
              type="text"
              value={localTiers[1].name}
              onChange={(e) => handleTierChange(1, "name", e.target.value)}
              style={{ marginLeft: 8 }}
            />
          </label>
        </div>
      )}

      {localModel === "gradual_wholesale" && (
        <div style={{ marginBottom: 24 }}>
          <h4>Configuração dos Níveis de Atacado</h4>
          {localTiers.slice(1).map((tier, idx) => (
            <div
              key={tier.order}
              style={{
                marginBottom: 12,
                padding: 8,
                border: "1px solid #eee",
                borderRadius: 6,
              }}
            >
              <label>
                <input
                  type="checkbox"
                  checked={tier.enabled}
                  onChange={(e) =>
                    handleTierChange(idx + 1, "enabled", e.target.checked)
                  }
                  style={{ marginRight: 8 }}
                />
                Ativar nível
              </label>
              <input
                type="text"
                value={tier.name}
                onChange={(e) =>
                  handleTierChange(idx + 1, "name", e.target.value)
                }
                placeholder={`Nome do nível ${tier.order}`}
                style={{ marginLeft: 8, marginRight: 8 }}
              />
              <label>
                Quantidade mínima:
                <input
                  type="number"
                  min={1}
                  value={tier.defaultMinQty}
                  onChange={(e) =>
                    handleTierChange(
                      idx + 1,
                      "defaultMinQty",
                      Number(e.target.value)
                    )
                  }
                  style={{ marginLeft: 8, width: 60 }}
                />
              </label>
            </div>
          ))}
          <button
            onClick={handleSaveTiers}
            disabled={saving}
            style={{ marginTop: 8 }}
          >
            Salvar Níveis
          </button>
        </div>
      )}

      <div style={{ marginTop: 32 }}>
        <h4>Resumo dos Níveis Ativos</h4>
        <ul>
          {localTiers
            .filter((t) => t.enabled)
            .map((tier) => (
              <li key={tier.order}>
                <strong>{tier.name}</strong> (mínimo: {tier.defaultMinQty})
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default PriceModelSettings;
