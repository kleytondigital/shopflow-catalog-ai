import React from "react";
import { Users, Search, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CustomersTable from "@/components/customers/CustomersTable";
import CustomersFilters from "@/components/customers/CustomersFilters";
import { useCustomers } from "@/hooks/useCustomers";

const Customers = () => {
  const { customers, loading, error } = useCustomers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Clientes
          </h1>
          <p className="text-muted-foreground">
            Gerencie sua base de clientes e acompanhe seus dados
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Buscar clientes..." className="pl-10" />
          </div>
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filtros
        </Button>
      </div>

      <CustomersFilters />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Erro ao carregar clientes: {error}</p>
        </div>
      )}

      <CustomersTable customers={customers || []} loading={loading} />
    </div>
  );
};

export default Customers;
