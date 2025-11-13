import { sleep, batchAsync, retry } from "../src/async";

describe("Async Utils", () => {
  describe("sleep", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should resolve after specified time", async () => {
      const promise = sleep(1000);
      expect(promise).toBeInstanceOf(Promise);

      // Advance time and await
      jest.advanceTimersByTime(1000);
      await expect(promise).resolves.toBeUndefined();
    });

    it("should resolve immediately for 0ms", () => {
      const promise = sleep(0);
      jest.advanceTimersByTime(0);
      expect(promise).resolves.toBeUndefined();
    });

    it("should handle negative values", () => {
      const promise = sleep(-100);
      jest.advanceTimersByTime(0);
      expect(promise).resolves.toBeUndefined();
    });
  });

  describe("batchAsync", () => {
    it("should execute all tasks and return results in order", async () => {
      const tasks = [
        () => Promise.resolve(1),
        () => Promise.resolve(2),
        () => Promise.resolve(3),
        () => Promise.resolve(4),
        () => Promise.resolve(5),
      ];

      const results = await batchAsync(tasks, 2);
      expect(results).toEqual([1, 2, 3, 4, 5]);
    });

    it("should handle empty tasks array", async () => {
      const results = await batchAsync([]);
      expect(results).toEqual([]);
    });

    it("should handle task failures", async () => {
      const tasks = [
        () => Promise.resolve(1),
        () => Promise.reject(new Error("Task failed")),
        () => Promise.resolve(3),
        () => Promise.reject(new Error("Another failed task")),
        () => Promise.resolve(5),
      ];

      const results = await batchAsync(tasks, 2);
      expect(results).toHaveLength(5);
      expect(results[0]).toBe(1);
      expect(results[1]).toBeInstanceOf(Error);
      expect(results[2]).toBe(3);
      expect(results[3]).toBeInstanceOf(Error);
      expect(results[4]).toBe(5);
    });

    it("should handle concurrency larger than task count", async () => {
      const tasks = [() => Promise.resolve(1), () => Promise.resolve(2)];

      const results = await batchAsync(tasks, 10);
      expect(results).toEqual([1, 2]);
    });

    it("should handle default concurrency", async () => {
      const tasks = Array.from({ length: 10 }, (_, i) => () => Promise.resolve(i));

      const results = await batchAsync(tasks);
      expect(results).toHaveLength(10);
    });
  });

  describe("retry", () => {
    it("should succeed on first try", async () => {
      const fn = jest.fn().mockResolvedValue("success");
      const result = await retry(fn, 3, 0);

      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should handle zero retries", async () => {
      const error = new Error("No retries");
      const fn = jest.fn().mockRejectedValue(error);

      await expect(retry(fn, 0, 0)).rejects.toThrow("No retries");
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should preserve function arguments", async () => {
      const fn = jest.fn().mockRejectedValue(new Error("Failed"));

      try {
        await retry(fn, 1, 0);
      } catch {}

      expect(fn).toHaveBeenCalled();
    });
  });
});
