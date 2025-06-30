import { EventEmitter } from "@utilslib/core";

/*
 * 状态管理存储类
 * 用于管理应用状态并提供发布订阅功能
 */
export class StateStore<T extends Record<string, any> = Record<string, any>> {
  private state: T;
  private eventEmitter: EventEmitter<string>;

  constructor() {
    this.state = {} as T;
    this.eventEmitter = new EventEmitter<string>();
  }

  /**
   * 设置状态
   * @param {keyof T} key - 状态键名
   * @param {T[keyof T]} value - 状态值
   */
  set<K extends keyof T>(key: K, value: T[K]): void {
    this.state[key] = value;
    this.eventEmitter.emit(key as string, value);
  }

  /**
   * 获取状态
   * @param {keyof T | undefined} key - 状态键名，不传则返回整个状态对象
   * @returns {T[keyof T] | T} 对应键的状态值或整个状态对象
   */
  get<K extends keyof T>(key?: K): T[K] | T {
    return key ? this.state[key] : this.state;
  }

  /**
   * 订阅状态变化
   * @param {keyof T} key - 要订阅的状态键名
   * @param {(value: T[keyof T]) => void} callback - 状态变化时的回调函数
   * @returns {() => void} 取消订阅的函数
   */
  subscribe<K extends keyof T>(key: K, callback: (value: T[K]) => void): () => void {
    return this.eventEmitter.on(key as string, callback);
  }

  /**
   * 取消订阅
   * @param {keyof T} key - 要取消订阅的状态键名
   * @param {(value: T[keyof T]) => void} callback - 之前注册的回调函数
   */
  unsubscribe<K extends keyof T>(key: K, callback: (value: T[K]) => void): void {
    this.eventEmitter.off(key as string, callback);
  }

  /**
   * 通知所有监听者
   * @param {keyof T} key - 要通知的状态键名
   * @param {T[keyof T]} value - 要传递的值
   */
  notify<K extends keyof T>(key: K, value: T[K]): void {
    this.eventEmitter.emit(key as string, value);
  }

  /**
   * 清空状态
   */
  clear(): void {
    this.state = {} as T;
    this.eventEmitter.removeAllListeners();
  }
}
