import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useCatalogSettings } from "@/hooks/useCatalogSettings";
import {
  FileText,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Video,
  Globe,
  Clock,
} from "lucide-react";
import FooterPreview from "./FooterPreview";
import FooterPageEditor from "./FooterPageEditor";
import {
  DEFAULT_CONTENT,
  loadDefaultContent,
  getContentDescription,
} from "./FooterDefaultContent";

const FooterSettings: React.FC = () => {
  const { settings, updateSettings } = useCatalogSettings();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Estados básicos do footer
  const [footerEnabled, setFooterEnabled] = useState(true);
  const [footerCustomText, setFooterCustomText] = useState("");
  const [footerCopyrightText, setFooterCopyrightText] = useState("");
  const [businessHoursDisplayType, setBusinessHoursDisplayType] = useState<
    "summary" | "detailed"
  >("summary");

  // Redes sociais
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");

  // Páginas informativas
  const [privacyPolicy, setPrivacyPolicy] = useState("");
  const [termsOfUse, setTermsOfUse] = useState("");
  const [returnsPolicy, setReturnsPolicy] = useState("");
  const [deliveryPolicy, setDeliveryPolicy] = useState("");
  const [aboutUs, setAboutUs] = useState("");

  // Carregar dados existentes
  useEffect(() => {
    if (settings) {
      setFooterEnabled(settings.footer_enabled !== false);
      setFooterCustomText(settings.footer_custom_text || "");
      setFooterCopyrightText(settings.footer_copyright_text || "");
      setBusinessHoursDisplayType(
        (settings as any).business_hours_display_type || "summary"
      );

      setFacebookUrl(settings.facebook_url || "");
      setInstagramUrl(settings.instagram_url || "");
      setTwitterUrl(settings.twitter_url || "");
      setLinkedinUrl(settings.linkedin_url || "");
      setYoutubeUrl(settings.youtube_url || "");
      setTiktokUrl(settings.tiktok_url || "");

      setPrivacyPolicy(settings.privacy_policy_content || "");
      setTermsOfUse(settings.terms_of_use_content || "");
      setReturnsPolicy(settings.returns_policy_content || "");
      setDeliveryPolicy(settings.delivery_policy_content || "");
      setAboutUs(settings.about_us_content || "");
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      setLoading(true);

      await updateSettings({
        footer_enabled: footerEnabled,
        footer_custom_text: footerCustomText,
        footer_copyright_text: footerCopyrightText,
        business_hours_display_type: businessHoursDisplayType,
        facebook_url: facebookUrl,
        instagram_url: instagramUrl,
        twitter_url: twitterUrl,
        linkedin_url: linkedinUrl,
        youtube_url: youtubeUrl,
        tiktok_url: tiktokUrl,
        privacy_policy_content: privacyPolicy,
        terms_of_use_content: termsOfUse,
        returns_policy_content: returnsPolicy,
        delivery_policy_content: deliveryPolicy,
        about_us_content: aboutUs,
      } as any);

      toast({
        title: "Configurações salvas!",
        description:
          "As configurações do footer foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultContentHandler = (type: string) => {
    const defaultContent = (DEFAULT_CONTENT as any)[type];
    if (defaultContent) {
      // Aplicar o conteúdo ao estado correto baseado no tipo
      switch (type) {
        case "privacy_policy":
          setPrivacyPolicy(defaultContent);
          break;
        case "terms_of_use":
          setTermsOfUse(defaultContent);
          break;
        case "returns_policy":
          setReturnsPolicy(defaultContent);
          break;
        case "delivery_policy":
          setDeliveryPolicy(defaultContent);
          break;
        case "about_us":
          setAboutUs(defaultContent);
          break;
      }

      toast({
        title: "Conteúdo padrão carregado",
        description: `Conteúdo padrão para "${getContentDescription(
          type
        )}" carregado.`,
      });
    } else {
      toast({
        title: "Erro ao carregar conteúdo padrão",
        description: `Não foi possível encontrar conteúdo padrão para "${getContentDescription(
          type
        )}".`,
        variant: "destructive",
      });
    }
  };

  const clearContent = (type: string) => {
    // Limpar apenas o conteúdo específico baseado no tipo
    switch (type) {
      case "privacy_policy":
        setPrivacyPolicy("");
        break;
      case "terms_of_use":
        setTermsOfUse("");
        break;
      case "returns_policy":
        setReturnsPolicy("");
        break;
      case "delivery_policy":
        setDeliveryPolicy("");
        break;
      case "about_us":
        setAboutUs("");
        break;
    }

    toast({
      title: "Conteúdo limpo",
      description: `Conteúdo para "${getContentDescription(type)}" foi limpo.`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Configurações do Footer
          </CardTitle>
          <CardDescription>
            Configure as informações e páginas que aparecerão no footer do
            catálogo. As informações de contato (telefone, email, endereço)
            serão obtidas das configurações da loja.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Exibir Footer</Label>
                <p className="text-sm text-muted-foreground">
                  Ativar ou desativar a exibição do footer no catálogo
                </p>
              </div>
              <Switch
                checked={footerEnabled}
                onCheckedChange={setFooterEnabled}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <Label>Exibição dos Horários de Funcionamento</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Escolha como os horários de funcionamento serão exibidos no
                footer
              </p>
              <RadioGroup
                value={businessHoursDisplayType}
                onValueChange={(value: "summary" | "detailed") =>
                  setBusinessHoursDisplayType(value)
                }
                className="grid grid-cols-1 gap-3"
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="summary" id="summary" />
                  <Label htmlFor="summary" className="flex-1 cursor-pointer">
                    <div className="font-medium">Resumido</div>
                    <div className="text-sm text-muted-foreground">
                      Mostra um resumo compacto (ex: Seg-Sex: 9h às 18h • Sáb:
                      9h às 13h)
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="detailed" id="detailed" />
                  <Label htmlFor="detailed" className="flex-1 cursor-pointer">
                    <div className="font-medium">Detalhado</div>
                    <div className="text-sm text-muted-foreground">
                      Mostra todos os dias configurados destacando o dia atual
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings">Configurações</TabsTrigger>
          <TabsTrigger value="social">Redes Sociais</TabsTrigger>
          <TabsTrigger value="pages">Páginas</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personalização do Footer</CardTitle>
              <CardDescription>
                Configure textos personalizados para o footer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="footer-custom-text">Texto Personalizado</Label>
                <Textarea
                  id="footer-custom-text"
                  placeholder="Texto adicional para o footer..."
                  value={footerCustomText}
                  onChange={(e) => setFooterCustomText(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Texto que aparecerá no footer antes das informações de contato
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="footer-copyright">Texto de Copyright</Label>
                <Input
                  id="footer-copyright"
                  placeholder="© 2024 Sua Loja. Todos os direitos reservados."
                  value={footerCopyrightText}
                  onChange={(e) => setFooterCopyrightText(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Se vazio, será gerado automaticamente com o nome da loja
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Redes Sociais</CardTitle>
              <CardDescription>
                Configure os links das redes sociais (opcional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook" className="flex items-center gap-2">
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </Label>
                  <Input
                    id="facebook"
                    placeholder="https://facebook.com/sua-loja"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="instagram"
                    className="flex items-center gap-2"
                  >
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    placeholder="https://instagram.com/sua-loja"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter" className="flex items-center gap-2">
                    <Twitter className="h-4 w-4" />
                    Twitter
                  </Label>
                  <Input
                    id="twitter"
                    placeholder="https://twitter.com/sua-loja"
                    value={twitterUrl}
                    onChange={(e) => setTwitterUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedin"
                    placeholder="https://linkedin.com/company/sua-loja"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtube" className="flex items-center gap-2">
                    <Youtube className="h-4 w-4" />
                    YouTube
                  </Label>
                  <Input
                    id="youtube"
                    placeholder="https://youtube.com/sua-loja"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiktok" className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    TikTok
                  </Label>
                  <Input
                    id="tiktok"
                    placeholder="https://tiktok.com/@sua-loja"
                    value={tiktokUrl}
                    onChange={(e) => setTiktokUrl(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="space-y-6">
          <div className="space-y-6">
            <FooterPageEditor
              title="Política de Privacidade"
              type="privacy_policy"
              content={privacyPolicy}
              onContentChange={setPrivacyPolicy}
              onLoadDefault={() => loadDefaultContentHandler("privacy_policy")}
              onClear={() => clearContent("privacy_policy")}
            />

            <FooterPageEditor
              title="Termos de Uso"
              type="terms_of_use"
              content={termsOfUse}
              onContentChange={setTermsOfUse}
              onLoadDefault={() => loadDefaultContentHandler("terms_of_use")}
              onClear={() => clearContent("terms_of_use")}
            />

            <FooterPageEditor
              title="Política de Trocas e Devoluções"
              type="returns_policy"
              content={returnsPolicy}
              onContentChange={setReturnsPolicy}
              onLoadDefault={() => loadDefaultContentHandler("returns_policy")}
              onClear={() => clearContent("returns_policy")}
            />

            <FooterPageEditor
              title="Política de Entrega"
              type="delivery_policy"
              content={deliveryPolicy}
              onContentChange={setDeliveryPolicy}
              onLoadDefault={() => loadDefaultContentHandler("delivery_policy")}
              onClear={() => clearContent("delivery_policy")}
            />

            <FooterPageEditor
              title="Sobre Nós"
              type="about_us"
              content={aboutUs}
              onContentChange={setAboutUs}
              onLoadDefault={() => loadDefaultContentHandler("about_us")}
              onClear={() => clearContent("about_us")}
            />
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <FooterPreview
            footerEnabled={footerEnabled}
            footerCustomText={footerCustomText}
            footerCopyrightText={footerCopyrightText}
            businessHoursDisplayType={businessHoursDisplayType}
            facebookUrl={facebookUrl}
            instagramUrl={instagramUrl}
            twitterUrl={twitterUrl}
            linkedinUrl={linkedinUrl}
            youtubeUrl={youtubeUrl}
            tiktokUrl={tiktokUrl}
            privacyPolicy={privacyPolicy}
            termsOfUse={termsOfUse}
            returnsPolicy={returnsPolicy}
            deliveryPolicy={deliveryPolicy}
            aboutUs={aboutUs}
          />
        </TabsContent>
      </Tabs>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} size="lg">
          {loading ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  );
};

export default FooterSettings;
