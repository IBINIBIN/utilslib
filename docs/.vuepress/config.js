import { defaultTheme } from "vuepress";
import { typedocPlugin } from "vuepress-plugin-typedoc/next";

module.exports = {
  theme: defaultTheme({}),
  plugins: [
    typedocPlugin({
      // plugin options
      entryPoints: ["../../packages/core/src/index.ts", "../../packages/dom/src/index.ts"],
      tsconfig: "../../tsconfig.json",
    }),
  ],
};
