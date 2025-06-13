
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';
import { useOrders, Order } from '@/hooks/useOrders';
import { useToast } from '@/hooks/use-toast';
import OrdersHeader from '@/components/orders/OrdersHeader';
import OrderFilters from '@/components/orders/OrderFilters';
import OrdersTable from '@/components/orders/OrdersTable';
import OrdersGrid from '@/components/orders/OrdersGrid';
import OrdersPagination from '@/components/orders/OrdersPagination';
import OrderDetailsModal from '@/components/orders/OrderDetailsModal';
import { generateWhatsAppMessage } from '@/components/catalog/checkout/checkoutUtils';

const Orders = () => {
  const { orders, loading, error, fetchOrders, updateOrderStatus } = useOrders();
  const { toast } = useToast();

  // View State
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Filter and Search Logic
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.customer_name.toLowerCase().includes(searchLower) ||
        order.customer_phone?.toLowerCase().includes(searchLower) ||
        order.customer_email?.toLowerCase().includes(searchLower) ||
        order.id.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => {
        const paymentStatus = getPaymentStatus(order);
        return paymentStatus === paymentFilter;
      });
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(order => order.order_type === typeFilter);
    }

    return filtered;
  }, [orders, searchTerm, statusFilter, paymentFilter, typeFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage, itemsPerPage]);

  // Helper Functions
  const getPaymentStatus = (order: Order) => {
    if (order.status === 'cancelled') return 'cancelled';
    if (order.status === 'delivered') return 'paid';
    if (order.status === 'pending') return 'pending';
    return 'processing';
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (statusFilter !== 'all') count++;
    if (paymentFilter !== 'all') count++;
    if (typeFilter !== 'all') count++;
    return count;
  };

  // Event Handlers
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const result = await updateOrderStatus(orderId, 'cancelled');
      if (result.error) {
        toast({
          title: "Erro",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Pedido cancelado com sucesso!",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao cancelar pedido",
        variant: "destructive",
      });
    }
  };

  const handleSendFollowUp = (order: Order) => {
    try {
      const message = generateWhatsAppMessage(order);
      const whatsappUrl = `https://wa.me/${order.customer_phone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      toast({
        title: "WhatsApp Aberto",
        description: "Mensagem de cobrança preparada no WhatsApp",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao abrir WhatsApp",
        variant: "destructive",
      });
    }
  };

  const handlePrintLabel = (order: Order) => {
    // TODO: Implementar impressão de etiqueta
    toast({
      title: "Em Desenvolvimento",
      description: "Funcionalidade de impressão de etiqueta em breve",
    });
  };

  const handlePrintDeclaration = (order: Order) => {
    // TODO: Implementar impressão de declaração
    toast({
      title: "Em Desenvolvimento",
      description: "Funcionalidade de declaração de conteúdo em breve",
    });
  };

  const handleExport = () => {
    // TODO: Implementar exportação
    toast({
      title: "Em Desenvolvimento",
      description: "Funcionalidade de exportação em breve",
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPaymentFilter('all');
    setTypeFilter('all');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6">
            <div className="h-20 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-16 bg-gray-200 rounded-lg animate-pulse" />
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <p className="text-red-600">Erro ao carregar pedidos: {error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <OrdersHeader
            totalOrders={filteredOrders.length}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onRefresh={fetchOrders}
            onExport={handleExport}
            isLoading={loading}
          />

          <OrderFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            paymentFilter={paymentFilter}
            onPaymentFilterChange={setPaymentFilter}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            onClearFilters={handleClearFilters}
            activeFiltersCount={getActiveFiltersCount()}
          />

          <Card>
            <CardContent className="p-0">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum pedido encontrado
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {getActiveFiltersCount() > 0 
                      ? "Tente ajustar os filtros para encontrar pedidos."
                      : "Os pedidos aparecerão aqui quando forem realizados pelos clientes."
                    }
                  </p>
                  {getActiveFiltersCount() > 0 && (
                    <Button variant="outline" onClick={handleClearFilters}>
                      Limpar Filtros
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className={viewMode === 'table' ? 'p-0' : 'p-6'}>
                    {viewMode === 'table' ? (
                      <OrdersTable
                        orders={paginatedOrders}
                        onViewOrder={handleViewOrder}
                        onCancelOrder={handleCancelOrder}
                        onSendFollowUp={handleSendFollowUp}
                        onPrintLabel={handlePrintLabel}
                        onPrintDeclaration={handlePrintDeclaration}
                      />
                    ) : (
                      <OrdersGrid
                        orders={paginatedOrders}
                        onViewOrder={handleViewOrder}
                        onCancelOrder={handleCancelOrder}
                        onSendFollowUp={handleSendFollowUp}
                        onPrintLabel={handlePrintLabel}
                        onPrintDeclaration={handlePrintDeclaration}
                      />
                    )}
                  </div>

                  <div className="px-6 pb-6">
                    <OrdersPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      itemsPerPage={itemsPerPage}
                      totalItems={filteredOrders.length}
                      onPageChange={handlePageChange}
                      onItemsPerPageChange={handleItemsPerPageChange}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onCancelOrder={handleCancelOrder}
        onSendFollowUp={handleSendFollowUp}
        onPrintLabel={handlePrintLabel}
        onPrintDeclaration={handlePrintDeclaration}
      />
    </div>
  );
};

export default Orders;
