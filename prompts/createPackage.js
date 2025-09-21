import pkg from "fs-extra";
const { readFileSync, writeFileSync, mkdirSync, existsSync } = pkg;
import prompts from "prompts";

(async function () {
  const questions = [
    {
      type: "text",
      name: "packageName",
      message: `请输入包名（如 my-lib）`,
      validate: (name) => (name && /^[a-zA-Z0-9-_]+$/.test(name) ? true : "包名只能包含字母、数字、-、_"),
    },
    {
      type: "text",
      name: "description",
      message: `请输入描述（可选）`,
      initial: "",
    },
    {
      type: "text",
      name: "author",
      message: `请输入作者（可选）`,
      initial: "",
    },
  ];

  const answers = await prompts(questions, {
    onCancel() {
      console.log("操作已取消");
      process.exit(0);
    },
  });

  const { packageName, description, author } = answers;
  if (!packageName) return;

  const pkgDir = `packages/${packageName}`;
  if (existsSync(pkgDir)) {
    console.error(`❌ 包 ${packageName} 已存在！`);
    process.exit(1);
  }

  // 创建目录结构
  mkdirSync(`${pkgDir}/src`, { recursive: true });

  // 生成 package.json
  const pkgJson = {
    name: `@utilslib/${packageName}`,
    version: "0.0.1",
    private: false,
    publishConfig: {
      access: "public",
      registry: "https://registry.npmjs.org/",
    },
    description: description || "",
    main: "dist/index.cjs.js",
    module: "dist/index.esm.js",
    types: "dist/types/index.d.ts",
    exports: {
      ".": {
        types: "./dist/types/index.d.ts",
        require: "./dist/index.cjs.js",
        import: "./dist/index.esm.js",
      },
    },
    keywords: [],
    author: author || "IBIN <ibin@qq.com>",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/IBINIBIN/utilslib",
    },
    bugs: {
      url: "https://github.com/IBINIBIN/utilslib/issues",
    },
    devDependencies: {},
    peerDependencies: {},
    dependencies: {},
  };
  writeFileSync(`${pkgDir}/package.json`, JSON.stringify(pkgJson, null, 2));

  // 写入 README.md
  writeFileSync(`${pkgDir}/README.md`, `# @utilslib/${packageName}\n`);

  // 写入 src/index.ts
  writeFileSync(`${pkgDir}/src/index.ts`, `// @utilslib/${packageName} 入口\n`);

  console.log(`\n🎉 子包 @utilslib/${packageName} 创建成功！路径: ${pkgDir}`);
})();
