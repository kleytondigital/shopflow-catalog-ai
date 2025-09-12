import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DataExporterProps {
  storeId?: string;
  timeRange: string;
}

type ExportFormat = "csv" | "xlsx" | "json";
type ExportType = "metrics" | "orders" | "products" | "views" | "all";

export const DataExporter: React.FC<DataExporterProps> = ({
  storeId,
  timeRange,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
  const [exportType, setExportType] = useState<ExportType>("metrics");
  const { toast } = useToast();

  const getDateRange = (range: string) => {
    const now = new Date();
    const days =
      range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return { startDate, endDate: now };
  };

  const formatDataForExport = (data: any[], type: ExportType) => {
    switch (type) {
      case "metrics":
        return data.map((item) => ({
          Data: new Date(item.created_at).toLocaleDateString("pt-BR"),
          Receita: item.total_amount || 0,
          Pedidos: item.orders_count || 0,
          Usuários: item.users_count || 0,
          Visualizações: item.views_count || 0,
        }));

      case "orders":
        return data.map((item) => ({
          ID: item.id,
          Cliente: item.customer_name,
          Email: item.customer_email || "",
          Telefone: item.customer_phone || "",
          "Valor Total": item.total_amount,
          Status: item.status,
          Tipo: item.order_type,
          Data: new Date(item.created_at).toLocaleDateString("pt-BR"),
        }));

      case "products":
        return data.map((item) => ({
          ID: item.id,
          Nome: item.name,
          Descrição: item.description || "",
          Categoria: item.category || "",
          "Preço Varejo": item.retail_price,
          "Preço Atacado": item.wholesale_price || 0,
          Estoque: item.stock,
          Ativo: item.is_active ? "Sim" : "Não",
          "Data Criação": new Date(item.created_at).toLocaleDateString("pt-BR"),
        }));

      case "views":
        return data.map((item) => ({
          Data: new Date(item.created_at).toLocaleDateString("pt-BR"),
          Página: item.page_path,
          Título: item.page_title || "",
          Visualizações: item.view_count,
          Sessão: item.session_id,
        }));

      default:
        return data;
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast({
        title: "Nenhum dado encontrado",
        description: "Não há dados para exportar no período selecionado.",
        variant: "destructive",
      });
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((header) => `"${row[header] || ""}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const exportToJSON = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast({
        title: "Nenhum dado encontrado",
        description: "Não há dados para exportar no período selecionado.",
        variant: "destructive",
      });
      return;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.json`;
    link.click();
  };

  const exportToXLSX = async (data: any[], filename: string) => {
    try {
      // Para XLSX, vamos usar uma biblioteca externa
      // Por enquanto, exportar como CSV com extensão .xlsx
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(","),
        ...data.map((row) =>
          headers.map((header) => `"${row[header] || ""}"`).join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.xlsx`;
      link.click();
    } catch (error) {
      console.error("Erro ao exportar XLSX:", error);
      toast({
        title: "Erro na exportação",
        description: "Erro ao exportar para XLSX. Tente CSV ou JSON.",
        variant: "destructive",
      });
    }
  };

  const fetchData = async (type: ExportType) => {
    const { startDate, endDate } = getDateRange(timeRange);
    const filename = `analytics_${type}_${timeRange}_${
      new Date().toISOString().split("T")[0]
    }`;

    try {
      let data: any[] = [];

      switch (type) {
        case "metrics":
          // Buscar métricas agregadas por dia
          const { data: ordersData } = await supabase
            .from("orders")
            .select("total_amount, created_at")
            .eq("status", "delivered")
            .gte("created_at", startDate.toISOString())
            .lte("created_at", endDate.toISOString());

          // Agrupar por dia
          const dailyMetrics = new Map();
          ordersData?.forEach((order) => {
            const date = new Date(order.created_at).toISOString().split("T")[0];
            if (!dailyMetrics.has(date)) {
              dailyMetrics.set(date, {
                created_at: order.created_at,
                total_amount: 0,
                orders_count: 0,
                users_count: 0,
                views_count: 0,
              });
            }
            const day = dailyMetrics.get(date);
            day.total_amount += order.total_amount || 0;
            day.orders_count += 1;
          });

          data = Array.from(dailyMetrics.values());
          break;

        case "orders":
          const { data: orders } = await supabase
            .from("orders")
            .select("*")
            .eq("status", "delivered")
            .gte("created_at", startDate.toISOString())
            .lte("created_at", endDate.toISOString())
            .order("created_at", { ascending: false });

          data = orders || [];
          break;

        case "products":
          const { data: products } = await supabase
            .from("products")
            .select("*")
            .gte("created_at", startDate.toISOString())
            .lte("created_at", endDate.toISOString())
            .order("created_at", { ascending: false });

          data = products || [];
          break;

        case "views":
          // Temporariamente desabilitado - tabela não existe
          // const { data: views } = await supabase
          //   .from("analytics_views")
          //   .select("*")
          //   .gte("created_at", startDate.toISOString())
          //   .lte("created_at", endDate.toISOString())
          //   .order("created_at", { ascending: false });

          data = []; // Retornar array vazio temporariamente
          break;

        case "all":
          // Exportar todos os dados
          const allData = [];

          // Métricas
          const { data: allOrders } = await supabase
            .from("orders")
            .select("total_amount, created_at")
            .eq("status", "delivered")
            .gte("created_at", startDate.toISOString())
            .lte("created_at", endDate.toISOString());

          allData.push(
            ...(allOrders || []).map((order) => ({
              type: "order",
              ...order,
            }))
          );

          // Produtos
          const { data: allProducts } = await supabase
            .from("products")
            .select("*")
            .gte("created_at", startDate.toISOString())
            .lte("created_at", endDate.toISOString());

          allData.push(
            ...(allProducts || []).map((product) => ({
              type: "product",
              ...product,
            }))
          );

          data = allData;
          break;
      }

      const formattedData = formatDataForExport(data, type);

      switch (exportFormat) {
        case "csv":
          exportToCSV(formattedData, filename);
          break;
        case "json":
          exportToJSON(formattedData, filename);
          break;
        case "xlsx":
          await exportToXLSX(formattedData, filename);
          break;
      }

      toast({
        title: "Exportação concluída",
        description: `Dados exportados com sucesso em formato ${exportFormat.toUpperCase()}`,
      });
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      toast({
        title: "Erro na exportação",
        description: "Erro ao buscar dados para exportação.",
        variant: "destructive",
      });
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await fetchData(exportType);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Exportar Dados
        </CardTitle>
        <CardDescription>
          Exporte dados de analytics em diferentes formatos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Dados</label>
            <Select
              value={exportType}
              onValueChange={(value: ExportType) => setExportType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metrics">Métricas</SelectItem>
                <SelectItem value="orders">Pedidos</SelectItem>
                <SelectItem value="products">Produtos</SelectItem>
                <SelectItem value="views">Visualizações</SelectItem>
                <SelectItem value="all">Todos os Dados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Formato</label>
            <Select
              value={exportFormat}
              onValueChange={(value: ExportFormat) => setExportFormat(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    CSV
                  </div>
                </SelectItem>
                <SelectItem value="xlsx">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    JSON
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          Período:{" "}
          {timeRange === "7d"
            ? "7 dias"
            : timeRange === "30d"
            ? "30 dias"
            : timeRange === "90d"
            ? "90 dias"
            : "1 ano"}
        </div>

        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Exportar Dados
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
