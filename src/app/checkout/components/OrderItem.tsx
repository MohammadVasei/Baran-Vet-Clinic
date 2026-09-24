"use client";

import { formatPrice, formatQuantity, getQuantityCeiling, UNIT_LABELS, type SellingUnit } from "@/lib/products";
import { ShoppingCartIcon, MinusIcon, PlusIcon, TrashIcon } from "@/components/icons";

interface OrderItemProps {
  item: {
    productId: string;
    name: string;
    price_rial: number;
    quantity: number;
    image?: string;
    stock?: number;
    selling_unit?: SellingUnit;
    quantity_step?: number;
    min_quantity?: number;
    max_quantity?: number;
  };
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export function OrderItem({ item, onUpdateQuantity, onRemove }: OrderItemProps) {
  const step = item.quantity_step || 1;
  const minQty = item.min_quantity || 1;
  const ceiling = getQuantityCeiling({
    stock: item.stock ?? Infinity,
    selling_unit: item.selling_unit,
    max_quantity: item.max_quantity,
  });
  const unitDenominator = item.selling_unit && UNIT_LABELS[item.selling_unit]
    ? ` / ${UNIT_LABELS[item.selling_unit]}`
    : "";
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
          {formatPrice(item.price_rial)} <span className="font-body text-xs">ریال{unitDenominator}</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateQuantity(item.productId, item.quantity - step)}
            disabled={item.quantity <= minQty}
            className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="کاهش مقدار"
          >
            <MinusIcon className="size-4" />
          </button>
<span className="w-12 text-center text-sm font-medium">{formatQuantity(item.quantity, item.selling_unit)}</span>
                {item.quantity >= ceiling && (
                  <span className="text-[11px] text-muted-foreground">بیشترین موجودی</span>
                )}
                <button
                  onClick={() => onUpdateQuantity(item.productId, item.quantity + step)}
                  disabled={item.quantity >= ceiling}
                  className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="افزایش مقدار"
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