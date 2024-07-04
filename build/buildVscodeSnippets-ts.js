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

let lastExternals = "";

/**
 * 获取外部变量的源代码
 *
 * @param {string} filePath - 文件路径
 * @param {string[]} externalVariables - 外部变量数组
 * @returns {string} - 外部变量的源代码
 */
function getExternalVariableSources(filePath, externalVariables) {
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
        const text = declaration.getFullText();
        externalSources.push(text);
      }
    }
  }
  Node.isDefaultClause();

  let text = externalSources.join("");
  const externals = getExternalVariables(text);
  if (externals.length && lastExternals !== JSON.stringify(externals)) {
    lastExternals = JSON.stringify(externals);
    const newExternals = getExternalVariableSources(filePath, externals);
    externalSources.unshift(newExternals);
  }

  return externalSources.join("");
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

function getIntegratedCode(filePath) {
  const code = readFileContent(filePath);
  const baseDir = path.dirname(filePath);
  const project = new Project();
  const sourceFile = project.createSourceFile("__getExportedVariables", code, { overwrite: false });

  let exports = [];

  sourceFile.forEachChild((node) => {
    if (node.isExported?.()) {
      const name = node.getName?.();
      if (name) {
        console.log(`当前处理:`, name);
        const code = getExternalVariableSources(filePath, [node.getName()]);
        const commentText = node
          .getJsDocs()
          .find((Jsdoc) => Jsdoc.getCommentText?.())
          ?.getCommentText?.();
        exports.push({
          code,
          type: "ts",
          name,
          intro: commentText,
        });
      }
    }

    if (node.getKind() === SyntaxKind.ExportDeclaration) {
      const moduleSpecifier = node.getModuleSpecifier()?.getText().replace(/['"]/g, "");
      const resolvedPath = resolveImportPath(moduleSpecifier, baseDir);
      const l = getIntegratedCode(resolvedPath);
      exports.push(...l);
    }
  });

  return exports;
}

const dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT_PATH = path.resolve(dirname, "..");

const CORE_ENTER_PATH = path.resolve(ROOT_PATH, "packages/core/src/index.ts");
const CORE_OUTPUT_PATH = path.resolve(ROOT_PATH, "packages/core/lib/tsSnippets.json");

const DOM_ENTER_PATH = path.resolve(ROOT_PATH, "packages/dom/src/index.ts");
const DOM_OUTPUT_PATH = path.resolve(ROOT_PATH, "packages/dom/lib/tsSnippets.json");

fs.writeFileSync(CORE_OUTPUT_PATH, JSON.stringify(getIntegratedCode(CORE_ENTER_PATH), null, 2));
fs.writeFileSync(DOM_OUTPUT_PATH, JSON.stringify(getIntegratedCode(DOM_ENTER_PATH), null, 2));
