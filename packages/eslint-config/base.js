import js from "@eslint/js";
import tseslint from "typescript-eslint";

/**
 * Configuração base compartilhada por todos os apps/pacotes.
 * @type {import("eslint").Linter.Config[]}
 */
export const base = [
  {
    ignores: [
      "**/dist/**",
      "**/.next/**",
      "**/node_modules/**",
      "**/*.config.js",
      "**/*.config.mjs",
      "**/*.config.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
];
