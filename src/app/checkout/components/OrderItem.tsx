"use client";

import { formatPrice } from "@/lib/products";
import { ShoppingCartIcon, MinusIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

interface OrderItemProps {
  item: {
    productId: string;
    name: string;
    price_rial: number;
    quantity: number;
    image?: string;
    stock?: number;
  };
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export function OrderItem({ item, onUpdateQuantity, onRemove }: OrderItemProps) {
  return (
    <li
      key={item.productId}
      className="flex gap-4 p-4 rounded-app border border-border bg-surface"
    >
      <div className="relative w-16 h-16 flex-shrink-0 rounded-app overflow-hidden bg-muted">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCartIcon className="size-8 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <h4 className="font-medium text-foreground truncate">{item.name}</h4>
        <p className="text-sm text-primary-text font-display">
          {formatPrice(item.price_rial)} <span className="font-body text-xs">ریال</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="کاهش تعداد"
          >
            <MinusIcon className="size-4" />
          </button>
<span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                {item.stock != null && item.quantity >= item.stock && (
                  <span className="text-[11px] text-muted-foreground">بیشترین موجودی</span>
                )}
                <button
                  onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                  disabled={item.stock != null && item.quantity >= item.stock}
                  className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="افزایش تعداد"
                >
            <PlusIcon className="size-4" />
          </button>
          <button
            onClick={() => onRemove(item.productId)}
            className="ml-auto p-1.5 rounded hover:bg-red-50 hover:text-red-600 transition-colors"
            aria-label={`حذف ${item.name}`}
          >
            <TrashIcon className="size-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground">مجموع: {formatPrice(item.price_rial * item.quantity)} ریال</p>
      </div>
    </li>
  );
}