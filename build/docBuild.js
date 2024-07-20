import path from "node:path";
import fs from "node:fs";

import { Application, Converter, PageEvent, CommentTag, ReflectionKind } from "typedoc";
import cheerio from "cheerio";
import { v4 as uuid } from "uuid";

import { createSandboxLink, generateSandboxIframe } from "./docBuildLogic.js";
import typedocConfig from "../config/typedoc.config.js";

const CodesandboxIdPrefix = `${uuid()}-`;
const csbDemoPathMap = new Map();
const csbLinkMap = new Map();

async function fetchCsbLinkHandler() {
  await Promise.all(
    [...csbDemoPathMap].map(async ([demoName, demoDirPath]) => {
      const fileList = fs.readdirSync(demoDirPath);
      const fileContents = {};

      for (const file of fileList) {
        const filePath = path.join(demoDirPath, file);
        const content = fs.readFileSync(filePath, "utf-8");
        fileContents[file] = { content };
      }

      const csbConfig = {
        files: fileContents,
      };

      csbLinkMap.set(demoName, await createSandboxLink(csbConfig));
    })
  );
}

async function main() {
  const app = await Application.bootstrapWithPlugins({
    ...typedocConfig,
    readme: "README_DOC.md",
    entryPoints: ["packages/*"],
    plugin: ["typedoc-plugin-mdn-links"],
  });

  /** 获取demo文件夹Path. 为后面生成codesandbox的iframe预览链接做铺垫 */
  app.converter.on(Converter.EVENT_CREATE_SIGNATURE, (ctx, decRef) => {
    try {
      const demoDirPath = path.resolve(
        decRef.sources[0].fullFileName,
        "../../demo-codesandbox",
        decRef.name
      );

      fs.statSync(demoDirPath);
      const codePenTag = new CommentTag("@例子", [
        {
          kind: "text",
          text: `${CodesandboxIdPrefix}${decRef.name}`,
        },
      ]);

      csbDemoPathMap.set(decRef.name, demoDirPath);

      decRef.comment?.blockTags?.push(codePenTag);
    } catch (error) {}
  });

  /** 为所有导出的方法添加 @category 注释标签.
   * 根据文件名设置category
   */
  app.converter.on(Converter.EVENT_CREATE_DECLARATION, (ctx, decRef) => {
    if (decRef.kind === ReflectionKind.Function) {
      let categoryName = path.parse(decRef.sources[0].fullFileName).name;
      categoryName = categoryName === "index" ? "所有方法" : categoryName;

      const categoryTag = new CommentTag("@category", [{ kind: "text", text: categoryName }]);
      decRef.comment?.blockTags?.push(categoryTag);
    }
  });

  /** 插入codesandbox预览代码 */
  app.renderer.on(PageEvent.END, async (pageEvent) => {
    const { model } = pageEvent;

    if (model.kind === 64) {
      const $ = cheerio.load(pageEvent.contents);
      const commentContainerElement = $(".tsd-comment.tsd-typography");

      $("h4+p", commentContainerElement).each(async (index, element) => {
        const currentItem = $(element);
        const text = currentItem.html();

        const [_, name] = text.match(new RegExp(`^${CodesandboxIdPrefix}(.*)$`)) || [];
        if (name) {
          const link = csbLinkMap.get(name);
          if (link) {
            currentItem.html(generateSandboxIframe(`${link}?view=split`));
          }
        }
      });

      pageEvent.contents = $.html();
    }
  });

  const project = await app.convert();
  await fetchCsbLinkHandler();

  if (project) {
    const outputDir = "docs";
    await app.generateDocs(project, outputDir);
  }
}

main().catch(console.error);
