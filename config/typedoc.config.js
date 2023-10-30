// import { glob, globSync, globStream, globStreamSync, Glob } from 'glob'
import path from "node:path";
import {fileURLToPath} from 'node:url'
import { globSync } from "glob";

/** @type {import('typedoc').TypeDocOptions} */
export default {
  $schema: "https://typedoc.org/schema.json",
  entryPoints: globSync("packages/*/src/index.ts").map((item) => "../" + item),
  out: path.join(fileURLToPath(new URL('.', import.meta.url)), '..', 'docs'),
  githubPages: true,
  hideGenerator: true,
  // name: "Runtime data validation for TypeScript",
  navigationLinks: {
    Example: "http://example.com",
  },
  sidebarLinks: {
    // Example: "http://example.com",
    // Example1: "http://example.com",
    // Example2: "http://example.com",
    // Example3: "http://example.com",
  },
  // version:true,
  includeVersion: true,
  searchInComments: true,
  // emit: "both",

  navigation: {
    includeCategories: true,
    includeGroups: false,
  },
  categorizeByGroup: false,

  // json: "docs/config.json",
  navigationLeaves: ["src"],
  // hideParameterTypesInTitle: true
};
