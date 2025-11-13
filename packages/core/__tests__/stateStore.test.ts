import { StateStore } from "../src/stateStore";

interface TestState {
  count: number;
  name: string;
  isActive: boolean;
}

describe("StateStore", () => {
  let store: StateStore<TestState>;

  beforeEach(() => {
    store = new StateStore<TestState>();
  });

  describe("constructor", () => {
    it("should create instance with empty state", () => {
      const newStore = new StateStore<TestState>();
      const state = newStore.get();
      expect(state).toEqual({});
    });
  });

  describe("set and get", () => {
    it("should set and get individual state values", () => {
      store.set("count", 42);
      expect(store.get("count")).toBe(42);

      store.set("name", "test");
      expect(store.get("name")).toBe("test");

      store.set("isActive", true);
      expect(store.get("isActive")).toBe(true);
    });

    it("should get entire state when no key provided", () => {
      store.set("count", 42);
      store.set("name", "test");
      store.set("isActive", true);

      const fullState = store.get();
      expect(fullState).toEqual({
        count: 42,
        name: "test",
        isActive: true,
      });
    });

    it("should overwrite existing values", () => {
      store.set("count", 1);
      expect(store.get("count")).toBe(1);

      store.set("count", 100);
      expect(store.get("count")).toBe(100);
    });

    it("should handle undefined values", () => {
      store.set("count", 42);
      expect(store.get("count")).toBe(42);

      store.set("count", undefined);
      expect(store.get("count")).toBeUndefined();
    });
  });

  describe("subscribe and unsubscribe", () => {
    it("should subscribe to state changes", () => {
      const callback = jest.fn();
      const unsubscribe = store.subscribe("count", callback);

      store.set("count", 42);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(42);

      unsubscribe();
      store.set("count", 100);

      expect(callback).toHaveBeenCalledTimes(1); // Should not be called again
    });

    it("should return unsubscribe function", () => {
      const callback = jest.fn();
      const unsubscribe = store.subscribe("name", callback);

      expect(typeof unsubscribe).toBe("function");

      unsubscribe();
      store.set("name", "test");
      expect(callback).not.toHaveBeenCalled();
    });

    it("should allow multiple subscribers for same key", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      store.subscribe("count", callback1);
      store.subscribe("count", callback2);

      store.set("count", 42);

      expect(callback1).toHaveBeenCalledWith(42);
      expect(callback2).toHaveBeenCalledWith(42);
    });

    it("should handle subscribers for different keys", () => {
      const countCallback = jest.fn();
      const nameCallback = jest.fn();

      store.subscribe("count", countCallback);
      store.subscribe("name", nameCallback);

      store.set("count", 42);
      expect(countCallback).toHaveBeenCalledWith(42);
      expect(nameCallback).not.toHaveBeenCalled();

      store.set("name", "test");
      expect(countCallback).toHaveBeenCalledTimes(1); // Still only called once
      expect(nameCallback).toHaveBeenCalledWith("test");
    });

    it("should unsubscribe specific listener", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      const unsubscribe1 = store.subscribe("count", callback1);
      store.subscribe("count", callback2);
      const unsubscribe3 = store.subscribe("count", callback3);

      // Remove first and third listeners
      unsubscribe1();
      unsubscribe3();

      store.set("count", 42);

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith(42);
      expect(callback3).not.toHaveBeenCalled();
    });
  });

  describe("notify", () => {
    it("should notify subscribers without changing state", () => {
      const callback = jest.fn();
      store.subscribe("count", callback);

      store.set("count", 42);
      expect(callback).toHaveBeenCalledWith(42);
      expect(callback).toHaveBeenCalledTimes(1);

      // Notify without changing state
      store.notify("count", 100);
      expect(callback).toHaveBeenCalledWith(100);
      expect(callback).toHaveBeenCalledTimes(2);

      // State should remain unchanged
      expect(store.get("count")).toBe(42);
    });

    it("should only notify subscribers for the specific key", () => {
      const countCallback = jest.fn();
      const nameCallback = jest.fn();

      store.subscribe("count", countCallback);
      store.subscribe("name", nameCallback);

      store.notify("count", 42);

      expect(countCallback).toHaveBeenCalledWith(42);
      expect(nameCallback).not.toHaveBeenCalled();
    });

    it("should work with different data types", () => {
      const stringCallback = jest.fn();
      const booleanCallback = jest.fn();
      const objectCallback = jest.fn();

      store.subscribe("name", stringCallback);
      store.subscribe("isActive", booleanCallback);

      store.subscribe("name" as keyof TestState, objectCallback);

      store.notify("name", "test string");
      store.notify("isActive", true);

      expect(stringCallback).toHaveBeenCalledWith("test string");
      expect(booleanCallback).toHaveBeenCalledWith(true);
    });
  });

  describe("clear", () => {
    it("should clear all state and remove all listeners", () => {
      const countCallback = jest.fn();
      const nameCallback = jest.fn();

      store.subscribe("count", countCallback);
      store.subscribe("name", nameCallback);

      store.set("count", 42);
      store.set("name", "test");

      expect(store.get()).toEqual({ count: 42, name: "test" });
      expect(countCallback).toHaveBeenCalled();
      expect(nameCallback).toHaveBeenCalled();

      store.clear();

      // State should be empty
      expect(store.get()).toEqual({});

      // Listeners should be removed
      store.set("count", 100);
      store.set("name", "new test");

      expect(countCallback).toHaveBeenCalledTimes(1); // Not called again
      expect(nameCallback).toHaveBeenCalledTimes(1); // Not called again
    });
  });

  describe("Integration Tests", () => {
    it("should handle complex state management scenarios", () => {
      const callbacks = Array.from({ length: 3 }, () => jest.fn());

      // Subscribe to different keys
      store.subscribe("count", callbacks[0]);
      store.subscribe("name", callbacks[1]);
      store.subscribe("isActive", callbacks[2]);

      // Update state
      store.set("count", 42);
      expect(callbacks[0]).toHaveBeenCalledWith(42);
      expect(callbacks[1]).not.toHaveBeenCalled();
      expect(callbacks[2]).not.toHaveBeenCalled();

      store.set("name", "test");
      expect(callbacks[0]).toHaveBeenCalledTimes(1);
      expect(callbacks[1]).toHaveBeenCalledWith("test");
      expect(callbacks[2]).not.toHaveBeenCalled();

      store.set("isActive", true);
      expect(callbacks[0]).toHaveBeenCalledTimes(1);
      expect(callbacks[1]).toHaveBeenCalledTimes(1);
      expect(callbacks[2]).toHaveBeenCalledWith(true);

      // Check final state
      expect(store.get()).toEqual({
        count: 42,
        name: "test",
        isActive: true,
      });
    });

    it("should handle subscriber addition and removal during notifications", () => {
      const initialCallback = jest.fn();
      const dynamicCallback = jest.fn();

      store.subscribe("count", initialCallback);

      // Add a new subscriber in response to a state change
      store.subscribe("count", () => {
        store.subscribe("count", dynamicCallback);
      });

      store.set("count", 1); // First set
      expect(initialCallback).toHaveBeenCalledTimes(1);
      expect(dynamicCallback).not.toHaveBeenCalled();

      store.set("count", 2); // Second set
      expect(initialCallback).toHaveBeenCalledTimes(2);
      expect(dynamicCallback).toHaveBeenCalledTimes(1); // Called now that it's subscribed
    });

    it("should handle rapid state changes", () => {
      const callback = jest.fn();
      store.subscribe("count", callback);

      // Rapid state changes
      for (let i = 0; i < 100; i++) {
        store.set("count", i);
      }

      expect(callback).toHaveBeenCalledTimes(100);
      expect(callback).toHaveBeenLastCalledWith(99);
    });

    it("should handle state with TypeScript generic typing", () => {
      interface CustomState {
        user: { name: string; age: number };
        settings: { theme: string };
      }

      const customStore = new StateStore<CustomState>();

      customStore.set("user", { name: "John", age: 30 });
      customStore.set("settings", { theme: "dark" });

      expect(customStore.get()).toEqual({
        user: { name: "John", age: 30 },
        settings: { theme: "dark" },
      });

      const userCallback = jest.fn();
      customStore.subscribe("user", userCallback);

      customStore.set("user", { name: "Jane", age: 25 });
      expect(userCallback).toHaveBeenCalledWith({ name: "Jane", age: 25 });
    });

    it("should handle state with optional properties", () => {
      interface StateWithOptional {
        required: string;
        optional?: number;
      }

      const optionalStore = new StateStore<StateWithOptional>();

      optionalStore.set("required", "test");
      expect(optionalStore.get()).toEqual({ required: "test" });

      optionalStore.set("optional", 42);
      expect(optionalStore.get()).toEqual({ required: "test", optional: 42 });
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined state values", () => {
      const callback = jest.fn();
      store.subscribe("count", callback);

      store.set("count", undefined);
      expect(callback).toHaveBeenCalledWith(undefined);
      expect(store.get("count")).toBeUndefined();
    });

    it("should handle null values", () => {
      interface StateWithNullable {
        value: string | null;
      }

      const nullableStore = new StateStore<StateWithNullable>();
      const callback = jest.fn();

      nullableStore.subscribe("value", callback);
      nullableStore.set("value", null);

      expect(callback).toHaveBeenCalledWith(null);
      expect(nullableStore.get("value")).toBeNull();
    });

    it("should handle get for non-existent keys", () => {
      expect(store.get("count")).toBeUndefined();
      expect(store.get("name")).toBeUndefined();
      expect(store.get("isActive")).toBeUndefined();
    });

    it("should handle unsubscribe for non-existent listeners", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      const unsubscribe1 = store.subscribe("count", callback1);

      // Try to unsubscribe a listener that was never added
      expect(() => store.unsubscribe("count", callback2)).not.toThrow();

      unsubscribe1();
      store.set("count", 42);
      expect(callback1).not.toHaveBeenCalled();
    });
  });
});
