# app-monorepo

Um **monorepo modular** com Turborepo + pnpm que implementa **barreiras arquiteturais em tempo de linting** para evitar dependência circular, acoplamento cruzado e violações de camada. Dois apps (Next.js e NestJS) com um `pnpm dev` só.

## 📋 Sumário

- [Conceito: Monolito Modular](#conceito-monolito-modular)
- [Por que essa arquitetura?](#por-que-essa-arquitetura)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Fluxo de import e barreiras](#fluxo-de-import-e-barreiras)
- [Comandos e setup](#comandos-e-setup)
- [Adicionando módulos](#adicionando-módulos)
- [Exemplos práticos](#exemplos-práticos)
- [Estendendo e boas práticas](#estendendo-e-boas-práticas)

---

## Conceito: Monolito Modular

### O Problema

Aplicações que crescem sofrem de dois extremos:

**Monolito acoplado** — Um único projeto que cresce sem limites. Tudo importa tudo, dependências circulares aparecem, refatorar fica arriscado, e a complexidade mental explode.

```
Controller → Service → Logger → Utils → Config → ...
    ↓         ↓          ↓
  Model  ← Database  ← Repo
    ↑                    ↓
    └────────────────────┘  (Circular!)
```

**Microsserviços** — Cada feature é um serviço separado. Ganham-se limites claros, mas perdem-se a velocidade de desenvolvimento (múltiplos deploys, overhead de RPC, sincronização de dados).

### A Solução: Monolito Modular

Um **monolito** (um único repositório, um `pnpm dev`, uma única instância rodando) com **módulos isolados** — cada um com fronteira clara, sem dependência circular, import só em uma direção.

```
┌─────────────────────────────────────────┐
│         Single Codebase (monorepo)      │
├─────────────────────────────────────────┤
│  app (entrypoint & composição)          │
│         ↓                               │
│  feature/greeting  feature/auth         │
│  feature/payments  feature/dashboard    │
│         ↓            ↓                  │
│     shared/logger   shared/http-client  │
│     shared/types    shared/utils        │
└─────────────────────────────────────────┘
 
🟢 Import só desce
🟢 Sem import cruzado entre features
🟢 Sem dependência circular
🟢 Mudança em shared afeta todos, mas é previsível
🟢 Refatoração rápida (um `pnpm dev`, tudo sincronizado)
```

**Benefícios:**
- ✅ **Velocidade de desenvolvimento** — alterar código, salvar, já vê o resultado (HMR)
- ✅ **Refatoração segura** — tipo-checker e linter barram cross-layer antes de rodar
- ✅ **Onboarding fácil** — nova feature? copie o estrutura de `modules/<nome>`
- ✅ **Sem overhead de rede** — tudo em processo
- ✅ **Escala até N modules** — a estrutura não cresce em complexidade; cada module é isolado

---

## Por que essa arquitetura?

### 1. **Barreiras automáticas (ESLint)**

As regras de import não são documentação — são **forçadas em lint-time**. Ninguém consegue commitar violação.

```ts
// ❌ ERRO: feature não importa feature
import { PaymentButton } from "@/modules/payments/ui";  // Error: boundaries/element-types
```

```ts
// ❌ ERRO: arquivo interno em vez de API pública
import { useGreeting } from "@/modules/greeting/hooks/use-greeting";  // Error: boundaries/entry-point
```

```ts
// ✅ CORRETO
import { GreetingCard } from "@/modules/greeting";  // index.ts é a única porta de entrada
```

### 2. **Sem dependência circular por construção**

Se só dá pra importar **pra baixo** (app → feature → shared), nunca há ciclo.

```ts
// shared não pode importar feature (seria subir)
// feature não pode importar outro feature (seria lateral)
// logo: sem ciclo
```

### 3. **Escalável: cada módulo é independente**

Um novo dev só precisa entender uma feature. Outra feature não afeta o desenvolvimento dela.

```
src/modules/
├─ greeting/       ← Dev A trabalha aqui
│  ├─ index.ts
│  ├─ ui/
│  └─ hooks/
├─ auth/           ← Dev B trabalha aqui (sem dependência)
│  ├─ index.ts
│  ├─ service/
│  └─ guards/
└─ payments/       ← Dev C trabalha aqui (sem dependência)
   ├─ index.ts
   ├─ webhook/
   └─ gateway/
```

### 4. **Monorepo com Turborepo: um comando só**

```bash
pnpm dev  # sobe web :3000 + api :3001 + HMR em ambos
```

Sem duplicar setup, sem múltiplos terminais. E o Turborepo cuida de dependências entre packages (se `web` depende de `@repo/eslint-config`, Turborepo builda config primeiro).

---

## Estrutura do repositório

```
app-monorepo/
├─ apps/
│  ├─ web/                    (Next.js 15 App Router)
│  │  ├─ src/
│  │  │  ├─ app/              (camada: app - entrypoint)
│  │  │  │  ├─ layout.tsx
│  │  │  │  └─ page.tsx       (compõe modules pela API pública)
│  │  │  ├─ modules/          (camada: feature - isolados)
│  │  │  │  └─ greeting/
│  │  │  │     ├─ index.ts    (API pública ← única porta de entrada)
│  │  │  │     └─ ui/
│  │  │  │        └─ greeting-card.tsx (arquivo interno, privado)
│  │  │  └─ shared/           (camada: shared - reutilizável)
│  │  │     └─ ui/
│  │  │        └─ button.tsx
│  │  ├─ eslint.config.mjs    (estende @repo/eslint-config)
│  │  ├─ tsconfig.json
│  │  ├─ next.config.mjs
│  │  └─ package.json
│  │
│  └─ api/                    (NestJS 11)
│     ├─ src/
│     │  ├─ main.ts           (camada: app - bootstrap)
│     │  ├─ app.module.ts     (camada: app - composição)
│     │  ├─ modules/          (camada: feature - isolados)
│     │  │  └─ health/
│     │  │     ├─ index.ts    (API pública)
│     │  │     ├─ health.module.ts
│     │  │     ├─ health.service.ts
│     │  │     └─ health.controller.ts (arquivo interno)
│     │  └─ shared/           (camada: shared)
│     │     └─ logger/
│     │        ├─ index.ts
│     │        ├─ logger.module.ts
│     │        └─ logger.service.ts
│     ├─ eslint.config.mjs
│     ├─ nest-cli.json
│     ├─ tsconfig.json
│     └─ package.json
│
├─ packages/
│  ├─ eslint-config/          (Config ESLint compartilhado)
│  │  ├─ base.js              (regras básicas)
│  │  ├─ boundaries.js        ← CORAÇÃO: define as barreiras
│  │  ├─ next.js              (ESLint para Next)
│  │  ├─ nest.js              (ESLint para NestJS)
│  │  └─ package.json
│  │
│  └─ typescript-config/      (tsconfig compartilhado)
│     ├─ base.json
│     ├─ nextjs.json
│     ├─ nestjs.json
│     └─ package.json
│
├─ turbo.json                 (Turborepo: orquestra build/dev/lint)
├─ pnpm-workspace.yaml        (Define workspace: apps/* + packages/*)
├─ package.json               (Raiz: scripts que rodam em todos)
├─ .npmrc
├─ .gitignore
└─ README.md
```

### As três camadas

| Camada | Localização | Importa | Pode ser importada por | Exemplos |
|--------|-------------|---------|----------------------|----------|
| **app** | `src/app/`, `src/main.ts`, `src/app.module.ts` | feature, shared | Ninguém | Página inicial, bootstrap, composição de módulos |
| **feature** | `src/modules/*` | shared, outro arquivo do mesmo módulo | app | greeting, auth, payments (cada um isolado) |
| **shared** | `src/shared/**` | shared | feature, app | logger, UI components, utils, types |

---

## Fluxo de import e barreiras

### Como o ESLint impõe as regras

Em `packages/eslint-config/boundaries.js`:

```js
"boundaries/element-types": [
  "error",
  {
    rules: [
      { from: ["app"], allow: ["app", "feature", "shared"] },
      { from: ["feature"], allow: ["shared", ["feature", { feature: "${from.feature}" }]] },
      { from: ["shared"], allow: ["shared"] }
    ]
  }
],
"boundaries/entry-point": [
  "error",
  {
    rules: [
      { target: ["feature"], allow: "index.{ts,tsx}" },  // ← Só o index.ts!
      { target: ["shared"], allow: "**" }
    ]
  }
]
```

### Cenários de violação (e como são barradas)

#### 1️⃣ Feature importa outro feature

```ts
// apps/web/src/modules/auth/guard.ts
import { GreetingCard } from "@/modules/greeting";  // ❌
// Error: boundaries/element-types
// "feature não pode depender de feature"
```

**Por quê blocar?** Porque abre porta para acoplamento cruzado. Se `auth` depender de `greeting`, você não pode mover `greeting` pra outro app sem quebrar `auth`.

#### 2️⃣ Feature importa arquivo interno (não via index.ts)

```ts
// apps/web/src/app/page.tsx
import { GreetingCard } from "@/modules/greeting/ui/greeting-card";  // ❌
// Error: boundaries/entry-point
// "Só é permitido importar um módulo pela sua API pública (index.ts)"
```

**Por quê blocar?** Porque a estrutura interna é detalhe de implementação. Amanhã você refatora `greeting/ui/` para `greeting/components/` — se alguém estava importando diretamente, quebra.

#### 3️⃣ Shared importa feature

```ts
// apps/api/src/shared/logger/logger.service.ts
import { HealthService } from "../../modules/health";  // ❌
// Error: boundaries/element-types
// "shared não pode depender de feature"
```

**Por quê blocar?** Porque `shared` é transversal — usado por todas as features. Se `shared` depender de `health`, você não consegue usar `shared` em `payments` sem puxar `health`. Fica circular.

---

## Comandos e setup

### Instalação

```bash
git clone https://github.com/eduardo-aguiar/app-monorepo
cd app-monorepo
pnpm install      # Instala todas as dependências (uma vez)
```

### Desenvolvimento

```bash
pnpm dev          # Sobe web (:3000) + api (:3001) com HMR
                  # Muda código → salva → já vê no navegador
```

### Linting (inclui verificação de barreiras)

```bash
pnpm lint         # Roda ESLint em ambos os apps
                  # Para em violação de boundaries
```

Saída de violação:

```
apps/web/src/app/page.tsx
  2:30  error  Só é permitido importar um módulo pela sua API pública (index.ts)  boundaries/entry-point
```

### Type-checking

```bash
pnpm check-types  # Roda tsc em ambos
```

### Build

```bash
pnpm build        # Next.js + NestJS
                  # Outputs: .next/ (web) + dist/ (api)
```

Turborepo cuida da **ordem de build**: se `web` depende de `@repo/eslint-config`, Turborepo builda `eslint-config` primeiro. Você não precisa pensar nisso.

### Comando individual

```bash
pnpm --filter api dev          # Só a API
pnpm --filter web build        # Só o web
pnpm --filter @repo/eslint-config lint  # Só o pacote
```

---

## Adicionando módulos

### Novo módulo em `web`

1. **Crie a estrutura:**

```bash
mkdir -p apps/web/src/modules/myfeature
```

2. **Crie `index.ts` (API pública):**

```ts
// apps/web/src/modules/myfeature/index.ts
export { MyFeatureComponent } from "./ui/my-feature";
export { useMyFeature } from "./hooks/use-my-feature";
```

3. **Implemente arquivos internos:**

```ts
// apps/web/src/modules/myfeature/ui/my-feature.tsx
// Isso é privado — ninguém acessa direto
export function MyFeatureComponent() { ... }

// apps/web/src/modules/myfeature/hooks/use-my-feature.ts
// Também privado
export function useMyFeature() { ... }
```

4. **Use em `app/page.tsx`:**

```ts
// apps/web/src/app/page.tsx
import { MyFeatureComponent } from "@/modules/myfeature";  // ✅ Via index.ts

export default function HomePage() {
  return <MyFeatureComponent />;
}
```

**Não precisa mexer em nenhuma config** — as barreiras já valem para qualquer pasta em `src/modules/*`.

### Novo módulo em `api`

Mesma ideia, mas com NestJS:

```bash
mkdir -p apps/api/src/modules/payments
```

```ts
// apps/api/src/modules/payments/index.ts
export { PaymentsModule } from "./payments.module";
export { PaymentsService } from "./payments.service";
```

```ts
// apps/api/src/modules/payments/payments.module.ts
import { Module } from "@nestjs/common";
import { LoggerModule } from "../../shared/logger";  // ✅ Importa shared
import { PaymentsService } from "./payments.service";
import { PaymentsController } from "./payments.controller";

@Module({
  imports: [LoggerModule],
  providers: [PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
```

```ts
// apps/api/src/app.module.ts
import { Module } from "@nestjs/common";
import { HealthModule } from "./modules/health";
import { PaymentsModule } from "./modules/payments";  // ✅ Via index.ts

@Module({
  imports: [HealthModule, PaymentsModule],
})
export class AppModule {}
```

---

## Exemplos práticos

### Exemplo 1: Adicionar novo endpoint à API

Quer adicionar `/status` que retorna `{ uptime, version }`?

1. Crie `apps/api/src/modules/status/`:

```ts
// apps/api/src/modules/status/index.ts
export { StatusModule } from "./status.module";
```

```ts
// apps/api/src/modules/status/status.service.ts
import { Injectable } from "@nestjs/common";
import { LoggerService } from "../../shared/logger";  // ✅ Desce pra shared

@Injectable()
export class StatusService {
  private startTime = Date.now();

  constructor(private logger: LoggerService) {}

  getStatus() {
    this.logger.log("Status check");
    return {
      uptime: Date.now() - this.startTime,
      version: "1.0.0",
    };
  }
}
```

```ts
// apps/api/src/modules/status/status.controller.ts
import { Controller, Get } from "@nestjs/common";
import { StatusService } from "./status.service";

@Controller("status")
export class StatusController {
  constructor(private service: StatusService) {}

  @Get()
  get() {
    return this.service.getStatus();
  }
}
```

```ts
// apps/api/src/modules/status/status.module.ts
import { Module } from "@nestjs/common";
import { LoggerModule } from "../../shared/logger";

@Module({
  imports: [LoggerModule],
  providers: [StatusService],
  controllers: [StatusController],
})
export class StatusModule {}
```

2. Adicione à `app.module.ts`:

```ts
import { StatusModule } from "./modules/status";

@Module({
  imports: [HealthModule, StatusModule],
})
export class AppModule {}
```

3. Rode e teste:

```bash
pnpm dev
# GET http://localhost:3001/status → { uptime: 1234, version: "1.0.0" }
```

### Exemplo 2: Novo módulo no web que usa shared

Quer criar um componente `<UserCard>` que reutiliza o botão compartilhado?

1. Crie `apps/web/src/modules/userprofile/`:

```ts
// apps/web/src/modules/userprofile/index.ts
export { UserCard } from "./ui/user-card";
```

```tsx
// apps/web/src/modules/userprofile/ui/user-card.tsx
import { Button } from "@/shared/ui/button";  // ✅ Desce pra shared

export function UserCard({ name }: { name: string }) {
  return (
    <div>
      <h2>{name}</h2>
      <Button label="Ver perfil" />
    </div>
  );
}
```

2. Use em `app/page.tsx`:

```tsx
import { GreetingCard } from "@/modules/greeting";
import { UserCard } from "@/modules/userprofile";

export default function HomePage() {
  return (
    <>
      <GreetingCard name="dev" />
      <UserCard name="João" />
    </>
  );
}
```

---

## Estendendo e boas práticas

### ✅ Fazendo certo

```ts
// app importa feature e shared
import { AuthModule } from "./modules/auth";
import { LoggerService } from "./shared/logger";

// feature importa shared
import { validateEmail } from "../../shared/validators";

// shared importa só shared
import { logger } from "./logger";
```

### ❌ Evite

```ts
// feature importa outro feature
import { PaymentService } from "../payments/service";  // ❌

// shared importa feature
import { AuthGuard } from "../../modules/auth";  // ❌

// Arquivo interno de feature sendo acessado direto
import { InternalHook } from "@/modules/auth/hooks/internal";  // ❌
```

### Regra prática: "Exportar via index.ts"

Sempre que criar um arquivo em uma feature, decida:
- **Está exposto ao resto da app?** → Exporte em `index.ts`
- **É detalhe de implementação?** → Não exporte; deixe privado

```ts
// apps/web/src/modules/auth/index.ts
export { LoginForm } from "./ui/login-form";        // ✅ Pública
export { useAuth } from "./hooks/use-auth";        // ✅ Pública
// useValidateEmail fica privado; só LoginForm usa
```

### Quando adicionar algo ao `shared`

- ✅ Usado por **2+ features**
- ✅ Não pertence a nenhuma feature específica
- ✅ É infra ou utilitário (logger, HTTP client, validation)

Exemplos bons pra `shared`:
```
shared/
├─ ui/              (Button, Input, Modal — reutilizável)
├─ utils/           (formatDate, slugify, parseJson)
├─ types/           (User, Product, types globais)
├─ logger/
├─ http-client/
└─ validators/
```

Exemplo de coisa que **não** deveria estar em `shared`:
```
// ❌ Não é "compartilhado"
shared/
└─ auth-guards/    (Específico de auth — deveria estar em modules/auth)
```

### Refatoração com segurança

A estrutura de camadas torna refatoração **segura**:

```bash
# Quer mover PaymentsService pra um package separado?
# 1. Cria packages/payments-logic
# 2. Saca PaymentsService lá
# 3. pnpm lint já avisa se quebrou algo
# Tipo-checker também.
```

```bash
# Quer renomear shared/logger/logger.service.ts?
# 1. Renomeia
# 2. Atualiza index.ts
# 3. pnpm lint passa (só importa via index.ts, então não quebra)
```

---

## Troubleshooting

### "Importação proibida: feature não pode depender de feature"

```
Error: boundaries/element-types
"feature não pode depender de feature"
```

**Solução:** Mova a lógica compartilhada pro `shared`:

```ts
// ❌ Antes
// modules/auth/service.ts
import { validateEmail } from "../utils/service";  // utils é outra feature

// ✅ Depois
// shared/validators/email.ts
export function validateEmail(email: string) { ... }

// modules/auth/service.ts
import { validateEmail } from "../../shared/validators";
```

### "Só é permitido importar um módulo pela sua API pública"

```
Error: boundaries/entry-point
"Só é permitido importar um módulo pela sua API pública (index.ts)"
```

**Solução:** Sempre importe via `index.ts`:

```ts
// ❌ Errado
import { Component } from "@/modules/myfeature/ui/component";

// ✅ Certo
import { Component } from "@/modules/myfeature";
```

Se o componente não está exportado em `index.ts`, adicione:

```ts
// modules/myfeature/index.ts
export { Component } from "./ui/component";  // ← Agora está exposto
```

### ESLint complaining about resolver

Se vir `Cannot find module "@/..."` no ESLint:

1. Verifique `tsconfig.json` tem `paths`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

2. Verifique `eslint.config.mjs` estende a config correta:

```js
// apps/web/eslint.config.mjs
import { nextConfig } from "@repo/eslint-config/next";
export default nextConfig;
```

---

## Conceitos-chave resumidos

| Conceito | Significa | Benefício |
|----------|-----------|-----------|
| **Monolito** | Código tudo em um repo | Simples de começar, HMR, refatoração rápida |
| **Modular** | Cada feature é isolada | Escalável, sem acoplamento |
| **Camadas** | app → feature → shared | Previsível, sem ciclo |
| **API pública (index.ts)** | Só essa porta de entrada | Refatoração interna segura |
| **Barreiras ESLint** | Regras forçadas em lint-time | Ninguém consegue ignorar |
| **Turborepo** | Orquestra build/dev/lint | Tudo sincronizado com um comando |

---

## Próximas etapas

- [ ] Adicione novo módulo (`pnpm dev` já vê mudanças)
- [ ] Teste uma violação de boundary (`pnpm lint` falha)
- [ ] Refatore nome de arquivo em `shared` (tudo auto-syncroniza)
- [ ] Estenda `packages/eslint-config` com regras customizadas
- [ ] Crie `packages/hooks-common` pra lógica compartilhada complexa

---

## Recursos

- [Turborepo docs](https://turbo.build/)
- [eslint-plugin-boundaries](https://github.com/javierbrea/eslint-plugin-boundaries)
- [NestJS modules](https://docs.nestjs.com/modules)
- [Next.js app directory](https://nextjs.org/docs/app)
- [pnpm workspaces](https://pnpm.io/workspaces)
