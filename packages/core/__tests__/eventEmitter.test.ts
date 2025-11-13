import { EventEmitter } from "../src/eventEmitter";

describe("EventEmitter", () => {
  let emitter: EventEmitter<string>;

  beforeEach(() => {
    emitter = new EventEmitter<string>();
  });

  describe("constructor", () => {
    it("should create instance with empty events", () => {
      const newEmitter = new EventEmitter<string>();
      // Events should be empty initially
      expect(newEmitter).toBeDefined();
    });
  });

  describe("on", () => {
    it("should add event listener", () => {
      const callback = jest.fn();
      const unsubscribe = emitter.on("test", callback);

      emitter.emit("test", "arg1", "arg2");
      expect(callback).toHaveBeenCalledWith("arg1", "arg2");
      expect(callback).toHaveBeenCalledTimes(1);

      // Test unsubscribe function
      unsubscribe();
      emitter.emit("test", "arg3");
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should return unsubscribe function", () => {
      const callback = jest.fn();
      const unsubscribe = emitter.on("test", callback);

      expect(typeof unsubscribe).toBe("function");

      unsubscribe();
      emitter.emit("test", "data");
      expect(callback).not.toHaveBeenCalled();
    });

    it("should allow multiple listeners for same event", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      emitter.on("test", callback1);
      emitter.on("test", callback2);

      emitter.emit("test", "data");
      expect(callback1).toHaveBeenCalledWith("data");
      expect(callback2).toHaveBeenCalledWith("data");
    });

    it("should handle different event types", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      emitter.on("event1", callback1);
      emitter.on("event2", callback2);

      emitter.emit("event1", "data1");
      emitter.emit("event2", "data2");

      expect(callback1).toHaveBeenCalledWith("data1");
      expect(callback2).toHaveBeenCalledWith("data2");
    });
  });

  describe("once", () => {
    it("should add one-time listener", () => {
      const callback = jest.fn();
      const unsubscribe = emitter.once("test", callback);

      emitter.emit("test", "arg1");
      emitter.emit("test", "arg2");

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith("arg1");
    });

    it("should return unsubscribe function", () => {
      const callback = jest.fn();
      const unsubscribe = emitter.once("test", callback);

      expect(typeof unsubscribe).toBe("function");

      unsubscribe();
      emitter.emit("test", "data");
      expect(callback).not.toHaveBeenCalled();
    });

    it("should work alongside regular listeners", () => {
      const onceCallback = jest.fn();
      const regularCallback = jest.fn();

      emitter.once("test", onceCallback);
      emitter.on("test", regularCallback);

      emitter.emit("test", "data1");
      emitter.emit("test", "data2");

      expect(onceCallback).toHaveBeenCalledTimes(1);
      expect(regularCallback).toHaveBeenCalledTimes(2);
    });

    it("should allow multiple once listeners for same event", () => {
      const onceCallback1 = jest.fn();
      const onceCallback2 = jest.fn();

      emitter.once("test", onceCallback1);
      emitter.once("test", onceCallback2);

      emitter.emit("test", "data");

      expect(onceCallback1).toHaveBeenCalledTimes(1);
      expect(onceCallback2).toHaveBeenCalledTimes(1);
    });
  });

  describe("off", () => {
    it("should remove specific listener", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      emitter.on("test", callback1);
      emitter.on("test", callback2);

      emitter.off("test", callback1);
      emitter.emit("test", "data");

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith("data");
    });

    it("should not affect other event listeners", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      emitter.on("event1", callback1);
      emitter.on("event2", callback2);

      emitter.off("event1", callback1);
      emitter.emit("event1", "data1");
      emitter.emit("event2", "data2");

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith("data2");
    });

    it("should handle removing non-existent listener gracefully", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      emitter.on("test", callback1);

      // Try to remove callback that was never added
      expect(() => emitter.off("test", callback2)).not.toThrow();

      emitter.emit("test", "data");
      expect(callback1).toHaveBeenCalledWith("data");
    });

    it("should handle removing from non-existent event gracefully", () => {
      const callback = jest.fn();

      expect(() => emitter.off("nonexistent", callback)).not.toThrow();
    });
  });

  describe("removeAllListeners", () => {
    it("should remove all listeners for specific event", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      emitter.on("event1", callback1);
      emitter.on("event1", callback2);
      emitter.on("event2", callback3);

      emitter.removeAllListeners("event1");

      emitter.emit("event1", "data1");
      emitter.emit("event2", "data2");

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
      expect(callback3).toHaveBeenCalledWith("data2");
    });

    it("should remove all listeners when no event specified", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      emitter.on("event1", callback1);
      emitter.on("event2", callback2);
      emitter.on("event3", callback3);

      emitter.removeAllListeners();

      emitter.emit("event1", "data1");
      emitter.emit("event2", "data2");
      emitter.emit("event3", "data3");

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
      expect(callback3).not.toHaveBeenCalled();
    });

    it("should handle removing from non-existent event gracefully", () => {
      expect(() => emitter.removeAllListeners("nonexistent")).not.toThrow();
    });
  });

  describe("emit", () => {
    it("should call all listeners with provided arguments", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      emitter.on("test", callback1);
      emitter.on("test", callback2);

      emitter.emit("test", "arg1", "arg2", "arg3");

      expect(callback1).toHaveBeenCalledWith("arg1", "arg2", "arg3");
      expect(callback2).toHaveBeenCalledWith("arg1", "arg2", "arg3");
    });

    it("should handle emit to non-existent event gracefully", () => {
      expect(() => emitter.emit("nonexistent", "data")).not.toThrow();
    });

    it("should call listeners in order they were added", () => {
      const calls: string[] = [];
      const callback1 = () => calls.push("first");
      const callback2 = () => calls.push("second");
      const callback3 = () => calls.push("third");

      emitter.on("test", callback1);
      emitter.on("test", callback2);
      emitter.on("test", callback3);

      emitter.emit("test");

      expect(calls).toEqual(["first", "second", "third"]);
    });

    it("should handle errors in individual listeners without affecting others", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const errorCallback = jest.fn(() => {
        throw new Error("Listener error");
      });
      const normalCallback = jest.fn();

      emitter.on("test", errorCallback);
      emitter.on("test", normalCallback);

      emitter.emit("test", "data");

      expect(normalCallback).toHaveBeenCalledWith("data");
      expect(consoleSpy).toHaveBeenCalledWith("Error in event handler for test:", expect.any(Error));

      consoleSpy.mockRestore();
    });

    it("should handle synchronous listener errors gracefully", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const syncErrorCallback = jest.fn(() => {
        throw new Error("Sync error");
      });

      emitter.on("test", syncErrorCallback);

      expect(() => emitter.emit("test")).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should handle zero arguments", () => {
      const callback = jest.fn();
      emitter.on("test", callback);

      emitter.emit("test");

      expect(callback).toHaveBeenCalledWith();
    });

    it("should work with multiple arguments of different types", () => {
      const callback = jest.fn();
      emitter.on("test", callback);

      const arg1 = "string";
      const arg2 = 123;
      const arg3 = { obj: true };
      const arg4 = [1, 2, 3];
      const arg5 = null;
      const arg6 = undefined;

      emitter.emit("test", arg1, arg2, arg3, arg4, arg5, arg6);

      expect(callback).toHaveBeenCalledWith(arg1, arg2, arg3, arg4, arg5, arg6);
    });
  });

  describe("Integration Tests", () => {
    it("should handle complex listener management scenarios", () => {
      const callbacks = Array.from({ length: 5 }, () => jest.fn());

      // Add multiple listeners
      callbacks.forEach((callback, index) => {
        emitter.on("test", callback);
      });

      // Emit event
      emitter.emit("test", "data1");
      callbacks.forEach((callback) => {
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith("data1");
      });

      // Remove one listener
      emitter.off("test", callbacks[2]);

      emitter.emit("test", "data2");
      expect(callbacks[0]).toHaveBeenCalledTimes(2);
      expect(callbacks[1]).toHaveBeenCalledTimes(2);
      expect(callbacks[2]).toHaveBeenCalledTimes(1); // Was removed
      expect(callbacks[3]).toHaveBeenCalledTimes(2);
      expect(callbacks[4]).toHaveBeenCalledTimes(2);
    });

    it("should handle once listeners removal during emit", () => {
      const onceCallback = jest.fn();
      const regularCallback = jest.fn();

      emitter.once("test", onceCallback);
      emitter.on("test", regularCallback);

      // Once listener should remove itself after first emit
      emitter.emit("test", "data1");
      emitter.emit("test", "data2");

      expect(onceCallback).toHaveBeenCalledTimes(1);
      expect(regularCallback).toHaveBeenCalledTimes(2);
    });

    it("should handle unsubscribe during emit", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const unsubscribe = emitter.on("test", callback1);
      emitter.on("test", () => {
        callback2();
        unsubscribe(); // Remove this listener during execution
      });

      emitter.emit("test", "data1");
      emitter.emit("test", "data2");

      expect(callback1).toHaveBeenCalledTimes(2); // Should be called both times
      expect(callback2).toHaveBeenCalledTimes(1); // Should be called only once
    });
  });

  describe("Error Handling", () => {
    it("should handle all types of listener errors gracefully", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const syncError = jest.fn(() => {
        throw new Error("Sync error");
      });

      const normalCallback = jest.fn();

      emitter.on("test", syncError);
      emitter.on("test", normalCallback);

      emitter.emit("test", "data");

      expect(normalCallback).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith("Error in event handler for test:", expect.any(Error));

      consoleSpy.mockRestore();
    });

    it("should handle errors in unsubscribe functions gracefully", () => {
      const callback = jest.fn();
      const unsubscribe = emitter.on("test", callback);

      // Unsubscribe should not throw even if called multiple times
      expect(() => unsubscribe()).not.toThrow();
      expect(() => unsubscribe()).not.toThrow();

      emitter.emit("test", "data");
      expect(callback).not.toHaveBeenCalled();
    });
  });
});
