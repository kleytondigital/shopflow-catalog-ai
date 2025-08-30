import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Video,
  MapPin,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  FileText,
} from "lucide-react";

interface FooterPreviewProps {
  footerEnabled: boolean;
  footerCustomText: string;
  footerCopyrightText: string;
  businessHoursDisplayType: "summary" | "detailed";
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  tiktokUrl: string;
  privacyPolicy: string;
  termsOfUse: string;
  returnsPolicy: string;
  deliveryPolicy: string;
  aboutUs: string;
}

const FooterPreview: React.FC<FooterPreviewProps> = ({
  footerEnabled,
  footerCustomText,
  footerCopyrightText,
  businessHoursDisplayType,
  facebookUrl,
  instagramUrl,
  twitterUrl,
  linkedinUrl,
  youtubeUrl,
  tiktokUrl,
  privacyPolicy,
  termsOfUse,
  returnsPolicy,
  deliveryPolicy,
  aboutUs,
}) => {
  const currentYear = new Date().getFullYear();
  const hasSocialMedia =
    facebookUrl ||
    instagramUrl ||
    twitterUrl ||
    linkedinUrl ||
    youtubeUrl ||
    tiktokUrl;
  const hasContent =
    privacyPolicy || termsOfUse || returnsPolicy || deliveryPolicy || aboutUs;

  if (!footerEnabled) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            <p className="text-lg font-medium">Footer Desabilitado</p>
            <p className="text-sm">
              O footer não será exibido no catálogo público
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status das Configurações */}
      <div className="flex flex-wrap gap-2">
        <Badge variant={hasSocialMedia ? "default" : "secondary"}>
          Redes Sociais: {hasSocialMedia ? "Configuradas" : "Não configuradas"}
        </Badge>
        <Badge variant={hasContent ? "default" : "secondary"}>
          Páginas: {hasContent ? "Configuradas" : "Não configuradas"}
        </Badge>
        <Badge variant={footerCustomText ? "default" : "secondary"}>
          Texto Personalizado: {footerCustomText ? "Sim" : "Não"}
        </Badge>
      </div>

      {/* Preview do Footer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preview do Footer</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="bg-gray-900 text-white">
            {/* Main Footer */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Sobre a Loja */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                      L
                    </div>
                    <h3 className="text-xl font-bold">Sua Loja</h3>
                  </div>
                  <p className="text-gray-300 mb-4 text-sm">
                    {footerCustomText ||
                      "Descrição da sua loja aparecerá aqui. Personalize este texto nas configurações."}
                  </p>

                  {/* Redes Sociais */}
                  {hasSocialMedia && (
                    <div className="flex flex-wrap gap-2">
                      {facebookUrl && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white"
                          title="Facebook"
                        >
                          <Facebook size={16} />
                        </Button>
                      )}
                      {instagramUrl && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 bg-pink-600 hover:bg-pink-700 text-white"
                          title="Instagram"
                        >
                          <Instagram size={16} />
                        </Button>
                      )}
                      {twitterUrl && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 bg-blue-400 hover:bg-blue-500 text-white"
                          title="Twitter"
                        >
                          <Twitter size={16} />
                        </Button>
                      )}
                      {linkedinUrl && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 bg-blue-700 hover:bg-blue-800 text-white"
                          title="LinkedIn"
                        >
                          <Linkedin size={16} />
                        </Button>
                      )}
                      {youtubeUrl && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 bg-red-600 hover:bg-red-700 text-white"
                          title="YouTube"
                        >
                          <Youtube size={16} />
                        </Button>
                      )}
                      {tiktokUrl && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 bg-black hover:bg-gray-800 text-white"
                          title="TikTok"
                        >
                          <Video size={16} />
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
                      <button className="text-gray-300 hover:text-white transition-colors text-left text-sm">
                        Sobre Nós
                      </button>
                    </li>
                    <li>
                      <button className="text-gray-300 hover:text-white transition-colors text-left text-sm">
                        Nossos Produtos
                      </button>
                    </li>
                    <li>
                      <button className="text-gray-300 hover:text-white transition-colors text-left text-sm">
                        Contato
                      </button>
                    </li>
                    <li>
                      <button className="text-gray-300 hover:text-white transition-colors text-left text-sm">
                        FAQ
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Informações de Contato */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">Contato</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-gray-400 mt-0.5" />
                      <span className="text-gray-300 text-sm">
                        Endereço da sua loja
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-gray-400" />
                      <span className="text-gray-300 text-sm">
                        Telefone da loja
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-gray-400" />
                      <span className="text-gray-300 text-sm">
                        Email da loja
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <Clock size={16} className="text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          {businessHoursDisplayType === "summary" ? (
                            <span className="text-gray-300 text-sm font-medium block">
                              Seg - Sex: 9h às 18h • Sáb: 9h às 13h
                            </span>
                          ) : (
                            <div className="space-y-1">
                              <span className="text-gray-300 text-sm font-medium block mb-2">
                                Horários de Funcionamento
                              </span>
                              <div className="space-y-1">
                                <div className="text-xs text-yellow-400 font-medium">
                                  ● Segunda: 9:00 - 18:00 (Almoço: 12:00 -
                                  13:00)
                                </div>
                                <div className="text-xs text-gray-400">
                                  Terça: 9:00 - 18:00 (Almoço: 12:00 - 13:00)
                                </div>
                                <div className="text-xs text-gray-400">
                                  Quarta: 9:00 - 18:00 (Almoço: 12:00 - 13:00)
                                </div>
                                <div className="text-xs text-gray-400">
                                  Quinta: 9:00 - 18:00 (Almoço: 12:00 - 13:00)
                                </div>
                                <div className="text-xs text-gray-400">
                                  Sexta: 9:00 - 18:00 (Almoço: 12:00 - 13:00)
                                </div>
                                <div className="text-xs text-gray-400">
                                  Sábado: 9:00 - 13:00
                                </div>
                                <div className="text-xs text-gray-500">
                                  Domingo: Fechado
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Políticas e Informações */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">Informações</h4>
                  <ul className="space-y-2 mb-6">
                    {privacyPolicy && (
                      <li>
                        <button className="text-gray-300 hover:text-white transition-colors text-left text-sm">
                          Política de Privacidade
                        </button>
                      </li>
                    )}
                    {termsOfUse && (
                      <li>
                        <button className="text-gray-300 hover:text-white transition-colors text-left text-sm">
                          Termos de Uso
                        </button>
                      </li>
                    )}
                    {returnsPolicy && (
                      <li>
                        <button className="text-gray-300 hover:text-white transition-colors text-left text-sm">
                          Trocas e Devoluções
                        </button>
                      </li>
                    )}
                    {deliveryPolicy && (
                      <li>
                        <button className="text-gray-300 hover:text-white transition-colors text-left text-sm">
                          Política de Entrega
                        </button>
                      </li>
                    )}
                  </ul>

                  {/* Formas de Pagamento */}
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-300 mb-2">
                      Formas de Pagamento:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <div className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">
                        PIX
                      </div>
                      <div className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">
                        Cartão
                      </div>
                      <div className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">
                        Boleto
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-gray-700" />

            {/* Bottom Footer */}
            <div className="bg-gray-800 p-6">
              {/* Texto personalizado do footer */}
              {footerCustomText && (
                <div className="text-center mb-4">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {footerCustomText}
                  </p>
                </div>
              )}

              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-gray-400 text-sm text-center md:text-left">
                  {footerCopyrightText ||
                    `© ${currentYear} Sua Loja. Todos os direitos reservados.`}
                </p>

                {/* Opções de Entrega */}
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>Opções de Entrega:</span>
                  <div className="flex gap-2">
                    <div className="bg-gray-700 px-2 py-1 rounded text-xs">
                      Retirada
                    </div>
                    <div className="bg-gray-700 px-2 py-1 rounded text-xs">
                      Entrega
                    </div>
                    <div className="bg-gray-700 px-2 py-1 rounded text-xs">
                      Correios
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detalhes das Configurações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium mb-2">Redes Sociais Configuradas</h5>
              <div className="space-y-1 text-sm">
                {facebookUrl && (
                  <div className="flex items-center gap-2">
                    <Facebook className="h-4 w-4 text-blue-600" /> Facebook
                  </div>
                )}
                {instagramUrl && (
                  <div className="flex items-center gap-2">
                    <Instagram className="h-4 w-4 text-pink-600" /> Instagram
                  </div>
                )}
                {twitterUrl && (
                  <div className="flex items-center gap-2">
                    <Twitter className="h-4 w-4 text-blue-400" /> Twitter
                  </div>
                )}
                {linkedinUrl && (
                  <div className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-blue-700" /> LinkedIn
                  </div>
                )}
                {youtubeUrl && (
                  <div className="flex items-center gap-2">
                    <Youtube className="h-4 w-4 text-red-600" /> YouTube
                  </div>
                )}
                {tiktokUrl && (
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" /> TikTok
                  </div>
                )}
                {!hasSocialMedia && (
                  <p className="text-muted-foreground">
                    Nenhuma rede social configurada
                  </p>
                )}
              </div>
            </div>

            <div>
              <h5 className="font-medium mb-2">Páginas Configuradas</h5>
              <div className="space-y-1 text-sm">
                {privacyPolicy && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Política de Privacidade
                  </div>
                )}
                {termsOfUse && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Termos de Uso
                  </div>
                )}
                {returnsPolicy && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Trocas e Devoluções
                  </div>
                )}
                {deliveryPolicy && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Política de Entrega
                  </div>
                )}
                {aboutUs && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Sobre Nós
                  </div>
                )}
                {!hasContent && (
                  <p className="text-muted-foreground">
                    Nenhuma página configurada
                  </p>
                )}
              </div>
            </div>
          </div>

          {footerCustomText && (
            <div>
              <h5 className="font-medium mb-2">Texto Personalizado</h5>
              <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                {footerCustomText}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FooterPreview;
