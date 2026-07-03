// Arquivo interno do modulo. A camada feature pode descer para "shared".
import { Button } from "@/shared/ui/button";

export function GreetingCard({ name }: { name: string }) {
  return (
    <section className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900 p-8 text-center shadow-2xl shadow-black/30">
      <h1 className="text-3xl font-semibold tracking-normal">Ola, {name}</h1>
      <p className="mt-3 mb-6 text-sm leading-6 text-zinc-400">
        Monorepo Turborepo rodando. Modulo <code>greeting</code> via API publica.
      </p>
      <Button label="Funciona!" />
    </section>
  );
}
