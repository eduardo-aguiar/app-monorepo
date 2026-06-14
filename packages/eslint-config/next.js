import nextPlugin from "@next/eslint-plugin-next";
import globals from "globals";
import { base } from "./base.js";
import { boundariesConfig } from "./boundaries.js";

/**
 * Config do app Next.js: base + regras do Next + barreiras de módulos.
 * @type {import("eslint").Linter.Config[]}
 */
export const nextConfig = [
  ...base,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { "@next/next": nextPlugin },
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
  boundariesConfig,
];

export default nextConfig;
