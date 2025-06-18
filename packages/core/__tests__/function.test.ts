/// <reference types="jest" />

import { NOOP, once, catchError, createCancelableTimer } from "../src/function.js";

describe("function.ts 测试", () => {
  describe("NOOP", () => {
    test("NOOP函数不应返回任何值", () => {
      expect(NOOP()).toBeUndefined();
    });
  });

  describe("once", () => {
    test("函数应该只执行一次", () => {
      const mockFn = jest.fn().mockReturnValue("result");
      const onceFn = once(mockFn);

      // 第一次调用
      expect(onceFn()).toBe("result");
      expect(mockFn).toHaveBeenCalledTimes(1);

      // 第二次调用
      expect(onceFn()).toBeUndefined();
      expect(mockFn).toHaveBeenCalledTimes(1);

      // 第三次调用
      expect(onceFn()).toBeUndefined();
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test("函数应该保留this上下文", () => {
      const obj = {
        value: 42,
        method: function () {
          return this.value;
        },
      };

      const onceMethod = once(obj.method);

      // 使用call绑定this上下文
      expect(onceMethod.call(obj)).toBe(42);

      // 第二次调用不会执行
      expect(onceMethod.call(obj)).toBeUndefined();
    });

    test("函数应该传递参数", () => {
      const mockFn = jest.fn((a, b) => a + b);
      const onceFn = once(mockFn);

      expect(onceFn(1, 2)).toBe(3);
      expect(mockFn).toHaveBeenCalledWith(1, 2);

      // 第二次调用不会执行
      onceFn(3, 4);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe("catchError", () => {
    test("成功执行的函数应返回[0, 结果, null]", async () => {
      const successFn = () => "success";
      const result = await catchError(successFn);
      expect(result).toEqual([0, "success", null]);
    });

    test("成功执行的异步函数应返回[0, 结果, null]", async () => {
      const successAsyncFn = async () => "async success";
      const result = await catchError(successAsyncFn);
      expect(result).toEqual([0, "async success", null]);
    });

    test("抛出错误的函数应返回[1, null, error]", async () => {
      const errorFn = () => {
        throw new Error("test error");
      };
      const result = await catchError(errorFn);
      expect(result[0]).toBe(1);
      expect(result[1]).toBeNull();
      expect(result[2]).toBeInstanceOf(Error);
      expect((result[2] as Error).message).toBe("test error");
    });

    test("抛出错误的异步函数应返回[1, null, error]", async () => {
      const errorAsyncFn = async () => {
        throw new Error("async test error");
      };
      const result = await catchError(errorAsyncFn);
      expect(result[0]).toBe(1);
      expect(result[1]).toBeNull();
      expect(result[2]).toBeInstanceOf(Error);
      expect((result[2] as Error).message).toBe("async test error");
    });

    test("应该正确传递参数", async () => {
      const paramFn = (a: number, b: number) => a + b;
      const result = await catchError(paramFn, 1, 2);
      expect(result).toEqual([0, 3, null]);
    });

    test("应该保留this上下文", async () => {
      const obj = {
        value: 42,
        method: function () {
          return this.value;
        },
      };

      const result = await catchError.call(obj, obj.method);
      expect(result).toEqual([0, 42, null]);
    });
  });

  describe("createCancelableTimer", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test("应该在指定延迟后执行回调", () => {
      const callback = jest.fn();
      createCancelableTimer(callback, 1000);

      // 验证回调尚未执行
      expect(callback).not.toHaveBeenCalled();

      // 前进999毫秒
      jest.advanceTimersByTime(999);
      expect(callback).not.toHaveBeenCalled();

      // 再前进1毫秒，达到1000毫秒
      jest.advanceTimersByTime(1);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    test("取消函数应该阻止回调执行", () => {
      const callback = jest.fn();
      const cancel = createCancelableTimer(callback, 1000);

      // 取消定时器
      cancel();

      // 前进1000毫秒
      jest.advanceTimersByTime(1000);

      // 验证回调未被执行
      expect(callback).not.toHaveBeenCalled();
    });

    test("取消函数应该可以在任何时间调用", () => {
      const callback = jest.fn();
      const cancel = createCancelableTimer(callback, 1000);

      // 前进500毫秒
      jest.advanceTimersByTime(500);

      // 取消定时器
      cancel();

      // 再前进500毫秒
      jest.advanceTimersByTime(500);

      // 验证回调未被执行
      expect(callback).not.toHaveBeenCalled();
    });
  });
});
