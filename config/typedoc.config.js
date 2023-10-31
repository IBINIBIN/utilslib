// import { glob, globSync, globStream, globStreamSync, Glob } from 'glob'
import path from "node:path";
import {fileURLToPath} from 'node:url'
import { globSync } from "glob";

/** @type {import('typedoc').TypeDocOptions} */
export default {
  $schema: "https://typedoc.org/schema.json",
  // entryPointStrategy: 'resolve',
  entryPoints: globSync("packages/*/src/index.ts").map((item) => "../" + item),
  // entryPoints: globSync("packages/*").map((item) => "../" + item),
  // entryPoints: '../',
  out: path.join(fileURLToPath(new URL('.', import.meta.url)), '..', 'docs'),
  githubPages: true,
  hideGenerator: true,
  cleanOutputDir: true,
  // searchCategoryBoosts: {
  //   "Common Items": 1.5
  // },
  // searchInComments: true,
  // pretty: false,
  // basePath: '../packages/core/',
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
