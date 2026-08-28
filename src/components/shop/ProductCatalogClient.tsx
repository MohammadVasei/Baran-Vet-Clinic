"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingCartIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  TagIcon,
} from '@/components/icons';
import {
  ProductCard,
  getStockStatus,
  getStockLabel,
  getStockColor,
  formatPrice,
  CATEGORY_LABELS,
  getProductImages,
} from '@/lib/products';

interface ProductCatalogClientProps {
  products: ProductCard[];
}

export function ProductCatalogClient({ products }: ProductCatalogClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ['all', ...Object.keys(CATEGORY_LABELS)] as const;
  const filteredProducts =
    selectedCategory && selectedCategory !== 'all'
      ? products.filter((p) => p.category === selectedCategory)
      : products;

  return (
    <section id="petshop-listing" className="py-16 lg:py-24 bg-background">
      <div className="container-site">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="eyebrow text-primary-text">پت‌شاپ باران</p>
          <h1 className="mt-4 font-display text-3xl font-bold leading-[1.3] text-foreground sm:text-4xl lg:text-5xl">
            محصولات پت‌شاپ
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            تمام نیازهای روزمره پت‌تان در یکجا — غذا، دارو، لوازم جانبی و محصولات شستشو
          </p>
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
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <TagIcon className="size-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-foreground">محصولی در این دسته وجود ندارد</h2>
            <p className="mt-2 text-muted-foreground">دسته دیگری را انتخاب کنید.</p>
          </div>
        ) : (
          <div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            role="list"
            aria-label="لیست محصولات پت‌شاپ"
          >
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product);
              const isOutOfStock = stockStatus === 'out_of_stock';
              const imageUrl = getProductImages(product)[0];

              return (
                <article
                  key={product.id}
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
                          <TagIcon className="size-16 text-muted-foreground" />
                        </div>
                      )}

                      {/* Stock Badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStockColor(stockStatus)}`}>
                          {stockStatus === 'in_stock' && <CheckCircleIcon className="size-3" />}
                          {stockStatus === 'low_stock' && <AlertCircleIcon className="size-3" />}
                          {stockStatus === 'out_of_stock' && <XCircleIcon className="size-3" />}
                          {getStockLabel(stockStatus)}
                        </span>
                      </div>

                      {/* Category Badge */}
                      {product.category && (
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-foreground">
                            <TagIcon className="size-3" />
                            {CATEGORY_LABELS[product.category] || product.category}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-display text-lg font-bold text-foreground line-clamp-2">
                      <Link href={`/services/petshop/products/${product.id}`} className="hover:text-primary-text transition-colors">
                        {product.name}
                      </Link>
                    </h3>

                    {product.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="font-display text-xl font-bold text-primary-text">
                        {formatPrice(product.price_rial)}
                        <span className="font-body text-sm font-normal text-muted-foreground">ریال</span>
                      </span>

                      <button
                        className={`flex items-center gap-2 px-4 py-2 rounded-app text-sm font-medium transition-all ${
                          isOutOfStock
                            ? 'bg-muted text-muted-foreground cursor-not-allowed'
                            : 'bg-primary text-on-primary hover:opacity-90'
                        }`}
                        disabled={isOutOfStock}
                        aria-label={isOutOfStock ? `${product.name} ناموجود است` : `افزودن ${product.name} به سبد خرید`}
                      >
                        <ShoppingCartIcon className="size-4" />
                        {isOutOfStock ? 'ناموجود' : 'افزودن به سبد'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}