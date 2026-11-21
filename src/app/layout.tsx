import type { Metadata } from "next";
import type { ReactNode } from "react";
import { OsProvider } from "@/features/os";
import "./globals.css";

// The Nunito font is self-hosted: see the @font-face rules in globals.css.

export const metadata: Metadata = {
  title: "Nutiküla – Nutiring",
  description: "Aitame sul nutitelefoniga sõbraks saada.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="et">
      <head>
        {/* Start loading the main font file right away, before the CSS asks for it. */}
        <link
          rel="preload"
          href="/fonts/nunito-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <OsProvider>{children}</OsProvider>
      </body>
    </html>
  );
}
