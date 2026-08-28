"use client";

import { useState } from 'react';
import { useNavigation, useCreate } from '@refinedev/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabaseClient } from '@/lib/supabase-client';
import { XIcon, UploadIcon } from '@/components/icons';

const CATEGORIES = [
  { value: 'food', label: 'غذا' },
  { value: 'medicine', label: 'دارو' },
  { value: 'accessories', label: 'لوازم جانبی' },
  { value: 'grooming', label: 'شستشو و اصلاح' },
] as const;

interface PreviewImage {
  file: File;
  preview: string;
}

export default function ProductCreatePage() {
  const navigation = useNavigation();
  const { mutateAsync: createProduct, mutation } = useCreate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [images, setImages] = useState<PreviewImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newPreviews: PreviewImage[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newPreviews]);
    event.currentTarget.value = '';
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadImages = async (): Promise<string[]> => {
    if (images.length === 0) return [];

    setUploading(true);
    setUploadProgress(0);

    const uploadedUrls: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const { file } = images[i];
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
      setUploadProgress(Math.round(((i + 1) / images.length) * 100));
    }

    setUploading(false);
    return uploadedUrls;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const imageUrls = await uploadImages();

      const result = await createProduct({
        resource: 'products',
        values: {
          name: name.trim(),
          description: description.trim() || null,
          price_rial: Number(price),
          category: category || null,
          images: imageUrls,
          display_order: Number(displayOrder) || 0,
          is_active: isActive,
        },
      });

      // Create initial stock level entry using the created product's id
      const productId = result?.data?.id;
      if (productId) {
        const { error: stockError } = await supabaseClient
          .from('stock_levels')
          .insert({
            product_id: productId,
            quantity_on_hand: 0,
            low_stock_threshold: 5,
          });
        if (stockError) {
          console.error('Error creating stock level:', stockError);
        }
      }

      navigation.list('products');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'خطا در ایجاد محصول');
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">افزودن محصول جدید</h1>
        <p className="mt-1 text-muted-foreground">اطلاعات محصول را وارد کنید</p>
      </div>

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
            <Label htmlFor="product-display-order">ترتیب نمایش</Label>
            <Input id="product-display-order" type="number" min="0" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} className="mt-2" />
          </div>
          <div>
            <Label>وضعیت</Label>
            <label className="flex items-center gap-2 mt-2">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              <span>این محصول در سایت نمایش داده شود</span>
            </label>
          </div>
        </div>

        <div>
          <Label>تصاویر محصول</Label>
          <div className="mt-2">
            <label className="flex flex-col items-start gap-2 cursor-pointer">
              <div className="flex items-center gap-2 rounded-app border-2 border-dashed border-border p-6 hover:border-primary transition-colors">
                <UploadIcon className="size-6 text-muted-foreground" />
                <span className="text-muted-foreground">کشیدن و رها کردن یا کلیک برای انتخاب تصاویر</span>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleImageSelect}
                className="sr-only"
                id="product-images"
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
                      className="absolute top-1 left-1 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                      aria-label="حذف تصویر"
                    >
                      <XIcon className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
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
          {mutation.isPending ? 'در حال ایجاد...' : 'ایجاد محصول'}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigation.list('products')}>
          انصراف
        </Button>
      </div>
    </form>
  );
}