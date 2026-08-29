"use client";

import { useState } from "react";
import { CheckIcon, LoaderIcon } from "@/components/icons";

interface StockQtyCellProps {
  productId: string;
  quantity: number;
  onSave: (productId: string, quantity: number) => Promise<void> | void;
}

export function StockQtyCell({ productId, quantity, onSave }: StockQtyCellProps) {
  const [prevQuantity, setPrevQuantity] = useState(quantity);
  const [value, setValue] = useState(String(quantity));
  const [saving, setSaving] = useState(false);

  // Adjust state during render when the external quantity changes (e.g. after a
  // list refetch following a save) — avoids an effect-triggered re-render.
  if (prevQuantity !== quantity) {
    setPrevQuantity(quantity);
    setValue(String(quantity));
  }

  const parsed = Math.max(0, Math.floor(Number(value) || 0));
  const dirty = parsed !== quantity;

  const handleSave = async () => {
    if (saving || !dirty) return;
    setSaving(true);
    try {
      await onSave(productId, parsed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-1" dir="ltr">
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSave();
          }
        }}
        className="w-16 rounded border border-border bg-background px-2 py-1 text-right font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="موجودی انبار"
      />
      {saving ? (
        <LoaderIcon className="size-4 text-muted-foreground" />
      ) : dirty ? (
        <button
          type="button"
          onClick={handleSave}
          className="p-1 rounded text-primary hover:bg-muted transition-colors"
          aria-label="ذخیره موجودی"
        >
          <CheckIcon className="size-4" />
        </button>
      ) : null}
    </div>
  );
}