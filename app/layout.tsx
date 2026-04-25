import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://arkanight.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ARKANIGHT // LIVE",
    template: "%s — ARKANIGHT",
  },
  description:
    "Sito ufficiale di Arkanight — streaming, contenuti e sondaggi live durante gli eventi.",
  applicationName: "Arkanight",
  authors: [{ name: "Arkanight" }],
  keywords: ["arkanight", "streamer", "twitch", "comicon", "live", "voting"],
  openGraph: {
    title: "ARKANIGHT // LIVE",
    description: "Vota in diretta con Arkanight all'evento.",
    type: "website",
    url: SITE_URL,
    siteName: "Arkanight",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Arkanight — Streamer Live Voting",
      },
    ],
    locale: "it_IT",
  },
  twitter: {
    card: "summary_large_image",
    title: "ARKANIGHT // LIVE",
    description: "Vota in diretta con Arkanight all'evento.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className="grain scanlines min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
