"use client";
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useList, useDelete, useNavigation, useCan } from '@refinedev/core';
import { AdminTable } from '@/components/admin/AdminTable';
import { EditIcon, TrashIcon } from '@/components/icons';

interface SpeciesRow {
  id: string;
  name: string;
  code: string;
  description: string | null;
  active: boolean;
}

interface BreedRow {
  id: string;
  name: string;
  species_id: string;
  species?: { name: string } | null;
  active: boolean;
}

export default function SpeciesAndBreedsList() {
  const { result: speciesResult, query: speciesQuery } = useList({
    resource: 'species',
    sorters: [{ field: 'name', order: 'asc' }],
    pagination: { pageSize: 100 },
    meta: { select: 'id,name,code,description,active' },
  });
  
  const { result: breedsResult, query: breedsQuery } = useList({
    resource: 'breeds',
    sorters: [{ field: 'name', order: 'asc' }],
    pagination: { pageSize: 100 },
    meta: { select: 'id,name,species_id,species:species(name),active' },
  });
  
  const navigation = useNavigation();
  const { mutate: deleteSpecies } = useDelete();
  const { mutate: deleteBreed } = useDelete();
  const canEditSpecies = useCan({ resource: 'species', action: 'edit' });
  const canDeleteSpecies = useCan({ resource: 'species', action: 'delete' });
  const canEditBreed = useCan({ resource: 'breeds', action: 'edit' });
  const canDeleteBreed = useCan({ resource: 'breeds', action: 'delete' });

  const [expandedSpeciesId, setExpandedSpeciesId] = useState<string | null>(null);

  const handleEditSpecies = (id: string) => navigation.edit('species', id);
  const handleDeleteSpecies = (id: string) => {
    if (confirm('آیا از حذف این گونه اطمینان دارید؟ در صورت وجود نژاد یا حیوان برای این گونه، حذف ممکن نیست.')) {
      deleteSpecies({ id, resource: 'species' });
    }
  };
  
  const handleCreateSpecies = () => navigation.create('species');
  
  const handleEditBreed = (id: string) => navigation.edit('breeds', id);
  const handleDeleteBreed = (id: string) => {
    if (confirm('آیا از حذف این نژاد اطمینان دارید؟ در صورت وجود حیوان با این نژاد، حذف ممکن نیست.')) {
      deleteBreed({ id, resource: 'breeds' });
    }
  };
  
  const handleCreateBreed = (speciesId: string) => {
    // Navigate to breed creation with species context
    navigation.create('breeds');
  };

  const speciesData = (speciesResult?.data as SpeciesRow[]) || [];
  const breedsData = (breedsResult?.data as BreedRow[]) || [];
  
  // Group breeds by species_id
  const breedsBySpecies: Record<string, BreedRow[]> = {};
  breedsData.forEach(breed => {
    if (!breedsBySpecies[breed.species_id]) {
      breedsBySpecies[breed.species_id] = [];
    }
    breedsBySpecies[breed.species_id].push(breed);
  });

  const isLoading = speciesQuery.isLoading || breedsQuery.isLoading;
  const isError = speciesQuery.isError || breedsQuery.isError;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">مدیریت گونه‌ها و نژادها</h1>
          <p className="text-muted-foreground mt-1"> ساختار hierarchical گونه‌ها و نژادها برای مدیریت بهتر داده‌های حیوانات</p>
        </div>
        <button onClick={handleCreateSpecies} className="inline-flex items-center gap-2 rounded-app bg-primary px-4 py-2 text-sm font-bold text-on-primary hover:opacity-90 transition-opacity" aria-label="افزودن گونه">
          + افزودن گونه
        </button>
      </div>

      {isError && (
        <div className="rounded-app border border-destructive bg-destructive/10 p-4 text-center text-destructive">
          خطا در بارگذاری داده‌ها
        </div>
      )}

      <div className="space-y-4">
        {speciesData.map((species) => (
          <div key={species.id} className="border border-border rounded-lg overflow-hidden">
            {/* Species Header Row */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/50 cursor-pointer" 
                 onClick={() => setExpandedSpeciesId(expandedSpeciesId === species.id ? null : species.id)}>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{species.name}</span>
                  </div>
                  <div className="flex-1 min-w-0 text-muted-foreground">
                    <span dir="ltr" className="text-muted-foreground">{species.code}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span>{species.description || '—'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${species.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {species.active ? 'فعال' : 'غیرفعال'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {canEditSpecies.data && (
                  <button onClick={() => handleEditSpecies(species.id)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" aria-label="ویرایش">
                    <EditIcon className="size-4" />
                  </button>
                )}
                {canDeleteSpecies.data && (
                  <button onClick={() => handleDeleteSpecies(species.id)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors" aria-label="حذف">
                    <TrashIcon className="size-4" />
                  </button>
                )}
                <span className="transition-transform duration-200" style={{ transform: expandedSpeciesId === species.id ? 'rotate(180deg)' : 'rotate(0)' }}>
                  ▼
                </span>
              </div>
            </div>
            
{/* Breeds List (shown when expanded) */}
            {expandedSpeciesId === species.id && (
              <div className="border-t border-border bg-muted/50 pl-4">
                <div className="flex items-center justify-between px-4 py-3 bg-muted/50">
                  <div className="flex-1">
                    <span className="font-medium">نژادهای این گونه</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleCreateBreed(species.id)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" aria-label="افزودن نژاد برای این گونه">
                      +
                    </button>
                  </div>
                </div>
                
                {(breedsBySpecies[species.id] || []).map((breed) => (
                  <div key={breed.id} className="flex items-center justify-between px-4 py-3 text-sm text-muted-foreground">
                    <div className="flex-1">
                      <span className="font-medium">{breed.name}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${breed.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {breed.active ? 'فعال' : 'غیرفعال'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {canEditBreed.data && (
                        <button onClick={() => handleEditBreed(breed.id)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" aria-label="ویرایش">
                          <EditIcon className="size-4" />
                        </button>
                      )}
                      {canDeleteBreed.data && (
                        <button onClick={() => handleDeleteBreed(breed.id)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors" aria-label="حذف">
                          <TrashIcon className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {(breedsBySpecies[species.id] || []).length === 0 && (
                  <div className="px-4 py-3 text-center text-muted-foreground">
                    این گونه نژاد مرتبطی ندارد
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        
        {speciesData.length === 0 && (
          <div className="rounded-app border border-muted bg-muted/50 p-8 text-center text-muted-foreground">
            هیچ گونه‌ای یافت نشد
          </div>
        )}
      </div>
    </div>
  );
}