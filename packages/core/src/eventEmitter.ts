import { once } from "./function";
import { AnyFunction } from "@utilslib/types";

/**
 * 一个简单的事件发射器类，用于实现发布-订阅模式
 */
export class EventEmitter<T extends string> {
  /** 存储所有事件及其对应的监听函数 */
  private events: Map<T, AnyFunction[]>;

  constructor() {
    this.events = new Map();
  }

  /**
   * 为指定事件添加监听器
   * @param {string} eventName - 要监听的事件名称
   * @param {Function} callback - 事件触发时要调用的回调函数
   * @returns {Function} 返回一个用于取消订阅的函数
   */
  on(eventName: T, callback: AnyFunction): () => void {
    const callbacks = this.events.get(eventName) ?? [];
    this.events.set(eventName, [...callbacks, callback]);
    return () => once(this.off.bind(this))(eventName, callback);
  }

  /**
   * 为指定事件添加一次性监听器，触发后自动移除
   * @param {string} eventName - 要监听的事件名称
   * @param {Function} callback - 事件触发时要调用的回调函数
   * @returns {Function} 返回一个用于取消订阅的函数
   */
  once(eventName: T, callback: AnyFunction): () => void {
    const wrapper = (...args: any[]) => {
      callback(...args);
      this.off(eventName, wrapper);
    };
    return this.on(eventName, wrapper);
  }

  /**
   * 移除指定事件的特定监听器
   * @param {string} eventName - 事件名称
   * @param {Function} callback - 要移除的监听器函数
   */
  off(eventName: T, callback: AnyFunction): void {
    const callbacks = this.events.get(eventName);
    if (!callbacks) return;
    const index = callbacks.indexOf(callback);
    index !== -1 && callbacks.splice(index, 1);
    callbacks.length === 0 && this.events.delete(eventName);
  }

  /**
   * 移除指定事件的所有监听器，如果没有指定事件名称则移除所有事件的监听器
   * @param {string} [eventName] - 可选的事件名称
   */
  removeAllListeners(eventName?: T): void {
    if (eventName) {
      this.events.delete(eventName);
    } else {
      this.events.clear();
    }
  }

  /**
   * 触发指定事件，调用所有监听该事件的回调函数
   * @param {string} eventName - 要触发的事件名称
   * @param {...any} args - 传递给监听器的参数
   */
  emit(eventName: T, ...args: any[]): void {
    const callbacks = this.events.get(eventName);
    if (!callbacks) return;

    // 创建回调函数数组的副本，防止回调函数中的操作影响遍历
    const callbacksCopy = [...callbacks];

    callbacksCopy.forEach((callback) => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event handler for ${eventName}:`, error);
      }
    });
  }
}
