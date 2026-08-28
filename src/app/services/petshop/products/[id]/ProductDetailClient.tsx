"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { useGSAP } from '@/lib/gsap';
import { revealUp, prefersReducedMotion } from '@/lib/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { PhoneIcon, ArrowIcon, TagIcon, ShieldIcon, TruckIcon, RotateCcwIcon, ShoppingCartIcon, CheckCircleIcon, AlertCircleIcon, XCircleIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';
import { CLINIC } from '@/lib/content';
import type { Product } from '@/lib/products';
import { getStockLabel, getStockColor, formatPrice, CATEGORY_LABELS, getProductImages } from '@/lib/products';

interface ProductDetailClientProps {
  product: Product;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  isOutOfStock: boolean;
}

export function ProductDetailClient({
  product,
  stockStatus,
  isOutOfStock,
}: ProductDetailClientProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const root = useRef<HTMLElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();
  const images = getProductImages(product);

  useGSAP(
    () => {
      if (prefersReducedMotion() || reduced || !root.current || !headline.current) return;
      const revealTweens = [
        revealUp(headline.current, { once: true, y: 30 }),
        revealUp('.product-detail-desc', { once: true, y: 24, delay: 0.1 }),
        revealUp('.product-detail-gallery', { once: true, y: 24, delay: 0.2 }),
        revealUp('.product-detail-info', { once: true, y: 24, delay: 0.3 }),
        revealUp('.product-detail-cta', { once: true, y: 24, delay: 0.4 }),
      ];
      return () => {
        revealTweens.forEach((t) => t.kill());
      };
    },
    { scope: root, dependencies: [reduced] }
  );

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    // TODO: Implement cart logic in Phase 6
    alert(`افزودن ${quantity} عدد ${product.name} به سبد خرید (فاز 6)`);
  };

  const handleIncreaseQty = () => {
    if (quantity < product.quantity_on_hand) setQuantity((q) => q + 1);
  };

  const handleDecreaseQty = () => {
    if (quantity > 1) setQuantity((q) => q - 1);
  };

  return (
    <section id="product-detail" ref={root} className="relative overflow-hidden bg-background py-16 lg:py-24">
      <div className="container-site relative">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground" aria-label="مسیر صفحه">
          <Link href="/" className="hover:text-foreground transition-colors">خانه</Link>
          <ChevronLeftIcon className="size-4" />
          <Link href="/services/petshop" className="hover:text-foreground transition-colors">پت‌شاپ</Link>
          <ChevronLeftIcon className="size-4" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-12">
          {/* Gallery */}
          <div className="product-detail-gallery lg:col-span-7 space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[4/3] rounded-app-lg overflow-hidden bg-muted">
              {images.length > 0 ? (
                <Image
                  src={images[currentImageIndex]}
                  alt={`${product.name} - تصویر ${currentImageIndex + 1}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
                  <TagIcon className="size-20" />
                  <span className="text-sm">تصویری ثبت نشده است</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2" role="group" aria-label="تصاویر محصول">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-app overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex
                        ? 'border-primary'
                        : 'border-transparent hover:border-border'
                    }`}
                    aria-label={`تصویر ${idx + 1}`}
                    aria-current={idx === currentImageIndex ? 'true' : 'false'}
                  >
                    <Image
                      src={img}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Nav arrows for thumbnails on mobile */}
            {images.length > 5 && (
              <div className="flex justify-center gap-2 lg:hidden">
                <button
                  onClick={() => setCurrentImageIndex((i) => (i === 0 ? images.length - 1 : i - 1))}
                  className="p-2 rounded-full bg-surface border border-border hover:bg-muted transition-colors"
                  aria-label="تصویر قبلی"
                >
                  <ChevronRightIcon className="size-5" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex((i) => (i === images.length - 1 ? 0 : i + 1))}
                  className="p-2 rounded-full bg-surface border border-border hover:bg-muted transition-colors"
                  aria-label="تصویر بعدی"
                >
                  <ChevronLeftIcon className="size-5" />
                </button>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-detail-info lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              {/* Category & Stock Badge */}
              <div className="flex flex-wrap items-center gap-3">
                {product.category && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-muted text-foreground">
                    <TagIcon className="size-4" />
                    {CATEGORY_LABELS[product.category] || product.category}
                  </span>
                )}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getStockColor(stockStatus)}`}>
                  {stockStatus === 'in_stock' && <CheckCircleIcon className="size-4" />}
                  {stockStatus === 'low_stock' && <AlertCircleIcon className="size-4" />}
                  {stockStatus === 'out_of_stock' && <XCircleIcon className="size-4" />}
                  {getStockLabel(stockStatus)}
                  {stockStatus === 'low_stock' && (
                    <span className="ml-1 text-xs opacity-80">(فقط {product.quantity_on_hand} عدد)</span>
                  )}
                </span>
              </div>

              {/* Title */}
              <h1
                ref={headline}
                className="font-display text-3xl font-bold leading-[1.3] text-foreground"
              >
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="font-display text-3xl font-bold text-primary-text">
                  {formatPrice(product.price_rial)}
                </span>
                <span className="text-muted-foreground">ریال</span>
              </div>

              {/* Description */}
              {product.description && (
                <div className="product-detail-desc prose prose-farsi max-w-none text-muted-foreground">
                  <p>{product.description}</p>
                </div>
              )}

              {/* Quantity Selector & Add to Cart */}
              <div className="product-detail-cta space-y-4 pt-4 border-t border-border">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-foreground mb-2">
                    تعداد
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-border rounded-app overflow-hidden">
                      <button
                        type="button"
                        onClick={handleDecreaseQty}
                        disabled={quantity <= 1 || isOutOfStock}
                        className="p-3 hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="کاهش تعداد"
                      >
                        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <line x1="5" x2="19" y1="12" y2="12" />
                        </svg>
                      </button>
                      <input
                        type="number"
                        id="quantity"
                        value={quantity}
                        onChange={(e) => {
                          const val = Math.max(1, Math.min(product.quantity_on_hand, Number(e.target.value) || 1));
                          setQuantity(val);
                        }}
                        min={1}
                        max={product.quantity_on_hand}
                        className="w-16 text-center border-x border-border bg-transparent focus:outline-none"
                        aria-label="تعداد"
                        disabled={isOutOfStock}
                      />
                      <button
                        type="button"
                        onClick={handleIncreaseQty}
                        disabled={quantity >= product.quantity_on_hand || isOutOfStock}
                        className="p-3 hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="افزایش تعداد"
                      >
                        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <line x1="12" x2="12" y1="5" y2="19" />
                          <line x1="5" x2="19" y1="12" y2="12" />
                        </svg>
                      </button>
                    </div>
                    <span className="text-sm text-muted-foreground">موجود در انبار: {product.quantity_on_hand}</span>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-app text-lg font-bold transition-all ${
                    isOutOfStock
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'bg-primary text-on-primary hover:opacity-90'
                  }`}
                >
                  <ShoppingCartIcon className="size-5" />
                  {isOutOfStock ? 'ناموجود - قابل سفارش نیست' : 'افزودن به سبد خرید'}
                </button>

                <p className="text-xs text-center text-muted-foreground">
                  {isOutOfStock
                    ? 'این محصول در حال حاضر ناموجود است. لطفاً بعداً مراجعه کنید.'
                    : 'پس از افزودن به سبد، می‌توانید در صفحه تسویه‌ حساب خرید را نهایی کنید.'}
                </p>
              </div>

              {/* Benefits */}
              <div className="pt-6 border-t border-border space-y-3">
                <div className="flex items-center gap-3 p-4 rounded-app bg-surface border border-border">
                  <div className="p-2 rounded-lg bg-green-100 text-green-700"><ShieldIcon className="size-5" /></div>
                  <div>
                    <p className="font-medium text-foreground">اصل و با گارانتی</p>
                    <p className="text-sm text-muted-foreground">تمام محصولات از توزیع‌کنندگان رسمی تأمین می‌شوند</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-app bg-surface border border-border">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700"><TruckIcon className="size-5" /></div>
                  <div>
                    <p className="font-medium text-foreground">تحویل سریع در مشهد</p>
                    <p className="text-sm text-muted-foreground">امکان تحویل در کلینیک یا ارسال پستی</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-app bg-surface border border-border">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-700"><RotateCcwIcon className="size-5" /></div>
                  <div>
                    <p className="font-medium text-foreground">استرجاع آسان</p>
                    <p className="text-sm text-muted-foreground">۷ روز ضمانت بازگشت کالا (شرایط اعمال می‌شود)</p>
                  </div>
                </div>
              </div>

              {/* Contact CTA */}
              <div className="pt-6 border-t border-border space-y-4">
                <p className="font-label text-sm text-primary-text">نیاز به مشاوره دارید؟</p>
                <div className="flex flex-col gap-3">
                  <a
                    href={CLINIC.phoneHref}
                    className="flex items-center justify-center gap-2 rounded-app bg-primary px-4 py-3 font-bold text-on-primary transition-opacity hover:opacity-90"
                    dir="ltr"
                  >
                    <PhoneIcon className="size-5" />
                    تماس: {CLINIC.phone}
                  </a>
                  <a
                    href={CLINIC.mobile1WhatsApp}
                    target="_blank"
                    rel="noopener"
                    className="flex items-center justify-center gap-2 rounded-app bg-accent-lime px-4 py-3 font-bold text-white transition-opacity hover:opacity-90"
                  >
                    <PhoneIcon className="size-5" />
                    واتساپ: {CLINIC.mobile1}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-12">
          <Link
            href="/services/petshop"
            className="link-reveal inline-flex items-center gap-1.5 font-label text-sm font-medium text-muted-foreground hover:text-primary-text"
          >
            <ArrowIcon direction="back" className="size-4" />
            بازگشت به لیست محصولات
          </Link>
        </div>
      </div>
    </section>
  );
}