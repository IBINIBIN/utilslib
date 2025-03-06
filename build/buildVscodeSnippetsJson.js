import fs from "node:fs";
import path, { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { globSync } from "glob";
import { format } from "prettier";
import ts from "typescript";
import { Project, SyntaxKind, SymbolFlags } from "ts-morph";
import { extractUsedCode } from "./extractUsedCode.js";

// 获取项目根路径
const dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT_PATH = resolve(dirname, "..");

// 缓存已处理的导出文件
const exportFileMap = new Map();

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
  return Array.isArray(value) ? value : [value];
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
 * @returns {Promise<{ts: Object, js: Object}>} - 外部变量的源代码对象
 */
async function getExportSources(filePath, exportName) {
  try {
    console.log(`当前处理:`, exportName);
    let code = extractUsedCode(filePath, [exportName]);
    const project = new Project();
    const sourceFile = project.createSourceFile("__extractUsedCode.ts", code);
    let commentText = "";

    // 获取export声明变量
    sourceFile.forEachChild((node) => {
      switch (node.getKind()) {
        case SyntaxKind.VariableStatement:
          const declarations = node.getFirstChildByKind(SyntaxKind.VariableDeclarationList)?.getDeclarations();
          if (!declarations) break;

          const same = declarations.some((item) => item.getName() === exportName);

          if (same) {
            commentText =
              node
                .getJsDocs()
                .find((Jsdoc) => Jsdoc.getCommentText?.())
                ?.getCommentText?.() || "";
          } else {
            node.setIsExported(false);
          }
          break;

        case SyntaxKind.FunctionDeclaration:
          if (node.getName?.() === exportName) {
            commentText =
              node
                .getJsDocs()
                .find((Jsdoc) => Jsdoc.getCommentText?.())
                ?.getCommentText?.() || "";
          } else if (node.hasExportKeyword?.()) {
            node.setIsExported(false);
          }
          break;
      }
    });

    let tsCode = sourceFile.getFullText();
    let jsCode = removeTypes(sourceFile.getFullText());

    return {
      ts: {
        code: await format(tsCode, { parser: "typescript" }),
        // code: "",
        type: "ts",
        name: exportName,
        intro: commentText,
      },
      js: {
        code: await format(jsCode, { parser: "typescript" }),
        type: "js",
        name: exportName,
        intro: commentText,
      },
    };
  } catch (error) {
    console.error(`Error in getExportSources for ${exportName}:`, error);
    // 返回空代码对象，避免整个流程中断
    return {
      ts: { code: "", type: "ts", name: exportName, intro: "" },
      js: { code: "", type: "js", name: exportName, intro: "" },
    };
  }
}

/**
 * 删除ts类型
 * @param {String} tsCode - TypeScript代码
 * @returns {String} - 转换后的JavaScript代码
 */
function removeTypes(tsCode) {
  try {
    const compilerOptions = {
      target: ts.ScriptTarget.ESNext, // 保留 ESNext 语法
      module: ts.ModuleKind.ESNext, // 使用 ES 模块
      removeComments: false, // 是否删除注释
    };

    // 使用 transpileModule 方法来编译 TypeScript 代码
    const result = ts.transpileModule(tsCode, { compilerOptions });

    // 返回转换后的 JavaScript 代码
    return result.outputText;
  } catch (error) {
    console.error("Error removing types:", error);
    return tsCode; // 出错时返回原始代码
  }
}

/**
 * 解析导入路径
 *
 * @param {string} importPath - 导入路径
 * @param {string} baseDir - 基础目录
 * @returns {string|null} - 解析后的文件路径，如果无法解析则返回null
 */
function resolveImportPath(importPath, baseDir) {
  try {
    if (!importPath) return null;

    if (importPath.startsWith(".")) {
      const resolvedPath = resolve(baseDir, importPath) + ".ts";
      return fs.existsSync(resolvedPath) ? resolvedPath : null;
    }

    // 如果是monorepo中的包路径
    const [scope, packageName] = importPath.split("/");
    if (scope && scope.startsWith("@")) {
      const packagePath = resolve(ROOT_PATH, "packages", packageName, "src", "index.ts");
      return fs.existsSync(packagePath) ? packagePath : null;
    }

    return null;
  } catch (error) {
    console.error(`Error resolving import path ${importPath}:`, error);
    return null;
  }
}

/**
 * 读取文件内容
 *
 * @param {string} filePath - 文件路径
 * @returns {string} - 文件内容
 * @throws {Error} - 如果文件不存在或无法读取
 */
function readFileContent(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, "utf-8");
    }
    throw new Error(`File not found: ${filePath}`);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    throw error;
  }
}

/**
 * 合并两个Map对象
 *
 * @param {Map} map1 - 第一个Map
 * @param {Map} map2 - 第二个Map
 * @returns {Map} - 合并后的Map
 */
function mergeMaps(map1, map2) {
  const mergedMap = new Map(map1);

  // 遍历第二个Map对象
  for (const [key, value] of map2) {
    if (mergedMap.has(key)) {
      const existingValue = mergedMap.get(key);
      mergedMap.set(
        key,
        Array.isArray(existingValue)
          ? [...existingValue, ...(Array.isArray(value) ? value : [value])]
          : [existingValue, ...(Array.isArray(value) ? value : [value])],
      );
    } else {
      mergedMap.set(key, value);
    }
  }

  return mergedMap;
}

/**
 * 从指定文件中获取所有导出节点
 * @param {string} sourceFilePath - 源文件路径
 * @returns {Map} - 导出节点映射
 */
function getAllExportNode(sourceFilePath) {
  try {
    // 检查缓存
    if (exportFileMap.has(sourceFilePath)) return exportFileMap.get(sourceFilePath);

    const baseDir = path.dirname(sourceFilePath);
    const code = readFileContent(sourceFilePath);
    const project = new Project();
    const sourceFile = project.createSourceFile("__getAllExportNode.ts", code);
    const typeChecker = project.getTypeChecker();

    let allExportMap = new Map();
    function addExportMap(key, val) {
      if (allExportMap.has(key)) {
        const existing = allExportMap.get(key);
        allExportMap.set(key, [...existing, ...(Array.isArray(val) ? val : [val])]);
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
          namedExports.map((node) => node.getName()),
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
  } catch (error) {
    console.error(`Error in getAllExportNode for ${sourceFilePath}:`, error);
    return new Map();
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    const PACKAGES_PATH = resolve(ROOT_PATH, "packages");

    const packageNameList = globSync("packages/*").map((p) => path.basename(p));

    for (const packageName of packageNameList) {
      try {
        console.log(`\nProcessing package: ${packageName}`);
        const ENTER_PATH = resolve(PACKAGES_PATH, packageName, "src/index.ts");

        if (!fs.existsSync(ENTER_PATH)) {
          console.warn(`Entry file not found for package ${packageName}, skipping...`);
          continue;
        }

        const JS_OUTPUT_PATH = resolve(PACKAGES_PATH, packageName, "lib/jsSnippets.json");
        const TS_OUTPUT_PATH = resolve(PACKAGES_PATH, packageName, "lib/tsSnippets.json");

        // 确保输出目录存在
        const outputDir = path.dirname(JS_OUTPUT_PATH);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        let codeList = [];
        const exportMap = getAllExportNode(ENTER_PATH);

        for (const [filePath, exportsVar] of exportMap) {
          for (const exportName of exportsVar) {
            try {
              const result = await getExportSources(filePath, exportName);
              codeList.push(result);
            } catch (error) {
              console.error(`Error processing export ${exportName} from ${filePath}:`, error);
            }
          }
        }

        const jsList = codeList.map((item) => item.js).filter(Boolean);
        const tsList = codeList.map((item) => item.ts).filter(Boolean);

        fs.writeFileSync(JS_OUTPUT_PATH, JSON.stringify(jsList, null, 2));
        fs.writeFileSync(TS_OUTPUT_PATH, JSON.stringify(tsList, null, 2));

        console.log(`Successfully processed package ${packageName}: ${jsList.length} snippets generated`);
      } catch (error) {
        console.error(`Error processing package ${packageName}:`, error);
      }
    }

    console.log("\nAll packages processed successfully!");
  } catch (error) {
    console.error("Error in main function:", error);
    process.exit(1);
  }
}

main();
