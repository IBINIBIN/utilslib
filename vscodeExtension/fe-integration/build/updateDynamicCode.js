const fs = require("fs-extra");
const path = require("path");
const getCssCodeList = require("./getCssCodeList.js").default;

const filePath = path.resolve(process.cwd(), "src/extension.ts");
const packagePath = path.resolve(process.cwd(), "package.json");
const packageName = JSON.parse(fs.readFileSync(packagePath, "utf-8")).name;
const variableName = "codeList";

async function updateExtension(list) {
  const fileContent = await fs.readFile(filePath, "utf-8");

  // 在文件内容中找到要修改的变量
  const regex = new RegExp(
    `(const\\s+${variableName}.+?=\\s*)(.*?)(// codeList -- end)`,
    "s"
  );
  const match = fileContent.match(regex);

  if (match[1]) {
    const modifiedContent = fileContent.replace(
      match[0],
      `${match[1]}${JSON.stringify(list, 0, 2)}\n${match[3]}`
    );

    // 写回文件
    await fs.writeFile(filePath, modifiedContent, "utf-8");
  } else {
    console.error(`${variableName} not found in the file.`);
  }
}
async function updatePackage(list) {
  const fileContent = await fs.readFile(packagePath, "utf-8");

  // 在文件内容中找到要修改的变量
  const regex = new RegExp(`("commands":)(\\s*?\\[.*?\\])`, "s");
  const match = fileContent.match(regex);

  const commandList = list.map((item) => {
    // let title = `${item.type} ${item.name} - 生成代码`;
    let title = `${item.type} (g) ${item.name} - ${
      item.intro ? item.intro : "生成代码片段"
    }`;
    return {
      command: `${packageName}.${item.type}.${item.name}`,
      title,
    };
  });

  commandList.unshift({
    command: "fe-integration.css.options",
    title: "css (g) Panel - 代码片段生成选择器",
  });
  commandList.unshift({
    command: "fe-integration.js.options",
    title: "js (g) Panel - 代码片段生成选择器",
  });

  if (match[1]) {
    const modifiedContent = fileContent.replace(
      match[0],
      `${match[1]}${JSON.stringify(commandList, 0, 6)}`
    );

    // 写回文件
    await fs.writeFile(packagePath, modifiedContent, "utf-8");
  } else {
    console.error(`${variableName} not found in the file.`);
  }
}

async function main() {
  const list = await getCssCodeList();
  const getJsCodeList = (await import("./getJsCodeList.mjs")).default;
  const jsList = await getJsCodeList();

  updateExtension(list.concat(jsList));
  updatePackage(list.concat(jsList));
}

main();
