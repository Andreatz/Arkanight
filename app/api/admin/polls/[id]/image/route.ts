import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getRequestErrorMessage } from "@/lib/errors";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const { id } = await ctx.params;
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file)
    return NextResponse.json({ error: "File mancante" }, { status: 400 });

  try {
    const sb = getSupabaseAdmin();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `polls/${id}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: upErr } = await sb.storage
      .from("poll-images")
      .upload(path, buffer, { contentType: file.type, upsert: true });
    if (upErr)
      return NextResponse.json({ error: upErr.message }, { status: 500 });

    const { data } = sb.storage.from("poll-images").getPublicUrl(path);

    const { error: dbErr } = await sb
      .from("polls")
      .update({ image_url: data.publicUrl })
      .eq("id", id);
    if (dbErr)
      return NextResponse.json({ error: dbErr.message }, { status: 500 });

    return NextResponse.json({ url: data.publicUrl });
  } catch (e) {
    return NextResponse.json({ error: getRequestErrorMessage(e) }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const { id } = await ctx.params;
  try {
    const sb = getSupabaseAdmin();

    const { error } = await sb
      .from("polls")
      .update({ image_url: null })
      .eq("id", id);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: getRequestErrorMessage(e) }, { status: 500 });
  }
}
