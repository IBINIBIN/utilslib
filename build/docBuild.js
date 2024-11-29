import path, { resolve } from "node:path";

/**
 * @type {import("fs-extra")}
 */
import fs from "fs-extra";
import { URL } from "node:url";

import { format } from "prettier";
import { Application, Converter, PageEvent, CommentTag, ReflectionKind } from "typedoc";
import cheerio from "cheerio";
import { v4 as uuid } from "uuid";

import { createSandboxLink, generateSandboxIframe } from "./docBuildLogic.js";
import typedocConfig from "../config/typedoc.config.js";

const __dirname = new URL(".", import.meta.url).pathname;
const ROOT_PATH = path.join(__dirname, "..");

const CodesandboxIdPrefix = `${uuid()}-`;
const csbDemoPathMap = new Map();
const csbLinkMap = new Map();

const ORGANIZATION_NAME = "@utilslib";

function getDirFilesToMap(dirPath) {
  const fileList = fs.readdirSync(dirPath);
  const fileContents = {};

  for (const file of fileList) {
    const filePath = path.join(dirPath, file);
    const content = fs.readFileSync(filePath, "utf-8");
    fileContents[file] = { content };
  }

  return fileContents;
}

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
    const outputDir = path.join(__dirname, typedocConfig.out);
    const outputJson = path.join(outputDir, "index.json");
    await app.generateDocs(project, outputDir);
    await app.generateJson(project, outputJson);
    await handleTypedocJson();
  }
}

function getTypedocJson() {
  const jsonPath = path.join(__dirname, typedocConfig.out, "index.json");
  return JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
}

function handleNav(c) {
  const nav = c.map((item) => ({
    text: item.name.replace(`${ORGANIZATION_NAME}/`, ""),
    link: `/${item.name}/index`,
  }));

  const vitepressPath = path.join(ROOT_PATH, "docsPress/docs/.vitepress");
  const navJsonPath = path.join(vitepressPath, "nav.json");
  fs.writeFileSync(navJsonPath, JSON.stringify(nav, null, 2));
}

function handleSidebar(c) {
  const sidebarList = [];

  for (const item of c) {
    const { name, children = [], packageVersion } = item;
    const baseFileName = name.replace(`${ORGANIZATION_NAME}/`, "");

    sidebarList.push({
      text: `${baseFileName} - v${packageVersion}`,
      collapsed: true,
      link: `/${name}/index`,
      items: children.map((item) => ({
        text: item.name,
        link: `/${name}/${item.name}/index`,
      })),
    });
  }

  const sidebarPath = path.join(ROOT_PATH, "docsPress/docs/.vitepress", "sidebar.json");
  fs.writeFileSync(sidebarPath, JSON.stringify(sidebarList, null, 2));
}

function formatCodeAsMarkdown(code = "", type = "js") {
  return `\`\`\`${type}\n${code.trimStart()}\n\`\`\``;
}

function formatGroupCodeAsMarkdown(jsCode, tsCode) {
  return `
::: code-group
${formatCodeAsMarkdown(jsCode)}
${formatCodeAsMarkdown(tsCode, "ts")}
:::
  `;
}

function convertMDCode(code, type = "js") {
  return `
  \`\`\`${type}
  ${code.trim()}
  \`\`\`
  `;
}

async function dataConvertMD(item, module, tsSnippetsJson, jsSnippetsJson) {
  const baseFileName = module.name.replace(`${ORGANIZATION_NAME}/`, "");
  const codesandboxExampleDirPath = resolve(
    ROOT_PATH,
    "packages",
    baseFileName,
    "demo-codesandbox",
    item.name
  );
  let code = "";
  const { name, signatures } = item;
  const kindName = ReflectionKind[item.kind];
  const sourceUrl = item.sources[0].url;

  let kindName1 = "";
  switch (item.kind) {
    case ReflectionKind.Variable:
      kindName1 = "";
      break;
  }
  let summary =
    signatures?.reduce((prev, cur) => {
      return prev + (cur?.comment?.summary?.map((item) => `${item.text}`) ?? []).join("");
    }, "### ") ?? "";

  const summaryBlock = summary
    ? `---
${summary}
---
`
    : "";

  const sourceCodeJs = await format(jsSnippetsJson.find((item) => item.name === name)?.code ?? "", {
    parser: "typescript",
  });

  const sourceCodeTs = await format(tsSnippetsJson.find((item) => item.name === name)?.code ?? "", {
    parser: "typescript",
  });

  let hasExample = false;
  let exampleCode = "";
  if (fs.existsSync(codesandboxExampleDirPath)) {
    hasExample = true;

    const iframeSrc = await createSandboxLink({
      files: getDirFilesToMap(codesandboxExampleDirPath),
    });

    const defaultEmbedOptions = {
      previewwindow: "console",
      view: "split",
      runonclick: 1,
    };
    const url = new URL(iframeSrc);
    const params = new URLSearchParams(url.search);
    Object.entries(defaultEmbedOptions).forEach(([key, val]) => {
      params.append(key, val);
    });
    url.search = params.toString();
    exampleCode = generateSandboxIframe(url.toString());
  }

  code = `
[${ORGANIZATION_NAME}](/)/[${baseFileName}](\/${ORGANIZATION_NAME}\/${baseFileName}/index)/${item.name}

${summaryBlock}

# ${kindName} ${name}/index

${exampleCode}

::: details 点击查看源码
${formatGroupCodeAsMarkdown(sourceCodeJs, sourceCodeTs)}

[如有错误，请提交issue](${sourceUrl ?? ""})
  `;

  return code;
}

function createModuleFile(c) {
  const utilslibPath = path.join(ROOT_PATH, "docsPress/docs/@utilslib");

  for (const module of c) {
    const { name, children = [], packageVersion } = module;
    const baseFileName = name.replace(`${ORGANIZATION_NAME}/`, "");
    fs.mkdirpSync(resolve(utilslibPath, baseFileName));

    let code = `
[${ORGANIZATION_NAME}](/) / [${baseFileName}](\/${ORGANIZATION_NAME}\/${baseFileName}/index)

![NPM Version](https://img.shields.io/npm/v/${ORGANIZATION_NAME}/${baseFileName})

${fs.readFileSync(resolve(ROOT_PATH, "packages", baseFileName, "README_DOC.md"), "utf-8")}
${children.map((item) => `**[${item.name}](${item.name}/index)**\n`).join("\n")}
`;

    // module方法列表集合
    fs.writeFile(resolve(utilslibPath, baseFileName, `index.md`), code);
  }
}

function setSourceCodeExportDefault(code, name) {
  return `${code}\n\nexport default ${name}`;
}

async function handleSingleSourceCode(c) {
  const utilslibPath = path.join(ROOT_PATH, "docsPress/docs/@utilslib");

  for (const module of c) {
    const { name, children = [], packageVersion } = module;
    const baseFileName = name.replace(`${ORGANIZATION_NAME}/`, "");
    const jsSnippetsJson = JSON.parse(
      fs.readFileSync(resolve(ROOT_PATH, "packages", baseFileName, "lib", "jsSnippets.json"))
    );
    const tsSnippetsJson = JSON.parse(
      fs.readFileSync(resolve(ROOT_PATH, "packages", baseFileName, "lib", "tsSnippets.json"))
    );
    for (const item of children) {
      console.log("当前处理:", item?.name);

      const p = resolve(utilslibPath, baseFileName, item.name);
      fs.mkdirpSync(p);

      const sourceCodeJs = jsSnippetsJson.find(({ name }) => item.name === name)?.code ?? "";
      const sourceCodeTs = tsSnippetsJson.find(({ name }) => item.name === name)?.code ?? "";

      await Promise.all([
        fs.writeFile(
          resolve(p, `sourceCode.js`),
          await format(setSourceCodeExportDefault(sourceCodeJs, item?.name), {
            parser: "typescript",
          })
        ),

        fs.writeFile(
          resolve(p, `sourceCode.ts`),
          await format(setSourceCodeExportDefault(sourceCodeTs, item?.name), {
            parser: "typescript",
          })
        ),

        fs.writeFile(
          resolve(p, `index.md`),
          await dataConvertMD(item, module, tsSnippetsJson, jsSnippetsJson)
        ),
      ]);
    }
  }
}

async function handleTypedocJson() {
  const json = getTypedocJson();
  const { children } = json;

  handleNav(children);
  handleSidebar(children);
  handleSingleSourceCode(children);
  createModuleFile(children);
}

main().catch(console.error);
