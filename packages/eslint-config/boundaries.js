import boundaries from "eslint-plugin-boundaries";

/**
 * Barreiras arquiteturais entre módulos.
 *
 * Camadas (de cima pra baixo):
 *   app      -> ponto de composição da aplicação (entrypoint / router)
 *   feature  -> cada pasta em src/modules/* (um módulo isolado)
 *   shared   -> código transversal e reutilizável (camada mais baixa)
 *
 * Regras impostas:
 *   - Import só desce: app -> feature -> shared. Nunca o contrário.
 *   - Um feature NÃO importa outro feature (sem dependência cruzada nem ciclo).
 *   - Um feature só é acessível pela sua API pública (index.ts). Os arquivos
 *     internos do módulo ficam privados.
 *
 * Importações entre arquivos do MESMO elemento são sempre permitidas.
 *
 * @type {import("eslint").Linter.Config}
 */
export const boundariesConfig = {
  files: ["src/**/*.{ts,tsx}"],
  plugins: { boundaries },
  settings: {
    "boundaries/dependency-nodes": ["import"],
    "boundaries/include": ["src/**/*"],
    "boundaries/elements": [
      {
        type: "app",
        pattern: ["src/app/**/*", "src/main.ts", "src/app.module.ts"],
        mode: "full",
      },
      {
        type: "feature",
        pattern: "src/modules/*",
        mode: "folder",
        capture: ["feature"],
      },
      {
        type: "shared",
        pattern: "src/shared/**/*",
        mode: "full",
      },
    ],
    "import/resolver": {
      typescript: { alwaysTryTypes: true },
      node: true,
    },
  },
  rules: {
    // Quem pode importar quem (fluxo só pra baixo).
    "boundaries/element-types": [
      "error",
      {
        default: "disallow",
        message:
          "Importação proibida: '${file.type}' não pode depender de '${dependency.type}'. O import só pode descer (app -> feature -> shared) e features não se importam entre si.",
        rules: [
          { from: ["app"], allow: ["app", "feature", "shared"] },
          {
            from: ["feature"],
            allow: ["shared", ["feature", { feature: "${from.feature}" }]],
          },
          { from: ["shared"], allow: ["shared"] },
        ],
      },
    ],
    // Um feature só pode ser importado pela sua API pública (index.ts).
    "boundaries/entry-point": [
      "error",
      {
        default: "disallow",
        message:
          "Só é permitido importar um módulo pela sua API pública (index.ts). Não acesse arquivos internos de '${dependency.source}'.",
        rules: [
          { target: ["feature"], allow: "index.{ts,tsx}" },
          { target: ["shared"], allow: "**" },
          { target: ["app"], allow: "**" },
        ],
      },
    ],
  },
};
