import { supabaseClient } from '@/lib/supabase-client';
import { AccessControlProvider } from '@refinedev/core';

export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action, params }) => {
    let role = String(params?.role || '');

    if (!role) {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) {
        const { data: staff } = await supabaseClient
          .from('staff_users')
          .select('role')
          .eq('id', user.id)
          .single();
        role = staff?.role || 'public';
      } else {
        role = 'public';
      }
    }

    const resourceStr = String(resource || '');

    // Owner has access to everything
    if (role === 'owner') {
      return { can: true };
    }

// Staff permissions
     if (role === 'staff') {
       const allowedResources = [
         'services',
         'doctors',
         'bookings',
         'availability-blocks',
         'products',
         'stock_levels',
         'orders',
         'diseases',
         'testimonials',
         'site_content',
         'service_categories',
         // Animal medical log
         'species',
         'breeds',
         'vaccines',
         'treatment_types',
         'animals',
         'medical_records',
         'reminders',
         'notifications',
       ];

       if (allowedResources.includes(resourceStr)) {
         // Staff can read all allowed resources
         if (action === 'list' || action === 'show') {
           return { can: true };
         }
         // Staff can create/edit content resources
         if (['services', 'doctors', 'products', 'diseases', 'testimonials', 'site_content', 'species', 'breeds', 'vaccines', 'treatment_types', 'animals', 'medical_records', 'reminders', 'service_categories'].includes(resourceStr)) {
           if (action === 'create' || action === 'edit') {
             return { can: true };
           }
         }
         // Staff can manage stock levels
         if (resourceStr === 'stock_levels' && action === 'edit') {
           return { can: true };
         }
         // Staff can update bookings (confirm, cancel, complete)
         if (resourceStr === 'bookings' && action === 'edit') {
           return { can: true };
         }
         // Staff can manage availability blocks
         if (resourceStr === 'availability-blocks') {
           return { can: true };
         }
         // Staff can manage notifications (mark as read/unread)
         if (resourceStr === 'notifications' && action === 'edit') {
           return { can: true };
         }
       }
       return { can: false };
     }

    // Public can only list published content
    if (role === 'public') {
      const publicResources = ['services', 'doctors', 'products', 'species', 'breeds', 'vaccines', 'treatment_types'];
      if (publicResources.includes(resourceStr) && (action === 'list' || action === 'show')) {
        return { can: true };
      }
      // Public can view stock levels (for availability display)
      if (resourceStr === 'stock_levels' && action === 'list') {
        return { can: true };
      }
      // Public can create bookings
      if (resourceStr === 'bookings' && action === 'create') {
        return { can: true };
      }
      // Public can view availability blocks
      if (resourceStr === 'availability-blocks' && action === 'list') {
        return { can: true };
      }
      return { can: false };
    }

    return { can: false };
  },
};