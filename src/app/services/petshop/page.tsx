import { Metadata } from 'next';
import { getProducts } from '@/lib/products';
import { ProductCatalogClient } from '@/components/shop/ProductCatalogClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'پت‌شاپ کلینیک باران | خرید آنلاین محصولات حیوانات خانگی',
  description: 'مشاهده و خرید انواع غذا، دارو، لوازم جانبی و شستشو برای حیوانات خانگی در پت‌شاپ کلینیک دامپزشکی باران.',
};

export default async function PetshopListingPage() {
  const products = await getProducts();

  return <ProductCatalogClient products={products} />;
}