import React, { useEffect, useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Video,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StoreData } from "@/hooks/useStoreData";
import { CatalogSettingsData } from "@/hooks/useCatalogSettings";
import { useTemplateColors } from "@/hooks/useTemplateColors";

interface CatalogFooterProps {
  store: StoreData;
  whatsappNumber?: string;
  storeSettings?: CatalogSettingsData | null;
}

const CatalogFooter: React.FC<CatalogFooterProps> = ({
  store,
  whatsappNumber,
  storeSettings,
}) => {
  const currentYear = new Date().getFullYear();
  const [modalContent, setModalContent] = useState<{
    title: string;
    content: string;
  } | null>(null);
  const { applyColorsToDocument } = useTemplateColors(
    store.url_slug || store.id
  );

  useEffect(() => {
    applyColorsToDocument();
  }, [applyColorsToDocument]);

  // Extrair dados de pagamento das configurações
  const getPaymentMethods = () => {
    if (!storeSettings?.payment_methods) return [];

    const methods = [];
    if (storeSettings.payment_methods.pix) methods.push("PIX");
    if (storeSettings.payment_methods.credit_card) methods.push("Cartão");
    if (storeSettings.payment_methods.bank_slip) methods.push("Boleto");

    return methods;
  };

  // Extrair horário de funcionamento das configurações
  const getBusinessHours = () => {
    // Usar horários estruturados das configurações se disponíveis
    if (
      storeSettings?.business_hours &&
      typeof storeSettings.business_hours === "object"
    ) {
      const hours = storeSettings.business_hours as any;

      // Verificar se tem horários configurados para segunda-feira
      if (hours.monday && !hours.monday.closed) {
        let timeText = `Seg - Sex: ${hours.monday.open} às ${hours.monday.close}`;

        // Adicionar horário de almoço se configurado
        if (
          hours.monday.hasLunchBreak &&
          hours.monday.lunchStart &&
          hours.monday.lunchEnd
        ) {
          timeText += ` (Almoço: ${hours.monday.lunchStart} - ${hours.monday.lunchEnd})`;
        }

        return timeText;
      }

      // Verificar outros dias se segunda não estiver configurada
      const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"];
      for (const day of weekdays) {
        if (hours[day] && !hours[day].closed) {
          let timeText = `Seg - Sex: ${hours[day].open} às ${hours[day].close}`;

          if (
            hours[day].hasLunchBreak &&
            hours[day].lunchStart &&
            hours[day].lunchEnd
          ) {
            timeText += ` (Almoço: ${hours[day].lunchStart} - ${hours[day].lunchEnd})`;
          }

          return timeText;
        }
      }
    }

    return "Seg - Sex: 9h às 18h (Almoço: 12h - 13h)";
  };

  // Gerar horários detalhados da semana
  const getDetailedBusinessHours = () => {
    if (
      !storeSettings?.business_hours ||
      typeof storeSettings.business_hours !== "object"
    ) {
      return null;
    }

    const hours = storeSettings.business_hours as any;
    const dayLabels = {
      monday: "Segunda",
      tuesday: "Terça",
      wednesday: "Quarta",
      thursday: "Quinta",
      friday: "Sexta",
      saturday: "Sábado",
      sunday: "Domingo",
    };

    const weekDays = Object.keys(dayLabels) as Array<keyof typeof dayLabels>;

    return weekDays
      .map((day) => {
        const dayHours = hours[day];
        if (!dayHours) return null;

        if (dayHours.closed) {
          return `${dayLabels[day]}: Fechado`;
        }

        let timeText = `${dayLabels[day]}: ${dayHours.open} - ${dayHours.close}`;

        if (
          dayHours.hasLunchBreak &&
          dayHours.lunchStart &&
          dayHours.lunchEnd
        ) {
          timeText += ` (Almoço: ${dayHours.lunchStart} - ${dayHours.lunchEnd})`;
        }

        return timeText;
      })
      .filter(Boolean);
  };

  // Verificar se há redes sociais configuradas
  const hasSocialMedia = () => {
    return !!(
      storeSettings?.facebook_url ||
      storeSettings?.instagram_url ||
      storeSettings?.twitter_url ||
      storeSettings?.linkedin_url ||
      storeSettings?.youtube_url ||
      storeSettings?.tiktok_url
    );
  };

  // Função para abrir modal com conteúdo das páginas
  const openInfoModal = (type: string) => {
    let title = "";
    let content = "";

    switch (type) {
      case "privacy":
        title = "Política de Privacidade";
        content =
          storeSettings?.privacy_policy_content || "Conteúdo não disponível.";
        break;
      case "terms":
        title = "Termos de Uso";
        content =
          storeSettings?.terms_of_use_content || "Conteúdo não disponível.";
        break;
      case "returns":
        title = "Política de Trocas e Devoluções";
        content =
          storeSettings?.returns_policy_content || "Conteúdo não disponível.";
        break;
      case "delivery":
        title = "Política de Entrega";
        content =
          storeSettings?.delivery_policy_content || "Conteúdo não disponível.";
        break;
      case "about":
        title = "Sobre Nós";
        content = storeSettings?.about_us_content || "Conteúdo não disponível.";
        break;
      default:
        return;
    }

    setModalContent({ title, content });
  };

  const paymentMethods = getPaymentMethods();

  // Verificar se o footer deve ser exibido
  if (storeSettings?.footer_enabled === false) {
    return null;
  }

  return (
    <>
      <style>{`
        .catalog-footer {
          background: var(--template-text, #1E293B);
          color: white;
        }
        
        .footer-logo-gradient {
          background: linear-gradient(135deg, var(--template-primary, #0057FF), var(--template-accent, #8E2DE2));
        }
        
        .footer-link {
          color: rgba(255, 255, 255, 0.7);
          transition: color 0.2s ease;
        }
        
        .footer-link:hover {
          color: var(--template-primary, #0057FF);
        }
        
        .footer-social-button {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.2s ease;
        }
        
        .footer-social-button:hover {
          background: var(--template-primary, #0057FF);
          border-color: var(--template-primary, #0057FF);
        }
        
        .footer-separator {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .footer-bottom {
          background: rgba(0, 0, 0, 0.2);
        }
        
        .footer-payment-method {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .footer-shipping-option {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>

      <footer className="catalog-footer text-white">
        {/* Main Footer */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Sobre a Loja */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                {store.logo_url ? (
                  <img
                    src={store.logo_url}
                    alt={`Logo ${store.name}`}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="footer-logo-gradient w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold">
                    {store.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <h3 className="text-xl font-bold">{store.name}</h3>
              </div>
              <p className="text-gray-300 mb-4">
                {store.description ||
                  "Oferecemos produtos de qualidade com os melhores preços do mercado."}
              </p>

              {/* Redes Sociais */}
              {hasSocialMedia() && (
                <div className="flex flex-wrap gap-2">
                  {storeSettings?.facebook_url && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="footer-social-button text-gray-300 hover:text-white"
                      onClick={() =>
                        window.open(storeSettings.facebook_url, "_blank")
                      }
                    >
                      <Facebook size={20} />
                    </Button>
                  )}
                  {storeSettings?.instagram_url && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="footer-social-button text-gray-300 hover:text-white"
                      onClick={() =>
                        window.open(storeSettings.instagram_url, "_blank")
                      }
                    >
                      <Instagram size={20} />
                    </Button>
                  )}
                  {storeSettings?.twitter_url && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="footer-social-button text-gray-300 hover:text-white"
                      onClick={() =>
                        window.open(storeSettings.twitter_url, "_blank")
                      }
                    >
                      <Twitter size={20} />
                    </Button>
                  )}
                  {storeSettings?.linkedin_url && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="footer-social-button text-gray-300 hover:text-white"
                      onClick={() =>
                        window.open(storeSettings.linkedin_url, "_blank")
                      }
                    >
                      <Linkedin size={20} />
                    </Button>
                  )}
                  {storeSettings?.youtube_url && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="footer-social-button text-gray-300 hover:text-white"
                      onClick={() =>
                        window.open(storeSettings.youtube_url, "_blank")
                      }
                    >
                      <Youtube size={20} />
                    </Button>
                  )}
                  {storeSettings?.tiktok_url && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="footer-social-button text-gray-300 hover:text-white"
                      onClick={() =>
                        window.open(storeSettings.tiktok_url, "_blank")
                      }
                    >
                      <Video size={20} />
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Links Rápidos */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Links Rápidos</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => openInfoModal("about")}
                    className="footer-link transition-colors text-left"
                  >
                    Sobre Nós
                  </button>
                </li>
                <li>
                  <a href="#produtos" className="footer-link transition-colors">
                    Nossos Produtos
                  </a>
                </li>
                <li>
                  <a href="#contato" className="footer-link transition-colors">
                    Contato
                  </a>
                </li>
                <li>
                  <a href="#faq" className="footer-link transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Informações de Contato */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Contato</h4>
              <div className="space-y-3">
                {store.address && (
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-gray-400 mt-0.5" />
                    <span className="text-gray-300 text-sm leading-relaxed">
                      {store.address}
                    </span>
                  </div>
                )}
                {(store.phone || whatsappNumber) && (
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-gray-400" />
                    <span className="text-gray-300 text-sm">
                      {store.phone || whatsappNumber}
                    </span>
                  </div>
                )}
                {store.email && (
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-gray-300 text-sm">{store.email}</span>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-gray-400" />
                    <span className="text-gray-300 text-sm font-medium">
                      {getBusinessHours()}
                    </span>
                  </div>

                  {/* Horários detalhados */}
                  {getDetailedBusinessHours() && (
                    <div className="ml-7 space-y-1">
                      {getDetailedBusinessHours()
                        ?.slice(0, 3)
                        .map((hour, index) => (
                          <div key={index} className="text-xs text-gray-400">
                            {hour}
                          </div>
                        ))}
                      {getDetailedBusinessHours() &&
                        getDetailedBusinessHours()!.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{getDetailedBusinessHours()!.length - 3} dias
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Políticas e Formas de Pagamento */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Informações</h4>
              <ul className="space-y-2 mb-6">
                <li>
                  <button
                    onClick={() => openInfoModal("privacy")}
                    className="footer-link transition-colors text-left"
                  >
                    Política de Privacidade
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openInfoModal("terms")}
                    className="footer-link transition-colors text-left"
                  >
                    Termos de Uso
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openInfoModal("returns")}
                    className="footer-link transition-colors text-left"
                  >
                    Trocas e Devoluções
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openInfoModal("delivery")}
                    className="footer-link transition-colors text-left"
                  >
                    Política de Entrega
                  </button>
                </li>
              </ul>

              {/* Formas de Pagamento - apenas se configuradas */}
              {paymentMethods.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-300 mb-2">
                    Formas de Pagamento:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {paymentMethods.map((method) => (
                      <div
                        key={method}
                        className="footer-payment-method px-2 py-1 rounded text-xs"
                      >
                        {method}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator className="footer-separator" />

        {/* Bottom Footer */}
        <div className="footer-bottom container mx-auto px-4 py-6">
          {/* Texto personalizado do footer */}
          {storeSettings?.footer_custom_text && (
            <div className="text-center mb-4">
              <p className="text-gray-300 text-sm leading-relaxed">
                {storeSettings.footer_custom_text}
              </p>
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              {storeSettings?.footer_copyright_text ||
                `© ${currentYear} ${store.name}. Todos os direitos reservados.`}
            </p>

            {/* Opções de Entrega - se configuradas */}
            {storeSettings?.shipping_options && (
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>Opções de Entrega:</span>
                <div className="flex gap-2">
                  {storeSettings.shipping_options.pickup && (
                    <div className="footer-shipping-option px-2 py-1 rounded text-xs">
                      Retirada
                    </div>
                  )}
                  {storeSettings.shipping_options.delivery && (
                    <div className="footer-shipping-option px-2 py-1 rounded text-xs">
                      Entrega
                    </div>
                  )}
                  {storeSettings.shipping_options.shipping && (
                    <div className="footer-shipping-option px-2 py-1 rounded text-xs">
                      Correios
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* WhatsApp Floating Button - Posicionado embaixo */}
        {whatsappNumber && (
          <Button
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg z-40 transition-all duration-300 transform hover:scale-105"
            onClick={() => {
              const message = `Olá! Estou interessado nos produtos da ${store.name}`;
              window.open(
                `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                  message
                )}`,
                "_blank"
              );
            }}
          >
            <Phone className="w-6 h-6" />
          </Button>
        )}
      </footer>

      {/* Modal para exibir conteúdo das páginas */}
      <Dialog open={!!modalContent} onOpenChange={() => setModalContent(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {modalContent?.title}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setModalContent(null)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="prose prose-sm max-w-none">
              {modalContent?.content.split("\n").map((line, index) => {
                if (line.startsWith("# ")) {
                  return (
                    <h1 key={index} className="text-2xl font-bold mb-4 mt-6">
                      {line.slice(2)}
                    </h1>
                  );
                } else if (line.startsWith("## ")) {
                  return (
                    <h2 key={index} className="text-xl font-semibold mb-3 mt-5">
                      {line.slice(3)}
                    </h2>
                  );
                } else if (line.startsWith("### ")) {
                  return (
                    <h3 key={index} className="text-lg font-medium mb-2 mt-4">
                      {line.slice(4)}
                    </h3>
                  );
                } else if (line.startsWith("- ")) {
                  return (
                    <li key={index} className="ml-4">
                      {line.slice(2)}
                    </li>
                  );
                } else if (line.trim() === "") {
                  return <br key={index} />;
                } else {
                  return (
                    <p key={index} className="mb-3 leading-relaxed">
                      {line}
                    </p>
                  );
                }
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CatalogFooter;
