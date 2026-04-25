import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("polls")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ polls: data });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  const body = await req.json().catch(() => null) as
    | { question?: unknown; options?: unknown }
    | null;
  if (!body) return NextResponse.json({ error: "Body invalido" }, { status: 400 });

  const question = typeof body.question === "string" ? body.question.trim() : "";
  const options = Array.isArray(body.options)
    ? body.options
        .map((o) => (typeof o === "string" ? o.trim() : ""))
        .filter(Boolean)
    : [];

  if (!question || options.length < 2) {
    return NextResponse.json(
      { error: "Domanda e almeno 2 opzioni" },
      { status: 400 }
    );
  }
  if (options.length > 8) {
    return NextResponse.json(
      { error: "Massimo 8 opzioni" },
      { status: 400 }
    );
  }

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("polls")
    .insert({ question, options, is_active: false })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ poll: data });
}
