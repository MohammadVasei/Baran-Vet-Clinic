"use client";

import { useState } from 'react';
import { useCreate, useNavigation } from '@refinedev/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function TestimonialCreatePage() {
  const { mutateAsync: createTestimonial, mutation } = useCreate();
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [quote, setQuote] = useState('');
  const [rating, setRating] = useState('5');
  const [animalType, setAnimalType] = useState('dog');
  const [hasAnimal, setHasAnimal] = useState(true);
  const [petNote, setPetNote] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [isPublished, setIsPublished] = useState(true);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await createTestimonial({
      resource: 'testimonials',
      values: {
        name: name.trim(),
        quote: quote.trim(),
        rating: Number(rating) || 5,
        animal_type: hasAnimal ? animalType : null,
        pet_note: petNote.trim() || null,
        display_order: Number(displayOrder) || 0,
        is_published: isPublished,
      },
    });
    navigation.list('testimonials');
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">افزودن بازخورد</h1>
        <p className="mt-1 text-muted-foreground">بازخورد یک مراجعه‌کننده را ثبت کنید.</p>
      </div>

      <div className="space-y-5 rounded-app-lg border border-border bg-surface p-6">
        <div>
          <Label htmlFor="testimonial-name">نام مراجعه‌کننده</Label>
          <Input id="testimonial-name" value={name} onChange={(event) => setName(event.target.value)} required className="mt-2" />
        </div>
        <div>
          <Label htmlFor="testimonial-quote">متن بازخورد</Label>
          <Textarea id="testimonial-quote" value={quote} onChange={(event) => setQuote(event.target.value)} rows={4} required className="mt-2" />
        </div>
        <div>
          <Label htmlFor="testimonial-rating">امتیاز (۱ تا ۵)</Label>
          <Input id="testimonial-rating" type="number" min="1" max="5" value={rating} onChange={(event) => setRating(event.target.value)} className="mt-2" />
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={hasAnimal} onChange={(event) => setHasAnimal(event.target.checked)} />
          <span>مراجعه مربوط به یک حیوان بوده است</span>
        </label>
        {hasAnimal && (
          <div>
            <Label>نوع حیوان</Label>
            <Select value={animalType} onValueChange={setAnimalType}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dog">سگ</SelectItem>
                <SelectItem value="cat">گربه</SelectItem>
                <SelectItem value="bird">پرنده</SelectItem>
                <SelectItem value="other">سایر</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <div>
          <Label htmlFor="testimonial-pet">نکته حیوان (مثلاً «صاحب «لئو»»)</Label>
          <Input id="testimonial-pet" value={petNote} onChange={(event) => setPetNote(event.target.value)} className="mt-2" />
        </div>
        <div>
          <Label htmlFor="testimonial-order">ترتیب نمایش</Label>
          <Input id="testimonial-order" type="number" min="0" value={displayOrder} onChange={(event) => setDisplayOrder(event.target.value)} className="mt-2" />
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isPublished} onChange={(event) => setIsPublished(event.target.checked)} />
          <span>در سایت منتشر شود</span>
        </label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={mutation.isPending}>افزودن بازخورد</Button>
        <Button type="button" variant="outline" onClick={() => navigation.list('testimonials')}>انصراف</Button>
      </div>
    </form>
  );
}