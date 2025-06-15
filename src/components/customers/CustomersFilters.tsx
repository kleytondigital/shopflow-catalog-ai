
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Download, FileText } from 'lucide-react';

interface CustomersFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
  totalCustomers: number;
}

const CustomersFilters: React.FC<CustomersFiltersProps> = ({
  searchTerm,
  onSearchChange,
  onExportExcel,
  onExportPDF,
  totalCustomers
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 w-full sm:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou telefone..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={onExportExcel}
              className="flex-1 sm:flex-none"
            >
              <Download className="h-4 w-4 mr-2" />
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onExportPDF}
              className="flex-1 sm:flex-none"
            >
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          {totalCustomers === 1 ? (
            `${totalCustomers} cliente encontrado`
          ) : (
            `${totalCustomers} clientes encontrados`
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomersFilters;
