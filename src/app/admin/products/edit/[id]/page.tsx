"use client";

import { useEffect, useState } from 'react';
import { useNavigation, useShow, useUpdate } from '@refinedev/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { supabaseClient } from '@/lib/supabase-client';
import { TrashIcon, UploadIcon, SettingsIcon } from '@/components/icons';
import { UNIT_CODES, UNIT_LABELS, isWeightUnit, formatQuantity, type SellingUnit } from '@/lib/products';
import { PageHelp } from "@/components/admin/PageHelp";

const CATEGORIES = [
  { value: 'food', label: 'غذا' },
  { value: 'medicine', label: 'دارو' },
  { value: 'accessories', label: 'لوازم جانبی' },
  { value: 'grooming', label: 'شستشو و اصلاح' },
] as const;

const UNITS = UNIT_CODES.map((value) => ({ value, label: UNIT_LABELS[value] }));

interface PreviewImage {
  file: File;
  preview: string;
  isNew: boolean;
  path?: string; // for existing images, the storage path
}

interface ProductData {
  id: string;
  name: string;
  description: string | null;
  price_rial: number;
  category: string | null;
  images: string[] | null;
  display_order: number;
  is_active: boolean;
  is_featured: boolean;
  selling_unit: SellingUnit | null;
  quantity_step: number;
  min_quantity: number;
  max_quantity: number | null;
  stock_levels?: { quantity_on_hand: number; low_stock_threshold: number } | null;
}

export default function ProductEditPage() {
  const { result, query } = useShow<ProductData>({
    resource: 'products',
    meta: { select: 'id,name,description,price_rial,category,images,display_order,is_active,is_featured,selling_unit,quantity_step,min_quantity,max_quantity,stock_levels(quantity_on_hand,low_stock_threshold)' },
  });
  const { mutateAsync: updateProduct, mutation } = useUpdate();
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [sellingUnit, setSellingUnit] = useState<SellingUnit>('PIECE');
  const [quantityStep, setQuantityStep] = useState('1');
  const [minQuantity, setMinQuantity] = useState('1');
  const [maxQuantity, setMaxQuantity] = useState('');
  const [images, setImages] = useState<PreviewImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deletedImagePaths, setDeletedImagePaths] = useState<string[]>([]);

  useEffect(() => {
    if (!result) return;
    setName(result.name);
    setDescription(result.description || '');
    setPrice(String(result.price_rial));
    setCategory(result.category || '');
    setDisplayOrder(String(result.display_order || 0));
    setIsActive(result.is_active);
    setIsFeatured(result.is_featured ?? false);
    setSellingUnit(result.selling_unit ?? 'PIECE');
    setQuantityStep(String(result.quantity_step || 1));
    setMinQuantity(String(result.min_quantity || 1));
    setMaxQuantity(result.max_quantity != null ? String(result.max_quantity) : '');

    // Convert existing images to preview format
    if (result.images && result.images.length > 0) {
      const previews: PreviewImage[] = result.images.map((url) => ({
        file: new File([], ''), // dummy file
        preview: url,
        isNew: false,
        // Extract path from URL for deletion
        path: url.split('/product-images/')[1]?.split('?')[0],
      }));
      setImages(previews);
    }
  }, [result]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newPreviews: PreviewImage[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isNew: true,
    }));
    setImages((prev) => [...prev, ...newPreviews]);
    event.currentTarget.value = '';
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const img = prev[index];
      if (!img.isNew && img.path) {
        setDeletedImagePaths((paths) => [...paths, img.path!]);
      } else if (img.isNew) {
        URL.revokeObjectURL(img.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadNewImages = async (): Promise<string[]> => {
    const newImages = images.filter((img) => img.isNew);
    if (newImages.length === 0) return [];

    setUploading(true);
    setUploadProgress(0);

    const uploadedUrls: string[] = [];

    for (let i = 0; i < newImages.length; i++) {
      const { file } = newImages[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { data, error } = await supabaseClient.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw new Error(`خطا در آپلود تصویر ${file.name}: ${error.message}`);
      }

      const { data: urlData } = supabaseClient.storage
        .from('product-images')
        .getPublicUrl(data.path);

      uploadedUrls.push(urlData.publicUrl);
      setUploadProgress(Math.round(((i + 1) / newImages.length) * 100));
    }

    setUploading(false);
    return uploadedUrls;
  };

  const deleteRemovedImages = async () => {
    if (deletedImagePaths.length === 0) return;

    await supabaseClient.storage
      .from('product-images')
      .remove(deletedImagePaths);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!result) return;

    try {
      const newImageUrls = await uploadNewImages();
      const existingImageUrls = images.filter((img) => !img.isNew).map((img) => img.preview);
      const allImageUrls = [...existingImageUrls, ...newImageUrls];

      await updateProduct({
        resource: 'products',
        id: result.id,
        values: {
          name: name.trim(),
          description: description.trim() || null,
          price_rial: Number(price),
          category: category || null,
          images: allImageUrls,
          display_order: Number(displayOrder) || 0,
          is_active: isActive,
          is_featured: isFeatured,
          selling_unit: sellingUnit,
          quantity_step: Number(quantityStep) || 1,
          min_quantity: Number(minQuantity) || 1,
          max_quantity: maxQuantity ? Number(maxQuantity) : null,
        },
      });

      await deleteRemovedImages();

      navigation.list('products');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'خطا در به‌روزرسانی محصول');
    }
  };

  if (query.isLoading) return <div className="p-8 text-center">در حال بارگذاری...</div>;
  if (!result) return <div className="p-8 text-center text-destructive">محصول یافت نشد.</div>;

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl space-y-6">
      <div>
        <div className="flex items-center gap-3"><h1 className="font-display text-2xl font-bold">ویرایش محصول</h1><PageHelp id="products-edit" /></div>
        <p className="mt-1 text-muted-foreground">اطلاعات محصول را به‌روزرسانی کنید</p>
      </div>

      {result.stock_levels && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-app-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-3">
            <SettingsIcon className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">موجودی انبار</p>
              <p className="mt-1 flex items-center gap-2">
                {(() => {
                  const { quantity_on_hand, low_stock_threshold } = result.stock_levels!;
                  const unit = result.selling_unit ?? ('PIECE' as SellingUnit);
                  if (quantity_on_hand === 0) {
                    return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">ناموجود</span>;
                  }
                  if (quantity_on_hand <= low_stock_threshold) {
                    return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">کم ({formatQuantity(quantity_on_hand, unit)})</span>;
                  }
                  return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">موجود ({formatQuantity(quantity_on_hand, unit)})</span>;
                })()}
                <span className="text-sm text-muted-foreground">حد کمبود: {result.stock_levels.low_stock_threshold}</span>
              </p>
            </div>
          </div>
          <Link
            href={`/admin/stock-levels/edit/${result.id}`}
            className="inline-flex items-center gap-2 rounded-app border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <SettingsIcon className="size-4" />
            ویرایش موجودی
          </Link>
        </div>
      )}

      <div className="space-y-5 rounded-app-lg border border-border bg-surface p-6">
        <div>
          <Label htmlFor="product-name">نام محصول <span className="text-destructive">*</span></Label>
          <Input id="product-name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-2" />
        </div>

        <div>
          <Label htmlFor="product-description">توضیحات</Label>
          <Textarea id="product-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-2" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="product-price">قیمت (ریال) <span className="text-destructive">*</span></Label>
            <Input id="product-price" type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required className="mt-2" />
            {isWeightUnit(sellingUnit) && (
              <p className="mt-1 text-xs text-muted-foreground">قیمت برای {UNIT_LABELS[sellingUnit]} — برای وزن، واحد کانونی گرم است (هر ۱ کیلوگرم = ۱۰۰۰ گرم).</p>
            )}
          </div>
          <div>
            <Label htmlFor="product-category">دسته‌بندی</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-2"><SelectValue placeholder="دسته‌بندی را انتخاب کنید" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>واحد فروش</Label>
            <Select value={sellingUnit} onValueChange={(v) => setSellingUnit(v as SellingUnit)}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                {UNITS.map((unit) => <SelectItem key={unit.value} value={unit.value}>{unit.label}</SelectItem>)}
              </SelectContent>
            </Select>
            {isWeightUnit(sellingUnit) && (
              <p className="mt-1 text-xs text-muted-foreground">مقدار سفارش به صورت عدد صحیح بر حسب {UNIT_LABELS[sellingUnit]} ثبت می‌شود.</p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="product-quantity-step">گام</Label>
              <Input id="product-quantity-step" type="number" min="1" value={quantityStep} onChange={(e) => setQuantityStep(e.target.value)} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="product-min-quantity">حداقل</Label>
              <Input id="product-min-quantity" type="number" min="1" value={minQuantity} onChange={(e) => setMinQuantity(e.target.value)} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="product-max-quantity">حداکثر (اختیاری)</Label>
              <Input id="product-max-quantity" type="number" min="1" value={maxQuantity} onChange={(e) => setMaxQuantity(e.target.value)} className="mt-2" />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="product-display-order">ترتیب نمایش</Label>
            <Input id="product-display-order" type="number" min="0" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} className="mt-2" />
          </div>
          <div>
            <Label>وضعیت</Label>
            <label className="flex items-center gap-2 mt-2">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              <span>این محصول در سایت نمایش داده شود</span>
            </label>
            <label className="flex items-center gap-2 mt-2">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
              <span>نمایش در بخش محصولات ویژه (صفحه اصلی)</span>
            </label>
          </div>
        </div>

        <div>
          <Label>تصاویر محصول</Label>
          <div className="mt-2">
            <label className="flex flex-col items-start gap-2 cursor-pointer">
              <div className="flex items-center gap-2 rounded-app border-2 border-dashed border-border p-6 hover:border-primary transition-colors">
                <UploadIcon className="size-6 text-muted-foreground" />
                <span className="text-muted-foreground">کشیدن و رها کردن یا کلیک برای انتخاب تصاویر جدید</span>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleImageSelect}
                className="sr-only"
                id="product-images-edit"
                disabled={uploading}
              />
            </label>

            {images.length > 0 && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-app overflow-hidden border border-border">
                    <img src={img.preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 left-1 p-1 rounded-full bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors"
                      aria-label="حذف تصویر"
                    >
                      <TrashIcon className="size-3" />
                    </button>
                    {!img.isNew && (
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 text-xs bg-white/90 rounded">موجود</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {images.length === 0 && (
              <p className="mt-2 text-sm text-muted-foreground">هیچ تصویری انتخاب نشده است</p>
            )}

            {uploading && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>در حال آپلود تصاویر...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={mutation.isPending || uploading}>
          {mutation.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigation.list('products')}>
          انصراف
        </Button>
      </div>
    </form>
  );
}