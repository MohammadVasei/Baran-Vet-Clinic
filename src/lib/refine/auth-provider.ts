import { AuthProvider, HttpError } from '@refinedev/core';
import { supabaseClient } from '@/lib/supabase-client';

export const authProvider: AuthProvider = {
  login: async (params: { email: string; password: string }) => {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: params.email,
      password: params.password,
    });

    if (error) {
      return {
        success: false,
        error: {
          name: 'LoginError',
          message: error.message,
        },
      };
    }

    // Check if user has staff_users role
    const { data: staff } = await supabaseClient
      .from('staff_users')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (!staff) {
      await supabaseClient.auth.signOut();
      return {
        success: false,
        error: {
          name: 'PermissionError',
          message: 'دسترسی غیرمجاز. فقط کارکنان کلینیک می‌توانند وارد شوند.',
        },
      };
    }

    return {
      success: true,
      redirectTo: '/admin',
    };
  },

  logout: async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      return {
        success: false,
        error: {
          name: 'LogoutError',
          message: error.message,
        },
      };
    }
    return {
      success: true,
      redirectTo: '/admin/login',
    };
  },

  onError: async (error: HttpError) => {
    if (error.status === 401 || error.status === 403) {
      return { logout: true };
    }
    return { error };
  },

  check: async () => {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return { authenticated: false, redirectTo: '/admin/login' };
    }

    const { data: staff } = await supabaseClient
      .from('staff_users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!staff) {
      return { authenticated: false, redirectTo: '/admin/login' };
    }

    return {
      authenticated: true,
      user: { id: user.id, email: user.email, role: staff.role },
    };
  },

  getPermissions: async () => {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return null;

    const { data: staff } = await supabaseClient
      .from('staff_users')
      .select('role')
      .eq('id', user.id)
      .single();

    return staff?.role || null;
  },

  getIdentity: async () => {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return null;

    const { data: staff } = await supabaseClient
      .from('staff_users')
      .select('role, full_name')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email,
      name: staff?.full_name || user.email,
      role: staff?.role,
    };
  },

  forgotPassword: async (params: { email: string }) => {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(params.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/reset-password`,
    });
    if (error) {
      return {
        success: false,
        error: { name: 'ForgotPasswordError', message: error.message },
      };
    }
    return { success: true };
  },

  updatePassword: async (params: { password: string }) => {
    const { error } = await supabaseClient.auth.updateUser({ password: params.password });
    if (error) {
      return {
        success: false,
        error: { name: 'UpdatePasswordError', message: error.message },
      };
    }
    return { success: true };
  },
};