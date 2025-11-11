import { AnyFunction } from "@utilslib/types";

/**
 * 空函数，用于占位符，不执行任何操作
 */
export const NOOP = () => {};

/**
 * 确保传入的方法只能被执行一次
 *
 * @param {(...args: any) => any} func - 要执行的方法。
 * @returns {(...args: any) => any} 返回一个新的方法，该方法只会执行一次
 */
export function once<F extends AnyFunction>(fn: F) {
  // 利用闭包判断函数是否执行过
  let called = false;
  return function (this: unknown, ...args: Parameters<F>) {
    if (!called) {
      called = true;
      return fn.apply(this, args);
    }
  };
}

/**
 * 通用错误捕获包装器，返回一个包装后的函数，该函数执行时会自动捕获异常。
 *
 * @param {F} fn - 需要包装的函数。
 * @returns 返回一个新函数，执行时返回元组：[错误标识, 结果或null, 异常或null]。
 */
export function catchError<F extends AnyFunction>(
  fn: F,
): (this: unknown, ...args: Parameters<F>) => Promise<[0, Awaited<ReturnType<F>>, null] | [1, null, unknown]> {
  return async function (this: unknown, ...args: Parameters<F>) {
    try {
      return [0, await fn.apply(this, args), null];
    } catch (error) {
      return [1, null, error];
    }
  };
}

/**
 * 创建一个可取消的倒计时执行器
 * @param {Function} callback - 倒计时结束后执行的回调函数
 * @param {number} delay - 倒计时时间（毫秒）
 * @returns {Function} - 返回一个取消函数
 */
export function createCancelableTimer(callback: AnyFunction, delay: number, onCancel: AnyFunction = NOOP) {
  let timer: number | null = setTimeout(callback, delay);
  return () => {
    if (!timer) return;
    clearTimeout(timer);
    timer = null;
    onCancel();
  };
}
