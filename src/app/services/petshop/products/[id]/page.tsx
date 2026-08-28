import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/products';
import { getStockStatus } from '@/lib/products';
import { ProductDetailClient } from './ProductDetailClient';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return {
      title: 'محصول یافت نشد | پت‌شاپ کلینیک باران',
    };
  }

  return {
    title: `${product.name} | پت‌شاپ کلینیک باران`,
    description: product.description || `خرید ${product.name} از پت‌شاپ کلینیک دامپزشکی باران`,
    openGraph: {
      title: product.name,
      description: product.description || '',
      images: product.images?.[0] ? [product.images[0]] : [],
      type: 'website',
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const stockStatus = getStockStatus(product);
  const isOutOfStock = stockStatus === 'out_of_stock';

  return (
    <ProductDetailClient
      product={product}
      stockStatus={stockStatus}
      isOutOfStock={isOutOfStock}
    />
  );
}