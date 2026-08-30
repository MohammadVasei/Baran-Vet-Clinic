import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { ALL_CMS_TAGS, CMS_TAGS } from "@/lib/cms";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/**
 * On-demand CMS cache invalidation (Phase 7).
 *
 * The public site snapshot is cached via unstable_cache with tags; admin
 * mutations call this endpoint so saves appear immediately instead of waiting
 * for the 5-minute revalidate interval. Only authenticated staff may call it.
 */
export async function POST(request: NextRequest) {
  try {
    const serverClient = await createSupabaseServerClient();
    const {
      data: { user },
    } = await serverClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: staff } = await serverClient
      .from("staff_users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (!staff || !["owner", "staff"].includes(staff.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json().catch(() => null)) as
      | { tags?: string | string[]; full?: boolean }
      | null;

    const requested = Array.isArray(body?.tags)
      ? body.tags
      : body?.tags
        ? [body.tags]
        : [];

    const known: ReadonlySet<string> = new Set(ALL_CMS_TAGS);
    const tags = requested.filter((t): t is (typeof ALL_CMS_TAGS)[number] =>
      known.has(t)
    );

    if (body?.full) {
      revalidatePath("/", "layout");
    }

    for (const tag of tags) {
      revalidateTag(tag, { expire: 0 });
    }

    return NextResponse.json({ revalidated: tags.length, full: !!body?.full });
  } catch (error) {
    console.error("Revalidate error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const REVALIDATE_TAGS = CMS_TAGS;