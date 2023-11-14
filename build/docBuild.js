import {
  Application,
  Converter,
  Renderer,
  RendererEvent,
  PageEvent,
  ParameterType,
  ReflectionKind,
} from "typedoc";
import path from "node:path";

import typedocConfig from "../config/typedoc.config.js";

async function main() {
  const app = await Application.bootstrapWithPlugins({
    ...typedocConfig,
    readme: "README_DOC.md",
    entryPoints: ["packages/core", "packages/dom"],
    plugin: ["typedoc-plugin-mdn-links"],
  });

  // app.converter.on(Converter.EVENT_RESOLVE, (ctx, ref) => {
  //   console.log();
  // });

  // app.converter.on('all', (name,ctx,...e) => {
  //   console.log(...e);
  // });

  // app.renderer.on("all", (eventName,pageEvent) => {
  //   console.log(`eventName,pageEvent: `, eventName,pageEvent);
  // });

  /** 修改Doc名称 */
  /**
  app.renderer.on("all", (eventName,pageEvent) => {
    if (Renderer.EVENT_BEGIN_PAGE === eventName) {
      if (pageEvent.model.kind === 1) {
        pageEvent.model.name = "@utilslib";
      }
    }
  });
  */

  app.converter.on(Converter.EVENT_CREATE_DECLARATION, (ctx, decRef) => {
    if (decRef.kind === ReflectionKind.Function) {
      const categoryName = path.parse(decRef.sources[0].fullFileName).name;
      decRef.comment?.blockTags?.push({
        tag: "@category",
        content: [{ kind: "text", text: categoryName }],
      });
    }
  });

  const project = await app.convert();

  if (project) {
    const outputDir = "docs";
    await app.generateDocs(project, outputDir);
  }
}

main().catch(console.error);
