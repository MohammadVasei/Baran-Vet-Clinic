import { dataProvider as supabaseDataProvider } from '@refinedev/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dataProvider = supabaseDataProvider(supabaseAdmin);