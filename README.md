# app-monorepo

Monorepo com **Turborepo + pnpm**, contendo dois apps que sobem com **um único comando**.

```
app-monorepo/
├─ apps/
│  ├─ web/   → Next.js 15 (App Router)   · http://localhost:3000
│  └─ api/   → NestJS 11                 · http://localhost:3001
├─ packages/
│  ├─ eslint-config/      → ESLint flat config + barreiras de módulo
│  └─ typescript-config/  → tsconfigs compartilhados
├─ turbo.json
└─ pnpm-workspace.yaml
```

## Comandos

```bash
pnpm install   # instala tudo (uma vez)
pnpm dev       # sobe web + api juntos (Turborepo)
pnpm build     # builda os dois
pnpm lint      # roda ESLint (inclui as barreiras de módulo)
pnpm check-types
```

- Web: http://localhost:3000
- API: http://localhost:3001  ·  health: http://localhost:3001/health

## Arquitetura modularizada e barreiras

Cada app segue camadas, e o import **só pode descer**:

```
app  →  feature (src/modules/*)  →  shared (src/shared/**)
```

Regras impostas por `eslint-plugin-boundaries` (em `packages/eslint-config/boundaries.js`):

1. **Fluxo só pra baixo** — `app` importa `feature` e `shared`; `feature` importa só `shared`; `shared` não importa pra cima. Isso elimina dependência circular por construção.
2. **Sem import cruzado entre módulos** — um `feature` não pode importar outro `feature`.
3. **API pública obrigatória** — um módulo só é acessível pelo seu `index.ts`. Os arquivos internos ficam privados.

Importações entre arquivos do **mesmo** módulo são livres.

### Testando uma violação

Se em `apps/web/src/app/page.tsx` você tentar:

```ts
// ❌ acessa arquivo interno em vez da API pública
import { GreetingCard } from "@/modules/greeting/ui/greeting-card";
```

…o `pnpm lint` falha com erro de `boundaries/entry-point`. O import correto é
`@/modules/greeting` (o `index.ts`).

## Adicionando um novo módulo

1. Crie `apps/<app>/src/modules/<nome>/`.
2. Exponha a API pública em `index.ts`.
3. Importe apenas via `@/modules/<nome>` (web) ou `./modules/<nome>` (api).
```

(Não precisa tocar em nenhuma config — as barreiras já valem para qualquer pasta em `src/modules/*`.)
