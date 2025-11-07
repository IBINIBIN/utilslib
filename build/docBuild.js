import path, { resolve } from "node:path";
import fs from "fs-extra";
import { URL } from "node:url";
import { format } from "prettier";
import { v4 as uuid } from "uuid";
import { glob } from "glob";

import { createSandboxLink, generateSandboxIframe } from "./docBuildLogic.js";
import { extractFunctionInfo } from "./functionInfoExtractor.js";

const __dirname = new URL(".", import.meta.url).pathname;
const ROOT_PATH = path.join(__dirname, "..");
const DOC_PATH = path.join(ROOT_PATH, "docsPress", "docs");

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
 * 读取 package 信息
 */
function getPackageInfo(packageName) {
  try {
    const packageJsonPath = path.join(ROOT_PATH, "packages", packageName, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
      return {
        version: packageJson.version || "0.0.0",
        name: packageJson.name || `${ORGANIZATION_NAME}/${packageName}`,
      };
    }
  } catch (error) {
    console.error(`Error reading package.json for ${packageName}:`, error);
  }
  return {
    version: "0.0.0",
    name: `${ORGANIZATION_NAME}/${packageName}`,
  };
}

/**
 * 从 snippets 文件获取所有导出的函数列表
 */
function getExportedFunctions(packageName) {
  try {
    const tsSnippetsPath = path.join(ROOT_PATH, "packages", packageName, "lib", "tsSnippets.json");
    if (fs.existsSync(tsSnippetsPath)) {
      const snippets = JSON.parse(fs.readFileSync(tsSnippetsPath, "utf-8"));
      return snippets.map((snippet) => snippet.name);
    }
  } catch (error) {
    console.error(`Error reading snippets for ${packageName}:`, error);
  }
  return [];
}

/**
 * 获取所有 packages
 */
function getAllPackages() {
  const packagesDir = path.join(ROOT_PATH, "packages");
  const packages = [];

  const packageDirs = fs
    .readdirSync(packagesDir)
    .filter((dir) => {
      const dirPath = path.join(packagesDir, dir);
      return fs.statSync(dirPath).isDirectory();
    })
    .filter((dir) => {
      // 确保有 lib/tsSnippets.json 文件
      const tsSnippetsPath = path.join(packagesDir, dir, "lib", "tsSnippets.json");
      return fs.existsSync(tsSnippetsPath);
    });

  for (const packageName of packageDirs) {
    const packageInfo = getPackageInfo(packageName);
    const functions = getExportedFunctions(packageName);

    packages.push({
      name: packageInfo.name,
      packageName: packageName,
      version: packageInfo.version,
      functions: functions,
    });
  }

  return packages;
}

/**
 * 生成导航配置
 */
function generateNav(packages) {
  const nav = packages.map((pkg) => ({
    text: pkg.packageName,
    link: `/${pkg.name}/index`,
  }));

  const navJsonPath = path.join(DOC_PATH, ".vitepress", "nav.json");
  fs.ensureFileSync(navJsonPath);
  fs.writeFileSync(navJsonPath, JSON.stringify(nav, null, 2));
  console.log(`Navigation JSON written to ${navJsonPath}`);
}

function generateHomePage(packages) {
  const homePagePath = path.join(DOC_PATH, "index.md");
  fs.ensureFileSync(homePagePath);
  fs.writeFileSync(
    homePagePath,
    `---
layout: home

hero:
  name: "utilslib"
  text: "工具库"
  actions:
    - theme: alt
      text: GitHub
      link: https://github.com/IBINIBIN/utilslib
    - theme: brand
      text: VS Code 下载
      link: https://marketplace.visualstudio.com/items?itemName=Jiabin.fe-integration

features:
${packages
  .map(
    (pkg) => `  - title: ${pkg.packageName}  
    link: "${pkg.name}/index"`,
  )
  .join("\n")}
---

![NPM License](https://img.shields.io/npm/l/%40utilslib%2Fcore)
`,
  );
}

/**
 * 生成侧边栏配置
 */
function generateSidebar(packages) {
  const sidebarList = [];

  for (const pkg of packages) {
    sidebarList.push({
      text: `${pkg.packageName} - v${pkg.version}`,
      collapsed: true,
      link: `/${pkg.name}/index`,
      items: pkg.functions.map((funcName) => ({
        text: funcName,
        link: `/${pkg.name}/${funcName}/index`,
      })),
    });
  }

  const sidebarPath = path.join(DOC_PATH, ".vitepress", "sidebar.json");
  fs.ensureFileSync(sidebarPath);
  fs.writeFileSync(sidebarPath, JSON.stringify(sidebarList, null, 2));
  console.log(`Sidebar JSON written to ${sidebarPath}`);
}

/**
 * 将代码格式化为Markdown代码块
 */
function formatCodeAsMarkdown(code = "", type = "js") {
  if (!code) return "";
  const safeCode = code.replace(/```/g, "\\`\\`\\`");
  return `\`\`\`${type}\n${safeCode.trimStart()}\n\`\`\``;
}

/**
 * 将JS和TS代码组合为Markdown代码组
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

/**
 * 转义Markdown中的特殊字符
 */
function escapeMarkdown(text) {
  if (!text) return "";

  if (
    text.includes("<") &&
    text.includes(">") &&
    (text.includes("keyof") || text.includes("extends") || text.includes("Readonly"))
  ) {
    return text.replace(/\|/g, "\\|").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, " ");
  }

  return text
    .replace(/\|/g, "\\|")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/`/g, "\\`")
    .replace(/\*/g, "\\*")
    .replace(/_/g, "\\_")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\n/g, " ");
}

/**
 * 生成函数文档内容
 */
async function generateFunctionDoc(functionName, packageInfo, tsSnippetsJson, jsSnippetsJson) {
  try {
    const { packageName, name: fullPackageName } = packageInfo;
    const codesandboxExampleDirPath = resolve(ROOT_PATH, "packages", packageName, "demo-codesandbox", functionName);

    // 获取源代码
    const tsSnippet = tsSnippetsJson.find((item) => item.name === functionName);
    const jsSnippet = jsSnippetsJson.find((item) => item.name === functionName);

    const sourceCodeTs = tsSnippet?.code
      ? await format(tsSnippet.code, { parser: "typescript" }).catch(() => tsSnippet.code)
      : "";

    const sourceCodeJs = jsSnippet?.code
      ? await format(jsSnippet.code, { parser: "typescript" }).catch(() => jsSnippet.code)
      : "";

    // 提取函数信息
    let functionInfo = null;
    try {
      if (sourceCodeTs) {
        functionInfo = extractFunctionInfo(sourceCodeTs, functionName);
        console.log(`Successfully extracted function info for ${functionName}`);
      }
    } catch (error) {
      console.error(`Error extracting function info for ${functionName}:`, error);
    }

    // 构建文档内容
    let docContent = `[${ORGANIZATION_NAME}](/)/[${packageName}](/${fullPackageName}/index)/${functionName}\n\n`;

    // 添加摘要
    if (functionInfo?.description) {
      docContent += `---\n### ${functionInfo.description}\n---\n\n`;
    }

    docContent += `# ${functionName}\n\n`;

    // 函数详细信息
    if (functionInfo) {
      // 函数签名
      if (functionInfo.signature) {
        docContent += `## 函数签名\n\n\`\`\`typescript\n${functionInfo.signature}\n\`\`\`\n\n`;
      }

      // 函数描述
      if (functionInfo.description) {
        docContent += `## 描述\n\n${functionInfo.description}\n\n`;
      }

      // 类型参数
      if (functionInfo.typeParameters && functionInfo.typeParameters.length > 0) {
        docContent += `## 类型参数\n\n`;
        docContent += `| 参数名 | 约束 | 默认值 | 描述 |\n`;
        docContent += `| ------ | ---- | ------ | ---- |\n`;

        for (const tp of functionInfo.typeParameters) {
          const name = escapeMarkdown(tp.name || "");
          let constraint = tp.constraint ? escapeMarkdown(tp.constraint) : "-";
          let defaultValue = tp.default ? escapeMarkdown(tp.default) : "-";

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
          docContent += `| \`${name}\` | ${constraint} | ${defaultValue} | ${description} |\n`;
        }

        docContent += `\n`;
      }

      // 参数
      if (functionInfo.parameters && functionInfo.parameters.length > 0) {
        docContent += `## 参数\n\n`;
        docContent += `| 参数名 | 类型 | 可选 | 默认值 | 描述 |\n`;
        docContent += `| ------ | ---- | ------ | ------ | ---- |\n`;

        for (const param of functionInfo.parameters) {
          const name = escapeMarkdown(param.name || "");
          let type = escapeMarkdown(param.type || "any");
          let defaultValue = param.defaultValue ? escapeMarkdown(param.defaultValue) : "-";

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

          docContent += `| \`${name}\` | ${type} | ${isOptional} | ${defaultValue} | ${description} |\n`;
        }

        docContent += `\n`;
      }

      // 返回值
      if (functionInfo.returnType) {
        const returnType = escapeMarkdown(functionInfo.returnType);

        if (
          returnType.includes("&lt;") ||
          returnType.includes("&gt;") ||
          returnType.includes("keyof") ||
          returnType.includes("{") ||
          returnType.includes("}")
        ) {
          docContent += `## 返回值\n\n<code>${returnType}</code>\n\n`;
        } else {
          docContent += `## 返回值\n\n\`${returnType}\`\n\n`;
        }
      }

      // 示例
      if (functionInfo.examples && functionInfo.examples.length > 0) {
        docContent += `## 示例\n\n`;
        for (const example of functionInfo.examples) {
          docContent += `\`\`\`typescript\n${example}\n\`\`\`\n\n`;
        }
      }
    }

    // CodeSandbox 示例
    if (fs.existsSync(codesandboxExampleDirPath)) {
      try {
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
        const exampleCode = generateSandboxIframe(url.toString());

        docContent += `## 在线示例\n\n${exampleCode}\n\n`;
      } catch (error) {
        console.error(`Error generating sandbox for ${functionName}:`, error);
      }
    }

    // 源代码
    // 查找源文件 URL
    let sourceUrl = "";
    try {
      const srcFiles = glob.sync(`packages/${packageName}/src/**/*.ts`, { cwd: ROOT_PATH });
      for (const file of srcFiles) {
        const content = fs.readFileSync(path.join(ROOT_PATH, file), "utf-8");
        if (content.includes(`export function ${functionName}`) || content.includes(`export const ${functionName}`)) {
          sourceUrl = `https://github.com/IBINIBIN/utilslib/blob/main/${file}`;
          break;
        }
      }
    } catch (error) {
      console.error(`Error finding source file for ${functionName}:`, error);
    }

    docContent += `::: details 点击查看源码\n${formatGroupCodeAsMarkdown(sourceCodeJs, sourceCodeTs)}\n\n[如有错误，请提交issue](${sourceUrl})\n:::\n`;

    return docContent;
  } catch (error) {
    console.error(`Error generating doc for ${functionName}:`, error);
    return `# Error\n\nFailed to generate documentation for ${functionName}: ${error.message}`;
  }
}

/**
 * 生成 package 索引页面
 */
function generatePackageIndex(packageInfo) {
  const { packageName, name: fullPackageName, functions } = packageInfo;

  // 读取 README_DOC.md
  let readmeContent = "";
  const readmePath = path.join(ROOT_PATH, "packages", packageName, "README_DOC.md");
  if (fs.existsSync(readmePath)) {
    readmeContent = fs.readFileSync(readmePath, "utf-8");
  }

  let content = `[${ORGANIZATION_NAME}](/) / [${packageName}](/${fullPackageName}/index)\n\n`;
  content += `![NPM Version](https://img.shields.io/npm/v/${fullPackageName})\n\n`;
  content += `${readmeContent}\n\n`;
  content += functions.map((funcName) => `**[${funcName}](${funcName}/index)**\n`).join("\n");

  return content;
}

/**
 * 为源代码添加默认导出
 */
function setSourceCodeExportDefault(code, name) {
  return `${code}\n\nexport default ${name}`;
}

/**
 * 生成所有文档
 */
async function generateDocs() {
  console.log("Starting documentation generation...");

  const packages = getAllPackages();
  console.log(`Found ${packages.length} packages`);

  // 生成导航和侧边栏
  generateHomePage(packages);
  generateNav(packages);
  generateSidebar(packages);

  const utilslibPath = path.join(ROOT_PATH, "docsPress/docs/@utilslib");

  // 为每个 package 生成文档
  for (const packageInfo of packages) {
    const { packageName, name: fullPackageName, functions } = packageInfo;
    console.log(`Processing package: ${packageName}`);

    const packageDir = path.join(utilslibPath, packageName);
    fs.mkdirpSync(packageDir);

    // 生成 package 索引页
    const indexContent = generatePackageIndex(packageInfo);
    fs.writeFileSync(path.join(packageDir, "index.md"), indexContent);

    // 读取代码片段
    const jsSnippetsPath = path.join(ROOT_PATH, "packages", packageName, "lib", "jsSnippets.json");
    const tsSnippetsPath = path.join(ROOT_PATH, "packages", packageName, "lib", "tsSnippets.json");

    if (!fs.existsSync(jsSnippetsPath) || !fs.existsSync(tsSnippetsPath)) {
      console.warn(`Snippets not found for ${packageName}, skipping...`);
      continue;
    }

    const jsSnippetsJson = JSON.parse(fs.readFileSync(jsSnippetsPath, "utf-8"));
    const tsSnippetsJson = JSON.parse(fs.readFileSync(tsSnippetsPath, "utf-8"));

    // 为每个函数生成文档
    for (const funcName of functions) {
      console.log(`  - Generating docs for ${funcName}`);

      const funcDir = path.join(packageDir, funcName);
      fs.mkdirpSync(funcDir);

      // 生成文档内容
      const docContent = await generateFunctionDoc(funcName, packageInfo, tsSnippetsJson, jsSnippetsJson);
      fs.writeFileSync(path.join(funcDir, "index.md"), docContent);

      // 生成源代码文件
      const sourceCodeJs = jsSnippetsJson.find(({ name }) => funcName === name)?.code ?? "";
      const sourceCodeTs = tsSnippetsJson.find(({ name }) => funcName === name)?.code ?? "";

      if (sourceCodeJs) {
        const formattedJs = await format(setSourceCodeExportDefault(sourceCodeJs, funcName), {
          parser: "typescript",
        }).catch(() => setSourceCodeExportDefault(sourceCodeJs, funcName));
        fs.writeFileSync(path.join(funcDir, "sourceCode.js"), formattedJs);
      }

      if (sourceCodeTs) {
        const formattedTs = await format(setSourceCodeExportDefault(sourceCodeTs, funcName), {
          parser: "typescript",
        }).catch(() => setSourceCodeExportDefault(sourceCodeTs, funcName));
        fs.writeFileSync(path.join(funcDir, "sourceCode.ts"), formattedTs);
      }
    }
  }

  console.log("Documentation generation completed!");
}

// 主函数
async function main() {
  try {
    await generateDocs();
  } catch (error) {
    console.error("Error in main:", error);
    process.exit(1);
  }
}

main().catch(console.error);
