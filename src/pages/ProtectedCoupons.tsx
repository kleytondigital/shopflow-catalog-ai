
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CouponsList from "@/components/coupons/CouponsList";
import { useCoupons } from "@/hooks/useCoupons";

const ProtectedCoupons = () => {
  const { coupons, loading, createCoupon, updateCoupon, deleteCoupon } = useCoupons();
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const handleEdit = (coupon: any) => {
    setSelectedCoupon(coupon);
  };

  const handleDelete = async (couponId: string) => {
    await deleteCoupon(couponId);
  };

  const handleToggleStatus = async (couponId: string, isActive: boolean) => {
    await updateCoupon(couponId, { is_active: isActive });
  };

  const breadcrumbs = [
    { href: "/", label: "Dashboard" },
    { label: "Cupons", current: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cupons de Desconto</h1>
        <p className="text-muted-foreground">
          Gerencie seus cupons de desconto e promoções
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Cupons</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os cupons criados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CouponsList
            coupons={coupons || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProtectedCoupons;
