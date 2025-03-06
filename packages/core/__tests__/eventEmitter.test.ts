/// <reference types="jest" />

import { EventEmitter } from "../src/eventEmitter.js";

describe("EventEmitter 测试", () => {
  let eventEmitter: EventEmitter<string>;

  beforeEach(() => {
    eventEmitter = new EventEmitter<string>();
  });

  describe("on 方法", () => {
    test("应该能够添加事件监听器", () => {
      const callback = jest.fn();
      eventEmitter.on("test", callback);
      eventEmitter.emit("test");
      expect(callback).toHaveBeenCalledTimes(1);
    });

    test("同一事件可以添加多个监听器", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      eventEmitter.on("test", callback1);
      eventEmitter.on("test", callback2);
      eventEmitter.emit("test");
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    test("不同事件的监听器应该被独立调用", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      eventEmitter.on("test1", callback1);
      eventEmitter.on("test2", callback2);
      eventEmitter.emit("test1");
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).not.toHaveBeenCalled();
    });

    test("返回的函数应该能够取消订阅", () => {
      const callback = jest.fn();
      const unsubscribe = eventEmitter.on("test", callback);
      unsubscribe();
      eventEmitter.emit("test");
      expect(callback).not.toHaveBeenCalled();
    });

    test("取消订阅函数应该是幂等的", () => {
      const callback = jest.fn();
      const unsubscribe = eventEmitter.on("test", callback);
      unsubscribe();
      unsubscribe(); // 第二次调用不应该有副作用
      eventEmitter.emit("test");
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("once 方法", () => {
    test("监听器应该只被调用一次", () => {
      const callback = jest.fn();
      eventEmitter.once("test", callback);
      eventEmitter.emit("test");
      eventEmitter.emit("test");
      expect(callback).toHaveBeenCalledTimes(1);
    });

    test("返回的函数应该能够在触发前取消订阅", () => {
      const callback = jest.fn();
      const unsubscribe = eventEmitter.once("test", callback);
      unsubscribe();
      eventEmitter.emit("test");
      expect(callback).not.toHaveBeenCalled();
    });

    test("多个once监听器应该独立工作", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      eventEmitter.once("test", callback1);
      eventEmitter.once("test", callback2);
      eventEmitter.emit("test");
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });
  });

  describe("off 方法", () => {
    test("应该能够移除特定监听器", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      eventEmitter.on("test", callback1);
      eventEmitter.on("test", callback2);
      eventEmitter.off("test", callback1);
      eventEmitter.emit("test");
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    test("移除不存在的监听器不应抛出错误", () => {
      const callback = jest.fn();
      expect(() => {
        eventEmitter.off("test", callback);
      }).not.toThrow();
    });

    test("移除不存在的事件不应抛出错误", () => {
      const callback = jest.fn();
      expect(() => {
        eventEmitter.off("nonexistent", callback);
      }).not.toThrow();
    });

    test("移除最后一个监听器应该清理事件", () => {
      const callback = jest.fn();
      eventEmitter.on("test", callback);
      eventEmitter.off("test", callback);
      // 内部实现细节，但我们可以通过添加新的监听器并检查它是否是第一个来间接测试
      const newCallback = jest.fn();
      eventEmitter.on("test", newCallback);
      eventEmitter.emit("test");
      expect(newCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe("removeAllListeners 方法", () => {
    test("应该移除指定事件的所有监听器", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      eventEmitter.on("test", callback1);
      eventEmitter.on("test", callback2);
      eventEmitter.removeAllListeners("test");
      eventEmitter.emit("test");
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });

    test("不应影响其他事件的监听器", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      eventEmitter.on("test1", callback1);
      eventEmitter.on("test2", callback2);
      eventEmitter.removeAllListeners("test1");
      eventEmitter.emit("test1");
      eventEmitter.emit("test2");
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    test("不传参数应移除所有事件的所有监听器", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      eventEmitter.on("test1", callback1);
      eventEmitter.on("test2", callback2);
      eventEmitter.removeAllListeners();
      eventEmitter.emit("test1");
      eventEmitter.emit("test2");
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });
  });

  describe("emit 方法", () => {
    test("应该调用所有注册的监听器", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      eventEmitter.on("test", callback1);
      eventEmitter.on("test", callback2);
      eventEmitter.emit("test");
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    test("应该传递所有参数给监听器", () => {
      const callback = jest.fn();
      eventEmitter.on("test", callback);
      eventEmitter.emit("test", "arg1", 123, { key: "value" });
      expect(callback).toHaveBeenCalledWith("arg1", 123, { key: "value" });
    });

    test("触发不存在的事件不应抛出错误", () => {
      expect(() => {
        eventEmitter.emit("nonexistent");
      }).not.toThrow();
    });

    test("一个监听器抛出错误不应影响其他监听器", () => {
      const errorCallback = jest.fn().mockImplementation(() => {
        throw new Error("Test error");
      });
      const normalCallback = jest.fn();

      // 模拟console.error以避免测试输出错误信息
      const originalConsoleError = console.error;
      console.error = jest.fn();

      eventEmitter.on("test", errorCallback);
      eventEmitter.on("test", normalCallback);

      eventEmitter.emit("test");

      expect(errorCallback).toHaveBeenCalledTimes(1);
      expect(normalCallback).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalled();

      // 恢复原始console.error
      console.error = originalConsoleError;
    });
  });
});
