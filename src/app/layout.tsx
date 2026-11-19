import type { ReactNode } from "react";

export const metadata = {
  title: "nutiringApp",
  description: "nutiringApp",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
