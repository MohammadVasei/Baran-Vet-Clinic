"use client";

import { useState } from 'react';
import { useCreate, useNavigation } from '@refinedev/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function DiseaseCreatePage() {
  const { mutateAsync: createDisease, mutation } = useCreate();
  const navigation = useNavigation();

  const [animalType, setAnimalType] = useState('dog');
  const [category, setCategory] = useState('infectious');
  const [name, setName] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [care, setCare] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [isPublished, setIsPublished] = useState(true);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await createDisease({
      resource: 'diseases',
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
        <h1 className="font-display text-2xl font-bold text-foreground">افزودن بیماری</h1>
        <p className="mt-1 text-muted-foreground">مقاله‌ای به دایرةالمعارف بیماری‌ها اضافه کنید.</p>
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
          <Textarea id="disease-symptoms" value={symptoms} onChange={(event) => setSymptoms(event.target.value)} rows={5} className="mt-2" placeholder={'تب\nبی‌اشتهایی\n...'} />
        </div>
        <div>
          <Label htmlFor="disease-care">مراقبت و درمان (هر مورد در یک خط)</Label>
          <Textarea id="disease-care" value={care} onChange={(event) => setCare(event.target.value)} rows={5} className="mt-2" placeholder={'مراجعه به دامپزشک\nاستراحت کامل\n...'} />
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
        <Button type="submit" disabled={mutation.isPending}>افزودن بیماری</Button>
        <Button type="button" variant="outline" onClick={() => navigation.list('diseases')}>انصراف</Button>
      </div>
    </form>
  );
}