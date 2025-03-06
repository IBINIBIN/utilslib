/// <reference types="jest" />

import * as CoreExports from "../src/index.js";
import * as ArrayModule from "../src/array.js";
import * as IsModule from "../src/is.js";
import * as ObjectModule from "../src/object.js";
import * as StringModule from "../src/string.js";
import * as FunctionModule from "../src/function.js";
import * as CommonModule from "../src/common.js";
import * as ConstantsModule from "../src/constants.js";
import * as RecursionModule from "../src/recursion.js";
import * as DependencyManagerModule from "../src/dependencyManager.js";

describe("index.ts 测试", () => {
  test("应该正确导出所有模块", () => {
    // 测试Array模块导出
    Object.keys(ArrayModule).forEach((key) => {
      expect((CoreExports as any)[key]).toBe((ArrayModule as any)[key]);
    });

    // 测试Is模块导出
    Object.keys(IsModule).forEach((key) => {
      expect((CoreExports as any)[key]).toBe((IsModule as any)[key]);
    });

    // 测试Object模块导出
    Object.keys(ObjectModule).forEach((key) => {
      expect((CoreExports as any)[key]).toBe((ObjectModule as any)[key]);
    });

    // 测试String模块导出
    Object.keys(StringModule).forEach((key) => {
      expect((CoreExports as any)[key]).toBe((StringModule as any)[key]);
    });

    // 测试Function模块导出
    Object.keys(FunctionModule).forEach((key) => {
      expect((CoreExports as any)[key]).toBe((FunctionModule as any)[key]);
    });

    // 测试Common模块导出
    Object.keys(CommonModule).forEach((key) => {
      expect((CoreExports as any)[key]).toBe((CommonModule as any)[key]);
    });

    // 测试Constants模块导出
    Object.keys(ConstantsModule).forEach((key) => {
      expect((CoreExports as any)[key]).toBe((ConstantsModule as any)[key]);
    });

    // 测试Recursion模块导出
    Object.keys(RecursionModule).forEach((key) => {
      expect((CoreExports as any)[key]).toBe((RecursionModule as any)[key]);
    });

    // 测试DependencyManager模块导出
    Object.keys(DependencyManagerModule).forEach((key) => {
      expect((CoreExports as any)[key]).toBe((DependencyManagerModule as any)[key]);
    });
  });

  test("应该导出DependencyManager类", () => {
    expect(CoreExports.DependencyManager).toBeDefined();
    expect(typeof CoreExports.DependencyManager).toBe("function");

    // 测试实例化
    const instance = new CoreExports.DependencyManager();
    expect(instance).toBeInstanceOf(CoreExports.DependencyManager);
  });
});
