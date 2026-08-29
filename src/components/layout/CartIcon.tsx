"use client";

import { ShoppingCartIcon } from "@/components/icons";
import { useCart } from "@/context/CartContext";

export function CartIcon() {
  const { state, openCart, getItemCount } = useCart();
  const count = getItemCount();

  return (
    <button
      onClick={openCart}
      className="relative p-2 rounded-lg hover:bg-muted transition-colors"
      aria-label={`سبد خرید${count > 0 ? `، ${count} مورد` : "، خالی"}`}
    >
      <ShoppingCartIcon className="size-6 text-foreground" />
      {count > 0 && (
        <span className="absolute -top-1 -left-1 min-w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center px-1.5">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}