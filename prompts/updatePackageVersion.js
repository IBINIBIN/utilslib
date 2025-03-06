// import { readFileSync } from "fs-extra";
import { glob } from "glob";
import prompts from "prompts";
import { basename } from "node:path";
import { exec } from "child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

// 问题配置

(async function () {
  const questions = [
    {
      type: "multiselect",
      name: "packages",
      message: "请选择要更新的包:",
      min: 1,
      choices: glob.globSync("packages/*").map((p) => ({
        title: basename(p),
        value: basename(p),
      })),
    },
    {
      type: "select",
      name: "versionType",
      message: "请选择版本类型:",
      choices: ["patch", "minor", "major"].map((v) => ({
        title: v,
        value: v,
      })),
    },
  ];

  try {
    const answers = await prompts(questions, {
      onCancel() {
        console.log("操作已取消");
        return false;
      },
    });

    const { packages, versionType } = answers;
    if (!packages || !versionType) return;

    Promise.all(
      packages.map((packageName) => {
        execAsync(`npm -C packages/${packageName} version ${versionType}`);
      }),
    )
      .then(() => {
        console.log("\n🎉 版本更新流程完成！");
      })
      .catch((err) => {
        console.error("❌ 更新失败:", err);
      });
  } catch (error) {
    console.error("发生错误:", error);
    return null;
  }
})();
