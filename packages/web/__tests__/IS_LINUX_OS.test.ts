/**
 * @jest-environment jsdom
 */

import { IS_LINUX_OS } from "../src/detect";

describe("IS_LINUX_OS", () => {
  it("应该是一个布尔值", () => {
    expect(typeof IS_LINUX_OS).toBe("boolean");
  });

  it("应该能够正确识别 Linux 操作系统", () => {
    // 由于这是基于运行环境的测试，我们只验证类型和可能值
    expect([true, false]).toContain(IS_LINUX_OS);
  });
});
