
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Tag } from 'lucide-react';
import { useCoupons, Coupon } from '@/hooks/useCoupons';
import CouponForm from '@/components/coupons/CouponForm';
import CouponsList from '@/components/coupons/CouponsList';

const Coupons = () => {
  const { toast } = useToast();
  const { coupons, loading, createCoupon, updateCoupon, deleteCoupon } = useCoupons();
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateCoupon = async (data: any) => {
    const { error } = await createCoupon(data);
    if (!error) {
      setDialogOpen(false);
    }
  };

  const handleUpdateCoupon = async (data: any) => {
    if (!selectedCoupon) return;
    
    const { error } = await updateCoupon(selectedCoupon.id, data);
    if (!error) {
      setDialogOpen(false);
      setSelectedCoupon(null);
    }
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setDialogOpen(true);
  };

  const handleDeleteCoupon = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cupom?')) {
      const { error } = await deleteCoupon(id);
      if (!error) {
        toast({
          title: "Cupom excluído",
          description: "Cupom excluído com sucesso!",
        });
      }
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    const { error } = await updateCoupon(id, { is_active: isActive });
    if (!error) {
      toast({
        title: "Status atualizado",
        description: `Cupom ${isActive ? 'ativado' : 'desativado'} com sucesso!`,
      });
    }
  };

  const activeCoupons = coupons.filter(c => c.is_active);
  const totalUsage = coupons.reduce((sum, c) => sum + c.current_uses, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cupons de Desconto</h1>
          <p className="text-gray-600">Gerencie cupons promocionais da sua loja</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="btn-primary"
              onClick={() => setSelectedCoupon(null)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Cupom
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedCoupon ? 'Editar Cupom' : 'Criar Novo Cupom'}
              </DialogTitle>
            </DialogHeader>
            <CouponForm
              onSubmit={selectedCoupon ? handleUpdateCoupon : handleCreateCoupon}
              coupon={selectedCoupon || undefined}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Cupons</CardDescription>
            <CardTitle className="text-3xl">{coupons.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {activeCoupons.length} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Usos Totais</CardDescription>
            <CardTitle className="text-3xl">{totalUsage}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Across all coupons
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Taxa de Conversão</CardDescription>
            <CardTitle className="text-3xl">
              {totalUsage > 0 ? Math.round((totalUsage / activeCoupons.length) * 100) / 100 : 0}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Média de uso por cupom
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Cupons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Seus Cupons
          </CardTitle>
          <CardDescription>
            Gerencie todos os cupons de desconto da sua loja
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CouponsList
            coupons={coupons}
            onEdit={handleEditCoupon}
            onDelete={handleDeleteCoupon}
            onToggleStatus={handleToggleStatus}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Coupons;
