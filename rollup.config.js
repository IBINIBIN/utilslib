// rollup.config.js
// import { RollupOptions } from "rollup";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import path from "node:path";
import clear from "rollup-plugin-clear";
import resolve from "@rollup/plugin-node-resolve";

import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import { globSync } from "glob";

const fileName = fileURLToPath(new URL(import.meta.url));
const r = (...url) => path.resolve(fileName, "..", ...url);

const globalEnterFile = globSync("packages/*/src/index.ts");
console.log(`globalEnterFile: `, globalEnterFile);

const getPackageDistPath = (url) => path.resolve(url, "../..", "dist");

/** @type {import('rollup').RollupOptions} */
export default globalEnterFile.map((enter) => {
  const { name } = JSON.parse(
    readFileSync(
      path.resolve(getPackageDistPath(enter), "..", "package.json"),
      "utf-8"
    )
  );
  const [packageName, subPackageName] = name.slice(1).split("/");

  function letterUp(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  const packageBundleName = `_${packageName}${letterUp(subPackageName)}`;

  return {
    input: enter,
    output: [
      {
        name: packageBundleName,
        file: path.resolve(getPackageDistPath(enter), "index.cjs.js"),
        format: "cjs",
      },
      {
        name: packageBundleName,
        file: path.resolve(getPackageDistPath(enter), "index.es.js"),
        format: "es",
      },
      {
        name: packageBundleName,
        file: path.resolve(getPackageDistPath(enter), "index.global.js"),
        format: "iife",
      },
    ],
    plugins: [
      resolve(),
      typescript({
        tsconfig: path.resolve(enter, "../..", 'tsconfig.json'),
        outDir: path.resolve(enter, "../..", "dist/types"),
      }),
      clear({
        targets: [getPackageDistPath(enter)],
      }),
    ],
  };
});
