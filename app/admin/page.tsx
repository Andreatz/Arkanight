import { isAdmin } from "@/lib/admin-auth";
import AdminClient from "./AdminClient";
import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const ok = await isAdmin();
  return (
    <main className="relative min-h-screen px-5 py-8 sm:px-10 sm:py-12">
      <div
        className="orb"
        style={{
          width: 500,
          height: 500,
          background: "var(--magenta)",
          top: "-200px",
          left: "-100px",
          opacity: 0.2,
        }}
      />
      <header className="mb-10 flex items-center justify-between">
        <a
          href="/"
          className="font-display text-2xl text-neon glow-neon hover:opacity-80"
        >
          ARKA
        </a>
        <div className="text-[0.65rem] uppercase tracking-[0.3em] text-ink-400">
          // ADMIN.PANEL
        </div>
      </header>
      {ok ? <AdminClient /> : <LoginClient />}
    </main>
  );
}
