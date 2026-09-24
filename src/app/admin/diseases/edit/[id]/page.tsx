"use client";

import { useEffect, useState } from 'react';
import { useNavigation, useShow, useUpdate } from '@refinedev/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PageHelp } from "@/components/admin/PageHelp";

interface DiseaseData {
  id: string;
  animal_type: string;
  category: string;
  name: string;
  symptoms: string;
  care: string;
  display_order: number;
  is_published: boolean;
}

export default function DiseaseEditPage() {
  const { result, query } = useShow<DiseaseData>({
    resource: 'diseases',
    meta: { select: 'id,animal_type,category,name,symptoms,care,display_order,is_published' },
  });
  const { mutateAsync: updateDisease, mutation } = useUpdate();
  const navigation = useNavigation();

  const [animalType, setAnimalType] = useState('dog');
  const [category, setCategory] = useState('infectious');
  const [name, setName] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [care, setCare] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => {
    if (!result) return;
    setAnimalType(result.animal_type);
    setCategory(result.category);
    setName(result.name);
    setSymptoms(result.symptoms);
    setCare(result.care);
    setDisplayOrder(String(result.display_order ?? 0));
    setIsPublished(result.is_published);
  }, [result]);

  if (query.isLoading) return <div className="p-8 text-center">در حال بارگذاری...</div>;
  if (!result) return <div className="p-8 text-center text-destructive">بیماری یافت نشد.</div>;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await updateDisease({
      resource: 'diseases',
      id: result.id,
      values: {
        animal_type: animalType,
        category,
        name: name.trim(),
        symptoms: symptoms.trim(),
        care: care.trim(),
        display_order: Number(displayOrder) || 0,
        is_published: isPublished,
      },
    });
    navigation.list('diseases');
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-6">
      <div>
        <div className="flex items-center gap-3"><h1 className="font-display text-2xl font-bold text-foreground">ویرایش بیماری</h1><PageHelp id="diseases-edit" /></div>
        <p className="mt-1 text-muted-foreground">اطلاعات مقاله را ویرایش کنید.</p>
      </div>

      <div className="space-y-5 rounded-app-lg border border-border bg-surface p-6">
        <div>
          <Label>حیوان</Label>
          <Select value={animalType} onValueChange={setAnimalType}>
            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="dog">سگ</SelectItem>
              <SelectItem value="cat">گربه</SelectItem>
              <SelectItem value="bird">پرنده</SelectItem>
              <SelectItem value="exotic">حیوانات عجیب‌وغریب</SelectItem>
              <SelectItem value="other">سایر</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>دسته‌بندی</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="infectious">عفونی</SelectItem>
              <SelectItem value="chronic">مزمن</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="disease-name">نام بیماری</Label>
          <Input id="disease-name" value={name} onChange={(event) => setName(event.target.value)} required className="mt-2" />
        </div>
        <div>
          <Label htmlFor="disease-symptoms">علائم (هر مورد در یک خط)</Label>
          <Textarea id="disease-symptoms" value={symptoms} onChange={(event) => setSymptoms(event.target.value)} rows={5} className="mt-2" />
        </div>
        <div>
          <Label htmlFor="disease-care">مراقبت و درمان (هر مورد در یک خط)</Label>
          <Textarea id="disease-care" value={care} onChange={(event) => setCare(event.target.value)} rows={5} className="mt-2" />
        </div>
        <div>
          <Label htmlFor="disease-order">ترتیب نمایش</Label>
          <Input id="disease-order" type="number" min="0" value={displayOrder} onChange={(event) => setDisplayOrder(event.target.value)} className="mt-2" />
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isPublished} onChange={(event) => setIsPublished(event.target.checked)} />
          <span>در سایت منتشر شود</span>
        </label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={mutation.isPending}>ذخیره تغییرات</Button>
        <Button type="button" variant="outline" onClick={() => navigation.list('diseases')}>انصراف</Button>
      </div>
    </form>
  );
}