// rollup.config.js
// import { RollupOptions } from "rollup";
import path, { fileURLToPath } from "node:url";

import resolve from "@rollup/plugin-node-resolve";
import babel, { getBabelOutputPlugin } from "@rollup/plugin-babel";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import { globSync } from "glob";

const fileName = fileURLToPath(new URL(import.meta.url));
const r = (...url) => path.resolve(fileName, ...url);

/** @type {import('rollup').RollupOptions} */
export default {
  input: r("src/index.ts"),
  output: [
    {
      name: "_lazyCore",
      file: "dist/index.cjs.js",
      plugins: [
        babel({ babelHelpers: "bundled" }),
        // getBabelOutputPlugin({ presets: ["@babel/preset-env"] })
      ],
      format: "cjs",
    },
    {
      name: "_lazyCore",
      file: "dist/index.es.js",
      plugins: [
            babel({ babelHelpers: "bundled" }),
            // getBabelOutputPlugin({ presets: ["@babel/preset-env"] })
          ],
      format: "es",
    },
    {
      name: "_lazyCore",
      file: "dist/index.global.js",
      format: "iife",
    },
  ],

  plugins: [
    typescript(),
    resolve(),
    // babel({ babelHelpers: "bundled" }),
    // getBabelOutputPlugin({ presets: ['@babel/preset-env'] })
    // terser()
  ],
};
