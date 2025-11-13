/**
 * @jest-environment jsdom
 */

import { getViewportInfo } from "../src/detect";

// Mock window 相关属性
Object.defineProperty(window, "innerWidth", {
  writable: true,
  value: 1200,
});

Object.defineProperty(window, "innerHeight", {
  writable: true,
  value: 800,
});

Object.defineProperty(window, "scrollX", {
  writable: true,
  value: 100,
});

Object.defineProperty(window, "scrollY", {
  writable: true,
  value: 50,
});

Object.defineProperty(window, "pageXOffset", {
  writable: true,
  value: 100,
});

Object.defineProperty(window, "pageYOffset", {
  writable: true,
  value: 50,
});

describe("getViewportInfo", () => {
  beforeEach(() => {
    // 重置默认值
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 1200,
    });

    Object.defineProperty(window, "innerHeight", {
      writable: true,
      value: 800,
    });

    Object.defineProperty(window, "scrollX", {
      writable: true,
      value: 100,
    });

    Object.defineProperty(window, "scrollY", {
      writable: true,
      value: 50,
    });

    Object.defineProperty(window, "pageXOffset", {
      writable: true,
      value: 100,
    });

    Object.defineProperty(window, "pageYOffset", {
      writable: true,
      value: 50,
    });
  });

  it("应该是一个函数", () => {
    expect(typeof getViewportInfo).toBe("function");
  });

  it("应该返回一个对象", () => {
    const result = getViewportInfo();
    expect(typeof result).toBe("object");
    expect(result).not.toBeNull();
  });

  it("应该返回正确的视口信息结构", () => {
    const result = getViewportInfo();

    expect(result).toHaveProperty("width");
    expect(result).toHaveProperty("height");
    expect(result).toHaveProperty("scrollX");
    expect(result).toHaveProperty("scrollY");
  });

  it("应该返回正确的视口尺寸和滚动位置", () => {
    const result = getViewportInfo();

    expect(result.width).toBe(1200);
    expect(result.height).toBe(800);
    expect(result.scrollX).toBe(100);
    expect(result.scrollY).toBe(50);
  });

  it("当 scrollX 不存在时应该使用 pageXOffset", () => {
    Object.defineProperty(window, "scrollX", {
      writable: true,
      value: undefined,
    });

    Object.defineProperty(window, "pageXOffset", {
      writable: true,
      value: 200,
    });

    const result = getViewportInfo();
    expect(result.scrollX).toBe(200);
  });

  it("当 scrollY 不存在时应该使用 pageYOffset", () => {
    Object.defineProperty(window, "scrollY", {
      writable: true,
      value: undefined,
    });

    Object.defineProperty(window, "pageYOffset", {
      writable: true,
      value: 100,
    });

    const result = getViewportInfo();
    expect(result.scrollY).toBe(100);
  });

  it("应该处理不同的窗口尺寸", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 800,
    });

    Object.defineProperty(window, "innerHeight", {
      writable: true,
      value: 600,
    });

    const result = getViewportInfo();
    expect(result.width).toBe(800);
    expect(result.height).toBe(600);
  });
});
