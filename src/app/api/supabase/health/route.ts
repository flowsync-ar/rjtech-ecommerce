import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/** Smoke test: GET /api/supabase/health */
export async function GET() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.getClaims();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Supabase client connected",
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
