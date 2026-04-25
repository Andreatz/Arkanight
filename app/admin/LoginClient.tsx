"use client";

import { useState } from "react";

export default function LoginClient() {
  const [pw, setPw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    if (r.ok) {
      window.location.reload();
    } else {
      const j = await r.json().catch(() => ({}));
      setError(j.error ?? "Errore");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center">
      <div className="mb-6 text-[0.65rem] uppercase tracking-[0.3em] text-ink-400">
        // CONTROLLO ACCESSO
      </div>
      <h1 className="mb-8 text-center font-head text-5xl uppercase text-white">
        Accedi al
        <br />
        <span className="text-neon glow-neon">pannello</span>
      </h1>
      <form onSubmit={submit} className="w-full space-y-4">
        <div>
          <label className="block text-[0.65rem] uppercase tracking-[0.3em] text-ink-400">
            Password Admin
          </label>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="mt-2 block w-full border border-white/15 bg-ink-900 px-4 py-3 font-mono text-white outline-none transition focus:border-neon"
            autoFocus
            required
          />
        </div>
        {error && (
          <div className="border border-magenta/60 bg-magenta/10 p-3 text-xs text-magenta">
            ⚠ {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="brackets w-full border border-neon bg-neon px-6 py-3 font-head text-xl uppercase tracking-wider text-ink-950 transition hover:bg-neon/90 disabled:opacity-50"
        >
          {loading ? "ACCESSO..." : "ENTRA →"}
        </button>
      </form>
    </div>
  );
}
