import { DependencyManager } from "../src/dependency";

describe("DependencyManager", () => {
  let manager: DependencyManager;

  beforeEach(() => {
    manager = new DependencyManager();
  });

  afterEach(() => {
    manager.reset();
  });

  describe("constructor", () => {
    it("should create instance with empty state", () => {
      const newManager = new DependencyManager();
      const status = newManager.getStatus();
      expect(status).toEqual({});
      expect(newManager.isComplete("test")).toBe(false);
    });
  });

  describe("createProvider", () => {
    it("should create provider function that marks dependency as complete", async () => {
      const provider = manager.createProvider("dep1", async () => {
        return "result";
      });

      expect(manager.isComplete("dep1")).toBe(false);

      const result = await provider();
      expect(result).toBe("result");
      expect(manager.isComplete("dep1")).toBe(true);
    });

    it("should mark dependency complete even if function throws error", async () => {
      const provider = manager.createProvider("dep1", async () => {
        throw new Error("Test error");
      });

      expect(manager.isComplete("dep1")).toBe(false);

      try {
        await provider();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }

      expect(manager.isComplete("dep1")).toBe(true);
    });

    it("should pass arguments correctly", async () => {
      const mockFn = jest.fn().mockResolvedValue("result");
      const provider = manager.createProvider("dep1", mockFn);

      await provider("arg1", "arg2", 123);

      expect(mockFn).toHaveBeenCalledWith("arg1", "arg2", 123);
    });
  });

  describe("provider", () => {
    it("should execute provider immediately and mark complete", async () => {
      const result = await manager.provider("dep1", async () => {
        return "immediate result";
      });

      expect(result).toBe("immediate result");
      expect(manager.isComplete("dep1")).toBe(true);
    });

    it("should pass arguments to function", async () => {
      const mockFn = jest.fn().mockResolvedValue("result");
      await manager.provider("dep1", mockFn, "arg1", "arg2");

      expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
    });

    it("should handle synchronous functions", async () => {
      const result = await manager.provider("dep1", () => "sync result");
      expect(result).toBe("sync result");
      expect(manager.isComplete("dep1")).toBe(true);
    });
  });

  describe("createAwaitDepExec", () => {
    it("should wait for single dependency", async () => {
      await manager.provider("dep1", async () => {
        return "dep1 result";
      });

      const executor = manager.createAwaitDepExec("dep1", async () => {
        return "final result";
      });

      const result = await executor();
      expect(result).toBe("final result");
    });

    it("should wait for multiple dependencies", async () => {
      const executor1 = manager.createAwaitDepExec(["dep1", "dep2"], async () => {
        return "result1";
      });

      const executor2 = manager.createAwaitDepExec("dep2", async () => {
        return "result2";
      });

      // Start executor1 first, but it should wait
      const promise1 = executor1();

      // Complete dep2 first
      await manager.provider("dep2", async () => {
        return "dep2";
      });

      // Then complete dep1
      await manager.provider("dep1", async () => {
        return "dep1";
      });

      const [result1, result2] = await Promise.all([promise1, executor2()]);

      expect(result1).toBe("result1");
      expect(result2).toBe("result2");
    });

    it("should execute immediately if dependencies are already complete", async () => {
      await manager.complete("dep1");
      await manager.complete("dep2");

      const mockFn = jest.fn().mockResolvedValue("result");
      const executor = manager.createAwaitDepExec(["dep1", "dep2"], mockFn);

      const result = await executor();
      expect(result).toBe("result");
      expect(mockFn).toHaveBeenCalled();
    });

    it("should pass arguments correctly", async () => {
      await manager.complete("dep1");

      const mockFn = jest.fn().mockResolvedValue("result");
      const executor = manager.createAwaitDepExec("dep1", mockFn);

      await executor("arg1", "arg2");

      expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
    });
  });

  describe("awaitDepExec", () => {
    it("should work with options object", async () => {
      await manager.complete("dep1");

      const mockFn = jest.fn().mockResolvedValue("result");
      const result = await manager.awaitDepExec("dep1", mockFn, { timeout: 5000 }, "arg1");

      expect(result).toBe("result");
      expect(mockFn).toHaveBeenCalledWith("arg1");
    });

    it("should work without options object", async () => {
      await manager.complete("dep1");

      const mockFn = jest.fn().mockResolvedValue("result");
      const result = await manager.awaitDepExec("dep1", mockFn, "arg1", "arg2");

      expect(result).toBe("result");
      expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
    });
  });

  describe("isComplete", () => {
    it("should return false for incomplete dependency", () => {
      expect(manager.isComplete("nonexistent")).toBe(false);
    });

    it("should return true for completed dependency", async () => {
      await manager.provider("dep1", async () => "result");
      expect(manager.isComplete("dep1")).toBe(true);
    });

    it("should return true for manually completed dependency", () => {
      manager.complete("dep1");
      expect(manager.isComplete("dep1")).toBe(true);
    });
  });

  describe("complete", () => {
    it("should mark dependency as complete", () => {
      expect(manager.isComplete("dep1")).toBe(false);
      const result = manager.complete("dep1");
      expect(manager.isComplete("dep1")).toBe(true);
      expect(result).toBe(manager); // Should return this for chaining
    });

    it("should handle multiple dependencies", () => {
      manager.complete("dep1").complete("dep2");
      expect(manager.isComplete("dep1")).toBe(true);
      expect(manager.isComplete("dep2")).toBe(true);
    });

    it("should handle completing already completed dependency", () => {
      manager.complete("dep1");
      manager.complete("dep1"); // Should not throw
      expect(manager.isComplete("dep1")).toBe(true);
    });
  });

  describe("waitFor", () => {
    it("should wait for single dependency", async () => {
      const promise = manager.waitFor("dep1");

      // Should not resolve immediately
      let resolved = false;
      promise.then(() => {
        resolved = true;
      });
      expect(resolved).toBe(false);

      manager.complete("dep1");
      await promise;
      expect(resolved).toBe(true);
    });

    it("should wait for multiple dependencies", async () => {
      const promise = manager.waitFor(["dep1", "dep2"]);

      manager.complete("dep1");
      // Should not resolve yet
      let resolved = false;
      promise.then(() => {
        resolved = true;
      });
      expect(resolved).toBe(false);

      manager.complete("dep2");
      await promise;
      expect(resolved).toBe(true);
    });

    it("should resolve immediately if dependencies are already complete", async () => {
      manager.complete("dep1");
      manager.complete("dep2");

      const promise = manager.waitFor(["dep1", "dep2"]);
      await expect(promise).resolves.toBeUndefined();
    });
  });

  describe("getStatus", () => {
    it("should return empty status initially", () => {
      const status = manager.getStatus();
      expect(status).toEqual({});
    });

    it("should return correct status after operations", async () => {
      await manager.provider("dep1", async () => "result1");
      await manager.provider("dep2", async () => "result2");

      const status = manager.getStatus();
      expect(status).toEqual({
        dep1: true,
        dep2: true,
      });
    });

    it("should not include internal promise keys", async () => {
      await manager.provider("dep1", async () => "result");

      const keys = Object.keys(manager.getStatus());
      expect(keys).toEqual(["dep1"]);
      expect(keys.some((key) => key.includes("_promise"))).toBe(false);
    });

    it("should show incomplete dependencies as false", async () => {
      manager.createProvider("dep1", async () => "result");
      // Don't execute the provider

      const status = manager.getStatus();
      expect(status).toEqual({
        dep1: false,
      });
    });
  });

  describe("reset", () => {
    it("should clear all dependency state", async () => {
      await manager.provider("dep1", async () => "result1");
      await manager.provider("dep2", async () => "result2");

      expect(manager.getStatus()).toEqual({
        dep1: true,
        dep2: true,
      });

      const result = manager.reset();
      expect(result).toBe(manager); // Should return this for chaining

      expect(manager.getStatus()).toEqual({});
      expect(manager.isComplete("dep1")).toBe(false);
      expect(manager.isComplete("dep2")).toBe(false);
    });

    it("should work with chaining", async () => {
      await manager.provider("dep1", async () => "result");

      manager.reset().complete("new-dep").complete("another-dep");

      expect(manager.getStatus()).toEqual({
        "new-dep": true,
        "another-dep": true,
      });
    });
  });

  describe("Integration Tests", () => {
    it("should handle complex dependency scenarios", async () => {
      const results: string[] = [];

      // Set up complex dependencies
      const executor1 = manager.createAwaitDepExec(["depA", "depB"], async () => {
        results.push("exec1");
        return "result1";
      });

      const executor2 = manager.createAwaitDepExec(["depB", "depC"], async () => {
        results.push("exec2");
        return "result2";
      });

      const providerA = manager.provider("depA", async () => {
        results.push("depA");
      });

      const providerC = manager.provider("depC", async () => {
        results.push("depC");
      });

      manager.complete("depB");

      const [result1, result2, resultA, resultC] = await Promise.all([executor1(), executor2(), providerA, providerC]);

      expect(result1).toBe("result1");
      expect(result2).toBe("result2");
      expect(results).toContain("depA");
      expect(results).toContain("depB");
      expect(results).toContain("depC");
      expect(results).toContain("exec1");
      expect(results).toContain("exec2");
    });

    it("should handle error scenarios gracefully", async () => {
      const errorExecutor = manager.createAwaitDepExec("dep1", async () => {
        throw new Error("Executor error");
      });

      await manager.provider("dep1", async () => {
        throw new Error("Provider error");
      });

      await expect(errorExecutor()).rejects.toThrow("Executor error");
      expect(manager.isComplete("dep1")).toBe(true);
    });
  });
});
