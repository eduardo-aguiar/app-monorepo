import type { ReactNode } from "react";

export const metadata = {
  title: "Web · app-monorepo",
  description: "App Next.js modularizado com barreiras de import.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          margin: 0,
          background: "#0b0b0f",
          color: "#f5f5f7",
        }}
      >
        {children}
      </body>
    </html>
  );
}
