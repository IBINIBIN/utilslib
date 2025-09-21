import { fileURLToPath } from "node:url";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import clear from "rollup-plugin-clear";
import esbuild from "rollup-plugin-esbuild";
import resolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import alias from "@rollup/plugin-alias";
import dts from "rollup-plugin-dts";

import typescript from "@rollup/plugin-typescript";
import { globSync } from "glob";

const fileName = fileURLToPath(new URL(import.meta.url));
const dirName = fileURLToPath(new URL(".", import.meta.url));
const r = (...url) => path.resolve(dirName, ...url);

/** 所有子包的入口文件 */
const globalEnterFile = globSync("packages/*/src/index.ts");
const packageAliasMap = globalEnterFile.reduce((prev, cur) => {
  const { name } = JSON.parse(readFileSync(getPackageJsonPath(cur), "utf-8"));
  return { ...prev, [name]: cur };
}, {});

function getPackageJsonPath(url) {
  return path.resolve(url, "../..", "package.json");
}
function getPackageDistPath(url) {
  return path.resolve(url, "../..", "dist");
}
function getPackageLibPath(url) {
  return path.resolve(url, "../..", "lib");
}
function getTsconfigPath(subPackageName) {
  const subPackageTsconfigPath = path.join(process.cwd(), "packages", subPackageName, "tsconfig.json");

  if (existsSync(subPackageTsconfigPath)) {
    return subPackageTsconfigPath;
  }
  return path.resolve(process.cwd(), "tsconfig.json");
}

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

  const distOutputList = Object.entries(outputConfigs).map(([format, config]) => {
    return {
      ...config,
      file: path.resolve(getPackageDistPath(enter), `index.${format}.js`),
      freeze: true,
    };
  });

  const libOutputList = Object.entries(outputConfigs).map(([format, config]) => {
    return {
      ...config,
      file: path.resolve(getPackageLibPath(enter), `index.${format}.js`),
      freeze: true,
    };
  });

  return [distOutputList, libOutputList];
};

const createConfig = (enter) => {
  const { name } = JSON.parse(readFileSync(getPackageJsonPath(enter), "utf-8"));
  const [packageName, subPackageName] = name.slice(1).split("/");
  const tsconfigPath = getTsconfigPath(subPackageName);

  function letterUp(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  const packageBundleName = `_${packageName}${letterUp(subPackageName)}`;

  const basePlugins = [
    resolve(),
    json(),
    alias({
      entries: packageAliasMap,
    }),
  ];

  const external = (id) => /node_modules/.test(id) && !id.includes("tslib");

  return [
    // 构建生产包
    {
      input: enter,
      output: createOutputList(packageBundleName, enter)[0],
      external,
      plugins: [
        ...basePlugins,
        typescript({
          tsconfig: tsconfigPath,
          target: "ES6",
          sourceMap: false,
        }),
        esbuild({
          minify: process.env.NODE_ENV === "production",
        }),
        clear({
          targets: [getPackageDistPath(enter)],
        }),
      ],
    },
    // 构建 js 代码。 提供不方便下载此包的用户直接复制
    {
      external,
      input: enter,
      output: createOutputList(packageBundleName, enter)[1],
      plugins: [
        ...basePlugins,
        typescript({
          tsconfig: tsconfigPath,
          target: "ESNext",
          sourceMap: false,
        }),
        clear({
          targets: [getPackageLibPath(enter)],
        }),
      ],
    },
    // 构建d.ts
    {
      input: enter,
      output: [
        {
          file: path.resolve(getPackageDistPath(enter), `types/index.d.ts`),
          format: "es",
        },
        {
          file: path.resolve(getPackageLibPath(enter), `types/index.d.ts`),
          format: "es",
        },
      ],
      treeshake: false,
      plugins: [...basePlugins, dts()],
    },
  ];
};

/** @type {import('rollup').RollupOptions} */
export default globalEnterFile
  .filter((enter) => enter.includes("uniapp"))
  .map((enter) => createConfig(enter))
  .flat(Infinity);
