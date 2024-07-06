import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Project, SyntaxKind, Node, SymbolFlags } from "ts-morph";

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

function getExternalVariables(code) {
  const project = new Project();
  const sourceFile = project.createSourceFile("temp.ts", code);

  const globalVarSymbols = project
    .getTypeChecker()
    .getSymbolsInScope(sourceFile, SymbolFlags.Value);

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
    const nodeKindName = node.getKindName();
    const nodeText = node?.getText();

    if (isTargetInOptions(node.getKind(), [SyntaxKind.FunctionDeclaration])) {
    }

    let l = [];

    node.forEachChild((item) => {
      const itemKindName = item.getKindName();
      const itemText = item?.getText();
      // aaa.push(itemText);

      l.push(getExternalVariablesByNode(item));
      l.push(...getExternal(item));
    });

    return [...new Set(l.filter(Boolean))];
  }

  function validate(node, text) {
    // if (
    //   isTargetInOptions(node.getParent().getKind(), [
    //     SyntaxKind.TypeReference,
    //     SyntaxKind.TypeParameter,
    //   ])
    // ) {
    //   return;
    // }

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
    if (isTargetInOptions(parent.getKind(), [SyntaxKind.PropertyAccessExpression])) {
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

function getCodeSourceNode(code) {
  const project = new Project();
  const sourceFile = project.createSourceFile("__getExternalVariableSources.ts", code);
  return sourceFile;
}

let lastExternals = "";

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

  const externalSources = [];

  // 遍历外部变量数组
  for (const variable of externalVariables) {
    const identifierNodeMap = sourceFile
      .getDescendantsOfKind(SyntaxKind.Identifier)
      .filter((node) => node.getText() === variable)
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
          const exportRelatedPath = importDeclaration
            .getModuleSpecifier()
            ?.getText()
            .replace(/['"]/g, "");
          const resolvedPath = resolveImportPath(exportRelatedPath, baseDir);
          const exportsMap = getAllExportNode(resolvedPath);

          let targetPath = "";
          for (const [key, val] of exportsMap) {
            const target = val.find((item) => item === declaration.getText());
            if (target) {
              targetPath = key;
            }
          }
          text = getExternalVariableSources(targetPath, [declaration.getText()]);
        } else {
          text = declaration.getFullText();
        }
        text = text.replace(/^[\n|\r]*|[\n|\r]*$/g, "");
        externalSources.push(text);
      }
    }
  }

  let text = externalSources.join("\n");
  const externals = getExternalVariables(text);
  if (externals.length && lastExternals !== JSON.stringify(externals)) {
    lastExternals = JSON.stringify(externals);
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
    if (node.getName?.() === exportName) {
      commentText = node
        .getJsDocs()
        .find((Jsdoc) => Jsdoc.getCommentText?.())
        ?.getCommentText?.();
    } else if (node.hasExportKeyword?.()) {
      node.setIsExported(false);
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
    return path.resolve(baseDir, importPath) + ".ts";
  }
  // 如果是monorepo中的包路径
  const [scope, packageName] = importPath.split("/");
  if (scope.startsWith("@")) {
    const packagePath = path.resolve(ROOT_PATH, "packages", packageName, "src", "index.ts");
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

/**
 * 检查一个值是否为非空数组。
 *
 * @param {unknown} value - 要检查的值。
 * @returns {value is any[]} 如果值为非空数组，则返回 true，否则返回 false。
 */
function isHasArray(value) {
  return Array.isArray(value) && value.length > 0;
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
  // let exportNameMap = new Map()
  function addExportMap(key, val) {
    // exportNameMap.set(val, key)
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

function main() {
  const CORE_ENTER_PATH = path.resolve(ROOT_PATH, "packages/core/src/index.ts");
  const CORE_OUTPUT_PATH = path.resolve(ROOT_PATH, "packages/core/lib/tsSnippets.json");

  const DOM_ENTER_PATH = path.resolve(ROOT_PATH, "packages/dom/src/index.ts");
  const DOM_OUTPUT_PATH = path.resolve(ROOT_PATH, "packages/dom/lib/tsSnippets.json");

  fs.writeFileSync(
    CORE_OUTPUT_PATH,
    JSON.stringify(
      [...getAllExportNode(CORE_ENTER_PATH)]
        .map(([filePath, exportsVar]) =>
          exportsVar.map((exportName) => getExportSources(filePath, exportName))
        )
        .flat(),
      null,
      2
    )
  );

  fs.writeFileSync(
    DOM_OUTPUT_PATH,
    JSON.stringify(
      [...getAllExportNode(DOM_ENTER_PATH)]
        .map(([filePath, exportsVar]) =>
          exportsVar.map((exportName) => getExportSources(filePath, exportName))
        )
        .flat(),
      null,
      2
    )
  );
}

const dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT_PATH = path.resolve(dirname, "..");

main();
