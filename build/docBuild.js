import { Application } from "typedoc";
import typedocConfig from "../config/typedoc.config.js";

async function main() {
  // Application.bootstrap also exists, which will not load plugins
  // Also accepts an array of option readers if you want to disable
  // TypeDoc's tsconfig.json/package.json/typedoc.json option readers

  const app = await Application.bootstrapWithPlugins({
    entryPoints: ["packages/dom", "packages/core"],
    entryPointStrategy: "packages",
    includeVersion: false,
    plugin: [
      // 'typedoc-plugin-markdown',
      "typedoc-plugin-mdn-links",
    ],
  });

  const project = await app.convert();

  if (project) {
    // Project may not have converted correctly
    const outputDir = "docs";

    // Rendered docs
    await app.generateDocs(project, outputDir);
    // Alternatively generate JSON output
    await app.generateJson(project, outputDir + "/documentation.json");
  }
}

main().catch(console.error);
