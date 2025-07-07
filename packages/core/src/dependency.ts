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
 *
 * @example
 * ```typescript
 * const depManager = new DependencyManager();
 * const wrappedInit = depManager.wrap('init', initFunction);
 * const wrappedLogin = depManager.require(['init'], loginFunction);
 * ```
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
   * 包装依赖函数，执行后自动标记依赖完成
   *
   * @template T - 函数参数类型数组
   * @template R - 函数返回值类型
   * @param {string} depName - 依赖名称，用于标识该依赖
   * @param {AnyFunction} fn - 要包装的原始函数
   * @returns {AsyncFunction<T, R>} 包装后的异步函数，执行完成后会自动标记依赖完成
   *
   * @example
   * ```typescript
   * const wrappedInit = depManager.wrap('database-init', async () => {
   *   await connectToDatabase();
   *   return 'connected';
   * });
   * ```
   */
  wrap<T extends any[] = any[], R = any>(depName: string, fn: AnyFunction): AsyncFunction<T, R> {
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
   * 包装需要依赖的函数，执行前等待指定依赖完成
   *
   * @template T - 函数参数类型数组
   * @template R - 函数返回值类型
   * @param {string | string[]} requiredDeps - 需要等待的依赖名称或依赖名称数组
   * @param {AnyFunction} fn - 要包装的原始函数
   * @param {DependencyOptions} [options={}] - 配置选项
   * @returns {AsyncFunction<T, R>} 包装后的异步函数，会在依赖满足后执行
   *
   * @example
   * ```typescript
   * const wrappedLogin = depManager.require(['auth-init', 'db-init'], loginUser, {
   *   timeout: 10000
   * });
   * ```
   */
  require<T extends any[] = any[], R = any>(
    requiredDeps: string | string[],
    fn: AnyFunction,
    options: DependencyOptions = {},
  ): AsyncFunction<T, R> {
    const deps = toArray(requiredDeps);

    deps.forEach((dep) => this._register(dep));

    return async (...args: T): Promise<R> => {
      await this._waitForAll(deps, options.timeout);
      return await fn(...args);
    };
  }

  /**
   * 检查指定依赖是否已完成
   *
   * @param {string} depName - 依赖名称
   * @returns {boolean} 如果依赖已完成返回true，否则返回false
   *
   * @example
   * ```typescript
   * if (depManager.isComplete('database-init')) {
   *   console.log('数据库初始化已完成');
   * }
   * ```
   */
  isComplete(depName: string): boolean {
    return this.dependencies.get(depName) === true;
  }

  /**
   * 手动标记依赖完成（用于非函数依赖或外部触发）
   *
   * @param {string} depName - 要标记完成的依赖名称
   * @returns {DependencyManager} 返回当前实例，支持链式调用
   *
   * @example
   * ```typescript
   * depManager.complete('manual-step').complete('another-step');
   * ```
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
   *
   * @example
   * ```typescript
   * await depManager.waitFor(['init1', 'init2'], 5000);
   * console.log('所有初始化完成');
   * ```
   */
  async waitFor(deps: string | string[], timeout?: number): Promise<void> {
    const depArray = Array.isArray(deps) ? deps : [deps];
    return this._waitForAll(depArray, timeout);
  }

  /**
   * 获取所有依赖的当前状态
   *
   * @returns {DependencyStatus} 包含所有依赖名称和完成状态的对象
   *
   * @example
   * ```typescript
   * const status = depManager.getStatus();
   * console.log(status); // { 'init1': true, 'init2': false }
   * ```
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
   *
   * @example
   * ```typescript
   * depManager.reset();
   * console.log(depManager.getStatus()); // {}
   * ```
   */
  reset(): DependencyManager {
    this.dependencies.clear();
    this.resolvers.clear();
    return this;
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
