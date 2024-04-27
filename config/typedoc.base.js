// import { glob, globSync, globStream, globStreamSync, Glob } from 'glob'
import path from "node:path";
import { fileURLToPath } from "node:url";
import { globSync } from "glob";

/** @type {import('typedoc').TypeDocOptions} */
export default {
  out: path.join(fileURLToPath(new URL(".", import.meta.url)), "..", "docs/typedoc"),
  githubPages: true,
  includeVersion: true,
  searchInComments: true,
  // entryPointStrategy: "packages",
  // plugin: ["typedoc-plugin-markdown"],
  navigation: {
    includeCategories: true,
    includeGroups: false,
  },
  categorizeByGroup: false,
};
