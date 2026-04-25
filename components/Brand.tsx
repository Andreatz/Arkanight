import Link from "next/link";
import Image from "next/image";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

const sizeMap: Record<Size, { wrapper: string; mark: number; word: string }> = {
  xs: { wrapper: "gap-2", mark: 24, word: "text-base" },
  sm: { wrapper: "gap-2.5", mark: 32, word: "text-xl" },
  md: { wrapper: "gap-3", mark: 40, word: "text-2xl" },
  lg: { wrapper: "gap-4", mark: 56, word: "text-4xl" },
  xl: { wrapper: "gap-5", mark: 80, word: "text-5xl" },
};

/**
 * Brand mark + wordmark.
 * - Logo file lives at /public/logo.png (1024x1024 transparent PNG)
 * - Use `showWord={false}` for icon-only contexts (top bars, mobile)
 */
export function Brand({
  size = "md",
  href = "/",
  showWord = true,
  className = "",
}: {
  size?: Size;
  href?: string | null;
  showWord?: boolean;
  className?: string;
}) {
  const s = sizeMap[size];
  const inner = (
    <span className={`inline-flex items-center ${s.wrapper} ${className}`}>
      <Image
        src="/logo.png"
        alt="Arkanight"
        width={s.mark}
        height={s.mark}
        priority
        className="block"
      />
      {showWord && (
        <span
          className={`font-display ${s.word} leading-none text-brand glow-brand`}
        >
          ARKANIGHT
        </span>
      )}
    </span>
  );
  if (!href) return inner;
  return (
    <Link
      href={href}
      className="inline-flex items-center transition hover:opacity-80"
      aria-label="Arkanight — torna alla home"
    >
      {inner}
    </Link>
  );
}

/** "← HOME" CTA button. Use on every sub-page so it's always one tap to escape. */
export function BackHomeButton({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 border border-white/15 bg-ink-900/60 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.3em] text-ink-300 backdrop-blur transition hover:border-brand hover:text-brand ${className}`}
    >
      <span aria-hidden>←</span>
      <span>HOME</span>
    </Link>
  );
}
