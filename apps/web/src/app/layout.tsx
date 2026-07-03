import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Web · app-monorepo",
  description: "App Next.js modularizado com barreiras de import.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-zinc-950 text-zinc-50 antialiased">{children}</body>
    </html>
  );
}
