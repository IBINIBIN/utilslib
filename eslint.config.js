import globals from "globals";
import tseslint from "typescript-eslint";
import eslintPluginPrettier from "eslint-plugin-prettier";
import { includeIgnoreFile } from "@eslint/compat";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, ".gitignore");

/** @type {import('eslint').Linter.Config[]} */
export default [
  { ignores: ["**/demo-codesandbox"] },
  includeIgnoreFile(gitignorePath),
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  ...tseslint.configs.recommended,
  {
    rules: {
      "prettier/prettier": "error",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
    },
    plugins: {
      prettier: eslintPluginPrettier,
    },
  },
];
