/**
 * @jest-environment jsdom
 */

import { isDarkMode } from "../src/detect";

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe("isDarkMode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("应该是一个函数", () => {
    expect(typeof isDarkMode).toBe("function");
  });

  it("应该返回一个布尔值", () => {
    const result = isDarkMode();
    expect(typeof result).toBe("boolean");
  });

  it("应该调用 window.matchMedia", () => {
    isDarkMode();
    expect(window.matchMedia).toHaveBeenCalledWith("(prefers-color-scheme: dark)");
  });

  it("应该根据 matchMedia 的返回值决定暗黑模式状态", () => {
    // 测试暗黑模式开启的情况
    (window.matchMedia as jest.Mock).mockReturnValueOnce({
      matches: true,
      media: "(prefers-color-scheme: dark)",
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    });

    expect(isDarkMode()).toBe(true);

    // 测试暗黑模式关闭的情况
    (window.matchMedia as jest.Mock).mockReturnValueOnce({
      matches: false,
      media: "(prefers-color-scheme: dark)",
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    });

    expect(isDarkMode()).toBe(false);
  });
});
