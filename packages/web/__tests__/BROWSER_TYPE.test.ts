/**
 * @jest-environment jsdom
 */

import { BROWSER_TYPE } from "../src/detect";

describe("BROWSER_TYPE", () => {
  it("应该是一个字符串", () => {
    expect(typeof BROWSER_TYPE).toBe("string");
  });

  it("应该是有效的浏览器类型", () => {
    const validTypes = ["chrome", "safari", "firefox", "edge", "opera", "ie", "unknown"];
    expect(validTypes).toContain(BROWSER_TYPE);
  });
});
