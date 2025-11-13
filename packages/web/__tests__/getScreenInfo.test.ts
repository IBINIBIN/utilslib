/**
 * @jest-environment jsdom
 */

import { getScreenInfo } from "../src/detect";

// Mock window.screen
Object.defineProperty(window, "screen", {
  writable: true,
  value: {
    width: 1920,
    height: 1080,
    availWidth: 1920,
    availHeight: 1040,
    colorDepth: 24,
    pixelDepth: 24,
  },
});

// Mock window.devicePixelRatio
Object.defineProperty(window, "devicePixelRatio", {
  writable: true,
  value: 1,
});

describe("getScreenInfo", () => {
  beforeEach(() => {
    // 重置默认值
    Object.defineProperty(window, "screen", {
      writable: true,
      value: {
        width: 1920,
        height: 1080,
        availWidth: 1920,
        availHeight: 1040,
        colorDepth: 24,
        pixelDepth: 24,
      },
    });

    Object.defineProperty(window, "devicePixelRatio", {
      writable: true,
      value: 1,
    });
  });

  it("应该是一个函数", () => {
    expect(typeof getScreenInfo).toBe("function");
  });

  it("应该返回一个对象", () => {
    const result = getScreenInfo();
    expect(typeof result).toBe("object");
    expect(result).not.toBeNull();
  });

  it("应该返回正确的屏幕信息结构", () => {
    const result = getScreenInfo();

    expect(result).toHaveProperty("width");
    expect(result).toHaveProperty("height");
    expect(result).toHaveProperty("availWidth");
    expect(result).toHaveProperty("availHeight");
    expect(result).toHaveProperty("colorDepth");
    expect(result).toHaveProperty("pixelDepth");
    expect(result).toHaveProperty("devicePixelRatio");
  });

  it("应该返回正确的屏幕尺寸", () => {
    const result = getScreenInfo();

    expect(result.width).toBe(1920);
    expect(result.height).toBe(1080);
    expect(result.availWidth).toBe(1920);
    expect(result.availHeight).toBe(1040);
    expect(result.colorDepth).toBe(24);
    expect(result.pixelDepth).toBe(24);
    expect(result.devicePixelRatio).toBe(1);
  });

  it("应该处理不同的 devicePixelRatio 值", () => {
    Object.defineProperty(window, "devicePixelRatio", {
      writable: true,
      value: 2,
    });

    const result = getScreenInfo();
    expect(result.devicePixelRatio).toBe(2);
  });

  it("当 devicePixelRatio 不存在时应该使用默认值 1", () => {
    Object.defineProperty(window, "devicePixelRatio", {
      writable: true,
      value: undefined,
    });

    const result = getScreenInfo();
    expect(result.devicePixelRatio).toBe(1);
  });
});
