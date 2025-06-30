import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Customer } from "@/hooks/useCustomers";

interface CustomersTableProps {
  customers: Customer[];
  loading: boolean;
}

const CustomersTable: React.FC<CustomersTableProps> = ({
  customers,
  loading,
}) => {
  // Garantir que customers seja sempre um array válido
  const safeCustomers = customers || [];

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (safeCustomers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">👥</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Nenhum cliente encontrado
        </h3>
        <p className="text-gray-600">
          Não há clientes que correspondam aos filtros aplicados.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Cadastrado</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {safeCustomers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-medium">{customer.name}</TableCell>
              <TableCell>
                <a
                  href={`https://wa.me/55${customer.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800 hover:underline"
                >
                  {customer.phone}
                </a>
              </TableCell>
              <TableCell>
                {customer.email ? (
                  <a
                    href={`mailto:${customer.email}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {customer.email}
                  </a>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(customer.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">Ativo</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomersTable;
