"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabase, type Poll } from "@/lib/supabase";
import { getVoterId, getVotedOption, setVotedOption } from "@/lib/voter";
import { Brand, BackHomeButton } from "@/components/Brand";
import { getRequestErrorMessage } from "@/lib/errors";

type Counts = Record<number, number>;

export default function VotePage() {
  const [supabase, setSupabase] = useState<ReturnType<typeof getSupabase> | null>(null);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<Counts>({});
  const [myVote, setMyVote] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = useMemo(
    () => Object.values(counts).reduce((a, b) => a + b, 0),
    [counts]
  );

  useEffect(() => {
    try {
      setSupabase(getSupabase());
    } catch (e) {
      setError(getRequestErrorMessage(e));
      setLoading(false);
    }
  }, []);

  // Initial load: get active poll + counts + my vote
  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        const { data: polls, error: e1 } = await client
          .from("polls")
          .select("*")
          .eq("is_active", true)
          .limit(1);

        if (!alive) return;

        if (e1) {
          setError(e1.message);
          setLoading(false);
          return;
        }

        const active = (polls?.[0] ?? null) as Poll | null;
        setPoll(active);

        if (active) {
          const { data: votes, error: e2 } = await client
            .from("votes")
            .select("option_index")
            .eq("poll_id", active.id);
          if (e2) {
            setError(e2.message);
            setLoading(false);
            return;
          }
          const c: Counts = {};
          votes?.forEach((v) => {
            c[v.option_index] = (c[v.option_index] ?? 0) + 1;
          });
          setCounts(c);
          setMyVote(getVotedOption(active.id));
        }
        setLoading(false);
      } catch (e) {
        if (!alive) return;
        setError(getRequestErrorMessage(e));
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [supabase]);

  // Realtime subscriptions: votes changes + poll activation changes
  useEffect(() => {
    if (!supabase || !poll) return;
    const client = supabase;

    const votesChannel = client
      .channel(`votes-${poll.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "votes",
          filter: `poll_id=eq.${poll.id}`,
        },
        (payload) => {
          const idx = (payload.new as { option_index: number }).option_index;
          setCounts((prev) => ({ ...prev, [idx]: (prev[idx] ?? 0) + 1 }));
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(votesChannel);
    };
  }, [poll, supabase]);

  // Listen for new active polls
  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    const ch = client
      .channel("polls-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "polls" },
        async () => {
          try {
            const { data, error: e1 } = await client
              .from("polls")
              .select("*")
              .eq("is_active", true)
              .limit(1);
            if (e1) {
              setError(e1.message);
              return;
            }
            const active = (data?.[0] ?? null) as Poll | null;
            if (!active) {
              setPoll(null);
              setCounts({});
              setMyVote(null);
              return;
            }
            if (active.id !== poll?.id) {
              setPoll(active);
              setCounts({});
              setMyVote(getVotedOption(active.id));
              const { data: votes, error: e2 } = await client
                .from("votes")
                .select("option_index")
                .eq("poll_id", active.id);
              if (e2) {
                setError(e2.message);
                return;
              }
              const c: Counts = {};
              votes?.forEach((v) => {
                c[v.option_index] = (c[v.option_index] ?? 0) + 1;
              });
              setCounts(c);
            }
          } catch (e) {
            setError(getRequestErrorMessage(e));
          }
        }
      )
      .subscribe();
    return () => {
      client.removeChannel(ch);
    };
  }, [poll, supabase]);

  async function vote(optionIndex: number) {
    if (!supabase || !poll || submitting || myVote !== null) return;
    setSubmitting(true);
    setError(null);

    try {
    const voterId = getVoterId();
    const { error: e } = await supabase.from("votes").insert({
      poll_id: poll.id,
      option_index: optionIndex,
      voter_id: voterId,
    });

    if (e) {
      // Conflict (already voted) — treat as success and surface state
      if (e.code === "23505") {
        setVotedOption(poll.id, optionIndex);
        setMyVote(optionIndex);
      } else {
        setError(e.message);
      }
    } else {
      setVotedOption(poll.id, optionIndex);
      setMyVote(optionIndex);
    }
    } catch (e) {
      setError(getRequestErrorMessage(e));
    }
    setSubmitting(false);
  }

  // ----- UI -----

  if (loading) {
    return <Wrapper><LoadingState /></Wrapper>;
  }

  if (error && !poll) {
    return <Wrapper><ErrorState message={error} /></Wrapper>;
  }

  if (!poll) {
    return <Wrapper><WaitingState /></Wrapper>;
  }

  return (
    <Wrapper>
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex items-center justify-between text-[0.65rem] uppercase tracking-[0.3em] text-ink-400">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber" />
            LIVE POLL
          </span>
        </div>

        <h1
          className="font-head text-3xl uppercase leading-tight text-white sm:text-4xl"
          style={{ animation: "rise .5s both" }}
        >
          {poll.question}
        </h1>

        {error && (
          <div className="mt-4 border border-amber/60 bg-amber/10 p-3 text-xs text-amber">
            ⚠ {error}
          </div>
        )}

        <div className="mt-8 space-y-3">
          {poll.options.map((opt, idx) => {
            const c = counts[idx] ?? 0;
            const pct = total === 0 ? 0 : Math.round((c / total) * 100);
            const isMine = myVote === idx;
            const hasVoted = myVote !== null;
            return (
              <button
                key={idx}
                onClick={() => vote(idx)}
                disabled={hasVoted || submitting}
                className={`group relative block w-full overflow-hidden border p-4 text-left transition ${
                  isMine
                    ? "border-brand bg-brand/10 box-glow-brand"
                    : hasVoted
                    ? "border-white/10 bg-ink-900"
                    : "border-white/15 bg-ink-900 hover:border-brand hover:bg-brand/5"
                } ${
                  !hasVoted && !submitting
                    ? "cursor-pointer"
                    : "cursor-default"
                }`}
                style={{ animation: `rise .5s ${0.1 + idx * 0.06}s both` }}
              >
                {/* Progress bar fill behind */}
                {hasVoted && (
                  <div
                    className="absolute inset-y-0 left-0 bg-brand/15 transition-[width] duration-700 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                )}

                <div className="relative flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`font-mono text-xs ${
                        isMine ? "text-brand" : "text-ink-400"
                      }`}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`truncate font-head text-xl uppercase tracking-wide ${
                        isMine ? "text-brand glow-brand" : "text-white"
                      }`}
                    >
                      {opt}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {hasVoted ? (
                      <>
                        <span
                          className={`font-head text-2xl ${
                            isMine ? "text-brand glow-brand" : "text-white"
                          }`}
                        >
                          {pct}%
                        </span>
                      </>
                    ) : (
                      <span className="text-xl text-ink-400 transition group-hover:text-brand group-hover:translate-x-0.5">
                        →
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {myVote !== null && (
          <div
            className="mt-8 border-l-2 border-brand pl-4"
            style={{ animation: "rise .5s .3s both" }}
          >
            <div className="text-[0.65rem] uppercase tracking-[0.3em] text-ink-400">
              GRAZIE PER IL VOTO
            </div>
            <div className="mt-1 font-mono text-sm text-ink-300">
              I risultati si aggiornano in tempo reale.
            </div>
          </div>
        )}

        {submitting && (
          <div className="mt-6 text-center font-mono text-xs uppercase tracking-[0.3em] text-brand animate-pulse">
            INVIO...
          </div>
        )}
      </div>
    </Wrapper>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen flex-col px-5 py-8 sm:px-8 sm:py-12">
      <div
        className="orb"
        style={{
          width: 400,
          height: 400,
          background: "var(--brand)",
          top: "-100px",
          right: "-100px",
          opacity: 0.25,
        }}
      />
      <header className="mb-10 flex items-center justify-between gap-3">
        <Brand size="sm" />
        <div className="flex items-center gap-3">
          <span className="hidden text-[0.6rem] uppercase tracking-[0.3em] text-ink-400 sm:inline">
            // VOTE.PANEL
          </span>
          <BackHomeButton />
        </div>
      </header>
      <div className="flex flex-1 items-center">{children}</div>
    </main>
  );
}

function LoadingState() {
  return (
    <div className="mx-auto text-center">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      <div className="mt-4 font-mono text-xs uppercase tracking-[0.3em] text-ink-400">
        CARICAMENTO...
      </div>
    </div>
  );
}

function WaitingState() {
  return (
    <div className="mx-auto w-full max-w-md text-center">
      <div className="mb-6 inline-flex items-center gap-2 border border-white/10 bg-ink-900 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.3em] text-ink-400">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-400" />
        IN ATTESA
      </div>
      <h1 className="font-head text-4xl uppercase text-white">
        Nessun sondaggio attivo
      </h1>
      <p className="mt-4 font-mono text-sm text-ink-300">
        Resta su questa pagina. Il prossimo sondaggio apparirà{" "}
        <span className="text-brand">automaticamente</span> appena Arkanight lo
        lancia dal vivo.
      </p>
      <div className="mt-8 font-mono text-xs uppercase tracking-[0.3em] text-brand animate-flicker">
        ⏳ STAY TUNED
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="mx-auto w-full max-w-md text-center">
      <div className="mb-6 inline-flex items-center gap-2 border border-amber/60 bg-amber/10 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.3em] text-amber">
        ERRORE
      </div>
      <h1 className="font-head text-4xl uppercase text-white">
        Connessione non disponibile
      </h1>
      <p className="mt-4 font-mono text-sm text-ink-300">{message}</p>
    </div>
  );
}
