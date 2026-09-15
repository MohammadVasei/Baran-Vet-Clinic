"use client";

import { useParams } from 'next/navigation';
import { RecordTreatmentForm } from '@/components/admin/RecordTreatmentForm';

export default function RecordTreatmentPage() {
  const params = useParams<{ id: string }>();

  if (!params?.id) return <div className="p-8 text-center text-destructive">شناسه حیوان مشخص نیست.</div>;

  return (
    <div className="py-2">
      <RecordTreatmentForm animalId={params.id} />
    </div>
  );
}