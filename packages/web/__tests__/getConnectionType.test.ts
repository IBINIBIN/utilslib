/**
 * @jest-environment jsdom
 */

import { getConnectionType } from "../src/detect";

describe("getConnectionType", () => {
  let originalConnection: any;
  let originalMozConnection: any;
  let originalWebkitConnection: any;

  beforeEach(() => {
    // 保存原始的 navigator 属性
    originalConnection = (navigator as any).connection;
    originalMozConnection = (navigator as any).mozConnection;
    originalWebkitConnection = (navigator as any).webkitConnection;
  });

  afterEach(() => {
    // 恢复原始的 navigator 属性
    (navigator as any).connection = originalConnection;
    (navigator as any).mozConnection = originalMozConnection;
    (navigator as any).webkitConnection = originalWebkitConnection;
  });

  it("应该是一个函数", () => {
    expect(typeof getConnectionType).toBe("function");
  });

  it("应该返回一个字符串", () => {
    const result = getConnectionType();
    expect(typeof result).toBe("string");
  });

  it("当不支持连接 API 时应该返回 'unknown'", () => {
    // 清除所有连接 API 属性
    (navigator as any).connection = undefined;
    (navigator as any).mozConnection = undefined;
    (navigator as any).webkitConnection = undefined;

    expect(getConnectionType()).toBe("unknown");
  });

  it("当支持 connection API 时应该返回有效的连接类型", () => {
    // 模拟 connection API
    const mockConnection = {
      effectiveType: "4g",
      type: "wifi",
    };

    (navigator as any).connection = mockConnection;

    expect(getConnectionType()).toBe("4g");
  });

  it("应该处理不同浏览器的 connection API 前缀", () => {
    // 清除 connection，设置 mozConnection
    (navigator as any).connection = undefined;

    const mockMozConnection = {
      effectiveType: "3g",
      type: "mobile",
    };

    (navigator as any).mozConnection = mockMozConnection;

    expect(getConnectionType()).toBe("3g");
  });

  it("当 connection 对象没有 effectiveType 时应该返回 'unknown'", () => {
    const mockConnection = {
      type: "wifi",
      // 没有 effectiveType
    };

    (navigator as any).connection = mockConnection;

    expect(getConnectionType()).toBe("unknown");
  });
});
