
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Search, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import CustomersTable from '@/components/customers/CustomersTable';
import { useCustomers } from '@/hooks/useCustomers';

const Customers: React.FC = () => {
  const { customers, loading, searchTerm, setSearchTerm } = useCustomers();

  const handleExport = () => {
    const rows = customers.map(c => ({
      id: c.id,
      nome: c.name,
      telefone: c.phone,
      email: c.email || ''
    }));
    const csv = ['id;nome;telefone;email', ...rows.map(r => `${r.id};${r.nome};${r.telefone};${r.email}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clientes.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-6 bg-white rounded-lg border">
        <div className="flex items-center gap-4">
          <Users className="w-8 h-8 text-purple-600" />
          <div>
            <h2 className="text-lg font-semibold">Base de Clientes</h2>
            <p className="text-gray-600">Histórico de compras e dados dos clientes</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar clientes (nome, telefone, email)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-[280px]"
            />
          </div>
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" /> Exportar CSV
          </Button>
        </div>
      </div>

      <Card className="card-modern">
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomersTable customers={customers} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Customers;
