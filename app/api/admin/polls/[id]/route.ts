import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => null)) as {
    action?: "activate" | "deactivate" | "reset";
  } | null;

  if (!body?.action) {
    return NextResponse.json({ error: "action mancante" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();

  if (body.action === "activate") {
    // Disattiva tutti gli altri sondaggi e attiva questo (in transazione logica)
    const { error: e1 } = await sb
      .from("polls")
      .update({ is_active: false })
      .neq("id", id);
    if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });

    const { error: e2 } = await sb
      .from("polls")
      .update({ is_active: true })
      .eq("id", id);
    if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "deactivate") {
    const { error } = await sb
      .from("polls")
      .update({ is_active: false })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "reset") {
    const { error } = await sb.from("votes").delete().eq("poll_id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "action sconosciuta" }, { status: 400 });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("polls").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
