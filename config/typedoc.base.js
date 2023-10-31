// import { glob, globSync, globStream, globStreamSync, Glob } from 'glob'
import path from "node:path";
import {fileURLToPath} from 'node:url'
import { globSync } from "glob";

/** @type {import('typedoc').TypeDocOptions} */
export default {
  out: path.join(fileURLToPath(new URL('.', import.meta.url)), '..', 'docs'),
  githubPages: true,
  hideGenerator: true,
  cleanOutputDir: true,
  // navigationLinks: {
  //   Example: "http://example.com",
  // },
  includeVersion: true,
  searchInComments: true,
  navigation: {
    includeCategories: true,
    includeGroups: false,
  },
  categorizeByGroup: false,
};
