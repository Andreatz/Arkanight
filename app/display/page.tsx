"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { getSupabase, type Poll } from "@/lib/supabase";
import { BackHomeButton } from "@/components/Brand";

type Counts = Record<number, number>;

export default function DisplayPage() {
  const supabase = useMemo(() => getSupabase(), []);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [counts, setCounts] = useState<Counts>({});
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [voteUrl, setVoteUrl] = useState<string>("");
  const [now, setNow] = useState<string>("");
  const flashRef = useRef<HTMLDivElement>(null);

  // Build QR
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/vote`;
    setVoteUrl(url);
    QRCode.toDataURL(url, {
      margin: 1,
      width: 600,
      color: { dark: "#0A0A0F", light: "#EF423E" },
      errorCorrectionLevel: "H",
    }).then(setQrDataUrl);
  }, []);

  // Clock
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");
      setNow(`${hh}:${mm}:${ss}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Load active poll + counts
  const loadActive = async () => {
    const { data } = await supabase
      .from("polls")
      .select("*")
      .eq("is_active", true)
      .limit(1);
    const active = (data?.[0] ?? null) as Poll | null;
    setPoll(active);
    if (active) {
      const { data: votes } = await supabase
        .from("votes")
        .select("option_index")
        .eq("poll_id", active.id);
      const c: Counts = {};
      votes?.forEach((v) => {
        c[v.option_index] = (c[v.option_index] ?? 0) + 1;
      });
      setCounts(c);
    } else {
      setCounts({});
    }
  };

  useEffect(() => {
    loadActive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Realtime: react to vote inserts on the active poll
  useEffect(() => {
    if (!poll) return;
    const ch = supabase
      .channel(`display-votes-${poll.id}`)
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
          // Flash animation
          if (flashRef.current) {
            flashRef.current.classList.remove("opacity-0");
            flashRef.current.classList.add("opacity-100");
            setTimeout(() => {
              flashRef.current?.classList.remove("opacity-100");
              flashRef.current?.classList.add("opacity-0");
            }, 120);
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [poll, supabase]);

  // Realtime: react to poll activation changes
  useEffect(() => {
    const ch = supabase
      .channel("display-polls")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "polls" },
        () => loadActive()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = useMemo(
    () => Object.values(counts).reduce((a, b) => a + b, 0),
    [counts]
  );

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-ink-950">
      {/* Flash overlay on new vote */}
      <div
        ref={flashRef}
        className="pointer-events-none absolute inset-0 z-50 bg-brand/10 opacity-0 transition-opacity duration-150"
      />

      {/* Ambient orbs */}
      <div
        className="orb"
        style={{
          width: 800,
          height: 800,
          background: "var(--brand)",
          top: "-300px",
          right: "-200px",
        }}
      />
      <div
        className="orb"
        style={{
          width: 700,
          height: 700,
          background: "var(--amber)",
          bottom: "-300px",
          left: "-200px",
          opacity: 0.3,
        }}
      />

      {/* Grid bg */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(var(--brand) 1px, transparent 1px), linear-gradient(90deg, var(--brand) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between border-b border-white/10 px-12 py-6">
        <div className="flex items-center gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Arkanight"
            className="h-16 w-16 shrink-0"
          />
          <h1 className="font-display text-5xl text-brand glow-brand animate-flicker">
            ARKANIGHT
          </h1>
          <div className="border-l border-white/10 pl-6 text-xs uppercase tracking-[0.3em] text-ink-300">
            <div>LIVE BROADCAST</div>
            <div className="mt-1 text-amber">// COMICON EDITION</div>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right text-xs uppercase tracking-[0.3em] text-ink-300">
            <div className="flex items-center justify-end gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-amber" />
              ON AIR
            </div>
            <div className="mt-1 font-mono text-ink-400">{now}</div>
            <BackHomeButton />
          </div>
        </div>
      </header>

      {/* Body */}
      {poll ? (
        <div className="relative z-10 grid h-[calc(100vh-94px)] grid-cols-12 gap-10 px-12 py-10">
          {/* LEFT: Question + bars */}
          <div className="col-span-8 flex flex-col">
            <div className="mb-6 flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-ink-400">
              <span className="border border-amber/40 bg-amber/10 px-3 py-1 text-amber">
                LIVE POLL
              </span>
              <span>RISPONDI DAL TUO TELEFONO</span>
            </div>

            <h2 className="font-head text-[clamp(2.5rem,5vw,5rem)] uppercase leading-[0.95] text-white">
              {poll.question}
            </h2>
            
            {/* Placeholder immagine sondaggio */}
            <div className="mt-6 w-full flex justify-center">
              <div className="h-48 w-full max-w-xl border border-white/10 bg-ink-900 flex items-center justify-center text-ink-400 text-xs uppercase tracking-[0.2em]">
                // IMMAGINE SONDAGGIO
              </div>
            </div>
            
            <div className="mt-10 flex-1 space-y-5 overflow-hidden">

            <div className="mt-10 flex-1 space-y-5 overflow-hidden">
              {poll.options.map((opt, idx) => {
                const c = counts[idx] ?? 0;
                const pct = total === 0 ? 0 : (c / total) * 100;
                const max = Math.max(...Object.values(counts), 0);
                const isLeading = total > 0 && c === max && c > 0;
                return (
                  <div
                    key={idx}
                    className="relative"
                    style={{ animation: `rise .5s ${idx * 0.08}s both` }}
                  >
                    <div className="mb-2 flex items-baseline justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <span
                          className={`font-mono text-sm ${
                            isLeading ? "text-brand" : "text-ink-400"
                          }`}
                        >
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span
                          className={`font-head text-3xl uppercase tracking-wide ${
                            isLeading ? "text-brand glow-brand" : "text-white"
                          }`}
                        >
                          {opt}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-4">
                        <span className="font-mono text-sm text-ink-400">
                          {c} {c === 1 ? "voto" : "voti"}
                        </span>
                        <span
                          className={`font-head text-4xl tabular-nums ${
                            isLeading ? "text-brand glow-brand" : "text-white"
                          }`}
                        >
                          {Math.round(pct)}%
                        </span>
                      </div>
                    </div>
                    <div className="relative h-4 overflow-hidden border border-white/10 bg-ink-900">
                      <div
                        className={`absolute inset-y-0 left-0 transition-[width] duration-700 ease-out ${
                          isLeading ? "bar-fill" : "bg-white/30"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
              <div className="text-xs uppercase tracking-[0.3em] text-ink-400">
                TOTALE VOTI
              </div>
              <div className="font-head text-5xl text-brand glow-brand tabular-nums">
                {String(total).padStart(3, "0")}
              </div>
            </div>
          </div>

          {/* RIGHT: QR */}
          <div className="col-span-4 flex flex-col items-center justify-center border-l border-white/10 pl-10">
            <div className="text-center">
              <div className="mb-6 text-xs uppercase tracking-[0.3em] text-ink-400">
                // SCANSIONA PER VOTARE
              </div>
              <div className="brackets relative inline-block bg-brand p-4 text-brand">
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrDataUrl}
                    alt="QR per votare"
                    className="block h-[320px] w-[320px]"
                  />
                ) : (
                  <div className="h-[320px] w-[320px] animate-pulse bg-brand/50" />
                )}
              </div>
              <div className="mt-6 font-mono text-xs text-ink-300 break-all">
                {voteUrl.replace(/^https?:\/\//, "")}
              </div>
              <div className="mt-8 inline-flex items-center gap-3 border border-amber/60 bg-amber/10 px-4 py-2 text-amber">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber" />
                <span className="font-head text-lg uppercase tracking-wider">
                  Vota Ora
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative z-10 flex h-[calc(100vh-94px)] flex-col items-center justify-center gap-8 px-12">
          <div className="text-xs uppercase tracking-[0.3em] text-ink-400">
            // STANDBY
          </div>
          <div className="text-center">
            <h2 className="font-display text-[clamp(4rem,12vw,11rem)] leading-none text-brand glow-brand animate-flicker">
              READY
            </h2>
            <p className="mt-6 font-head text-3xl uppercase text-white">
              Il prossimo sondaggio sta per partire
            </p>
            <p className="mt-3 font-mono text-sm text-ink-300">
              Scansiona il QR per essere pronto a votare
            </p>
          </div>
          <div className="brackets relative bg-brand p-3 text-brand">
            {qrDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt="QR per votare"
                className="block h-[260px] w-[260px]"
              />
            )}
          </div>
          <div className="font-mono text-xs text-ink-300">
            {voteUrl.replace(/^https?:\/\//, "")}
          </div>
        </div>
      )}
    </main>
  );
}
