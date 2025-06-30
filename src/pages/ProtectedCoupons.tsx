import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CouponsList from "@/components/coupons/CouponsList";

const ProtectedCoupons = () => {
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
          <CouponsList />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProtectedCoupons;
