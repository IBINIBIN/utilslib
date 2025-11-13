/**
 * @jest-environment jsdom
 */

import { isOnline } from "../src/detect";

describe("isOnline", () => {
  it("应该是一个函数", () => {
    expect(typeof isOnline).toBe("function");
  });

  it("应该返回一个布尔值", () => {
    const result = isOnline();
    expect(typeof result).toBe("boolean");
  });

  it("应该返回 navigator.onLine 的值", () => {
    // 设置 navigator.onLine 的值
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: true,
    });
    expect(isOnline()).toBe(true);

    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: false,
    });
    expect(isOnline()).toBe(false);
  });
});
