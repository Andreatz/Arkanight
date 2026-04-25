import Link from "next/link";
import { Brand } from "@/components/Brand";
import { BackHomeButton } from "@/components/Brand";

export const dynamic = "force-dynamic";

const SOCIALS = [
  {
    label: "TWITCH",
    handle: "arkanightlive",
    url: "https://www.twitch.tv/arkanightlive",
    color: "amber",
  },
  {
    label: "YOUTUBE",
    handle: "@arkanight",
    url: "https://www.youtube.com/@arkanight",
    color: "brand",
  },
  {
    label: "INSTAGRAM",
    handle: "@arkanightreal",
    url: "https://www.instagram.com/arkanightreal/",
    color: "bone",
  },
] as const;

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Ambient background orbs */}
      <div
        className="orb"
        style={{
          width: 600,
          height: 600,
          background: "var(--brand)",
          top: "-200px",
          right: "-150px",
        }}
      />
      <div
        className="orb"
        style={{
          width: 500,
          height: 500,
          background: "var(--amber)",
          bottom: "-200px",
          left: "-100px",
          opacity: 0.25,
        }}
      />

      {/* Decorative grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(var(--brand) 1px, transparent 1px), linear-gradient(90deg, var(--brand) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between border-b border-white/5 px-6 py-4 sm:px-10">
        <div className="flex items-center gap-4">
          <Brand size="sm" href={null} showWord={false} />
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-ink-300">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber" />
            <span>LIVE BROADCAST // 2026</span>
          </div>
        </div>
        <div className="hidden gap-6 text-xs uppercase tracking-[0.25em] text-ink-300 sm:flex">
          <Link href="/vote" className="hover:text-brand">
            Vota
          </Link>
          <Link href="/display" className="hover:text-brand">
            Display
          </Link>
          <Link href="/admin" className="hover:text-brand">
            Admin
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-6 pt-12 sm:px-10 sm:pt-20">
        <div className="mx-auto max-w-6xl">
          <p className="mb-6 inline-flex items-center gap-3 border border-brand/40 bg-brand/5 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.3em] text-brand">
            <span className="h-1.5 w-1.5 rounded-full bg-brand glow-brand" />
            Streamer · Content Creator · Comicon Guest
          </p>

          <h1 className="font-display text-[clamp(3.5rem,14vw,12rem)] leading-[0.85] tracking-tight">
            <span className="block animate-glitch text-brand glow-brand">
              ARKA
            </span>
            <span className="block text-white/95" style={{ marginLeft: "0.4em" }}>
              NIGHT
            </span>
          </h1>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <p className="lg:col-span-7 max-w-2xl text-base leading-relaxed text-ink-300 sm:text-lg">
              Benvenuti nella tana digitale di{" "}
              <span className="text-brand">Arkanight</span>. IL MIGLIOR TRIO DEL WEB!
              Siamo tre millennial di Roma con un talento naturale nel non essere mai d'accordo:
              🎙️ LIVIO 🎙️ Youtuber dal 2009 e streamer dal 2019, ma vecchio dentro dalla nascita
              🧙 MELIADOR🧙 Campione mondiale di giochi di strategia e di fanboysmo su Star Wars e HxH
              💪 MAGGI 💪 Personal trainer ombroso e tenebroso, fissato con la semantica e i buchi di trama
              Se vuoi esplorare i nostri contenuti, puoi cominciare dalla Home o dalla sezione Podcast.
              Seguici in live ogni sera alle 21 su Twitch, e su tutti gli altri social dai link qui sotto!
            </p>

            <div className="lg:col-span-5 lg:justify-self-end">
              <Link
                href="/vote"
                className="brackets group relative inline-flex items-center gap-3 border border-brand/60 bg-brand/10 px-6 py-4 text-brand transition hover:bg-brand hover:text-ink-950"
              >
                <span className="font-head text-2xl tracking-wider">
                  PARTECIPA AL VOTO
                </span>
                <span className="text-xl transition group-hover:translate-x-1">
                  →
                </span>
              </Link>
              <p className="mt-3 text-[0.65rem] uppercase tracking-[0.3em] text-ink-400">
                inquadra il QR code allo schermo
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Socials */}
      <section className="relative z-10 px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-end justify-between gap-6">
            <h2 className="font-head text-4xl uppercase tracking-wider text-white sm:text-6xl">
              Dove
              <br />
              <span className="text-brand">trovarci</span>
            </h2>
            <div className="hidden h-px flex-1 bg-gradient-to-r from-brand/60 to-transparent sm:block" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {SOCIALS.map((s, i) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block overflow-hidden border border-white/10 bg-ink-900 p-6 transition hover:border-brand/60"
                style={{ animation: `rise .6s ${0.2 + i * 0.1}s both` }}
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-brand/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <div className="relative">
                  <div className="mb-8 text-[0.65rem] uppercase tracking-[0.3em] text-ink-400">
                    // 0{i + 1}
                  </div>
                  <div
                    className={`font-head text-3xl uppercase tracking-wider ${
                      s.color === "brand"
                        ? "text-brand"
                        : s.color === "amber"
                        ? "text-amber"
                        : "text-bone"
                    }`}
                  >
                    {s.label}
                  </div>
                  <div className="mt-2 font-mono text-sm text-ink-300">
                    {s.handle}
                  </div>
                  <div className="mt-8 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-ink-400 transition group-hover:text-brand">
                    <span>VAI AL PROFILO</span>
                    <span className="transition group-hover:translate-x-1">↗</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee */}
      <section className="relative z-10 overflow-hidden border-y border-white/5 bg-brand py-3 text-ink-950">
        <div className="marquee-track flex whitespace-nowrap font-head text-2xl uppercase tracking-wider">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="mx-6 flex items-center gap-6">
              ARKANIGHT LIVE <span>★</span> VOTA SUL SITO <span>★</span> COMICON
              EDITION <span>★</span>
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-10 sm:px-10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 text-xs uppercase tracking-[0.25em] text-ink-400 sm:flex-row sm:items-center">
          <div>© 2026 ARKANIGHT — ALL RIGHTS RESERVED</div>
          <div className="font-mono text-ink-500">
            BUILT WITH NEXT.JS · SUPABASE · VERCEL
          </div>
        </div>
      </footer>
    </main>
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