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
import { extractFunctionInfo } from "./functionInfoExtractor.js";
import typedocConfig from "../config/typedoc.config.js";

const __dirname = new URL(".", import.meta.url).pathname;
const ROOT_PATH = path.join(__dirname, "..");

const CodesandboxIdPrefix = `${uuid()}-`;
const csbDemoPathMap = new Map();
const csbLinkMap = new Map();

const ORGANIZATION_NAME = "@utilslib";

/**
 * 获取目录中所有文件的内容并映射到对象
 *
 * @param {string} dirPath - 目录路径
 * @returns {Object} 文件内容映射
 */
function getDirFilesToMap(dirPath) {
  try {
    const fileList = fs.readdirSync(dirPath);
    const fileContents = {};

    for (const file of fileList) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);

      // 跳过目录和过大的文件
      if (stats.isDirectory() || stats.size > 1024 * 1024) {
        continue;
      }

      try {
        const content = fs.readFileSync(filePath, "utf-8");
        fileContents[file] = { content };
      } catch (error) {
        console.error(`Error reading file ${filePath}:`, error.message);
      }
    }

    return fileContents;
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error.message);
    return {};
  }
}

/**
 * 处理所有CodeSandbox链接
 */
async function fetchCsbLinkHandler() {
  try {
    const promises = [...csbDemoPathMap].map(async ([demoName, demoDirPath]) => {
      try {
        const fileContents = getDirFilesToMap(demoDirPath);

        if (Object.keys(fileContents).length === 0) {
          console.warn(`No valid files found in ${demoDirPath}`);
          return;
        }

        const csbConfig = { files: fileContents };
        const link = await createSandboxLink(csbConfig);
        csbLinkMap.set(demoName, link);
      } catch (error) {
        console.error(`Error processing demo ${demoName}:`, error.message);
      }
    });

    await Promise.all(promises);
  } catch (error) {
    console.error("Error in fetchCsbLinkHandler:", error.message);
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    const app = await Application.bootstrapWithPlugins({
      ...typedocConfig,
      readme: "README_DOC.md",
      entryPoints: ["packages/*"],
    });

    /** 获取demo文件夹Path. 为后面生成codesandbox的iframe预览链接做铺垫 */
    app.converter.on(Converter.EVENT_CREATE_SIGNATURE, (ctx, decRef) => {
      try {
        const demoDirPath = path.resolve(decRef.sources[0].fullFileName, "../../demo-codesandbox", decRef.name);

        if (fs.existsSync(demoDirPath) && fs.statSync(demoDirPath).isDirectory()) {
          const codePenTag = new CommentTag("@例子", [
            {
              kind: "text",
              text: `${CodesandboxIdPrefix}${decRef.name}`,
            },
          ]);

          csbDemoPathMap.set(decRef.name, demoDirPath);
          decRef.comment?.blockTags?.push(codePenTag);
        }
      } catch (error) {
        console.error(`Error in EVENT_CREATE_SIGNATURE for ${decRef.name}:`, error.message);
      }
    });

    /** 为所有导出的方法添加 @category 注释标签.
     * 根据文件名设置category
     */
    app.converter.on(Converter.EVENT_CREATE_DECLARATION, (ctx, decRef) => {
      try {
        if (decRef.kind === ReflectionKind.Function && decRef.sources && decRef.sources.length > 0) {
          let categoryName = path.parse(decRef.sources[0].fullFileName).name;
          categoryName = categoryName === "index" ? "所有方法" : categoryName;

          const categoryTag = new CommentTag("@category", [{ kind: "text", text: categoryName }]);
          decRef.comment?.blockTags?.push(categoryTag);
        }
      } catch (error) {
        console.error(`Error in EVENT_CREATE_DECLARATION for ${decRef.name}:`, error.message);
      }
    });

    /** 插入codesandbox预览代码 */
    app.renderer.on(PageEvent.END, async (pageEvent) => {
      try {
        const { model } = pageEvent;

        if (model.kind === 64) {
          const $ = cheerio.load(pageEvent.contents);
          const commentContainerElement = $(".tsd-comment.tsd-typography");

          $("h4+p", commentContainerElement).each(async (index, element) => {
            try {
              const currentItem = $(element);
              const text = currentItem.html() || "";

              const match = text.match(new RegExp(`^${CodesandboxIdPrefix}(.*)$`));
              if (match && match[1]) {
                const name = match[1];
                const link = csbLinkMap.get(name);
                if (link) {
                  currentItem.html(generateSandboxIframe(`${link}?view=split`));
                }
              }
            } catch (error) {
              console.error(`Error processing element ${index}:`, error.message);
            }
          });

          pageEvent.contents = $.html();
        }
      } catch (error) {
        console.error("Error in PageEvent.END:", error.message);
      }
    });

    const project = await app.convert();

    if (!project) {
      throw new Error("Failed to convert project");
    }

    await fetchCsbLinkHandler();

    const outputDir = path.join(__dirname, typedocConfig.out);
    const outputJson = path.join(outputDir, "index.json");

    await app.generateDocs(project, outputDir);
    await app.generateJson(project, outputJson);
    await handleTypedocJson();

    console.log("Documentation build completed successfully!");
  } catch (error) {
    console.error("Error in main function:", error);
    process.exit(1);
  }
}

function getTypedocJson() {
  try {
    const jsonPath = path.join(__dirname, typedocConfig.out, "index.json");
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`TypeDoc JSON file not found at ${jsonPath}`);
    }
    return JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  } catch (error) {
    console.error("Error reading TypeDoc JSON:", error);
    throw error;
  }
}

function handleNav(c) {
  try {
    const nav = c.map((item) => ({
      text: item.name.replace(`${ORGANIZATION_NAME}/`, ""),
      link: `/${item.name}/index`,
    }));

    const vitepressPath = path.join(ROOT_PATH, "docsPress/docs/.vitepress");
    const navJsonPath = path.join(vitepressPath, "nav.json");

    // 确保目录存在
    fs.mkdirpSync(vitepressPath);

    fs.writeFileSync(navJsonPath, JSON.stringify(nav, null, 2));
    console.log(`Navigation JSON written to ${navJsonPath}`);
  } catch (error) {
    console.error("Error in handleNav:", error);
  }
}

function handleSidebar(c) {
  try {
    const sidebarList = [];

    for (const item of c) {
      const { name, children = [], packageVersion } = item;
      const baseFileName = name.replace(`${ORGANIZATION_NAME}/`, "");

      sidebarList.push({
        text: `${baseFileName} - v${packageVersion || "0.0.0"}`,
        collapsed: true,
        link: `/${name}/index`,
        items: children.map((item) => ({
          text: item.name,
          link: `/${name}/${item.name}/index`,
        })),
      });
    }

    const vitepressPath = path.join(ROOT_PATH, "docsPress/docs/.vitepress");
    const sidebarPath = path.join(vitepressPath, "sidebar.json");

    // 确保目录存在
    fs.mkdirpSync(vitepressPath);

    fs.writeFileSync(sidebarPath, JSON.stringify(sidebarList, null, 2));
    console.log(`Sidebar JSON written to ${sidebarPath}`);
  } catch (error) {
    console.error("Error in handleSidebar:", error);
  }
}

/**
 * 将代码格式化为Markdown代码块
 *
 * @param {string} code - 代码内容
 * @param {string} type - 代码类型
 * @returns {string} - Markdown格式的代码块
 */
function formatCodeAsMarkdown(code = "", type = "js") {
  if (!code) return "";

  // 确保代码中的反引号不会破坏Markdown格式
  const safeCode = code.replace(/```/g, "\\`\\`\\`");

  return `\`\`\`${type}\n${safeCode.trimStart()}\n\`\`\``;
}

/**
 * 将JS和TS代码组合为Markdown代码组
 *
 * @param {string} jsCode - JavaScript代码
 * @param {string} tsCode - TypeScript代码
 * @returns {string} - Markdown格式的代码组
 */
function formatGroupCodeAsMarkdown(jsCode, tsCode) {
  if (!jsCode && !tsCode) return "";

  return `
::: code-group
${jsCode ? formatCodeAsMarkdown(jsCode) : ""}
${tsCode ? formatCodeAsMarkdown(tsCode, "ts") : ""}
:::
  `.trim();
}

function convertMDCode(code, type = "js") {
  return `
  \`\`\`${type}
  ${code.trim()}
  \`\`\`
  `;
}

async function dataConvertMD(item, module, tsSnippetsJson, jsSnippetsJson) {
  try {
    const baseFileName = module.name.replace(`${ORGANIZATION_NAME}/`, "");
    const codesandboxExampleDirPath = resolve(ROOT_PATH, "packages", baseFileName, "demo-codesandbox", item.name);
    let code = "";
    const { name, signatures } = item;
    const kindName = ReflectionKind[item.kind] || "Function";
    const sourceUrl = item.sources?.[0]?.url || "";

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

    // 查找源代码
    const tsSnippet = tsSnippetsJson.find((item) => item.name === name);
    const jsSnippet = jsSnippetsJson.find((item) => item.name === name);

    const sourceCodeTs = tsSnippet?.code
      ? await format(tsSnippet.code, { parser: "typescript" }).catch(() => tsSnippet.code)
      : "";

    const sourceCodeJs = jsSnippet?.code
      ? await format(jsSnippet.code, { parser: "typescript" }).catch(() => jsSnippet.code)
      : "";

    // 使用extractFunctionInfo获取详细信息
    let functionInfo = null;
    try {
      if (sourceCodeTs) {
        functionInfo = extractFunctionInfo(sourceCodeTs, name);
        console.log(`Successfully extracted function info for ${name}`);
      } else {
        console.warn(`No TypeScript source code found for ${name}`);
      }
    } catch (error) {
      console.error(`Error extracting function info for ${name}:`, error);
    }

    // 构建函数详细信息部分
    let functionDetailsSection = "";
    if (functionInfo) {
      // 函数签名
      if (functionInfo.signature) {
        functionDetailsSection += `## 函数签名\n\n\`\`\`typescript\n${functionInfo.signature}\n\`\`\`\n\n`;
      }

      // 函数描述
      if (functionInfo.description) {
        functionDetailsSection += `## 描述\n\n${functionInfo.description}\n\n`;
      }

      // 类型参数
      if (functionInfo.typeParameters && functionInfo.typeParameters.length > 0) {
        functionDetailsSection += `## 类型参数\n\n`;
        functionDetailsSection += `| 参数名 | 约束 | 默认值 | 描述 |\n`;
        functionDetailsSection += `| ------ | ---- | ------ | ---- |\n`;

        for (const tp of functionInfo.typeParameters) {
          // 确保所有值都是安全的字符串，并转义可能导致Markdown表格格式问题的字符
          const name = escapeMarkdown(tp.name || "");

          // 对于约束和默认值，我们需要特殊处理TypeScript类型
          let constraint = tp.constraint ? escapeMarkdown(tp.constraint) : "-";
          let defaultValue = tp.default ? escapeMarkdown(tp.default) : "-";

          // 如果约束或默认值是复杂的TypeScript类型，可能需要在代码块中显示
          if (
            constraint !== "-" &&
            (constraint.includes("&lt;") || constraint.includes("&gt;") || constraint.includes("keyof"))
          ) {
            constraint = `<code>${constraint}</code>`;
          } else if (constraint !== "-") {
            constraint = `\`${constraint}\``;
          }

          if (
            defaultValue !== "-" &&
            (defaultValue.includes("&lt;") || defaultValue.includes("&gt;") || defaultValue.includes("keyof"))
          ) {
            defaultValue = `<code>${defaultValue}</code>`;
          } else if (defaultValue !== "-") {
            defaultValue = `\`${defaultValue}\``;
          }

          const description = escapeMarkdown(tp.description || "-");

          functionDetailsSection += `| \`${name}\` | ${constraint} | ${defaultValue} | ${description} |\n`;
        }

        functionDetailsSection += `\n`;
      }

      // 参数
      if (functionInfo.parameters && functionInfo.parameters.length > 0) {
        functionDetailsSection += `## 参数\n\n`;
        functionDetailsSection += `| 参数名 | 类型 | 可选 | 默认值 | 描述 |\n`;
        functionDetailsSection += `| ------ | ---- | ------ | ------ | ---- |\n`;

        for (const param of functionInfo.parameters) {
          // 确保所有值都是安全的字符串，并转义可能导致Markdown表格格式问题的字符
          const name = escapeMarkdown(param.name || "");

          // 对于类型和默认值，我们需要特殊处理TypeScript类型
          let type = escapeMarkdown(param.type || "any");
          let defaultValue = param.defaultValue ? escapeMarkdown(param.defaultValue) : "-";

          // 如果类型是复杂的TypeScript类型，可能需要在代码块中显示
          if (
            type.includes("&lt;") ||
            type.includes("&gt;") ||
            type.includes("keyof") ||
            type.includes("{") ||
            type.includes("}")
          ) {
            type = `<code>${type}</code>`;
          } else {
            type = `\`${type}\``;
          }

          // 如果默认值是复杂的表达式，可能需要在代码块中显示
          if (
            defaultValue !== "-" &&
            (defaultValue.includes("&lt;") || defaultValue.includes("&gt;") || defaultValue.includes("{"))
          ) {
            defaultValue = `<code>${defaultValue}</code>`;
          } else if (defaultValue !== "-") {
            defaultValue = `\`${defaultValue}\``;
          }

          const isOptional = param.isOptional ? "是" : "否";
          const description = escapeMarkdown(param.description || "-");

          functionDetailsSection += `| \`${name}\` | ${type} | ${isOptional} | ${defaultValue} | ${description} |\n`;
        }

        functionDetailsSection += `\n`;
      }

      // 返回值
      if (functionInfo.returnType) {
        const returnType = escapeMarkdown(functionInfo.returnType);

        // 如果返回类型是复杂的TypeScript类型，可能需要在代码块中显示
        if (
          returnType.includes("&lt;") ||
          returnType.includes("&gt;") ||
          returnType.includes("keyof") ||
          returnType.includes("{") ||
          returnType.includes("}")
        ) {
          functionDetailsSection += `## 返回值\n\n<code>${returnType}</code>\n\n`;
        } else {
          functionDetailsSection += `## 返回值\n\n\`${returnType}\`\n\n`;
        }
      }

      // 示例
      if (functionInfo.examples && functionInfo.examples.length > 0) {
        functionDetailsSection += `## 示例\n\n`;

        for (const example of functionInfo.examples) {
          functionDetailsSection += `\`\`\`typescript\n${example}\n\`\`\`\n\n`;
        }
      }
    } else {
      console.warn(`No function info extracted for ${name}`);
    }

    let hasExample = false;
    let exampleCode = "";
    if (fs.existsSync(codesandboxExampleDirPath)) {
      try {
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
      } catch (error) {
        console.error(`Error generating sandbox for ${name}:`, error);
        exampleCode = `<div class="error-message">Failed to generate CodeSandbox example: ${error.message}</div>`;
      }
    }

    code = `
[${ORGANIZATION_NAME}](/)/[${baseFileName}](\/${ORGANIZATION_NAME}\/${baseFileName}/index)/${item.name}

${summaryBlock}

# ${kindName} ${name}

${functionDetailsSection}

${hasExample ? "## 在线示例\n\n" + exampleCode : ""}

::: details 点击查看源码
${formatGroupCodeAsMarkdown(sourceCodeJs, sourceCodeTs)}

[如有错误，请提交issue](${sourceUrl ?? ""})
:::
`;

    return code;
  } catch (error) {
    console.error(`Error in dataConvertMD for ${item?.name}:`, error);
    return `# Error generating documentation for ${item?.name}\n\nAn error occurred while generating the documentation: ${error.message}`;
  }
}

/**
 * 转义Markdown中的特殊字符，防止格式问题
 *
 * @param {string} text - 要转义的文本
 * @returns {string} - 转义后的文本
 */
function escapeMarkdown(text) {
  if (!text) return "";

  // 对于TypeScript类型，我们需要特殊处理
  if (
    text.includes("<") &&
    text.includes(">") &&
    (text.includes("keyof") || text.includes("extends") || text.includes("Readonly"))
  ) {
    // 这可能是TypeScript类型，只转义表格分隔符和HTML标签
    return text
      .replace(/\|/g, "\\|") // 转义表格分隔符
      .replace(/</g, "&lt;") // 转义HTML标签开始
      .replace(/>/g, "&gt;") // 转义HTML标签结束
      .replace(/\n/g, " "); // 将换行符替换为空格，防止表格中的换行
  }

  // 对于普通文本，转义所有可能导致Markdown格式问题的字符
  return text
    .replace(/\|/g, "\\|") // 转义表格分隔符
    .replace(/</g, "&lt;") // 转义HTML标签开始
    .replace(/>/g, "&gt;") // 转义HTML标签结束
    .replace(/`/g, "\\`") // 转义反引号
    .replace(/\*/g, "\\*") // 转义星号
    .replace(/_/g, "\\_") // 转义下划线
    .replace(/\[/g, "\\[") // 转义方括号
    .replace(/\]/g, "\\]") // 转义方括号
    .replace(/\(/g, "\\(") // 转义圆括号
    .replace(/\)/g, "\\)") // 转义圆括号
    .replace(/\{/g, "\\{") // 转义花括号
    .replace(/\}/g, "\\}") // 转义花括号
    .replace(/\n/g, " "); // 将换行符替换为空格，防止表格中的换行
}

function createModuleFile(c) {
  const utilslibPath = path.join(ROOT_PATH, "docsPress/docs/@utilslib");

  for (const module of c) {
    try {
      const { name, children = [], packageVersion } = module;
      const baseFileName = name.replace(`${ORGANIZATION_NAME}/`, "");
      fs.mkdirpSync(resolve(utilslibPath, baseFileName));

      // 读取README_DOC.md文件，如果不存在则使用空字符串
      let readmeContent = "";
      const readmePath = resolve(ROOT_PATH, "packages", baseFileName, "README_DOC.md");
      if (fs.existsSync(readmePath)) {
        readmeContent = fs.readFileSync(readmePath, "utf-8");
      } else {
        console.warn(`README_DOC.md not found for package ${baseFileName}, using empty content`);
      }

      let code = `
[${ORGANIZATION_NAME}](/) / [${baseFileName}](\/${ORGANIZATION_NAME}\/${baseFileName}/index)

![NPM Version](https://img.shields.io/npm/v/${ORGANIZATION_NAME}/${baseFileName})

${readmeContent}
${children.map((item) => `**[${item.name}](${item.name}/index)**\n`).join("\n")}
`;

      // module方法列表集合
      fs.writeFile(resolve(utilslibPath, baseFileName, `index.md`), code);
    } catch (error) {
      console.error(`Error creating module file for ${module?.name}:`, error);
    }
  }
}

function setSourceCodeExportDefault(code, name) {
  return `${code}\n\nexport default ${name}`;
}

async function handleSingleSourceCode(c) {
  const utilslibPath = path.join(ROOT_PATH, "docsPress/docs/@utilslib");

  for (const module of c) {
    try {
      const { name, children = [], packageVersion } = module;
      const baseFileName = name.replace(`${ORGANIZATION_NAME}/`, "");

      // 检查js和ts代码片段文件是否存在
      const jsSnippetsPath = resolve(ROOT_PATH, "packages", baseFileName, "lib", "jsSnippets.json");
      const tsSnippetsPath = resolve(ROOT_PATH, "packages", baseFileName, "lib", "tsSnippets.json");

      if (!fs.existsSync(jsSnippetsPath) || !fs.existsSync(tsSnippetsPath)) {
        console.warn(`Snippets files not found for package ${baseFileName}, skipping...`);
        continue;
      }

      const jsSnippetsJson = JSON.parse(fs.readFileSync(jsSnippetsPath));
      const tsSnippetsJson = JSON.parse(fs.readFileSync(tsSnippetsPath));

      for (const item of children) {
        try {
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
              }),
            ),

            fs.writeFile(
              resolve(p, `sourceCode.ts`),
              await format(setSourceCodeExportDefault(sourceCodeTs, item?.name), {
                parser: "typescript",
              }),
            ),

            fs.writeFile(resolve(p, `index.md`), await dataConvertMD(item, module, tsSnippetsJson, jsSnippetsJson)),
          ]);
        } catch (error) {
          console.error(`Error processing item ${item?.name}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error in handleSingleSourceCode for module ${module?.name}:`, error);
    }
  }
}

async function handleTypedocJson() {
  try {
    const json = getTypedocJson();
    if (!json || !json.children) {
      throw new Error("Invalid TypeDoc JSON structure");
    }

    const { children } = json;

    await Promise.all([
      handleNav(children),
      handleSidebar(children),
      handleSingleSourceCode(children),
      createModuleFile(children),
    ]);

    console.log("TypeDoc JSON processing completed successfully");
  } catch (error) {
    console.error("Error in handleTypedocJson:", error);
    throw error; // 重新抛出错误，让上层函数处理
  }
}

main().catch(console.error);
