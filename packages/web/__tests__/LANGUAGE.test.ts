/**
 * @jest-environment jsdom
 */

import { LANGUAGE } from "../src/detect";

describe("LANGUAGE", () => {
  it("应该是一个字符串", () => {
    expect(typeof LANGUAGE).toBe("string");
  });

  it("应该是一个有效的语言代码", () => {
    // 基本的语言代码格式验证，如 "en", "zh-CN", "fr" 等
    expect(LANGUAGE).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
  });

  it("不应该为空字符串", () => {
    expect(LANGUAGE).not.toBe("");
  });
});
