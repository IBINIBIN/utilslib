// import { glob, globSync, globStream, globStreamSync, Glob } from 'glob'
import path from "node:path";
import {fileURLToPath} from 'node:url'
import { globSync } from "glob";

/** @type {import('typedoc').TypeDocOptions} */
export default {
  entryPoints: globSync("packages/*").map((item) => "../" + item),
  entryPointStrategy: 'packages',
  hideGenerator: true,
  includeVersion: false,
  navigationLinks: {
    GitHub: "https://github.com/T-Tuan/utilslib",
  },
};
