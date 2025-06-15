
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import CustomersTable from '@/components/customers/CustomersTable';
import CustomersFilters from '@/components/customers/CustomersFilters';
import { useCustomers } from '@/hooks/useCustomers';
import { useCustomerExport } from '@/hooks/useCustomerExport';

const Customers = () => {
  const { 
    customers, 
    loading, 
    searchTerm, 
    setSearchTerm 
  } = useCustomers();
  
  const { exportToExcel, exportToPDF } = useCustomerExport();

  const breadcrumbs = [
    { href: '/', label: 'Dashboard' },
    { label: 'Clientes', current: true },
  ];

  const handleExportExcel = () => {
    exportToExcel(customers);
  };

  const handleExportPDF = () => {
    exportToPDF(customers);
  };

  return (
    <AppLayout 
      title="Clientes" 
      subtitle="Gerencie a base de clientes da sua loja"
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        <CustomersFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onExportExcel={handleExportExcel}
          onExportPDF={handleExportPDF}
          totalCustomers={customers.length}
        />

        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              Clientes Cadastrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CustomersTable customers={customers} loading={loading} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Customers;
