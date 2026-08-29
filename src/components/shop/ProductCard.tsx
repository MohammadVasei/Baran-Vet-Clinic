"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCartIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  TagIcon,
} from "@/components/icons";
import {
  ProductCard as ProductCardType,
  getStockStatus,
  getStockLabel,
  getStockColor,
  formatPrice,
  CATEGORY_LABELS,
  getProductImages,
} from "@/lib/products";
import { useCart } from "@/context/CartContext";

const MAX_QTY = 99;

export function ProductCard({ product }: { product: ProductCardType }) {
  const { addItem, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const stockStatus = getStockStatus(product);
  const isOutOfStock = stockStatus === 'out_of_stock';
  const imageUrl = getProductImages(product)[0];

  const handleAddToCart = () => {
    if (stockStatus === "out_of_stock") return;
    addItem({
      productId: product.id,
      name: product.name,
      price_rial: product.price_rial,
      quantity,
      image: getProductImages(product)[0],
      category: product.category || undefined,
    });
    openCart();
  };

  return (
    <article
      className={`relative rounded-app-lg border border-border bg-surface overflow-hidden transition-all duration-300 hover:shadow-lg ${isOutOfStock ? 'opacity-60' : ''}`}
      role="listitem"
    >
      {/* Product Image */}
      <Link href={`/services/petshop/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <TagIcon className="size-10 text-muted-foreground sm:size-16" />
            </div>
          )}

          {/* Stock Badge */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium sm:gap-1 sm:px-2.5 sm:py-1 sm:text-xs ${getStockColor(stockStatus)}`}>
              {stockStatus === 'in_stock' && <CheckCircleIcon className="size-2.5 sm:size-3" />}
              {stockStatus === 'low_stock' && <AlertCircleIcon className="size-2.5 sm:size-3" />}
              {stockStatus === 'out_of_stock' && <XCircleIcon className="size-2.5 sm:size-3" />}
              {getStockLabel(stockStatus)}
            </span>
          </div>

          {/* Category Badge */}
          {product.category && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-white/90 text-foreground sm:gap-1 sm:px-2.5 sm:py-1 sm:text-xs">
                <TagIcon className="size-2.5 sm:size-3" />
                {CATEGORY_LABELS[product.category] || product.category}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-3 space-y-2 sm:p-5 sm:space-y-3">
        <h3 className="font-display text-sm font-bold text-foreground line-clamp-2 sm:text-lg">
          <Link href={`/services/petshop/products/${product.id}`} className="hover:text-primary-text transition-colors">
            {product.name}
          </Link>
        </h3>

        {product.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 sm:text-sm">{product.description}</p>
        )}

        <div className="flex flex-col pt-2 border-t border-border gap-2 sm:gap-3">
          <span className="font-display text-base font-bold text-primary-text text-center sm:text-left sm:text-xl whitespace-nowrap">
            {formatPrice(product.price_rial)}
            <span className="font-body text-xs font-normal text-muted-foreground sm:text-sm">ریال</span>
          </span>

          <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-stretch">
            {/* Quantity Stepper */}
            <div className="flex items-center rounded-app border border-border overflow-hidden shrink-0" aria-label="تعداد">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={isOutOfStock || quantity <= 1}
                className="w-6 h-7 flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-40 text-sm font-semibold sm:w-9 sm:h-10"
                aria-label="کاهش تعداد"
              >
                −
              </button>
              <span className="w-6 h-7 flex items-center justify-center text-xs font-bold text-foreground sm:w-9 sm:h-10 sm:text-sm" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(MAX_QTY, q + 1))}
                disabled={isOutOfStock || quantity >= MAX_QTY}
                className="w-6 h-7 flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-40 text-sm font-semibold sm:w-9 sm:h-10"
                aria-label="افزایش تعداد"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-app text-xs font-medium transition-all whitespace-nowrap w-full sm:flex-1 sm:justify-center sm:gap-2 sm:px-4 sm:py-2 sm:text-sm ${
                isOutOfStock
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-on-primary hover:opacity-90"
              }`}
              disabled={isOutOfStock}
              aria-label={isOutOfStock ? `${product.name} ناموجود است` : `افزودن ${quantity} از ${product.name} به سبد خرید`}
            >
              <ShoppingCartIcon className="size-3 sm:size-4" />
              {isOutOfStock ? "ناموجود" : "افزودن به سبد"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
