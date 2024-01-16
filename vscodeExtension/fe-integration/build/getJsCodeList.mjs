import { fileURLToPath } from "node:url";
import fs from "fs-extra";
import path from "node:path";
import { parse } from "acorn";
import { simple } from "acorn-walk";
import { rollup } from "rollup";
import axios from "axios";
import virtual from "@rollup/plugin-virtual";
import { Project, printNode } from "ts-morph";

const ROOT_PATH = fileURLToPath(new URL("../../../", import.meta.url));

const jsSourceCodeLinkList = [
  path.join(ROOT_PATH, "packages/core/lib/index.esm.js"),
  path.join(ROOT_PATH, "packages/dom/lib/index.esm.js"),
];

function getClearExportDescHandle(code, exportName) {
  const project = new Project({
    compilerOptions: {
      target: "ESNext",
    },
  });

  const sourceFile = project.createSourceFile("这里随便输入.ts", code);
  sourceFile.compilerNode.statements.pop();

  return printNode(sourceFile.compilerNode);
}

const introMap = {};

/**
 * 去除其他export方法的注释
 * export只保留exportName
 * @param {String} code
 * @param {String} exportName
 * @returns String
 */
function astHandle(code, exportName) {
  const project = new Project();

  const sourceFile = project.createSourceFile("这里随便输入.ts", code);

  // 遍历源文件中的所有函数
  sourceFile.getFunctions().forEach((func) => {
    const ii = func.getName();
    const jsDocs = func.getJsDocs();

    if (ii === exportName) {
      // 存储一下方法的desc
      const intro = jsDocs.map((jsDoc) => jsDoc.getComment()).join();
      introMap[exportName] = intro;
    } else {
      // 删除其他方法的注释
      try {
        jsDocs.forEach((jsDoc) => jsDoc.remove?.());
      } catch (err) {
        // console.log(`err: `, err);
      }
    }
  });

  // 获取所有注释节点
  const commentNodes = sourceFile.getDescendantsOfKind(3);
  for (const item of commentNodes) {
    const text = item.getText();
    item.remove();
  }

  // 删除其他export
  const ns = sourceFile.getDescendantsOfKind(278);
  for (const node of ns) {
    node.compilerNode.exportClause.elements =
      node.compilerNode.exportClause.elements.filter(
        (n) => n.name.escapedText === exportName
      );
  }

  return printNode(sourceFile.compilerNode);
}

/** 除屑优化 */
async function getTreeShakingCode(code) {
  const bundle = await rollup({
    input: "virtual-input.js",
    plugins: [
      virtual({ "virtual-input.js": code }), // 使用虚拟文件插件
    ],
  });

  const { output } = await bundle.generate({
    format: "es",
  });

  return output[0].code;
}

/** 获取export列表 */
async function getExportList(code) {
  let exportList = [];
  const ast = parse(code, {
    ecmaVersion: "latest",
    sourceType: "module",
  });

  simple(ast, {
    ExportNamedDeclaration(n, ...args) {
      exportList = n.specifiers.map((n_1) => n_1.exported.name);
    },
  });

  return exportList;
}

async function main() {
  let jsCodeList = [];
  for (const url of jsSourceCodeLinkList) {
    console.log(`url: `, url);
    const code = await fs.readFile(url, "utf-8");

    // 获取所有export变量
    let exportList = await getExportList(code);
    for (const exportName of exportList) {
      console.log(`exportName: `, exportName);
      let latestCode = code;
      latestCode = await astHandle(latestCode, exportName);
      latestCode = await getTreeShakingCode(latestCode);
      latestCode = await getClearExportDescHandle(latestCode);
      jsCodeList.push({
        code: latestCode,
        type: "js",
        name: exportName,
        intro: introMap[exportName],
      });
    }
  }

  return jsCodeList;
}

export default main;
