import {
  dataProvider as supabaseDataProvider,
} from '@refinedev/supabase';
import type {
  BaseRecord,
  CreateParams,
  CreateResponse,
  DeleteManyParams,
  DeleteManyResponse,
  DeleteOneParams,
  DeleteOneResponse,
  UpdateParams,
  UpdateResponse,
} from '@refinedev/core';
import { supabaseClient } from '@/lib/supabase-client';

/**
 * Enhanced data provider (Phase 7).
 *
 * Content resources drive the cached public snapshot (see src/lib/cms.ts).
 * On every create/update/delete we fire POST /api/revalidate for the matching
 * tag (fire-and-forget) so saved content appears on the public site without
 * waiting for the 5-minute revalidate interval.
 */
const REVALIDATE_TAGS: Record<string, string> = {
  site_content: 'cms:site',
  services: 'cms:services',
  doctors: 'cms:doctors',
  diseases: 'cms:diseases',
  testimonials: 'cms:testimonials',
};

const base = supabaseDataProvider(supabaseClient);

async function notifyRevalidate(resource: string) {
  const tag = REVALIDATE_TAGS[resource];
  if (!tag) return;
  try {
    // keepalive: the admin navigation right after save is a brand-new document
    // navigation; without it the in-flight request can be aborted before the
    // server invalidates the public tag cache.
    await fetch(new Request('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: [tag] }),
      keepalive: true,
    }));
  } catch (error) {
    console.error('Revalidate notify failed:', error);
  }
}

export const dataProvider = {
  ...base,
  create: async <
    TDataType extends BaseRecord = BaseRecord,
    TVariables = Record<string, never>,
  >(
    params: CreateParams<TVariables>
  ): Promise<CreateResponse<TDataType>> => {
    const result = await base.create<TDataType, TVariables>(params);
    void notifyRevalidate(params.resource);
    return result;
  },
  update: async <
    TDataType extends BaseRecord = BaseRecord,
    TVariables = Record<string, never>,
  >(
    params: UpdateParams<TVariables>
  ): Promise<UpdateResponse<TDataType>> => {
    const result = await base.update<TDataType, TVariables>(params);
    void notifyRevalidate(params.resource);
    return result;
  },
  deleteOne: async <
    TDataType extends BaseRecord = BaseRecord,
    TVariables = Record<string, never>,
  >(
    params: DeleteOneParams<TVariables>
  ): Promise<DeleteOneResponse<TDataType>> => {
    const result = await base.deleteOne<TDataType, TVariables>(params);
    void notifyRevalidate(params.resource);
    return result;
  },
  deleteMany: async <
    TDataType extends BaseRecord = BaseRecord,
    TVariables = Record<string, never>,
  >(
    params: DeleteManyParams<TVariables>
  ): Promise<DeleteManyResponse<TDataType>> => {
    const result = await base.deleteMany<TDataType, TVariables>(params);
    void notifyRevalidate(params.resource);
    return result;
  },
};