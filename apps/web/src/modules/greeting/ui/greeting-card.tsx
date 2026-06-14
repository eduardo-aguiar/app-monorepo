// Arquivo interno do módulo. A camada feature pode descer para "shared".
import { Button } from "@/shared/ui/button";

export function GreetingCard({ name }: { name: string }) {
  return (
    <section
      style={{
        border: "1px solid #2a2a35",
        borderRadius: 16,
        padding: 32,
        maxWidth: 420,
        textAlign: "center",
        background: "#15151c",
      }}
    >
      <h1 style={{ margin: "0 0 8px", fontSize: 28 }}>
        Olá, {name} 👋
      </h1>
      <p style={{ margin: "0 0 24px", color: "#b8b8c4" }}>
        Monorepo Turborepo rodando · módulo <code>greeting</code> via API pública.
      </p>
      <Button label="Funciona!" />
    </section>
  );
}
