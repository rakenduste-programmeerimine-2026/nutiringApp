import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import type { ReactNode } from "react";
import { OsProvider } from "@/features/os";
import "./globals.css";

// Nunito is downloaded at build time and served by Next.js itself.
const nunito = Nunito({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Nutiküla – Nutiring",
  description: "Aitame sul nutitelefoniga sõbraks saada.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="et" className={nunito.variable}>
      <body>
        <OsProvider>{children}</OsProvider>
      </body>
    </html>
  );
}
