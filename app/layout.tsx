import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ARKANIGHT // LIVE",
  description:
    "Sito ufficiale di Arkanight",
  openGraph: {
    title: "ARKANIGHT // LIVE",
    description: "Vota in diretta con Arkanight all'evento.",
    type: "website",
  },
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22><rect width=%2232%22 height=%2232%22 fill=%22%230A0A0F%22/><text x=%2216%22 y=%2222%22 text-anchor=%22middle%22 font-family=%22Anton, Impact, sans-serif%22 font-size=%2220%22 fill=%22%23C8FF00%22>A</text></svg>",
      },
    ],
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
