"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabase, type Poll } from "@/lib/supabase";

type Counts = Record<string, Record<number, number>>;

export default function AdminClient() {
  const supabase = useMemo(() => getSupabase(), []);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [counts, setCounts] = useState<Counts>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [creating, setCreating] = useState(false);

  async function refresh() {
    setLoading(true);
    const r = await fetch("/api/admin/polls", { cache: "no-store" });
    if (!r.ok) {
      setError("Sessione scaduta");
      setLoading(false);
      return;
    }
    const { polls } = (await r.json()) as { polls: Poll[] };
    setPolls(polls ?? []);

    // Fetch counts for all polls
    if (polls?.length) {
      const ids = polls.map((p) => p.id);
      const { data: votes } = await supabase
        .from("votes")
        .select("poll_id, option_index")
        .in("poll_id", ids);
      const c: Counts = {};
      votes?.forEach((v) => {
        c[v.poll_id] ??= {};
        c[v.poll_id][v.option_index] = (c[v.poll_id][v.option_index] ?? 0) + 1;
      });
      setCounts(c);
    }
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Realtime votes for live counts
  useEffect(() => {
    const ch = supabase
      .channel("admin-votes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "votes" },
        (payload) => {
          const v = payload.new as { poll_id: string; option_index: number };
          setCounts((prev) => {
            const next = { ...prev };
            next[v.poll_id] = { ...(next[v.poll_id] ?? {}) };
            next[v.poll_id][v.option_index] =
              (next[v.poll_id][v.option_index] ?? 0) + 1;
            return next;
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "votes" },
        () => refresh()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createPoll(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    const cleaned = options.map((o) => o.trim()).filter(Boolean);
    const r = await fetch("/api/admin/polls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: question.trim(), options: cleaned }),
    });
    const j = await r.json();
    if (!r.ok) {
      setError(j.error ?? "Errore");
    } else {
      setQuestion("");
      setOptions(["", ""]);
      await refresh();
    }
    setCreating(false);
  }

  async function action(id: string, action: "activate" | "deactivate" | "reset") {
    if (action === "reset" && !confirm("Azzerare tutti i voti di questo sondaggio?")) return;
    const r = await fetch(`/api/admin/polls/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setError(j.error ?? "Errore");
      return;
    }
    refresh();
  }

  async function deletePoll(id: string) {
    if (!confirm("Eliminare definitivamente il sondaggio e tutti i suoi voti?")) return;
    const r = await fetch(`/api/admin/polls/${id}`, { method: "DELETE" });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setError(j.error ?? "Errore");
      return;
    }
    refresh();
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.reload();
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[0.65rem] uppercase tracking-[0.3em] text-ink-400">
            Benvenuto nel
          </div>
          <h1 className="mt-1 font-head text-5xl uppercase text-white sm:text-6xl">
            <span className="text-neon glow-neon">CONTROL</span> ROOM
          </h1>
        </div>
        <button
          onClick={logout}
          className="border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.25em] text-ink-300 hover:border-magenta hover:text-magenta"
        >
          Logout →
        </button>
      </div>

      {error && (
        <div className="mb-6 border border-magenta/60 bg-magenta/10 p-3 text-xs text-magenta">
          ⚠ {error}
        </div>
      )}

      {/* Create form */}
      <section className="mb-12 border border-white/10 bg-ink-900 p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3 text-[0.65rem] uppercase tracking-[0.3em] text-ink-400">
          <span className="text-neon">+</span>
          NUOVO SONDAGGIO
        </div>

        <form onSubmit={createPoll} className="space-y-5">
          <div>
            <label className="block text-[0.65rem] uppercase tracking-[0.3em] text-ink-400">
              Domanda
            </label>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={140}
              placeholder="Es. Quale gioco facciamo dopo?"
              className="mt-2 block w-full border border-white/15 bg-ink-950 px-4 py-3 font-head text-2xl uppercase text-white outline-none transition focus:border-neon"
              required
            />
          </div>

          <div>
            <label className="block text-[0.65rem] uppercase tracking-[0.3em] text-ink-400">
              Opzioni ({options.length}/8)
            </label>
            <div className="mt-2 space-y-2">
              {options.map((o, i) => (
                <div key={i} className="flex gap-2">
                  <span className="flex w-10 items-center justify-center font-mono text-xs text-ink-400">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <input
                    value={o}
                    onChange={(e) => {
                      const next = [...options];
                      next[i] = e.target.value;
                      setOptions(next);
                    }}
                    maxLength={60}
                    placeholder={`Opzione ${i + 1}`}
                    className="flex-1 border border-white/15 bg-ink-950 px-4 py-2.5 font-mono text-white outline-none transition focus:border-neon"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setOptions(options.filter((_, j) => j !== i))}
                      className="border border-white/15 px-3 text-ink-400 hover:border-magenta hover:text-magenta"
                      aria-label="Rimuovi"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 8 && (
              <button
                type="button"
                onClick={() => setOptions([...options, ""])}
                className="mt-3 text-xs uppercase tracking-[0.25em] text-ink-400 hover:text-neon"
              >
                + Aggiungi opzione
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={creating}
            className="brackets w-full border border-neon bg-neon px-6 py-3 font-head text-xl uppercase tracking-wider text-ink-950 transition hover:bg-neon/90 disabled:opacity-50 sm:w-auto"
          >
            {creating ? "CREAZIONE..." : "CREA SONDAGGIO →"}
          </button>
        </form>
      </section>

      {/* Polls list */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-head text-3xl uppercase text-white">
            <span className="text-neon">//</span> SONDAGGI
          </h2>
          <a
            href="/display"
            target="_blank"
            rel="noreferrer"
            className="text-xs uppercase tracking-[0.25em] text-ink-300 hover:text-neon"
          >
            Apri display ↗
          </a>
        </div>

        {loading ? (
          <div className="border border-white/10 bg-ink-900 p-10 text-center font-mono text-xs uppercase tracking-[0.3em] text-ink-400">
            CARICAMENTO...
          </div>
        ) : polls.length === 0 ? (
          <div className="border border-white/10 bg-ink-900 p-10 text-center text-ink-400">
            Nessun sondaggio. Creane uno qui sopra ↑
          </div>
        ) : (
          <div className="space-y-3">
            {polls.map((p) => (
              <PollRow
                key={p.id}
                poll={p}
                counts={counts[p.id] ?? {}}
                onActivate={() => action(p.id, "activate")}
                onDeactivate={() => action(p.id, "deactivate")}
                onReset={() => action(p.id, "reset")}
                onDelete={() => deletePoll(p.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function PollRow({
  poll,
  counts,
  onActivate,
  onDeactivate,
  onReset,
  onDelete,
}: {
  poll: Poll;
  counts: Record<number, number>;
  onActivate: () => void;
  onDeactivate: () => void;
  onReset: () => void;
  onDelete: () => void;
}) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return (
    <div
      className={`border bg-ink-900 p-5 transition ${
        poll.is_active
          ? "border-neon box-glow-neon"
          : "border-white/10"
      }`}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-3 text-[0.65rem] uppercase tracking-[0.3em]">
            {poll.is_active ? (
              <span className="flex items-center gap-2 text-neon">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon" />
                LIVE · {total} {total === 1 ? "voto" : "voti"}
              </span>
            ) : (
              <span className="text-ink-400">DRAFT · {total} {total === 1 ? "voto" : "voti"}</span>
            )}
            <span className="text-ink-500">
              {new Date(poll.created_at).toLocaleString("it-IT")}
            </span>
          </div>
          <h3 className="font-head text-2xl uppercase text-white">
            {poll.question}
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {poll.is_active ? (
            <button
              onClick={onDeactivate}
              className="border border-magenta/60 px-3 py-1.5 text-xs uppercase tracking-[0.25em] text-magenta hover:bg-magenta/10"
            >
              ◼ Stop
            </button>
          ) : (
            <button
              onClick={onActivate}
              className="border border-neon bg-neon px-3 py-1.5 text-xs uppercase tracking-[0.25em] text-ink-950 hover:bg-neon/90"
            >
              ▶ Attiva
            </button>
          )}
          <button
            onClick={onReset}
            className="border border-white/15 px-3 py-1.5 text-xs uppercase tracking-[0.25em] text-ink-300 hover:border-cyan hover:text-cyan"
          >
            ↻ Reset voti
          </button>
          <button
            onClick={onDelete}
            className="border border-white/15 px-3 py-1.5 text-xs uppercase tracking-[0.25em] text-ink-400 hover:border-magenta hover:text-magenta"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {poll.options.map((opt, i) => {
          const c = counts[i] ?? 0;
          const pct = total === 0 ? 0 : Math.round((c / total) * 100);
          return (
            <div key={i} className="flex items-center justify-between border border-white/5 bg-ink-950 px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="font-mono text-xs text-ink-400">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="truncate text-sm text-ink-300">{opt}</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-xs text-ink-400">{c}</span>
                <span className="font-mono text-sm text-neon tabular-nums">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
