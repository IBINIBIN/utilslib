import { NOOP, once, catchError, createCancelableTimer } from "../src/function";

describe("Function Utils", () => {
  describe("NOOP", () => {
    it("should be a function that does nothing", () => {
      expect(typeof NOOP).toBe("function");
      expect(NOOP()).toBeUndefined();
    });
  });

  describe("once", () => {
    it("should only execute function once", () => {
      let count = 0;
      const increment = once(() => count++);

      increment();
      expect(count).toBe(1);

      increment();
      expect(count).toBe(1);

      increment();
      expect(count).toBe(1);
    });

    it("should return the result of the first call", () => {
      const fn = once((x: number) => x * 2);

      expect(fn(5)).toBe(10);
      expect(fn(10)).toBeUndefined(); // Should return undefined after first call
    });

    it("should preserve this context", () => {
      const obj = {
        value: 42,
        getValue: once(function (this: any) {
          return this.value;
        }),
      };

      expect(obj.getValue()).toBe(42);
    });

    it("should pass arguments correctly", () => {
      const fn = once((a: number, b: string, c: boolean) => `${a}-${b}-${c}`);
      expect(fn(1, "test", true)).toBe("1-test-true");
    });

    it("should handle async functions", async () => {
      let count = 0;
      const asyncFn = once(async () => {
        count++;
        return count;
      });

      expect(await asyncFn()).toBe(1);
      expect(await asyncFn()).toBeUndefined();
      expect(count).toBe(1);
    });

    it("should handle functions that throw errors", () => {
      let errorCount = 0;
      const errorFn = once(() => {
        errorCount++;
        throw new Error("Test error");
      });

      expect(() => errorFn()).toThrow("Test error");
      expect(errorCount).toBe(1);

      // Should not throw again as function is marked as called
      expect(() => errorFn()).not.toThrow();
      expect(errorCount).toBe(1);
    });
  });

  describe("catchError", () => {
    it("should catch synchronous errors and return error tuple", async () => {
      const syncErrorFn = catchError(() => {
        throw new Error("Sync error");
      });

      const result = await syncErrorFn();
      expect(result).toEqual([1, null, new Error("Sync error")]);
      expect(result[0]).toBe(1); // Error indicator
      expect(result[1]).toBe(null); // Result
      expect(result[2]).toBeInstanceOf(Error); // Error
    });

    it("should handle successful synchronous function", async () => {
      const syncSuccessFn = catchError((x: number) => x * 2);

      const result = await syncSuccessFn(5);
      expect(result).toEqual([0, 10, null]);
      expect(result[0]).toBe(0); // Success indicator
      expect(result[1]).toBe(10); // Result
      expect(result[2]).toBe(null); // Error
    });

    it("should catch asynchronous errors and return error tuple", async () => {
      const asyncErrorFn = catchError(async () => {
        throw new Error("Async error");
      });

      const result = await asyncErrorFn();
      expect(result).toEqual([1, null, new Error("Async error")]);
      expect(result[0]).toBe(1);
      expect(result[1]).toBe(null);
      expect(result[2]).toBeInstanceOf(Error);
    });

    it("should handle successful asynchronous function", async () => {
      const asyncSuccessFn = catchError(async (x: number) => {
        return Promise.resolve(x * 2);
      });

      const result = await asyncSuccessFn(5);
      expect(result).toEqual([0, 10, null]);
      expect(result[0]).toBe(0);
      expect(result[1]).toBe(10);
      expect(result[2]).toBe(null);
    });

    it("should preserve this context", async () => {
      const obj = {
        value: 42,
        getValue: catchError(function (this: any) {
          return this.value;
        }),
      };

      const result = await obj.getValue();
      expect(result).toEqual([0, 42, null]);
    });

    it("should pass arguments correctly", async () => {
      const fn = catchError((a: number, b: string) => `${a}-${b}`);
      const result = await fn(5, "test");
      expect(result).toEqual([0, "5-test", null]);
    });
  });

  describe("createCancelableTimer", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should execute callback after delay", () => {
      const callback = jest.fn();
      const cancel = createCancelableTimer(callback, 1000);

      expect(callback).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledTimes(1);

      // Cancel after execution should not throw
      expect(() => cancel()).not.toThrow();
    });

    it("should not execute callback if canceled before delay", () => {
      const callback = jest.fn();
      const cancel = createCancelableTimer(callback, 1000);

      cancel();

      jest.advanceTimersByTime(1000);
      expect(callback).not.toHaveBeenCalled();
    });

    it("should call onCancel callback when canceled", () => {
      const callback = jest.fn();
      const onCancel = jest.fn();
      const cancel = createCancelableTimer(callback, 1000, onCancel);

      cancel();
      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(callback).not.toHaveBeenCalled();
    });

    it("should not call onCancel when timer completes normally", () => {
      const callback = jest.fn();
      const onCancel = jest.fn();
      const cancel = createCancelableTimer(callback, 1000, onCancel);

      jest.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledTimes(1);
      expect(onCancel).not.toHaveBeenCalled();
    });

    it("should handle multiple cancel calls gracefully", () => {
      const callback = jest.fn();
      const cancel = createCancelableTimer(callback, 1000);

      cancel();
      cancel();
      cancel(); // Multiple cancels should not throw

      jest.advanceTimersByTime(1000);
      expect(callback).not.toHaveBeenCalled();
    });

    it("should use NOOP as default onCancel", () => {
      const callback = jest.fn();
      const cancel = createCancelableTimer(callback, 1000);

      expect(() => cancel()).not.toThrow();
    });

    it("should handle zero delay", () => {
      const callback = jest.fn();
      const cancel = createCancelableTimer(callback, 0);

      jest.advanceTimersByTime(0);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});
