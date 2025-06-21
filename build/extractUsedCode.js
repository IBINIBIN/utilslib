import fs from "node:fs";
import path, { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { Project, SyntaxKind, SymbolFlags } from "ts-morph";

// 获取项目根路径
const dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT_PATH = resolve(dirname, "..");

// 缓存已处理的导出文件
const exportFileMap = new Map();
// 缓存上一次处理的外部变量，避免无限递归
let lastExternals = [];

// #region ====================== 公共方法 ======================

/**
 * 检查指定目标是否在选项中（选项可以是单个对象或对象数组）。
 *
 * @param {T} target - 目标项。
 * @param {(T | T[])[]} options - 选项，可以是单个对象或对象数组。
 * @returns {boolean} 若目标项在选项中，则返回 true；否则返回 false。
 */
function isTargetInOptions(target, ...options) {
  return options.some((option) => {
    if (Array.isArray(option)) {
      return option.includes(target);
    }
    return option === target;
  });
}

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

/**
 * 生成指定长度的随机字符串。
 *
 * @param {number} length - 随机字符串的长度。默认值为 8。
 * @returns {string} 生成的随机字符串。
 * @example
 * ```ts
 * createRandomString(8) // => "aBcDeFgH"
 */
function createRandomString(length = 8) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }
  return randomString;
}

/**
 * 获取两个数组的交集，通过指定字段属性进行判断。
 *
 * @type  {<T, K extends keyof T>(arr1: T[], arr2: T[], key?: K) => T[]}
 * @param {T[]} arr1 - 第一个数组。「主数组,当返回的内容从主数组中获取」
 * @param {T[]} arr2 - 第二个数组。
 * @param {K extends keyof T} [key] - 可选的字段属性，用于判断交集。
 * @returns {T[]} 交集的数组。
 */
function getArrayIntersection(arr1, arr2, key) {
  if (!arr1 || !arr2) return [];

  if (key) {
    const set = new Set(arr2.map((item) => item[key]));
    return arr1.filter((item) => set.has(item[key]));
  }
  return arr1.filter((item) => arr2.includes(item));
}

// #endregion -- end

/**
 * 获取导入声明中的命名导入列表
 *
 * @param {import('ts-morph').ImportDeclaration} importDecl - 导入声明
 * @returns {string[]} - 命名导入列表
 */
function getImportClauseNameList(importDecl) {
  try {
    return (
      importDecl
        .getImportClause()
        ?.getNamedBindings()
        ?.getElements()
        ?.map((item) => item.getText()) ?? []
    );
  } catch (error) {
    console.error("Error in getImportClauseNameList:", error);
    return [];
  }
}

/**
 * 获取代码中的外部变量
 *
 * @param {string} code - 代码字符串
 * @returns {string[]} - 外部变量列表
 */
function getExternalVariables(code) {
  try {
    const project = new Project();
    const sourceFile = project.createSourceFile("temp.ts", code);

    const globalVarSymbols = project.getTypeChecker().getSymbolsInScope(sourceFile, SymbolFlags.Value);

    // 将全局变量名称提取出来
    const globalVarNames = new Set(globalVarSymbols.map((symbol) => symbol.getName()));

    // 获取类型检查器
    const typeChecker = project.getTypeChecker();

    // 获取全局符号中所有的类型
    const globalTypeSymbols = typeChecker.getSymbolsInScope(sourceFile, SymbolFlags.Type);

    // 提取类型名称
    const globalTypeNames = globalTypeSymbols.map((symbol) => symbol.getName());

    const externalVariables = new Set();
    const jsDefaultVariables = new Set([
      "arguments",
      "this",
      "Object",
      "undefined",
      "Array",
      "String",
      "Number",
      "Boolean",
      "Function",
      "Error",
    ]);
    const TsTypeDefaultVariables = new Set([
      "Record",
      "Partial",
      "Required",
      "Pick",
      "Omit",
      "Readonly",
      "ReturnType",
      "Parameters",
    ]);

    // 获取所有在代码中声明的标识符
    const declaredIdentifiers = new Set();
    sourceFile.forEachDescendant((node) => {
      try {
        const nameNode = node.getNameNode?.();
        const text = nameNode?.getText();

        if (!text) return;

        switch (node.getKind()) {
          case SyntaxKind.MethodSignature:
          case SyntaxKind.PropertyAssignment:
          case SyntaxKind.VariableDeclaration:
          case SyntaxKind.FunctionDeclaration:
          case SyntaxKind.BindingElement:
          case SyntaxKind.PropertySignature:
          case SyntaxKind.Parameter:
          case SyntaxKind.TypeParameter:
          case SyntaxKind.InterfaceDeclaration:
          case SyntaxKind.PropertyDeclaration:
            declaredIdentifiers.add(text);
            break;
        }
      } catch (error) {
        // 忽略单个节点处理错误，继续处理其他节点
      }
    });

    /**
     * 递归获取节点中的外部变量
     *
     * @param {import('ts-morph').Node} node - 节点
     * @returns {string[]} - 外部变量列表
     */
    function getExternal(node) {
      const results = [];

      node.forEachChild((item) => {
        const externalVar = getExternalVariablesByNode(item);
        if (externalVar) {
          results.push(externalVar);
        }

        results.push(...getExternal(item));
      });

      return [...new Set(results.filter(Boolean))];
    }

    /**
     * 验证节点是否为外部变量
     *
     * @param {import('ts-morph').Node} node - 节点
     * @param {string} text - 节点文本
     * @returns {boolean} - 是否为外部变量
     */
    function validate(node, text) {
      if (globalTypeNames.includes(text) || globalVarNames.has(text)) return false;

      if (isTargetInOptions(node.getKind(), [SyntaxKind.TypeReference])) {
        return false;
      }

      // 排除 TS 类型默认变量
      if (TsTypeDefaultVariables.has(text)) {
        return false;
      }
      // 排除 JS 默认变量
      if (jsDefaultVariables.has(text)) {
        return false;
      }

      // 排除已声明的标识符
      if (declaredIdentifiers.has(text)) {
        return false;
      }

      const parent = node.getParent();

      // 排除链式调用中的标识符
      if (isTargetInOptions(parent?.getKind(), [SyntaxKind.PropertyAccessExpression, SyntaxKind.MethodDeclaration])) {
        return false;
      }

      return true;
    }

    /**
     * 获取节点中的外部变量
     *
     * @param {import('ts-morph').Node} node - 节点
     * @returns {string|undefined} - 外部变量
     */
    function getExternalVariablesByNode(node) {
      try {
        if (
          isTargetInOptions(node.getKind(), [
            SyntaxKind.VariableDeclaration,
            SyntaxKind.Parameter,
            SyntaxKind.PropertyAssignment,
          ])
        ) {
          const initializer = node.getInitializer?.();
          if (!initializer) return;

          const initKind = initializer.getKind();
          const initText = initializer.getText?.();

          if (isTargetInOptions(initKind, SyntaxKind.Identifier)) {
            if (initText && validate(node, initText)) {
              return initText;
            }
          }
        } else if (isTargetInOptions(node.getKind(), [SyntaxKind.Identifier])) {
          let text = node?.getText();

          if (text && validate(node, text)) {
            return text;
          }
        }
      } catch (error) {
        // 忽略单个节点处理错误
        return undefined;
      }
    }

    return getExternal(sourceFile);
  } catch (error) {
    console.error("Error in getExternalVariables:", error);
    return [];
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
        const existing = allExportMap.get(key);
        allExportMap.set(key, [...existing, ...(Array.isArray(val) ? val : [val])]);
      } else {
        allExportMap.set(key, toArray(val));
      }
    }

    // 获取所有带有export关键字的节点
    sourceFile.getDescendantsOfKind(SyntaxKind.ExportKeyword).forEach((exportKeywordNode) => {
      const parent = exportKeywordNode.getParent();
      let name = parent.getName?.() ?? null;
      if (name) addExportMap(sourceFilePath, name);
    });

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
 * 提取代码中使用的代码
 *
 * @param {string} filePath - 文件路径
 * @param {string[]} externalVariables - 外部变量数组
 * @returns {string} - 提取的代码
 */
export function extractUsedCode(filePath, externalVariables) {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return "";
    }

    if (!Array.isArray(externalVariables) || externalVariables.length === 0) {
      return "";
    }

    const baseDir = path.dirname(filePath);
    const code = readFileContent(filePath);
    const project = new Project();
    const sourceFile = project.createSourceFile("__extractUsedCode.ts", code);

    let noHandleVariableList = [];
    const externalSources = [];

    // 遍历外部变量数组
    for (const variable of externalVariables) {
      if (!variable || isTargetInOptions(variable, noHandleVariableList)) continue;

      const identifierNodes = sourceFile.getDescendantsOfKind(SyntaxKind.Identifier).filter((node) => {
        return (
          node.getText() === variable &&
          !node.getFirstAncestorByKind(SyntaxKind.PropertyAccessExpression) &&
          !node.getParentIfKind(SyntaxKind.MethodDeclaration)
        );
      });

      const identifierNodeMap = identifierNodes.reduce((prev, cur) => {
        return {
          ...prev,
          [cur.getText()]: cur,
        };
      }, {});

      for (const [key, identifierNode] of Object.entries(identifierNodeMap)) {
        const definitionNodes = identifierNode.getDefinitionNodes();
        if (!definitionNodes || definitionNodes.length === 0) continue;

        const declaration = definitionNodes[0];

        if (declaration) {
          let text = "";
          const importDeclaration = declaration.getFirstAncestorByKind(SyntaxKind.ImportDeclaration);
          const varDeclaration = declaration.getFirstAncestorByKind(SyntaxKind.VariableStatement);

          if (varDeclaration) {
            text = varDeclaration.getFullText();
          } else if (importDeclaration) {
            const exportRelatedPath = importDeclaration.getModuleSpecifier()?.getText().replace(/['"]/g, "");
            const resolvedPath = resolveImportPath(exportRelatedPath, baseDir);

            // 处理外部模块
            if (!resolvedPath) {
              const importClauses = getImportClauseNameList(importDeclaration);
              noHandleVariableList = [
                ...noHandleVariableList,
                ...getArrayIntersection(externalVariables, importClauses),
              ];
              text = importDeclaration.getFullText();
            } else {
              const exportsMap = getAllExportNode(resolvedPath);

              let targetPath = "";
              for (const [key, val] of exportsMap) {
                const target = val.find((item) => item === declaration.getText());
                if (target) {
                  targetPath = key;
                  break;
                }
              }

              if (targetPath) {
                text = extractUsedCode(targetPath, [declaration.getText()]);
              }
            }
          } else {
            text = declaration.getFullText();
          }

          text = text.replace(/^[\n|\r]*|[\n|\r]*$/g, "");
          if (text) {
            externalSources.push(text);
          }
        }
      }
    }

    let text = externalSources.join(`\n`);
    const externals = getExternalVariables(text);

    // 避免无限递归，检查新的外部变量是否已经处理过
    if (externals.length && getArrayIntersection(lastExternals, externals).length !== externals.length) {
      const newExternals = [...externals];
      lastExternals = newExternals;
      const newExternalSources = extractUsedCode(filePath, newExternals);
      lastExternals = [];
      if (newExternalSources) {
        externalSources.unshift(newExternalSources);
      }
    }

    return externalSources.join("\n\n");
  } catch (error) {
    console.error(`Error in extractUsedCode for ${filePath}:`, error);
    return "";
  }
}

export default extractUsedCode;
