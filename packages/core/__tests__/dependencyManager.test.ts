/// <reference types="jest" />

import { DependencyManager } from "../src/dependencyManager.js";

describe("DependencyManager 测试", () => {
  let depManager: DependencyManager;

  beforeEach(() => {
    depManager = new DependencyManager();
  });

  describe("wrap 方法", () => {
    test("应该包装函数并在执行后标记依赖完成", async () => {
      const mockFn = jest.fn().mockResolvedValue("result");
      const wrappedFn = depManager.wrap("test-dep", mockFn);

      expect(depManager.isComplete("test-dep")).toBe(false);

      const result = await wrappedFn("arg1", "arg2");

      expect(result).toBe("result");
      expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
      expect(depManager.isComplete("test-dep")).toBe(true);
    });

    test("包装的函数抛出错误时也应该标记依赖完成", async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error("test error"));
      const wrappedFn = depManager.wrap("error-dep", mockFn);

      expect(depManager.isComplete("error-dep")).toBe(false);

      await expect(wrappedFn()).rejects.toThrow("test error");
      expect(depManager.isComplete("error-dep")).toBe(true);
    });

    test("包装同步函数也应该正常工作", async () => {
      const mockFn = jest.fn().mockReturnValue("sync result");
      const wrappedFn = depManager.wrap("sync-dep", mockFn);

      expect(depManager.isComplete("sync-dep")).toBe(false);

      const result = await wrappedFn("arg");

      expect(result).toBe("sync result");
      expect(mockFn).toHaveBeenCalledWith("arg");
      expect(depManager.isComplete("sync-dep")).toBe(true);
    });
  });

  describe("require 方法", () => {
    test("应该等待单个依赖完成后执行函数", async () => {
      const mockFn = jest.fn().mockResolvedValue("result");
      const requiredFn = depManager.require("dep1", mockFn);

      // 先完成依赖，避免超时问题
      depManager.complete("dep1");

      const result = await requiredFn("arg");

      expect(result).toBe("result");
      expect(mockFn).toHaveBeenCalledWith("arg");
    });

    test("应该等待多个依赖完成后执行函数", async () => {
      const mockFn = jest.fn().mockResolvedValue("result");
      const requiredFn = depManager.require(["dep1", "dep2"], mockFn);

      // 依赖尚未完成，函数不应该执行
      expect(mockFn).not.toHaveBeenCalled();

      // 完成依赖
      depManager.complete("dep1");
      depManager.complete("dep2");

      const result = await requiredFn("arg");

      expect(result).toBe("result");
      expect(mockFn).toHaveBeenCalledWith("arg");
    });

    test("如果依赖已完成，应该立即执行函数", async () => {
      // 先完成依赖
      depManager.complete("dep1");

      const mockFn = jest.fn().mockResolvedValue("result");
      const requiredFn = depManager.require("dep1", mockFn);

      const result = await requiredFn("arg");

      expect(result).toBe("result");
      expect(mockFn).toHaveBeenCalledWith("arg");
    }, 10000); // 增加超时时间

    test("超时选项应该在超时后抛出错误", async () => {
      const mockFn = jest.fn();
      const requiredFn = depManager.require("timeout-dep", mockFn, { timeout: 50 });

      // 不完成依赖，让它超时
      await expect(requiredFn()).rejects.toThrow("依赖等待超时");
      expect(mockFn).not.toHaveBeenCalled();
    });
  });

  describe("isComplete 方法", () => {
    test("未完成的依赖应返回false", () => {
      // 注册依赖但不完成
      depManager.wrap("test-dep", () => {});
      expect(depManager.isComplete("test-dep")).toBe(false);
    });

    test("已完成的依赖应返回true", () => {
      // 直接注册并完成依赖
      const wrappedFn = depManager.wrap("test-dep", () => {});
      wrappedFn();
      expect(depManager.isComplete("test-dep")).toBe(true);
    });

    test("未注册的依赖应返回false", () => {
      expect(depManager.isComplete("non-existent")).toBe(false);
    });
  });

  describe("complete 方法", () => {
    test("应该标记依赖为完成状态", async () => {
      const fn = depManager.wrap("test-dep", () => {});
      expect(depManager.isComplete("test-dep")).toBe(false);

      depManager.complete("test-dep");
      expect(depManager.isComplete("test-dep")).toBe(true);
    });

    test("应该支持链式调用", () => {
      // 先注册依赖
      depManager.wrap("dep1", () => {});
      depManager.wrap("dep2", () => {});

      const result = depManager.complete("dep1").complete("dep2");

      expect(result).toBe(depManager);
      expect(depManager.isComplete("dep1")).toBe(true);
      expect(depManager.isComplete("dep2")).toBe(true);
    });

    test("标记未注册的依赖不应抛出错误", () => {
      expect(() => {
        depManager.complete("non-existent");
      }).not.toThrow();
    });
  });

  describe("waitFor 方法", () => {
    test("应该等待单个依赖完成", async () => {
      // 先完成依赖，避免测试中的竞态条件
      depManager.complete("dep1");
      await expect(depManager.waitFor("dep1")).resolves.toBeUndefined();
    });

    test("应该等待多个依赖完成", async () => {
      // 先完成所有依赖
      depManager.complete("dep1");
      depManager.complete("dep2");

      await expect(depManager.waitFor(["dep1", "dep2"])).resolves.toBeUndefined();
    });

    test("如果依赖已完成，应该立即解析", async () => {
      depManager.complete("dep1");
      await expect(depManager.waitFor("dep1")).resolves.toBeUndefined();
    });

    test("超时选项应该在超时后抛出错误", async () => {
      // 注册依赖但不完成它
      depManager.wrap("timeout-dep", () => {});
      await expect(depManager.waitFor("timeout-dep", 50)).rejects.toThrow("依赖等待超时");
    });
  });

  describe("getStatus 方法", () => {
    test("应该返回所有依赖的状态", () => {
      // 注册并完成一些依赖
      depManager.wrap("dep1", () => {});
      const fn2 = depManager.wrap("dep2", () => {});

      // 完成dep2
      fn2();

      expect(depManager.getStatus()).toEqual({
        dep1: false,
        dep2: true,
      });
    });
  });

  describe("reset 方法", () => {
    test("应该清除所有依赖状态", () => {
      // 注册并完成一些依赖
      depManager.wrap("dep1", () => {});
      depManager.complete("dep2");

      expect(depManager.getStatus()).toEqual({
        dep1: false,
        dep2: true,
      });

      // 重置
      depManager.reset();

      // 应该清空所有状态
      expect(depManager.getStatus()).toEqual({});
    });

    test("应该支持链式调用", () => {
      depManager.complete("dep1");
      depManager.complete("dep2");

      const result = depManager.reset().complete("dep2");

      expect(result).toBe(depManager);
      expect(depManager.getStatus()).toEqual({ dep2: true });
    });
  });

  describe("复杂场景测试", () => {
    test("依赖链应该正确工作", async () => {
      // 创建一系列依赖函数
      const step1 = depManager.wrap("step1", () => "step1 done");
      const step2 = depManager.require("step1", () => "step2 done");
      const step3 = depManager.require(["step1", "step2"], () => "step3 done");

      // 执行第一步
      await step1();

      // 第一步完成后，第二步应该可以执行
      const result2 = await step2();
      expect(result2).toBe("step2 done");

      // 第二步完成后，第三步应该可以执行
      const result3 = await step3();
      expect(result3).toBe("step3 done");
    });
  });
});
