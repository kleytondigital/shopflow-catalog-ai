import React from "react";
import { useCart } from "@/hooks/useCart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CartDebug: React.FC = () => {
  const cart = useCart();

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <Card className="fixed top-4 left-4 z-50 max-w-md">
      <CardHeader>
        <CardTitle className="text-sm">🛒 Debug do Carrinho</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div>
          <strong>Total de itens:</strong> {cart.totalItems}
        </div>
        <div>
          <strong>Total em R$:</strong> {cart.totalAmount.toFixed(2)}
        </div>
        <div>
          <strong>Carrinho aberto:</strong> {cart.isOpen ? "Sim" : "Não"}
        </div>
        <div>
          <strong>Número de produtos:</strong> {cart.items.length}
        </div>

        {cart.items.length > 0 && (
          <div className="space-y-1">
            <strong>Itens:</strong>
            {cart.items.map((item, index) => (
              <div key={item.id} className="bg-gray-100 p-2 rounded">
                <div>
                  {index + 1}. {item.product?.name || "Sem nome"}
                </div>
                <div>
                  Qtd: {item.quantity} | Preço: R${item.price}
                </div>
                <div>Total: R${(item.quantity * item.price).toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 border-t">
          <button
            onClick={() => {
              console.log("🛒 Estado completo do carrinho:", cart);
              console.log(
                "📦 LocalStorage cart-items:",
                localStorage.getItem("cart-items")
              );
            }}
            className="text-blue-600 underline"
          >
            Log estado no console
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CartDebug;
