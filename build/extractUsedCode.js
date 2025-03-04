import fs from "node:fs";
import path, { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { Project, SyntaxKind, SymbolFlags } from "ts-morph";

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
      return option.some((item) => item === target);
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
 * @type  {<T, K extends keyof T>(arr1: T[], arr2: T[], key: K) => T[]}
 * @param {T[]} arr1 - 第一个数组。「主数组,当返回的内容从主数组中获取」
 * @param {T[]} arr2 - 第二个数组。
 * @param {K extends keyof T} [key] - 可选的字段属性，用于判断交集。
 * @returns {T[]} 交集的数组。
 */
function getArrayIntersection(arr1, arr2, key) {
  if (key) {
    const set = new Set(arr2.map((item) => item[key]));
    return arr1.filter((item) => set.has(item[key]));
  }
  return arr1.filter((item) => arr2.includes(item));
}

// #endregion -- end

function getImportClauseNameList(importDecl) {
  return (
    importDecl
      .getImportClause()
      ?.getNamedBindings()
      ?.getElements()
      ?.map((item) => item.getText()) ?? []
  );
}
function getExternalVariables(code) {
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
  const jsDefaultVariables = new Set(["arguments", "this", "Object", "undefined"]);
  const TsTypeDefaultVariables = new Set(["Record"]);

  // 获取所有在代码中声明的标识符
  const declaredIdentifiers = new Set();
  sourceFile.forEachDescendant((node) => {
    const nameNode = node.getNameNode?.();
    const text = nameNode?.getText();
    const kindName = node.getKindName();

    switch (node.getKind()) {
      case SyntaxKind.MethodSignature:
        declaredIdentifiers.add(node.getName());
        break;

      case SyntaxKind.PropertyAssignment:
        declaredIdentifiers.add(text);
        break;

      case SyntaxKind.VariableDeclaration:
        declaredIdentifiers.add(text);
        break;

      case SyntaxKind.FunctionDeclaration:
      case SyntaxKind.BindingElement:
      case SyntaxKind.VariableDeclaration:
      case SyntaxKind.PropertySignature:
      case SyntaxKind.PropertyAssignment:
        declaredIdentifiers.add(text);
        break;

      case SyntaxKind.Parameter:
        declaredIdentifiers.add(text);
        break;
      case SyntaxKind.TypeParameter:
        declaredIdentifiers.add(text);
        break;

      case SyntaxKind.InterfaceDeclaration:
        declaredIdentifiers.add(text);
        break;
      default:
        break;
    }
  });

  function getExternal(node) {
    let l = [];

    node.forEachChild((item) => {
      l.push(getExternalVariablesByNode(item));
      l.push(...getExternal(item));
    });

    return [...new Set(l.filter(Boolean))];
  }

  function validate(node, text) {
    if (globalTypeNames.includes(text) || globalVarNames.has(text)) return;

    if (isTargetInOptions(node.getKind(), [SyntaxKind.TypeReference])) {
      return;
    }

    // 排除 TS 类型默认变量
    if (TsTypeDefaultVariables.has(text)) {
      return;
    }
    // 排除 JS 默认变量
    if (jsDefaultVariables.has(text)) {
      return;
    }

    // 排除已声明的标识符
    if (declaredIdentifiers.has(text)) {
      return;
    }

    const parent = node.getParent();

    // 排除链式调用中的标识符
    if (isTargetInOptions(parent.getKind(), [SyntaxKind.PropertyAccessExpression, SyntaxKind.MethodDeclaration])) {
      return;
    }

    return true;
  }

  function getExternalVariablesByNode(node) {
    if (
      isTargetInOptions(node.getKind(), [
        SyntaxKind.VariableDeclaration,
        SyntaxKind.Parameter,
        SyntaxKind.PropertyAssignment,
      ])
    ) {
      const initKind = node.getInitializer?.()?.getKind();
      const initText = node.getInitializer?.()?.getText?.();
      if (isTargetInOptions(initKind, SyntaxKind.Identifier)) {
        if (initText && validate(node, initText)) {
          return initText;
        }
      }
    } else if (isTargetInOptions(node.getKind(), [SyntaxKind.Identifier])) {
      let text = node?.getText();

      if (validate(node, text)) {
        return text;
      }
    }
  }

  const l = getExternal(sourceFile);
  return l;
}

let lastExternals = [];

/**
 * 获取外部变量的源代码
 *
 * @param {string} filePath - 文件路径
 * @param {string[]} externalVariables - 外部变量数组
 * @returns {string} - 外部变量的源代码
 */
function getExternalVariableSources(filePath, externalVariables) {
  const baseDir = path.dirname(filePath);
  const code = readFileContent(filePath);
  const project = new Project();
  const sourceFile = project.createSourceFile("__getExternalVariableSources.ts", code);

  let noHandleVariableList = [];

  const externalSources = [];

  // 遍历外部变量数组
  for (const variable of externalVariables) {
    if (isTargetInOptions(variable, noHandleVariableList)) continue;

    const identifierNodeMap = sourceFile
      .getDescendantsOfKind(SyntaxKind.Identifier)
      .filter((node) => {
        return node.getText() === variable && !node.getFirstAncestorByKind(SyntaxKind.PropertyAccessExpression);
      })
      .reduce((prev, cur) => {
        return {
          ...prev,
          [cur.getText()]: cur,
        };
      }, {});

    for (const [key, identifierNode] of Object.entries(identifierNodeMap)) {
      const declaration = identifierNode.getDefinitionNodes()[0];

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
            noHandleVariableList = [...noHandleVariableList, ...getArrayIntersection(externalVariables, importClauses)];
            text = importDeclaration.getFullText();
          } else {
            const exportsMap = getAllExportNode(resolvedPath);

            let targetPath = "";
            for (const [key, val] of exportsMap) {
              const target = val.find((item) => item === declaration.getText());
              if (target) {
                targetPath = key;
              }
            }
            text = getExternalVariableSources(targetPath, [declaration.getText()]);
          }
        } else {
          text = declaration.getFullText();
        }
        text = text.replace(/^[\n|\r]*|[\n|\r]*$/g, "");
        externalSources.push(text);
      }
    }
  }

  let text = externalSources.join(`\n`);
  const externals = getExternalVariables(text);

  if (externals.length && getArrayIntersection(lastExternals, externals).length !== externals.length) {
    lastExternals = [...externals];
    const newExternals = getExternalVariableSources(filePath, externals);
    externalSources.unshift(newExternals);
  }

  return externalSources.join("\n\n");
}

/**
 * 获取外部变量的源代码
 *
 * @param {string} filePath - 文件路径
 * @param {string} exportName - 导出的变量名
 * @returns {string} - 外部变量的源代码
 */
function getExportSources(filePath, exportName) {
  console.log(`当前处理:`, exportName);
  let code = getExternalVariableSources(filePath, [exportName]);
  const project = new Project();
  const sourceFile = project.createSourceFile("__getExternalVariableSources.ts", code);
  let commentText = "";
  // 获取export声明变量
  sourceFile.forEachChild((node) => {
    switch (node.getKind()) {
      case SyntaxKind.VariableStatement:
        const declarations = node.getFirstChildByKind(SyntaxKind.VariableDeclarationList).getDeclarations();
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

  return {
    code: sourceFile.getFullText(),
    type: "ts",
    name: exportName,
    intro: commentText,
  };
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
}

const dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT_PATH = resolve(dirname, "..");

/**
 * 获取外部变量的源代码
 *
 * @param {string} filePath - 文件路径
 * @param {string[]} externalVariables - 外部变量数组
 * @returns {string} - 外部变量的源代码
 */
export function extractUsedCode(filePath, externalVariables) {
  const baseDir = path.dirname(filePath);
  const code = readFileContent(filePath);
  const project = new Project();
  const sourceFile = project.createSourceFile("__extractUsedCode.ts", code);

  let noHandleVariableList = [];

  const externalSources = [];

  // 遍历外部变量数组
  for (const variable of externalVariables) {
    if (isTargetInOptions(variable, noHandleVariableList)) continue;

    const identifierNodeMap = sourceFile
      .getDescendantsOfKind(SyntaxKind.Identifier)
      .filter((node) => {
        return node.getText() === variable && !node.getFirstAncestorByKind(SyntaxKind.PropertyAccessExpression);
      })
      .reduce((prev, cur) => {
        return {
          ...prev,
          [cur.getText()]: cur,
        };
      }, {});

    for (const [key, identifierNode] of Object.entries(identifierNodeMap)) {
      const declaration = identifierNode.getDefinitionNodes()[0];

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
            noHandleVariableList = [...noHandleVariableList, ...getArrayIntersection(externalVariables, importClauses)];
            text = importDeclaration.getFullText();
          } else {
            const exportsMap = getAllExportNode(resolvedPath);

            let targetPath = "";
            for (const [key, val] of exportsMap) {
              const target = val.find((item) => item === declaration.getText());
              if (target) {
                targetPath = key;
              }
            }
            text = extractUsedCode(targetPath, [declaration.getText()]);
          }
        } else {
          text = declaration.getFullText();
        }
        text = text.replace(/^[\n|\r]*|[\n|\r]*$/g, "");
        externalSources.push(text);
      }
    }
  }

  let text = externalSources.join(`\n`);
  const externals = getExternalVariables(text);

  if (externals.length && getArrayIntersection(lastExternals, externals).length !== externals.length) {
    lastExternals = [...externals];
    const newExternals = extractUsedCode(filePath, externals);
    lastExternals = [];
    externalSources.unshift(newExternals);
  }

  return externalSources.join("\n\n");
}

export default extractUsedCode;
