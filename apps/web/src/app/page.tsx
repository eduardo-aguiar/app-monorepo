// A camada "app" só enxerga os módulos pela API pública (index.ts).
import { GreetingCard } from "@/modules/greeting";

export default function HomePage() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <GreetingCard name="dev" />
    </main>
  );
}
