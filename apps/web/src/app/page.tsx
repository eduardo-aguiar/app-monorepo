// A camada "app" só enxerga os módulos pela API pública (index.ts).
import { GreetingCard } from "@/modules/greeting";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <GreetingCard name="dev" />
    </main>
  );
}
