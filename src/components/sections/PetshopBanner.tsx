"use client";

import { ProductCard } from "@/components/shop/ProductCard";
import { ProductCard as ProductCardData } from "@/lib/products";

export function PetshopBanner({ products }: { products: ProductCardData[] }) {
  return (
    <section
      className="py-16 lg:py-24 bg-[var(--accent-yellow-soft)] border-t border-accent-yellow/30"
      aria-label="محصولات ویژه پت‌شاپ باران"
    >
      <div className="container-site">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="eyebrow text-primary-text">پت‌شاپ باران</p>
          <h2 className="mt-4 font-display text-2xl font-bold leading-[1.3] text-foreground">
            محصولات ویژه پت‌شاپ
          </h2>
          <p className="text-lg text-muted-foreground">
            تمام نیازهای روزمره پت‌تان در یکجا
          </p>
        </div>

        {products && products.length > 0 ? (
          <div
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3"
            role="list"
            aria-label="لیست محصولات ویژه پت‌شاپ"
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="font-display text-xl font-bold text-foreground">محصولی یافت نشد</h2>
            <p className="mt-2 text-muted-foreground">
              هنوز محصولی به عنوان محصول ویژه تعیین نشده است.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
