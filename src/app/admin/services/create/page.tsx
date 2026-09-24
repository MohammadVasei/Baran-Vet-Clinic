"use client";

import { useState } from 'react';
import { useCreate, useNavigation, useSelect } from '@refinedev/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PageHelp } from "@/components/admin/PageHelp";

const ACCENTS = [
  { value: 'purple', label: 'بنفش' },
  { value: 'orange', label: 'نارنجی' },
  { value: 'lime', label: 'سبز' },
  { value: 'magenta', label: 'سرخابی' },
];

export default function ServiceCreatePage() {
  const { mutateAsync: createService, mutation } = useCreate();
  const navigation = useNavigation();
  const { options: doctors } = useSelect({ resource: 'doctors', optionLabel: 'name', optionValue: 'id', filters: [{ field: 'is_active', operator: 'eq', value: true }], meta: { select: 'id,name,role' } });
  const { options: serviceCategories } = useSelect({ resource: 'service_categories', optionLabel: 'label', optionValue: 'name', filters: [{ field: 'is_active', operator: 'eq', value: true }], meta: { select: 'id,name,label,display_order' } });

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
  const [category, setCategory] = useState(''); // New category state

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await createService({
      resource: 'services',
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
        category: category.trim() || null, // Add category to values
      },
    });
    navigation.list('services');
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-6">
      <div>
        <div className="flex items-center gap-3"><h1 className="font-display text-2xl font-bold text-foreground">افزودن خدمت</h1><PageHelp id="services-create" /></div>
        <p className="mt-1 text-muted-foreground">خدمت رزرو و بخش نمایش آن در سایت را تنظیم کنید.</p>
      </div>

      <div className="space-y-5 rounded-app-lg border border-border bg-surface p-6">
        <div>
          <Label htmlFor="service-name">عنوان خدمت</Label>
          <Input id="service-name" value={name} onChange={(event) => setName(event.target.value)} required className="mt-2" />
        </div>
        <div>
          <Label htmlFor="service-key">کلید یکتا</Label>
          <Input id="service-key" value={key} onChange={(event) => setKey(event.target.value)} className="mt-2" dir="ltr" placeholder="darman" />
          <p className="mt-1 text-xs text-muted-foreground">برای نمایش در سایت لازم است؛ بدون آن servant در بخش عمومی دیده نمی‌شود.</p>
        </div>
        <div>
          <Label htmlFor="service-price">قیمت (ریال)</Label>
          <Input id="service-price" type="number" min="0" value={price} onChange={(event) => setPrice(event.target.value)} className="mt-2" />
        </div>
        <div>
          <Label>پزشک مسئول</Label>
          <Select value={doctorId} onValueChange={setDoctorId}>
            <SelectTrigger className="mt-2"><SelectValue placeholder="پزشک را انتخاب کنید" /></SelectTrigger>
            <SelectContent>{doctors.map((doctor) => <SelectItem key={doctor.value} value={doctor.value}>{doctor.label} { (doctor as { role?: string }).role && `- ${ (doctor as { role?: string }).role }` }</SelectItem>)}</SelectContent>
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
          <Input id="service-numeral" value={numeral} onChange={(event) => setNumeral(event.target.value)} className="mt-2" dir="ltr" placeholder="۰۱" />
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
          <Input id="service-image" value={image} onChange={(event) => setImage(event.target.value)} className="mt-2" dir="ltr" placeholder="/images/..." />
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
          <Input id="service-href" value={href} onChange={(event) => setHref(event.target.value)} className="mt-2" dir="ltr" placeholder="/services/darman" />
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
        <Button type="submit" disabled={mutation.isPending}>افزودن خدمت</Button>
        <Button type="button" variant="outline" onClick={() => navigation.list('services')}>انصراف</Button>
      </div>
    </form>
  );
}
