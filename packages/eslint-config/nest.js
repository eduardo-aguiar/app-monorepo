import globals from "globals";
import { base } from "./base.js";
import { boundariesConfig } from "./boundaries.js";

/**
 * Config do app NestJS: base + ambiente node + barreiras de módulos.
 * @type {import("eslint").Linter.Config[]}
 */
export const nestConfig = [
  ...base,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      // NestJS depende de decorators e injeção; afrouxamos o que atrapalha.
      "@typescript-eslint/no-extraneous-class": "off",
      "@typescript-eslint/interface-name-prefix": "off",
    },
  },
  boundariesConfig,
];

export default nestConfig;
