"use client";

import { useState } from "react";
import {
  TagIcon,
  SearchIcon,
  ArrowIcon,
} from "@/components/icons";
import {
  ProductCard as ProductCardData,
  CATEGORY_LABELS,
} from "@/lib/products";
import { ProductCard } from "@/components/shop/ProductCard";

interface ProductCatalogClientProps {
  products: ProductCardData[];
  isLoading?: boolean;
}

export function ProductCatalogClient({ products, isLoading = false }: ProductCatalogClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSearch, setSelectedSearch] = useState<string>("");

  const categories = ["all", ...Object.keys(CATEGORY_LABELS)] as const;
  const searchLower = selectedSearch.toLowerCase();
  const filteredProducts =
    selectedCategory && selectedCategory !== "all"
      ? products
          .filter((p) => p.category === selectedCategory)
          .filter(
            (p) =>
              p.name.toLowerCase().includes(searchLower) ||
              (p.description && p.description.toLowerCase().includes(searchLower))
          )
      : products.filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            (p.description && p.description.toLowerCase().includes(searchLower))
        );

  return (
    <section id="petshop-listing" className="py-16 lg:py-24 bg-background">
      <div className="container-site">
        {isLoading ? (
          <div className="min-h-screen flex items-center justify-center py-16">
            <div className="flex gap-4 flex-wrap justify-center">
              {Array(8)
                .fill(0)
                .map((_, i) => (
                  <article
                    key={i}
                    className={`relative rounded-app-lg border border-border bg-surface overflow-hidden transition-all duration-300 ${i % 2 === 0 ? 'w-full' : 'w-2/3'} mb-6 rounded-lg`}
                  >
                    <div className="relative aspect-square overflow-hidden bg-muted rounded-app-lg mb-3">
                      <div
                        className="absolute top-0 left-0 right-0 bottom-0 bg-surface/50 rounded-app-lg"
                      />
                      <div
                        className="h-10 w-2/3 rounded-full bg-surface/30 mx-auto mt-2"
                      />
                      <div className="h-10 w-3/4 rounded-full bg-surface/30 mx-auto mt-2" />
                    </div>
                    <div className="h-6 w-full rounded-app bg-surface/30 mb-1" />
                    <div className="h-4 w-2/3 rounded-app bg-surface/30 mb-1" />
                  </article>
                ))}
            </div>
          </div>
        ) : (
          <>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="eyebrow text-primary-text">پت‌شاپ باران</p>
              <h1 className="mt-4 font-display text-3xl font-bold leading-[1.3] text-foreground sm:text-4xl lg:text-5xl">
                محصولات پت‌شاپ
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                تمام نیازهای روزمره پت‌تان در یکجا — غذا، دارو، لوازم جانبی و محصولات شستشو
              </p>
            </div>

            {/* Search Input */}
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="relative w-full max-w-md">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="نام محصول یا توضیحات را جستجو کنید..."
                  onChange={(e) => setSelectedSearch(e.target.value)}
                  value={selectedSearch}
                  className="w-full pl-10 pr-4 py-2.5 rounded-app border border-border bg-surface text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  aria-label="جستجو در محصولات"
                />
              </div>
            </div>

            {/* Category Filter */}
            {products.length > 0 && (
              <div className="flex flex-wrap justify-center gap-3 mb-12" role="group" aria-label="فیلتر دسته‌بندی">
                {categories.map((key) => {
                  const isActive = (selectedCategory ?? 'all') === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key === 'all' ? null : key)}
                      aria-pressed={isActive}
                      className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                        isActive
                          ? 'bg-primary text-on-primary'
                          : 'border border-border bg-surface text-foreground hover:bg-muted'
                      }`}
                    >
                      {key === 'all' ? 'همه' : CATEGORY_LABELS[key]}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Products Grid */}
            {products.length === 0 ? (
              <div className="text-center py-20">
                <TagIcon className="size-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="font-display text-2xl font-bold text-foreground">محصولی یافت نشد</h2>
                <p className="mt-2 text-muted-foreground">هنوز محصولی به پت‌شاپ اضافه نشده است.</p>
                <div className="mt-4">
                  <a
                    href="/services/petshop"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-app bg-primary text-on-primary font-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <ArrowIcon direction="forward" className="size-4" />
                    ثبت اولین محصول
                  </a>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <TagIcon className="size-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="font-display text-2xl font-bold text-foreground">محصولی در این دسته وجود ندارد</h2>
                <p className="mt-2 text-muted-foreground">دسته دیگری را انتخاب کنید.</p>
                <div className="mt-4">
                  <a
                    href="/services/petshop"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-app bg-surface text-foreground hover:bg-muted transition-colors"
                  >
                    <ArrowIcon direction="forward" className="size-4" />
                    مرور全部商品
                  </a>
                </div>
              </div>
            ) : (
              <div
                className="grid grid-cols-2 gap-4 sm:grid-cols-3"
                role="list"
                aria-label="لیست محصولات پت‌شاپ"
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}