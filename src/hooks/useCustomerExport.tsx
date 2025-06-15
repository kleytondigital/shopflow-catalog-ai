
import { Customer } from './useCustomers';
import { format } from 'date-fns';

export const useCustomerExport = () => {
  const exportToExcel = (customers: Customer[]) => {
    const csvData = [
      ['Nome', 'Telefone', 'Email', 'Data de Cadastro'],
      ...customers.map(customer => [
        customer.name,
        customer.phone,
        customer.email || '',
        format(new Date(customer.created_at), 'dd/MM/yyyy HH:mm')
      ])
    ];

    const csvContent = csvData
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `clientes_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
    link.click();
  };

  const exportToPDF = (customers: Customer[]) => {
    // Criar conteúdo HTML para PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Lista de Clientes</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <h1>Lista de Clientes</h1>
          <p>Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Email</th>
                <th>Data de Cadastro</th>
              </tr>
            </thead>
            <tbody>
              ${customers.map(customer => `
                <tr>
                  <td>${customer.name}</td>
                  <td>${customer.phone}</td>
                  <td>${customer.email || '-'}</td>
                  <td>${format(new Date(customer.created_at), 'dd/MM/yyyy HH:mm')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>Total de clientes: ${customers.length}</p>
          </div>
        </body>
      </html>
    `;

    // Abrir nova janela para impressão/PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return {
    exportToExcel,
    exportToPDF
  };
};
