import { AccessControlProvider } from '@refinedev/core';

export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action, params }) => {
    const role = String(params?.role || 'public');
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
        'diseases',
        'testimonials',
        'bookings',
        'availability-blocks',
      ];

      if (allowedResources.includes(resourceStr)) {
        // Staff can read all allowed resources
        if (action === 'list' || action === 'show') {
          return { can: true };
        }
        // Staff can create/edit content resources
        if (['services', 'doctors', 'diseases', 'testimonials'].includes(resourceStr)) {
          if (action === 'create' || action === 'edit') {
            return { can: true };
          }
        }
        // Staff can update bookings (confirm, cancel, complete)
        if (resourceStr === 'bookings' && action === 'edit') {
          return { can: true };
        }
        // Staff can manage availability blocks
        if (resourceStr === 'availability-blocks') {
          return { can: true };
        }
      }
      return { can: false };
    }

    // Public can only list published content
    if (role === 'public') {
      const publicResources = ['services', 'doctors', 'diseases', 'testimonials'];
      if (publicResources.includes(resourceStr) && (action === 'list' || action === 'show')) {
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