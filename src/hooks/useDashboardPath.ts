"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase-client";
import { dashboardPathForRole } from "@/lib/dashboard-path";
import { useAuth } from "@/context/AuthContext";

type StaffRole = string | null;

function metadataRole(user: ReturnType<typeof useAuth>["user"]): StaffRole {
  const role = user?.user_metadata?.role;
  return typeof role === "string" ? role : null;
}

/**
 * Resolves the dashboard link for the signed-in user. `user_metadata.role` is
 * only a fast first guess (stale for users created before the metadata was
 * set), so the authoritative `staff_users` role is fetched and applied.
 */
export function useDashboardPath(): string {
  const { user } = useAuth();
  const [fetched, setFetched] = useState<{ userId: string; role: StaffRole } | null>(null);

  useEffect(() => {
    if (!user) return;

    let active = true;
    supabaseClient
      .from("staff_users")
      .select("role")
      .eq("id", user.id)
      .single()
      .then(({ data: staff }) => {
        if (active) setFetched({ userId: user.id, role: (staff?.role as StaffRole) ?? null });
      });

    return () => {
      active = false;
    };
  }, [user]);

  const role = fetched && fetched.userId === user?.id ? fetched.role : metadataRole(user);
  return dashboardPathForRole(role);
}
