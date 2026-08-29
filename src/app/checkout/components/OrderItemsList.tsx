"use client";

import { formatPrice } from "@/lib/products";
import { TrashIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { OrderItem } from "./OrderItem";

interface OrderItemsListProps {
  items: {
    productId: string;
    name: string;
    price_rial: number;
    quantity: number;
    image?: string;
  }[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
}

export function OrderItemsList({ items, onUpdateQuantity, onRemove, onClear }: OrderItemsListProps) {
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="checkout-items lg:col-span-2 space-y-6">
      <ul className="space-y-4" role="list" aria-label="آیتم‌های سفارش">
        {items.map((item) => (
          <OrderItem
            key={item.productId}
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemove}
          />
        ))}
      </ul>

      {items.length > 0 && (
        <div className="rounded-app border border-border bg-surface p-4">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={onClear}
          >
            <TrashIcon className="size-4 mr-1" />
            خالی کردن سبد
          </Button>
        </div>
      )}
    </div>
  );
}