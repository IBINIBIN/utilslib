import { globSync } from "glob";
import { fileURLToPath } from "url";

/** @type {import('typedoc').TypeDocOptions} */
export default {
  name: "@utilslib",
  readme: fileURLToPath(new URL("../README.md", import.meta.url)),
  entryPoints: globSync("packages/*").map((item) => "../" + item),
  entryPointStrategy: "packages",
  hideGenerator: true,
  // plugin: ["typedoc-plugin-markdown"],
  includeVersion: false,
  navigationLinks: {
    GitHub: "https://github.com/T-Tuan/utilslib",
  },
};
