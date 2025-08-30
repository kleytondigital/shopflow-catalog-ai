// Conteúdo padrão para as páginas informativas do footer
export const DEFAULT_CONTENT = {
  privacy_policy: `# Política de Privacidade

## 1. Informações Coletadas
Coletamos informações que você nos fornece diretamente, como quando cria uma conta, faz um pedido ou entra em contato conosco.

## 2. Como Usamos Suas Informações
- Processar pedidos e pagamentos
- Enviar confirmações e atualizações
- Responder suas perguntas e solicitações
- Enviar comunicações de marketing (com seu consentimento)

## 3. Compartilhamento de Informações
Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto conforme descrito nesta política.

## 4. Segurança
Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações pessoais.

## 5. Seus Direitos
Você tem o direito de:
- Acessar suas informações pessoais
- Corrigir informações imprecisas
- Solicitar a exclusão de seus dados
- Revogar consentimento para marketing

## 6. Contato
Para dúvidas sobre esta política, entre em contato conosco através dos canais disponíveis em nosso site.`,

  terms_of_use: `# Termos de Uso

## 1. Aceitação dos Termos
Ao acessar e usar este site, você aceita estar vinculado a estes Termos de Uso.

## 2. Uso do Site
Você concorda em usar o site apenas para propósitos legais e de acordo com estes termos.

## 3. Conta do Usuário
- Você é responsável por manter a confidencialidade de sua conta
- Você é responsável por todas as atividades que ocorrem em sua conta
- Você deve notificar-nos imediatamente sobre qualquer uso não autorizado

## 4. Produtos e Serviços
- Os preços estão sujeitos a alterações sem aviso prévio
- Reservamo-nos o direito de recusar qualquer pedido
- As descrições dos produtos são fornecidas "como estão"

## 5. Propriedade Intelectual
Todo o conteúdo deste site é protegido por direitos autorais e outras leis de propriedade intelectual.

## 6. Limitação de Responsabilidade
Não nos responsabilizamos por danos indiretos, incidentais ou consequenciais.`,

  returns_policy: `# Política de Trocas e Devoluções

## 1. Prazo para Trocas
Aceitamos trocas e devoluções em até 30 dias após a compra, desde que o produto esteja em perfeito estado.

## 2. Condições para Troca
O produto deve estar:
- Em sua embalagem original
- Sem sinais de uso
- Com todas as etiquetas e acessórios
- Limpo e sem danos

## 3. Produtos Não Aceitos para Troca
- Produtos personalizados ou sob medida
- Produtos de higiene pessoal
- Produtos em promoção (final de estoque)
- Produtos danificados por mau uso

## 4. Processo de Troca
1. Entre em contato conosco informando o motivo da troca
2. Envie fotos do produto (se solicitado)
3. Aguarde nossa aprovação
4. Envie o produto para nossa loja
5. Após análise, processaremos a troca ou reembolso

## 5. Reembolso
- Cartão de crédito: até 2 faturas
- PIX: até 5 dias úteis
- Boleto: até 10 dias úteis

## 6. Custos de Envio
Os custos de envio para troca são de responsabilidade do cliente, exceto em caso de produto com defeito.`,

  delivery_policy: `# Política de Entrega

## 1. Opções de Entrega

### Retirada na Loja
- Gratuita
- Disponível em até 2 horas após confirmação do pagamento
- Horário: Segunda a Sexta, 9h às 18h

### Entrega Local
- Gratuita para compras acima de R$ 50,00
- Taxa de R$ 5,00 para compras abaixo de R$ 50,00
- Entrega em até 24 horas úteis

### Correios
- Sedex: 1-2 dias úteis
- PAC: 3-10 dias úteis
- Frete calculado automaticamente

## 2. Cálculo do Frete
O frete é calculado automaticamente baseado em:
- Peso do produto
- CEP de destino
- Modalidade escolhida

## 3. Acompanhamento
- Enviamos código de rastreamento por email
- Acompanhe sua entrega em tempo real
- Notificações de status por WhatsApp

## 4. Horários de Entrega
- Segunda a Sexta: 8h às 18h
- Sábados: 8h às 12h
- Não fazemos entregas aos domingos e feriados

## 5. Problemas na Entrega
Em caso de problemas:
1. Entre em contato conosco
2. Forneça o código de rastreamento
3. Descreva o problema
4. Aguarde nossa solução

## 6. Áreas de Cobertura
Atendemos toda a região metropolitana e cidades próximas. Consulte disponibilidade para sua localidade.`,

  about_us: `# Sobre Nós

## Nossa História
Fundada em [ANO], nossa empresa nasceu da paixão por [SEU RAMO] e do desejo de oferecer produtos de qualidade com preços justos.

## Nossa Missão
Proporcionar aos nossos clientes uma experiência de compra excepcional, oferecendo produtos selecionados, atendimento personalizado e soluções que superem suas expectativas.

## Nossos Valores
- **Qualidade**: Selecionamos rigorosamente nossos produtos
- **Transparência**: Preços claros e informações honestas
- **Atendimento**: Suporte personalizado e eficiente
- **Inovação**: Sempre buscando melhorar nossos processos
- **Confiança**: Construindo relacionamentos duradouros

## Nossa Equipe
Contamos com profissionais experientes e dedicados, comprometidos em oferecer o melhor atendimento e suporte aos nossos clientes.

## Nossos Produtos
Oferecemos uma ampla variedade de produtos [DESCREVA SEUS PRODUTOS], cuidadosamente selecionados para atender às necessidades e preferências de nossos clientes.

## Nossa Localização
Estamos localizados em [ENDEREÇO], oferecendo facilidade de acesso e estacionamento para nossos clientes.

## Horário de Funcionamento
- Segunda a Sexta: 9h às 19h
- Sábados: 9h às 13h
- Domingos e Feriados: Fechado

## Entre em Contato
- Telefone: [TELEFONE]
- WhatsApp: [WHATSAPP]
- Email: [EMAIL]
- Endereço: [ENDEREÇO COMPLETO]

Estamos sempre disponíveis para atender você e esclarecer suas dúvidas!`,
};

// Funções utilitárias para gerenciar o conteúdo padrão
export const loadDefaultContent = (type: keyof typeof DEFAULT_CONTENT) => {
  return DEFAULT_CONTENT[type];
};

export const getContentTypes = () => {
  return Object.keys(DEFAULT_CONTENT) as Array<keyof typeof DEFAULT_CONTENT>;
};

export const getContentDescription = (type: string) => {
  const descriptions: Record<string, string> = {
    privacy_policy:
      "Política de Privacidade - Como coletamos e usamos suas informações",
    terms_of_use: "Termos de Uso - Regras e condições para uso do site",
    returns_policy:
      "Trocas e Devoluções - Como funciona nosso processo de trocas",
    delivery_policy: "Política de Entrega - Opções e prazos de entrega",
    about_us: "Sobre Nós - Conheça nossa história e valores",
  };

  return descriptions[type] || "Página informativa";
};
