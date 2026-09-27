"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductCard as ProductCardData } from "@/lib/products";
import { SnapCarousel } from "@/components/sections/mobile/SnapCarousel";

export function PetshopBanner({ products }: { products: ProductCardData[] }) {
  return (
    <section
      className="bg-background py-16 lg:py-24 lg:overflow-hidden"
      aria-label="محصولات ویژه پت‌شاپ باران"
    >
      <div className="container-site">
        <div className="max-w-2xl lg:max-w-none lg:flex lg:items-end lg:justify-between lg:gap-8">
          <div>
            <Link
              href="/services/petshop"
              className="eyebrow text-primary-text transition-colors hover:text-primary-text-hover focus-visible:outline-offset-2"
            >
              پت‌شاپ باران
            </Link>

            <div className="flex items-center justify-between gap-3 sm:block">
              <h2 className="mt-8 font-display text-3xl font-bold leading-[1.35] text-foreground sm:text-4xl lg:text-[2.75rem]">
                محصولات ویژه پت‌شاپ
              </h2>
              <Link
                href="/services/petshop"
                className="btn btn-outline size-11 shrink-0 !p-0 sm:hidden"
                aria-label="مشاهده همه محصولات"
                title="مشاهده همه محصولات"
              >
                <ArrowLeftIcon className="size-5" aria-hidden="true" />
              </Link>
            </div>

            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              تمام نیازهای روزمره پت‌تان در یکجا
            </p>
          </div>
          <Link
            href="/services/petshop"
            className="btn btn-outline group mt-6 hidden shrink-0 gap-2 sm:inline-flex lg:mt-0"
          >
            <span>مشاهده همه محصولات</span>
            <ArrowLeftIcon className="hidden size-4 transition-transform duration-normal group-hover:-translate-x-1 lg:block" aria-hidden="true" />
          </Link>
        </div>

        {products && products.length > 0 ? (
          <div className="mt-12">
            <SnapCarousel
              ariaLabel="لیست محصولات ویژه پت‌شاپ"
              slideClassName="w-[45%] sm:w-[70%] md:w-[60%] lg:w-[340px]"
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} featured />
              ))}
            </SnapCarousel>
          </div>
        ) : (
          <div className="py-20 text-center">
            <h2 className="font-display text-xl font-bold text-foreground">
              محصولی یافت نشد
            </h2>
            <p className="mt-2 text-muted-foreground">
              هنوز محصولی به عنوان محصول ویژه تعیین نشده است.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
