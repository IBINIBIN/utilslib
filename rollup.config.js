import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import path from "node:path";
import clear from "rollup-plugin-clear";
import esbuild from "rollup-plugin-esbuild";
import resolve from "@rollup/plugin-node-resolve";

import typescript from "@rollup/plugin-typescript";
import { globSync } from "glob";

const fileName = fileURLToPath(new URL(import.meta.url));
const dirName = fileURLToPath(new URL(".", import.meta.url));
const r = (...url) => path.resolve(dirName, ...url);

/** 所有子包的入口文件 */
const globalEnterFile = globSync("packages/*/src/index.ts");
console.log(`globalEnterFile: `, globalEnterFile);

/** 获取子包的dist文件夹路径 */
const getPackageDistPath = (url) => path.resolve(url, "../..", "dist");

const createOutputList = (name, enter) => {
  const outputConfigs = {
    cjs: {
      name,
      format: "cjs",
    },
    esm: {
      name,
      format: "es",
    },
    global: {
      name,
      format: "iife",
    },
  };

  const distOutputList = Object.entries(outputConfigs).map(
    ([format, config]) => {
      return {
        ...config,
        file: path.resolve(getPackageDistPath(enter), `index.${format}.js`),
      };
    }
  );

  const libOutputList = Object.entries(outputConfigs).map(
    ([format, config]) => {
      return {
        ...config,
        file: r(
          "lib",
          path.basename(path.resolve(enter, "../..")),
          `index.${format}.js`
        ),
        freeze: true,
      };
    }
  );

  return [distOutputList, libOutputList];
};

const createConfig = (enter) => {
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

  const basePlugins = [resolve()];

  return [
    {
      input: enter,
      output: createOutputList(packageBundleName, enter)[0],
      plugins: [
        ...basePlugins,
        typescript({
          target: "ES6",
          include: [`packages/${subPackageName}/src/*`],
          declarationDir: path.resolve(getPackageDistPath(enter), "types"),
        }),
        esbuild({
          minify: process.env.NODE_ENV === "production",
        }),
        clear({
          targets: [getPackageDistPath(enter)],
        }),
      ],
    },
    {
      input: enter,
      output: createOutputList(packageBundleName, enter)[1],
      treeshake: false,
      plugins: [
        ...basePlugins,
        typescript({
          target: "ESNext",
          include: [`packages/${subPackageName}/src/*`],
          outDir: r("lib", subPackageName, "types"),
        }),
        clear({
          targets: [r("lib", subPackageName)],
        }),
      ],
    },
  ];
};

/** @type {import('rollup').RollupOptions} */
export default globalEnterFile
  .map((enter) => createConfig(enter))
  .flat(Infinity);
