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
} from "lucide-react";

const FooterSettings: React.FC = () => {
  const { settings, updateSettings } = useCatalogSettings();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Estados básicos do footer
  const [footerEnabled, setFooterEnabled] = useState(true);
  const [footerCustomText, setFooterCustomText] = useState("");
  const [footerCopyrightText, setFooterCopyrightText] = useState("");

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
      });

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
          <div className="flex items-center justify-between mb-6">
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
        </CardContent>
      </Card>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">Configurações</TabsTrigger>
          <TabsTrigger value="social">Redes Sociais</TabsTrigger>
          <TabsTrigger value="pages">Páginas</TabsTrigger>
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
          <Card>
            <CardHeader>
              <CardTitle>Páginas de Informações</CardTitle>
              <CardDescription>
                Configure o conteúdo das páginas que aparecerão no footer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="privacy-policy">Política de Privacidade</Label>
                <Textarea
                  id="privacy-policy"
                  placeholder="Digite o conteúdo da política de privacidade..."
                  value={privacyPolicy}
                  onChange={(e) => setPrivacyPolicy(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="terms-of-use">Termos de Uso</Label>
                <Textarea
                  id="terms-of-use"
                  placeholder="Digite o conteúdo dos termos de uso..."
                  value={termsOfUse}
                  onChange={(e) => setTermsOfUse(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="returns-policy">
                  Política de Trocas e Devoluções
                </Label>
                <Textarea
                  id="returns-policy"
                  placeholder="Digite o conteúdo da política de trocas..."
                  value={returnsPolicy}
                  onChange={(e) => setReturnsPolicy(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery-policy">Política de Entrega</Label>
                <Textarea
                  id="delivery-policy"
                  placeholder="Digite o conteúdo da política de entrega..."
                  value={deliveryPolicy}
                  onChange={(e) => setDeliveryPolicy(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="about-us">Sobre Nós</Label>
                <Textarea
                  id="about-us"
                  placeholder="Digite o conteúdo sobre nós..."
                  value={aboutUs}
                  onChange={(e) => setAboutUs(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
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
