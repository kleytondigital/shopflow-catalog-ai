---
name: "Plano: Geração de Vídeos e Imagens com IA para Produtos"
overview: ""
todos:
  - id: 986c7b1b-bd8e-431e-8421-ea431f94707f
    content: "Testar fluxo completo: configuração → geração → fila → resultado"
    status: pending
---

# Plano: Geração de Vídeos e Imagens com IA para Produtos

## Visão Geral
Sistema completo de geração de mídia com IA que permite criar vídeos (Veo 3, Runway, Kling AI) e imagens melhoradas (DALL-E 3) dos produtos, com modelos usando os itens, usando templates de prompts editáveis e fila de processamento.

## Arquitetura Principal

### 1. Banco de Dados - Extensão do Sistema Existente

**Tabelas Novas**:
- `ai_providers_config` - Configuração de provedores de IA (Veo 3, Runway, DALL-E)
- `ai_usage_tracking` - Rastreamento de uso por tenant e global
- `ai_generation_queue` - Fila de geração de vídeos/imagens
- `ai_prompt_templates` - Templates de prompts editáveis
- `tenant_ai_credits` - Créditos e limites por tenant/plano

**Extensões em tabelas existentes**:
- `stores` - Adicionar colunas para API keys próprias (veo_api_key, runway_api_key, dalle_api_key)
- `product_videos` - Adicionar campos: generated_by_ai, ai_provider, generation_prompt, generation_status
- `product_images` - Adicionar campos: generated_by_ai, ai_provider, original_image_id (referência)

### 2. Configuração Global de IA (Nível Sistema)

**Arquivo**: `src/config/aiProvidersConfig.ts`
- Interface para configurar múltiplos provedores
- Prioridade de fallback (se Veo falhar, tenta Runway)
- Limites globais por plano (free: 5 vídeos/mês, pro: 50/mês, enterprise: ilimitado)

**Arquivo**: `src/contexts/AIConfigContext.tsx`
- Context para gerenciar configurações de IA
- Detecta se tenant tem API key própria ou usa global
- Controla quota e limites

### 3. Templates de Prompts Editáveis

**Arquivo**: `src/components/ai/PromptTemplateEditor.tsx`
- Editor de templates com variáveis: {modelo}, {ambiente}, {genero}, {tipo_produto}, {acao}
- Exemplos pré-configurados:
  - Calçado Treino: "{modelo} utilizando {produto} treinando na {ambiente}"
  - Roupa Casual: "{modelo} usando {produto} em {ambiente}"
- Validação de variáveis obrigatórias

**Arquivo**: `src/lib/ai/promptBuilder.ts`
- Função que substitui variáveis: buildPrompt(template, product, options)
- Detecção inteligente de gênero do modelo baseado em product_gender
- Biblioteca de ambientes: academia, praia, cidade, casa, etc.

### 4. Sistema de Geração de Vídeo

**Arquivo**: `src/lib/ai/videoGenerators/index.ts`
- Interface unificada: `generateVideo(prompt, provider, apiKey)`
- Implementações específicas:
  - `veo3Generator.ts` - Google Veo 3 via Vertex AI
  - `runwayGenerator.ts` - Runway Gen-3 Alpha
  - `klingGenerator.ts` - Kling AI

**Arquivo**: `src/components/products/wizard/AIVideoGenerator.tsx`
- Componente na etapa "Imagens e Vídeo"
- Botão "Gerar Vídeo com IA" (se tenant tem créditos)
- Preview da imagem selecionada como base
- Seletor de template de prompt
- Editor de variáveis (modelo, ambiente, ação)
- Status de geração em tempo real

### 5. Sistema de Geração de Imagens Melhoradas

**Arquivo**: `src/lib/ai/imageGenerators/dalleGenerator.ts`
- Integração com DALL-E 3 (já tem OpenAI configurado)
- Prompt: "Professional product photo of {produto} being worn by {modelo} in {ambiente}, commercial photography, high quality, studio lighting"

**Arquivo**: `src/components/products/wizard/AIImageEnhancer.tsx`
- Botão "Melhorar com IA" em cada imagem
- Opções: adicionar modelo, mudar cenário, melhorar qualidade
- Preview lado a lado (original vs gerada)

### 6. Fila de Processamento

**Arquivo**: `src/lib/ai/generationQueue.ts`
- Classe `GenerationQueue` com métodos: enqueue(), process(), getStatus()
- Integração com Supabase Realtime para updates
- Retry automático (3 tentativas)
- Webhook para notificar conclusão

**Arquivo**: `src/components/ai/GenerationDashboard.tsx`
- Dashboard mostrando filas de vídeos/imagens
- Status: pending, processing, completed, failed
- Progress bar por item
- Botão cancelar/retry

### 7. Gestão de API Keys e Créditos

**Arquivo**: `src/pages/Settings/AIProvidersSettings.tsx`
- Tela para admin cadastrar API keys próprias
- Toggle: "Usar API global" ou "Usar minha API"
- Visualização de créditos restantes
- Histórico de uso

**Arquivo**: `src/hooks/useAICredits.tsx`
- Hook que retorna: `{ videosRemaining, imagesRemaining, canGenerate }`
- Verifica plano do tenant
- Consome crédito ao gerar

### 8. Edge Functions (Backend)

**Supabase Functions**:
- `generate-ai-video` - Orquestra geração de vídeo
- `generate-ai-image` - Orquestra geração de imagem
- `process-ai-queue` - Processa fila em background
- `webhook-ai-completion` - Recebe callback dos provedores

### 9. Integrações com Cadastro de Produtos

**Modificações em**:
- `src/components/products/wizard/steps/ImagesStep.tsx`:
  - Botão "Gerar Vídeo com IA" após upload de imagens
  - Botão "Melhorar Imagem" em cada foto
  - Preview de gerações em andamento

**Fluxo**:
1. Gestor faz upload da imagem do produto (tênis na mesa)
2. Clica "Gerar Vídeo com IA"
3. Seleciona template: "Pessoa treinando com tênis"
4. Customiza: Modelo (mulher/homem), Ambiente (academia/rua)
5. Clica "Gerar"
6. Sistema adiciona à fila
7. Notificação quando pronto
8. Vídeo aparece automaticamente na página do produto

## Arquivos Principais a Criar

### Backend/Database:
- `supabase/migrations/[timestamp]_ai_generation_system.sql`
- `supabase/functions/generate-ai-video/index.ts`
- `supabase/functions/generate-ai-image/index.ts`
- `supabase/functions/process-ai-queue/index.ts`

### Frontend Core:
- `src/lib/ai/videoGenerators/index.ts`
- `src/lib/ai/videoGenerators/veo3Generator.ts`
- `src/lib/ai/videoGenerators/runwayGenerator.ts`
- `src/lib/ai/imageGenerators/dalleGenerator.ts`
- `src/lib/ai/promptBuilder.ts`
- `src/lib/ai/generationQueue.ts`

### Frontend Components:
- `src/components/ai/PromptTemplateEditor.tsx`
- `src/components/ai/GenerationDashboard.tsx`
- `src/components/products/wizard/AIVideoGenerator.tsx`
- `src/components/products/wizard/AIImageEnhancer.tsx`
- `src/pages/Settings/AIProvidersSettings.tsx`

### Frontend Hooks:
- `src/hooks/useAICredits.tsx`
- `src/hooks/useAIGeneration.tsx`
- `src/contexts/AIConfigContext.tsx`

## Tecnologias e Integrações

- **Google Veo 3**: Vertex AI API (vídeo)
- **Runway Gen-3**: REST API (vídeo alternativo)
- **DALL-E 3**: OpenAI API já configurado (imagens)
- **Supabase Storage**: Armazenamento de mídia gerada
- **Supabase Realtime**: Updates em tempo real da fila
- **Supabase Functions**: Processamento serverless

## Estimativa

- Migration e estrutura de banco: 1-2 horas
- Integrações de IA (3 provedores): 3-4 horas
- UI/UX (componentes, dashboard): 2-3 horas
- Sistema de fila e créditos: 2 horas
- Testes e ajustes: 1-2 horas
- **Total**: 9-13 horas de desenvolvimento

## Observações Importantes

1. **Custo**: Veo 3 e DALL-E 3 são pagos - precisa considerar modelo de negócio
2. **Tempo**: Vídeos podem levar 30s-2min para gerar
3. **Qualidade**: Resultado depende muito do prompt e imagem base
4. **Limitações**: Veo 3 está em preview limitado (pode ter fila de espera)