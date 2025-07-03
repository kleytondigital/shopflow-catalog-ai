import React, { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Download,
  X,
  Play,
  Pause,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBulkImport, ImportConfig } from "@/hooks/useBulkImport";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId?: string;
}

const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  storeId,
}) => {
  const { toast } = useToast();
  const {
    isImporting,
    progress,
    result,
    startImport,
    downloadTemplate,
    resetImport,
    canStartNewImport,
  } = useBulkImport();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [config, setConfig] = useState<ImportConfig>({
    createCategories: true,
    updateExisting: false,
    strictValidation: true,
    uploadImages: false,
  });
  const [step, setStep] = useState<
    "upload" | "preview" | "processing" | "results"
  >("upload");

  // Reset ao abrir modal
  useEffect(() => {
    if (isOpen) {
      resetImport();
      setSelectedFile(null);
      setStep("upload");
    }
  }, [isOpen, resetImport]);

  // Monitorar progresso
  useEffect(() => {
    if (progress) {
      if (progress.stage === "completed") {
        setStep("results");
      } else if (progress.stage === "error") {
        toast({
          title: "Erro na importação",
          description: progress.message,
          variant: "destructive",
        });
      }
    }
  }, [progress, toast]);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const uploadedFile = event.target.files?.[0];
      if (!uploadedFile) return;

      if (!uploadedFile.name.endsWith(".xlsx")) {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione um arquivo .xlsx",
          variant: "destructive",
        });
        return;
      }

      // Validar tamanho (máximo 10MB)
      if (uploadedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 10MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(uploadedFile);
      setStep("preview");
    },
    [toast]
  );

  const handleDownloadTemplate = useCallback(async () => {
    const result = await downloadTemplate();

    if (result.success) {
      toast({
        title: "Template baixado",
        description: "Template de importação salvo no seu computador",
      });
    } else {
      toast({
        title: "Erro ao baixar template",
        description: result.error,
        variant: "destructive",
      });
    }
  }, [downloadTemplate, toast]);

  const handleStartImport = useCallback(async () => {
    if (!selectedFile || !storeId) {
      toast({
        title: "Dados necessários",
        description: "Arquivo e loja são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setStep("processing");

    const result = await startImport(selectedFile, storeId, config);

    if (!result.success) {
      toast({
        title: "Erro na importação",
        description: result.error,
        variant: "destructive",
      });
      setStep("preview");
    }
  }, [selectedFile, storeId, config, startImport, toast]);

  const handleClose = useCallback(() => {
    if (!isImporting) {
      onClose();
    }
  }, [isImporting, onClose]);

  const renderUploadStep = () => (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Faça upload da sua planilha
            </h3>
            <p className="text-gray-600 mb-4">
              Selecione um arquivo .xlsx com seus produtos
            </p>
            <input
              type="file"
              accept=".xlsx"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Selecionar Arquivo
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Template Download */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium mb-2">
                Precisa de um template?
              </h3>
              <p className="text-gray-600">
                Baixe nosso modelo padrão com exemplos e instruções
              </p>
            </div>
            <Button onClick={handleDownloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Baixar Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instruções */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Dicas importantes:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Use apenas arquivos .xlsx (Excel)</li>
            <li>Máximo 10MB por arquivo</li>
            <li>Inclua as abas: PRODUTOS, CATEGORIAS e VARIAÇÕES</li>
            <li>Nome e categoria são campos obrigatórios</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-6">
      {/* Arquivo selecionado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Arquivo Selecionado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-medium">{selectedFile?.name}</p>
                <p className="text-sm text-gray-600">
                  {selectedFile
                    ? (selectedFile.size / 1024 / 1024).toFixed(2)
                    : 0}{" "}
                  MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedFile(null);
                setStep("upload");
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configurações */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Importação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Criar categorias automaticamente
            </label>
            <input
              type="checkbox"
              checked={config.createCategories}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  createCategories: e.target.checked,
                }))
              }
              className="rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Atualizar produtos existentes
            </label>
            <input
              type="checkbox"
              checked={config.updateExisting}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  updateExisting: e.target.checked,
                }))
              }
              className="rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Validação rigorosa</label>
            <input
              type="checkbox"
              checked={config.strictValidation}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  strictValidation: e.target.checked,
                }))
              }
              className="rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Upload automático de imagens
            </label>
            <input
              type="checkbox"
              checked={config.uploadImages}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  uploadImages: e.target.checked,
                }))
              }
              className="rounded"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Importação em Andamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {progress && (
            <>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>{progress.message}</span>
                  <span>{progress.percentage}%</span>
                </div>
                <Progress value={progress.percentage} className="w-full" />
              </div>

              {progress.currentItem && (
                <p className="text-sm text-gray-600">
                  Processando: {progress.currentItem}
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Não feche esta janela durante a importação. O processo pode levar
          alguns minutos dependendo do tamanho do arquivo.
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderResultsStep = () => (
    <div className="space-y-6">
      {result && (
        <>
          {/* Resumo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Importação Concluída
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {result.total}
                  </div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {result.successful}
                  </div>
                  <div className="text-sm text-gray-600">Sucesso</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {result.failed}
                  </div>
                  <div className="text-sm text-gray-600">Erros</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logs de erro */}
          {result.failed > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">
                  Erros Encontrados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {result.logs
                    .filter((log) => log.status === "error")
                    .map((log, index) => (
                      <div
                        key={index}
                        className="p-3 bg-red-50 rounded border-l-4 border-red-400"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-red-800">
                              Linha {log.rowNumber}: {log.productName}
                            </p>
                            <p className="text-sm text-red-600">
                              {log.message}
                            </p>
                          </div>
                          <Badge variant="destructive">Erro</Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-6 w-6 text-blue-600" />
            <div>
              <DialogTitle className="text-xl font-bold">
                Importação em Massa de Produtos
              </DialogTitle>
              <p className="text-sm text-gray-600">
                Importe produtos em lote via planilha Excel
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="py-6">
          {step === "upload" && renderUploadStep()}
          {step === "preview" && renderPreviewStep()}
          {step === "processing" && renderProcessingStep()}
          {step === "results" && renderResultsStep()}
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {step !== "upload" && step !== "processing" && (
              <Button
                variant="outline"
                onClick={() => {
                  if (step === "preview") {
                    setStep("upload");
                  } else if (step === "results") {
                    setStep("upload");
                    setSelectedFile(null);
                    resetImport();
                  }
                }}
              >
                Voltar
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isImporting}
            >
              {step === "results" ? "Fechar" : "Cancelar"}
            </Button>

            {step === "preview" && (
              <Button
                onClick={handleStartImport}
                disabled={!canStartNewImport || !selectedFile}
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar Importação
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkImportModal;
