import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Download, Trash2, FileText, Eye, Edit3, Sparkles } from "lucide-react";
import { DEFAULT_CONTENT, getContentDescription } from "./FooterDefaultContent";
import AIPageGenerator from "./AIPageGenerator";

interface FooterPageEditorProps {
  title: string;
  type: keyof typeof DEFAULT_CONTENT;
  content: string;
  onContentChange: (content: string) => void;
  onLoadDefault: () => void;
  onClear: () => void;
}

const FooterPageEditor: React.FC<FooterPageEditorProps> = ({
  title,
  type,
  content,
  onContentChange,
  onLoadDefault,
  onClear,
}) => {
  const { toast } = useToast();
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const hasContent = content.trim().length > 0;
  const wordCount = content
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  const handleLoadDefault = () => {
    onLoadDefault();
    toast({
      title: "Conteúdo padrão carregado!",
      description:
        "O conteúdo padrão foi carregado. Personalize conforme necessário.",
    });
  };

  const handleClear = () => {
    onClear();
    toast({
      title: "Conteúdo limpo!",
      description: "O conteúdo foi removido.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={hasContent ? "default" : "secondary"}>
              {hasContent ? "Configurado" : "Não configurado"}
            </Badge>
            {hasContent && (
              <Badge variant="outline" className="text-xs">
                {wordCount} palavras
              </Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {getContentDescription(type)}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controles */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAIGenerator(!showAIGenerator)}
              className="text-xs"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {showAIGenerator ? "Ocultar" : "Gerar com"} IA
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadDefault}
              className="text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Carregar Padrão
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="text-xs"
              disabled={!hasContent}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Limpar
            </Button>
          </div>

          {hasContent && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                Última edição: {new Date().toLocaleDateString("pt-BR")}
              </span>
            </div>
          )}
        </div>

        {/* Gerador de IA */}
        {showAIGenerator && (
          <>
            <Separator />
            <AIPageGenerator
              pageType={type}
              title={title}
              currentContent={content}
              onContentGenerated={(generatedContent) => {
                onContentChange(generatedContent);
                setShowAIGenerator(false);
              }}
            />
            <Separator />
          </>
        )}

        {/* Editor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={`${type}-content`} className="text-sm font-medium">
              Conteúdo da Página
            </Label>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Markdown suportado</span>
              <span>•</span>
              <span>{content.length} caracteres</span>
            </div>
          </div>

          <Textarea
            id={`${type}-content`}
            placeholder={`Digite o conteúdo da ${title.toLowerCase()}...`}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            rows={8}
            className="font-mono text-sm resize-y"
          />

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Use # para títulos</span>
              <span>Use ## para subtítulos</span>
              <span>Use - para listas</span>
            </div>
            <span>Min: 50 caracteres | Recomendado: 200+ caracteres</span>
          </div>
        </div>

        {/* Preview Rápido */}
        {hasContent && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Preview Rápido</Label>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto">
                <div className="prose prose-sm max-w-none">
                  {content
                    .split("\n")
                    .slice(0, 3)
                    .map((line, index) => {
                      if (line.startsWith("# ")) {
                        return (
                          <h1 key={index} className="text-lg font-bold mb-2">
                            {line.slice(2)}
                          </h1>
                        );
                      } else if (line.startsWith("## ")) {
                        return (
                          <h2
                            key={index}
                            className="text-base font-semibold mb-1"
                          >
                            {line.slice(3)}
                          </h2>
                        );
                      } else if (line.startsWith("- ")) {
                        return (
                          <li key={index} className="ml-4 text-sm">
                            {line.slice(2)}
                          </li>
                        );
                      } else if (line.trim() === "") {
                        return <br key={index} />;
                      } else {
                        return (
                          <p key={index} className="text-sm mb-1">
                            {line}
                          </p>
                        );
                      }
                    })}
                  {content.split("\n").length > 3 && (
                    <p className="text-xs text-muted-foreground italic">
                      ... e mais {content.split("\n").length - 3} linhas
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Dicas */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Edit3 className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-xs text-blue-800">
              <p className="font-medium mb-1">💡 Dicas para um bom conteúdo:</p>
              <ul className="space-y-1">
                <li>• Seja claro e direto</li>
                <li>• Use linguagem acessível</li>
                <li>• Organize com títulos e subtítulos</li>
                <li>• Inclua informações de contato quando relevante</li>
                <li>• Revise antes de salvar</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FooterPageEditor;
