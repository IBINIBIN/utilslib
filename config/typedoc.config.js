import { globSync } from "glob";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('typedoc').TypeDocOptions} */
export default {
  name: "@utilslib",
  out: path.join(fileURLToPath(new URL(".", import.meta.url)), "..", "docs/src"),
  // readme: "./README.md",
  entryPoints: globSync("packages/*").map((item) => "../" + item),
  entryPointStrategy: "packages",
  hideGenerator: true,
  includeVersion: false,
  plugin: ["typedoc-plugin-markdown"],
  navigationLinks: {
    GitHub: "https://github.com/T-Tuan/utilslib",
  },
};
