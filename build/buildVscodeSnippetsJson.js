import fs from "node:fs";
import path, { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { format } from "prettier";
import ts from "typescript";
import { Project, SyntaxKind, Node, SymbolFlags } from "ts-morph";
import { extractUsedCode } from "./extractUsedCode.js";

// #region ====================== 公共方法 ======================

/**
 * 将值或值数组转换为数组。
 *
 * @type {<T>(value: T | T[]) => T[]}
 * @param {T | T[]} value - 要转换的值或值数组。
 * @returns {T[]} 转换后的数组。
 * @example
 * const result = toArray("value"); // ['value']
 * const resultArray = toArray(["value1", "value2"]); // ['value1', 'value2']
 */
function toArray(value) {
  let list;
  if (Array.isArray(value)) {
    list = value;
  } else {
    list = [value];
  }
  return list;
}

/**
 * 检查一个值是否为非空数组。
 *
 * @param {unknown} value - 要检查的值。
 * @returns {value is any[]} 如果值为非空数组，则返回 true，否则返回 false。
 */
function isHasArray(value) {
  return Array.isArray(value) && value.length > 0;
}
// #endregion -- end

/**
 * 获取外部变量的源代码
 *
 * @param {string} filePath - 文件路径
 * @param {string} exportName - 导出的变量名
 * @returns {string} - 外部变量的源代码
 */
async function getExportSources(filePath, exportName) {
  console.log(`当前处理:`, exportName);
  let code = extractUsedCode(filePath, [exportName]);
  const project = new Project();
  const sourceFile = project.createSourceFile("__extractUsedCode.ts", code);
  let commentText = "";
  // 获取export声明变量
  sourceFile.forEachChild((node) => {
    switch (node.getKind()) {
      case SyntaxKind.VariableStatement:
        const declarations = node
          .getFirstChildByKind(SyntaxKind.VariableDeclarationList)
          .getDeclarations();
        const same = declarations.some((item) => {
          const name = item.getName();
          return name === exportName;
        });

        if (same) {
          commentText = node
            .getJsDocs()
            .find((Jsdoc) => Jsdoc.getCommentText?.())
            ?.getCommentText?.();
        } else {
          node.setIsExported(false);
        }

        break;
      case SyntaxKind.FunctionDeclaration:
        if (node.getName?.() === exportName) {
          commentText = node
            .getJsDocs()
            .find((Jsdoc) => Jsdoc.getCommentText?.())
            ?.getCommentText?.();
        } else if (node.hasExportKeyword?.()) {
          node.setIsExported(false);
        }
        break;

      default:
        break;
    }
  });

  let tsCode = sourceFile.getFullText();
  let jsCode = removeTypes(sourceFile.getFullText());
  return {
    ts: {
      code: await format(tsCode, {
        parser: "typescript",
      }),
      type: "ts",
      name: exportName,
      intro: commentText,
    },
    js: {
      code: await format(jsCode, {
        parser: "typescript",
      }),
      type: "js",
      name: exportName,
      intro: commentText,
    },
  };
}

/**
 * 删除ts类型
 * @param {String} tsCode
 * @returns {String} jsCode
 */
function removeTypes(tsCode) {
  const compilerOptions = {
    target: ts.ScriptTarget.ESNext, // 保留 ESNext 语法
    module: ts.ModuleKind.ESNext, // 使用 ES 模块
    removeComments: false, // 是否删除注释
  };

  // 使用 transpileModule 方法来编译 TypeScript 代码
  const result = ts.transpileModule(tsCode, { compilerOptions });

  // 返回转换后的 JavaScript 代码
  return result.outputText;
}

/**
 * 解析导入路径
 *
 * @param {string} importPath - 导入路径
 * @param {string} baseDir - 基础目录
 * @returns {string} - 解析后的文件路径
 */
function resolveImportPath(importPath, baseDir) {
  if (importPath.startsWith(".")) {
    return resolve(baseDir, importPath) + ".ts";
  }
  // 如果是monorepo中的包路径
  const [scope, packageName] = importPath.split("/");
  if (scope.startsWith("@")) {
    const packagePath = resolve(ROOT_PATH, "packages", packageName, "src", "index.ts");
    return packagePath;
  }
}

/**
 * 读取文件内容
 *
 * @param {string} filePath - 文件路径
 * @returns {string} - 文件内容
 */
function readFileContent(filePath) {
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, "utf-8");
  }
  throw new Error(`File not found: ${filePath}`);
}

function mergeMaps(map1, map2) {
  const mergedMap = new Map();
  // 遍历第一个Map对象
  for (const [key, value] of map1) {
    // 如果mergedMap中已经有该键,则将值合并为数组
    if (mergedMap.has(key)) {
      const existingValue = mergedMap.get(key);
      if (Array.isArray(existingValue)) {
        mergedMap.set(key, [...existingValue, value]);
      } else {
        mergedMap.set(key, [existingValue, value]);
      }
    } else {
      // 否则直接添加键值对
      mergedMap.set(key, value);
    }
  }

  // 遍历第二个Map对象
  for (const [key, value] of map2) {
    // 如果mergedMap中已经有该键,则将值合并为数组
    if (mergedMap.has(key)) {
      const existingValue = mergedMap.get(key);
      if (Array.isArray(existingValue)) {
        mergedMap.set(key, [...existingValue, value]);
      } else {
        mergedMap.set(key, [existingValue, value]);
      }
    } else {
      // 否则直接添加键值对
      mergedMap.set(key, value);
    }
  }

  return mergedMap;
}

const exportFileMap = new Map();

/**
 * 从指定文件中获取所有导出节点
 * @param {string} sourceFilePath - 源文件路径
 * @returns {void}
 */
function getAllExportNode(sourceFilePath) {
  if (exportFileMap.has(sourceFilePath)) {
    return exportFileMap.get(sourceFilePath);
  }

  const baseDir = path.dirname(sourceFilePath);
  const code = readFileContent(sourceFilePath);
  const project = new Project();
  const sourceFile = project.createSourceFile("__getAllExportNode.ts", code);

  const typeChecker = project.getTypeChecker();

  let allExportMap = new Map();
  function addExportMap(key, val) {
    if (allExportMap.has(key)) {
      allExportMap.set(key, [...allExportMap.get(key), val]);
    } else {
      allExportMap.set(key, toArray(val));
    }
  }

  // 获取export声明变量
  const exportNodes = typeChecker.getSymbolsInScope(sourceFile, SymbolFlags.ExportValue);
  exportNodes.forEach((node) => {
    addExportMap(sourceFilePath, node.getName());
  });

  // 获取所有ExportDeclaration类型的节点
  const exports = sourceFile.getDescendantsOfKind(SyntaxKind.ExportDeclaration);

  exports.forEach((exportNode) => {
    const namedExports = exportNode.getNamedExports();
    const namespaceExport = exportNode.getNamespaceExport();
    if (isHasArray(namedExports)) {
      addExportMap(
        sourceFilePath,
        namedExports.map((node) => node.getName())
      );
    } else if (namespaceExport) {
      addExportMap(sourceFilePath, namespaceExport.getName());
    } else {
      const exportRelatedPath = exportNode.getModuleSpecifier()?.getText().replace(/['"]/g, "");
      const resolvedPath = resolveImportPath(exportRelatedPath, baseDir);
      if (resolvedPath) {
        allExportMap = mergeMaps(allExportMap, getAllExportNode(resolvedPath));
      }
    }
  });

  exportFileMap.set(sourceFilePath, allExportMap);
  return allExportMap;
}

async function main() {
  const PACKAGES_PATH = resolve(ROOT_PATH, "packages");
  const packageNames = fs.readdirSync(PACKAGES_PATH);

  for (const packageName of packageNames) {
    const ENTER_PATH = resolve(PACKAGES_PATH, packageName, "src/index.ts");
    const JS_OUTPUT_PATH = resolve(PACKAGES_PATH, packageName, "lib/jsSnippets.json");
    const TS_OUTPUT_PATH = resolve(PACKAGES_PATH, packageName, "lib/tsSnippets.json");

    let codeList = [];
    for (const [filePath, exportsVar] of getAllExportNode(ENTER_PATH)) {
      for (const exportName of exportsVar) {
        codeList = codeList.concat(await getExportSources(filePath, exportName));
      }
    }

    const jsList = await codeList.map((item) => item.js);
    const tsList = await codeList.map((item) => item.ts);
    fs.writeFileSync(JS_OUTPUT_PATH, JSON.stringify(jsList, null, 2));
    fs.writeFileSync(TS_OUTPUT_PATH, JSON.stringify(tsList, null, 2));
  }
}

const dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT_PATH = resolve(dirname, "..");

main();
