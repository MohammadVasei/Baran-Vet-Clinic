"use client";
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useList, useNavigation, useCan } from '@refinedev/core';
import type { CrudFilter } from '@refinedev/core';
import { AdminTable } from '@/components/admin/AdminTable';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchIcon } from '@/components/icons';
import {
  ANIMAL_SEX_LABELS,
  ANIMAL_STATUS_LABELS,
  ANIMAL_STATUSES,
  ANIMAL_STATUS_STYLES,
  getAnimalAge,
} from '@/lib/animals';

interface AnimalRow {
  id: string;
  name: string;
  owner_id: string | null;
  owner_phone: string | null;
  species_id: string;
  species?: { id: string; name: string } | null;
  breed?: { id: string; name: string } | null;
  sex: string;
  date_of_birth: string | null;
  status: string;
}

// Builds server-side filters so search covers name + phone + microchip.
const SEARCH_FIELDS = ['name', 'owner_phone', 'microchip_number'];

function composeFilters(search: string, speciesId: string, status: string): CrudFilter[] {
  const filters: CrudFilter[] = [];
  if (search.trim()) {
    filters.push({
      operator: 'or',
      value: SEARCH_FIELDS.map((field) => ({
        field,
        operator: 'contains',
        value: search.trim(),
      })),
    });
  }
  if (speciesId) filters.push({ field: 'species_id', operator: 'eq', value: speciesId });
  if (status) filters.push({ field: 'status', operator: 'eq', value: status });
  return filters;
}

export default function AnimalsList() {
  const [search, setSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [applied, setApplied] = useState({ search: '', speciesId: '', status: '' });

  const { result, query } = useList({
    resource: 'animals',
    sorters: [{ field: 'created_at', order: 'desc' }],
    meta: {
      select: 'id,name,owner_id,owner_phone,species_id,species:species(id,name),breed:breeds(id,name),sex,date_of_birth,status',
    },
    filters: composeFilters(applied.search, applied.speciesId, applied.status),
  });
  const navigation = useNavigation();
  const canEdit = useCan({ resource: 'animals', action: 'edit' });

  const { result: speciesResult } = useList({
    resource: 'species',
    pagination: { pageSize: 100 },
    meta: { select: 'id,name' },
  });

  const applySearch = (event?: React.FormEvent) => {
    event?.preventDefault();
    setApplied({ search, speciesId: speciesFilter, status: statusFilter });
  };

  const handleEdit = (id: string) => navigation.edit('animals', id);
  const handleCreate = () => navigation.create('animals');

  const columns = [
    {
      accessorKey: 'name' as keyof AnimalRow,
      header: 'نام',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => (
        <span className="font-medium">{getValue('name') as string}</span>
      ),
    },
    {
      accessorKey: 'species_id' as keyof AnimalRow,
      header: 'گونه / نژاد',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => (
        <span className="text-sm text-muted-foreground">
          {(getValue('species') as { name?: string } | null)?.name || '—'}
          {(getValue('breed') as { name?: string } | null)?.name && ` · ${(getValue('breed') as { name: string }).name}`}
        </span>
      ),
    },
    {
      accessorKey: 'sex' as keyof AnimalRow,
      header: 'جنسیت',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => (
        <span>{ANIMAL_SEX_LABELS[getValue('sex') as keyof typeof ANIMAL_SEX_LABELS] || '—'}</span>
      ),
    },
    {
      accessorKey: 'date_of_birth' as keyof AnimalRow,
      header: 'سن',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => (
        <span>{getAnimalAge(getValue('date_of_birth') as string | null)}</span>
      ),
    },
    {
      accessorKey: 'owner_id' as keyof AnimalRow,
      header: 'صاحب',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const phone = getValue('owner_phone') as string | null;
        const account = getValue('owner_id') as string | null;
        return (
          <span>{account ? 'حساب کاربری' : phone ? <span dir="ltr">{phone}</span> : '—'}</span>
        );
      },
    },
    {
      accessorKey: 'status' as keyof AnimalRow,
      header: 'وضعیت',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const status = getValue('status') as keyof typeof ANIMAL_STATUS_STYLES;
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${ANIMAL_STATUS_STYLES[status] || 'bg-gray-100 text-gray-700'}`}>
            {ANIMAL_STATUS_LABELS[status] || status}
          </span>
        );
      },
    },
    ...(canEdit.data
      ? [{
          id: 'actions',
          header: 'عملیات',
          cellWithMeta: ({ original }: { original: AnimalRow }) => (
            <button
              onClick={() => handleEdit(original.id)}
              className="px-3 py-1.5 text-sm rounded-app border border-border hover:bg-muted transition-colors"
            >
              ویرایش
            </button>
          ),
        }]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">حیوانات</h1>
          <p className="text-muted-foreground mt-1">جستجو و مدیریت پرونده‌های حیوانات کلینیک</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-app bg-primary px-4 py-2 text-sm font-bold text-on-primary hover:opacity-90 transition-opacity"
        >
          + افزودن حیوان
        </button>
      </div>

      {/* Server-side search toolbar */}
      <form onSubmit={applySearch} className="rounded-app-lg border border-border bg-surface p-4 space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
          <div className="relative">
            <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="جستجو بر اساس نام، تلفن صاحب یا شماره میکروچیپ..."
              className="pl-10 pr-10 py-2"
              aria-label="جستجوی حیوان"
            />
          </div>
          <Select value={speciesFilter} onValueChange={(value) => { const v = value === '__all' ? '' : value; setSpeciesFilter(v); setApplied((prev) => ({ ...prev, speciesId: v })); }}>
            <SelectTrigger className="min-w-40"><SelectValue placeholder="همه گونه‌ها" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">همه گونه‌ها</SelectItem>
              {(speciesResult?.data as { id: string; name: string }[] | undefined)?.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(value) => { const v = value === '__all' ? '' : value; setStatusFilter(v); setApplied((prev) => ({ ...prev, status: v })); }}>
            <SelectTrigger className="min-w-40"><SelectValue placeholder="همه وضعیت‌ها" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">همه وضعیت‌ها</SelectItem>
              {ANIMAL_STATUSES.map((st) => <SelectItem key={st} value={st}>{ANIMAL_STATUS_LABELS[st]}</SelectItem>)}
            </SelectContent>
          </Select>
          <button type="submit" className="inline-flex items-center gap-2 rounded-app border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors whitespace-nowrap">
            جستجو
          </button>
        </div>
      </form>

      <AdminTable
        columns={columns}
        data={(result?.data as AnimalRow[]) || []}
        isLoading={query.isLoading}
      />

      {query.isError && (
        <div className="rounded-app border border-destructive bg-destructive/10 p-4 text-center text-destructive">
          خطا در بارگذاری حیوانات
        </div>
      )}
    </div>
  );
}