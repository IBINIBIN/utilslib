// import { glob, globSync, globStream, globStreamSync, Glob } from 'glob'
import path from "node:path";
import {fileURLToPath} from 'node:url'
import { globSync } from "glob";

/** @type {import('typedoc').TypeDocOptions} */
export default {
  extends: ["./typedoc.base.js"],
  entryPoints: globSync("packages/*").map((item) => "../" + item),
  entryPointStrategy: 'packages',
  includeVersion: false,
};
