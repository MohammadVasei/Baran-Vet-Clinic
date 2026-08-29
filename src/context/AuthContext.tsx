"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabaseClient } from "@/lib/supabase-client";
import { setAuthCookie } from "@/lib/auth-cookie";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, options?: { data?: Record<string, string> }) => Promise<{ user: User | null; error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signInWithPhone: (phone: string) => Promise<{ error: AuthError | null }>;
  verifyOtp: (phone: string, token: string, type: "sms" | "email") => Promise<{ user: User | null; error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
  updatePhone: (phone: string) => Promise<{ error: AuthError | null }>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setAuthCookie(session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setAuthCookie(session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, options?: { data?: Record<string, string> }) => {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: options?.data,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { user: data.user, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    return { user: data.user, error };
  };

  const signInWithPhone = async (phone: string) => {
    // Normalize phone: 09xxxxxxxxx -> +989xxxxxxxxx
    const normalized = phone.startsWith("0") ? "+98" + phone.slice(1) : phone;
    const { error } = await supabaseClient.auth.signInWithOtp({
      phone: normalized,
    });
    return { error };
  };

  const verifyOtp = async (phone: string, token: string, type: "sms" | "email") => {
    const normalized = phone.startsWith("0") ? "+98" + phone.slice(1) : phone;
    const { data, error } = await supabaseClient.auth.verifyOtp({
      phone: normalized,
      token,
      type,
    });
    return { user: data.user, error };
  };

  const signOut = async () => {
    const { error } = await supabaseClient.auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { error };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabaseClient.auth.updateUser({ password });
    return { error };
  };

  const updatePhone = async (phone: string) => {
    const normalized = phone.startsWith("0") ? "+98" + phone.slice(1) : phone;
    const { error } = await supabaseClient.auth.updateUser({ phone: normalized });
    return { error };
  };

  const refreshSession = async () => {
    const { data: { session } } = await supabaseClient.auth.refreshSession();
    setAuthCookie(session);
    setSession(session);
    setUser(session?.user ?? null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signInWithPhone,
        verifyOtp,
        signOut,
        resetPassword,
        updatePassword,
        updatePhone,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}