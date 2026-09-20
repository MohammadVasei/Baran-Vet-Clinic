"use client";

import { useEffect, useState } from 'react';
import { useNavigation, useSelect, useShow, useUpdate } from '@refinedev/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const ACCENTS = [
  { value: 'purple', label: 'بنفش' },
  { value: 'orange', label: 'نارنجی' },
  { value: 'lime', label: 'سبز' },
  { value: 'magenta', label: 'سرخابی' },
];

interface ServiceData {
  id: string;
  name: string;
  price_rial: number | null;
  is_active: boolean;
  doctor_id: string | null;
  key: string | null;
  numeral: string | null;
  tagline: string | null;
  title: string | null;
  description: string | null;
  image: string | null;
  alt: string | null;
  accent: string | null;
  href: string | null;
  display_order: number;
  category: string | null;
  doctor?: { name: string; role: string } | null;
}

export default function ServiceEditPage() {
const { result, query } = useShow<ServiceData>({
   resource: 'services',
   meta: { select: 'id,name,price_rial,is_active,doctor_id,key,numeral,tagline,title,description,image,alt,accent,href,display_order,category,doctor:doctors(*)' },
});
const { options: serviceCategories } = useSelect({ resource: 'service_categories', optionLabel: 'label', optionValue: 'name', filters: [{ field: 'is_active', operator: 'eq', value: true }], meta: { select: 'id,name,label,display_order' } });
  const { mutateAsync: updateService, mutation } = useUpdate();
  const navigation = useNavigation();
  const { options: doctors } = useSelect({ resource: 'doctors', optionLabel: 'name', optionValue: 'id', filters: [{ field: 'is_active', operator: 'eq', value: true }], meta: { select: 'id,name,role' } });

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [key, setKey] = useState('');
  const [numeral, setNumeral] = useState('');
  const [tagline, setTagline] = useState('');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [image, setImage] = useState('');
  const [alt, setAlt] = useState('');
  const [accent, setAccent] = useState('purple');
  const [href, setHref] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (!result) return;
    setName(result.name);
    setPrice(result.price_rial == null ? '' : String(result.price_rial));
    setDoctorId(result.doctor_id || '');
    setIsActive(result.is_active);
    setKey(result.key || '');
    setNumeral(result.numeral || '');
    setTagline(result.tagline || '');
    setTitle(result.title || '');
    setText(result.description || '');
    setImage(result.image || '');
    setAlt(result.alt || '');
    setAccent(result.accent || 'purple');
    setHref(result.href || '');
    setDisplayOrder(String(result.display_order ?? 0));
    setCategory(result.category || '');
  }, [result]);

  if (query.isLoading) return <div className="p-8 text-center">در حال بارگذاری...</div>;
  if (!result) return <div className="p-8 text-center text-destructive">خدمت یافت نشد.</div>;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await updateService({
      resource: 'services',
      id: result.id,
      values: {
        name: name.trim(),
        price_rial: price ? Number(price) : null,
        doctor_id: doctorId || null,
        is_active: isActive,
        key: key.trim() || null,
        numeral: numeral.trim() || null,
        tagline: tagline.trim() || null,
        title: title.trim() || null,
        description: text.trim() || null,
        image: image.trim() || null,
        alt: alt.trim() || null,
        accent: accent || null,
        href: href.trim() || null,
        display_order: Number(displayOrder) || 0,
        category: category.trim() || null,
      },
    });
    navigation.show('services', result.id);
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">ویرایش خدمت</h1>
        <p className="mt-1 text-muted-foreground">مشخصات رزرو و بخش نمایش در سایت را تنظیم کنید.</p>
      </div>

      <div className="space-y-5 rounded-app-lg border border-border bg-surface p-6">
        <div>
          <Label htmlFor="service-name">عنوان خدمت</Label>
          <Input id="service-name" value={name} onChange={(event) => setName(event.target.value)} required className="mt-2" />
        </div>
        <div>
          <Label htmlFor="service-key">کلید یکتا</Label>
          <Input id="service-key" value={key} onChange={(event) => setKey(event.target.value)} className="mt-2" dir="ltr" />
          <p className="mt-1 text-xs text-muted-foreground">برای نمایش در سایت لازم است.</p>
        </div>
        <div>
          <Label htmlFor="service-price">قیمت (ریال)</Label>
          <Input id="service-price" type="number" min="0" value={price} onChange={(event) => setPrice(event.target.value)} className="mt-2" />
        </div>
<div>
  <Label>پزشک مسئول</Label>
  {result.doctor ? (
    <div className="mb-2">
      <p className="text-sm font-medium text-foreground">{result.doctor.name}</p>
      {result.doctor.role && <p className="text-xs text-muted-foreground">{result.doctor.role}</p>}
    </div>
  ) : (
    <p className="text-xs text-muted-foreground">پزشک مسئول تعیین نشده است</p>
  )}
  <Select value={doctorId} onValueChange={setDoctorId} className="mt-2">
    <SelectTrigger><SelectValue placeholder="پزشک را انتخاب کنید" /></SelectTrigger>
    <SelectContent>{doctors.map((doctor) => <SelectItem key={doctor.value} value={doctor.value}>{doctor.label} {doctor.role && `- ${doctor.role}`}</SelectItem>)}</SelectContent>
  </Select>
</div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
          <span>این خدمت در سایت قابل رزرو باشد</span>
        </label>
      </div>

      <div className="space-y-5 rounded-app-lg border border-border bg-surface p-6">
        <p className="font-medium text-foreground">نمایش در بخش خدمات</p>
        <div>
          <Label htmlFor="service-numeral">شماره ترتیبی</Label>
          <Input id="service-numeral" value={numeral} onChange={(event) => setNumeral(event.target.value)} className="mt-2" dir="ltr" />
        </div>
        <div>
          <Label htmlFor="service-tagline">زیرعنوان کوتاه</Label>
          <Input id="service-tagline" value={tagline} onChange={(event) => setTagline(event.target.value)} className="mt-2" />
        </div>
        <div>
          <Label htmlFor="service-title">عنوان بلند</Label>
          <Input id="service-title" value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2" />
        </div>
        <div>
          <Label htmlFor="service-text">متن توضیحات</Label>
          <Textarea id="service-text" value={text} onChange={(event) => setText(event.target.value)} rows={5} className="mt-2" />
        </div>
        <div>
          <Label htmlFor="service-image">آدرس تصویر</Label>
          <Input id="service-image" value={image} onChange={(event) => setImage(event.target.value)} className="mt-2" dir="ltr" />
        </div>
        <div>
          <Label htmlFor="service-alt">متن جایگزین تصویر</Label>
          <Input id="service-alt" value={alt} onChange={(event) => setAlt(event.target.value)} className="mt-2" />
        </div>
        <div>
          <Label>رنگ نشان</Label>
          <Select value={accent} onValueChange={setAccent}>
            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
            <SelectContent>{ACCENTS.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="service-href">پیوند صفحه خدمت</Label>
          <Input id="service-href" value={href} onChange={(event) => setHref(event.target.value)} className="mt-2" dir="ltr" />
        </div>
        <div>
          <Label htmlFor="service-category">دسته‌بندی</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="mt-2"><SelectValue placeholder="دسته‌بندی را انتخاب کنید" /></SelectTrigger>
            <SelectContent>
              {serviceCategories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="service-order">ترتیب نمایش</Label>
          <Input id="service-order" type="number" min="0" value={displayOrder} onChange={(event) => setDisplayOrder(event.target.value)} className="mt-2" />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={mutation.isPending}>ذخیره تغییرات</Button>
        <Button type="button" variant="outline" onClick={() => navigation.list('services')}>انصراف</Button>
      </div>
    </form>
  );
}