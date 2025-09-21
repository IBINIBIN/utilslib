import { AnyFunction } from "@utilslib/types";
import { toArray } from "./array";

/**
 * 函数包装式依赖管理器选项接口
 */
interface DependencyOptions {
  /** 超时时间（毫秒） */
  timeout?: number;
}

/**
 * 依赖状态类型
 */
type DependencyStatus = Record<string, boolean>;

/**
 * 异步函数类型
 */
type AsyncFunction<T extends any[] = any[], R = any> = (...args: T) => Promise<R>;

/**
 * 函数包装式依赖管理器
 * 通过包装函数的方式管理依赖关系，确保在执行某个操作前所需的依赖都已完成
 */
export class DependencyManager {
  /**
   * 存储依赖状态的Map
   * @private
   */
  private readonly dependencies: Map<string, boolean>;

  /**
   * 存储依赖完成的Promise resolve函数的Map
   * @private
   */
  private readonly resolvers: Map<string, () => void>;

  /**
   * 创建依赖管理器实例
   */
  constructor() {
    this.dependencies = new Map<string, boolean>();
    this.resolvers = new Map<string, () => void>();
  }

  /**
   * 创建依赖提供者函数，执行后自动标记依赖完成
   *
   * @template T - 函数参数类型数组
   * @template R - 函数返回值类型
   * @param {string} depName - 依赖名称，用于标识该依赖
   * @param {AnyFunction} fn - 要包装的原始函数
   * @returns {AsyncFunction<T, R>} 包装后的异步函数，执行完成后会自动标记依赖完成
   */
  createProvider<T extends any[] = any[], R = any>(depName: string, fn: AnyFunction): AsyncFunction<T, R> {
    return this._createProviderWrapper(depName, fn);
  }

  /**
   * 立即执行依赖提供者函数，执行后自动标记依赖完成
   *
   * @template T - 函数参数类型数组
   * @template R - 函数返回值类型
   * @param {string} depName - 依赖名称，用于标识该依赖
   * @param {AnyFunction} fn - 要执行的原始函数
   * @param {...T} args - 函数参数
   * @returns {Promise<R>} 函数执行结果，执行完成后会自动标记依赖完成
   */
  async provider<T extends any[] = any[], R = any>(depName: string, fn: AnyFunction, ...args: T): Promise<R> {
    const wrapper = this._createProviderWrapper<T, R>(depName, fn);
    return wrapper(...args);
  }

  /**
   * 创建等待依赖执行函数，执行前等待指定依赖完成
   *
   * @template T - 函数参数类型数组
   * @template R - 函数返回值类型
   * @param {string | string[]} requiredDeps - 需要等待的依赖名称或依赖名称数组
   * @param {AnyFunction} fn - 要包装的原始函数
   * @param {DependencyOptions} [options={}] - 配置选项
   * @returns {AsyncFunction<T, R>} 包装后的异步函数，会在依赖满足后执行
   */
  createAwaitDepExec<T extends any[] = any[], R = any>(
    requiredDeps: string | string[],
    fn: AnyFunction,
    options: DependencyOptions = {},
  ): AsyncFunction<T, R> {
    return this._createAwaitDepExecWrapper(requiredDeps, fn, options);
  }

  /**
   * 立即等待依赖并执行函数
   *
   * @template T - 函数参数类型数组
   * @template R - 函数返回值类型
   * @param {string | string[]} requiredDeps - 需要等待的依赖名称或依赖名称数组
   * @param {AnyFunction} fn - 要执行的原始函数
   * @param {DependencyOptions} options - 配置选项
   * @param {...T} args - 函数参数
   * @returns {Promise<R>} 函数执行结果，会在依赖满足后执行
   */
  async awaitDepExec<T extends any[] = any[], R = any>(
    requiredDeps: string | string[],
    fn: AnyFunction,
    options: DependencyOptions,
    ...args: T
  ): Promise<R>;
  async awaitDepExec<T extends any[] = any[], R = any>(
    requiredDeps: string | string[],
    fn: AnyFunction,
    ...args: T
  ): Promise<R>;
  async awaitDepExec<T extends any[] = any[], R = any>(
    requiredDeps: string | string[],
    fn: AnyFunction,
    optionsOrFirstArg?: DependencyOptions | T[0],
    ...restArgs: T extends [any, ...infer Rest] ? Rest : never[]
  ): Promise<R> {
    let options: DependencyOptions = {};
    let args: T;

    // 判断第三个参数是否为选项对象
    if (
      optionsOrFirstArg !== undefined &&
      typeof optionsOrFirstArg === "object" &&
      optionsOrFirstArg !== null &&
      "timeout" in optionsOrFirstArg
    ) {
      options = optionsOrFirstArg as DependencyOptions;
      args = restArgs as unknown as T;
    } else {
      args = [optionsOrFirstArg, ...restArgs] as T;
    }

    const wrapper = this._createAwaitDepExecWrapper<T, R>(requiredDeps, fn, options);
    return wrapper(...args);
  }

  /**
   * 检查指定依赖是否已完成
   *
   * @param {string} depName - 依赖名称
   * @returns {boolean} 如果依赖已完成返回true，否则返回false
   */
  isComplete(depName: string): boolean {
    return this.dependencies.get(depName) === true;
  }

  /**
   * 手动标记依赖完成（用于非函数依赖或外部触发）
   *
   * @param {string} depName - 要标记完成的依赖名称
   * @returns {DependencyManager} 返回当前实例，支持链式调用
   */
  complete(depName: string): DependencyManager {
    this._complete(depName);
    return this;
  }

  /**
   * 等待指定依赖完成
   *
   * @param {string | string[]} deps - 要等待的依赖名称或依赖名称数组
   * @param {number} [timeout] - 可选的超时时间（毫秒）
   * @returns {Promise<void>} 当所有指定依赖完成时resolve的Promise
   * @throws {Error} 当超时时抛出错误
   */
  async waitFor(deps: string | string[], timeout?: number): Promise<void> {
    const depArray = Array.isArray(deps) ? deps : [deps];
    return this._waitForAll(depArray, timeout);
  }

  /**
   * 获取所有依赖的当前状态
   *
   * @returns {DependencyStatus} 包含所有依赖名称和完成状态的对象
   */
  getStatus(): DependencyStatus {
    const status: DependencyStatus = {};
    for (const [key, value] of this.dependencies.entries()) {
      if (!key.endsWith("_promise")) {
        status[key] = value;
      }
    }
    return status;
  }

  /**
   * 重置所有依赖状态，清空所有已注册的依赖
   *
   * @returns {DependencyManager} 返回当前实例，支持链式调用
   */
  reset(): DependencyManager {
    this.dependencies.clear();
    this.resolvers.clear();
    return this;
  }

  /**
   * 创建依赖提供者包装函数的通用逻辑
   *
   * @private
   * @template T - 函数参数类型数组
   * @template R - 函数返回值类型
   * @param {string} depName - 依赖名称
   * @param {AnyFunction} fn - 要包装的原始函数
   * @returns {AsyncFunction<T, R>} 包装后的异步函数
   */
  private _createProviderWrapper<T extends any[] = any[], R = any>(
    depName: string,
    fn: AnyFunction,
  ): AsyncFunction<T, R> {
    this._register(depName);

    return async (...args: T): Promise<R> => {
      try {
        const result = await fn(...args);
        this._complete(depName);
        return result;
      } catch (error) {
        this._complete(depName);
        throw error;
      }
    };
  }

  /**
   * 创建等待依赖执行包装函数的通用逻辑
   *
   * @private
   * @template T - 函数参数类型数组
   * @template R - 函数返回值类型
   * @param {string | string[]} requiredDeps - 需要等待的依赖名称或依赖名称数组
   * @param {AnyFunction} fn - 要包装的原始函数
   * @param {DependencyOptions} options - 配置选项
   * @returns {AsyncFunction<T, R>} 包装后的异步函数
   */
  private _createAwaitDepExecWrapper<T extends any[] = any[], R = any>(
    requiredDeps: string | string[],
    fn: AnyFunction,
    options: DependencyOptions,
  ): AsyncFunction<T, R> {
    const deps = toArray(requiredDeps);
    deps.forEach((dep) => this._register(dep));

    return async (...args: T): Promise<R> => {
      await this._waitForAll(deps, options.timeout);
      return await fn(...args);
    };
  }

  /**
   * 注册一个依赖项到管理器中
   *
   * @private
   * @param {string} depName - 要注册的依赖名称
   */
  private _register(depName: string): void {
    if (this.dependencies.has(depName)) return;

    this.dependencies.set(depName, false);
    const promise = new Promise<void>((resolve) => {
      this.resolvers.set(depName, resolve);
    });

    this.dependencies.set(`${depName}_promise`, promise as any);
  }

  /**
   * 标记指定依赖为已完成状态
   *
   * @private
   * @param {string} depName - 要标记完成的依赖名称
   */
  private _complete(depName: string): void {
    if (!this.dependencies.has(depName)) return;
    this.dependencies.set(depName, true);
    const resolver = this.resolvers.get(depName);
    if (resolver) {
      resolver();
      this.resolvers.delete(depName);
    }
  }

  /**
   * 等待所有指定的依赖完成
   *
   * @private
   * @param {string[]} deps - 要等待的依赖名称数组
   * @param {number} [timeout] - 可选的超时时间（毫秒）
   * @returns {Promise<void>} 当所有依赖完成时resolve的Promise
   * @throws {Error} 当超时时抛出错误
   */
  private async _waitForAll(deps: string[], timeout?: number): Promise<void> {
    const promises = deps.map((dep) => {
      if (this.isComplete(dep)) {
        return Promise.resolve();
      }
      return this.dependencies.get(`${dep}_promise`);
    });

    const waitPromise = Promise.all(promises);

    if (timeout) {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`依赖等待超时 (${timeout}ms)`));
        }, timeout);
      });

      await Promise.race([waitPromise, timeoutPromise]);
    } else {
      await waitPromise;
    }
  }
}
