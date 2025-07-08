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

type UnpackPromise<T> = T extends Promise<infer U> ? U : T;

/**
 * 通用错误捕获函数，用于执行可能会抛出异常的函数，并捕获异常信息。
 *
 * @type {<F extends AnyFunction, R = UnpackPromise<ReturnType<F>>>(
 *   this: unknown,
 *   fn: F
 * ) => Promise<[0, R, null] | [1, null, unknown]>}
 * @param {F} fn - 可能会抛出异常的函数。
 * @returns {Promise<[0, R, null] | [1, null, unknown]>} 返回一个元组，包含错误标识、函数执行结果或 null 、异常信息或 null。
 */
export async function catchError<F extends AnyFunction, R = UnpackPromise<ReturnType<F>>>(
  this: unknown,
  fn: F,
  ...args: Parameters<F>
): Promise<[0, R, null] | [1, null, unknown]> {
  let data: R | null;
  let err: 0 | 1;
  let errMsg: unknown | null;

  try {
    data = await fn.apply(this, args);
    err = 0;
    errMsg = null;
    return [err, data as R, errMsg as null];
  } catch (error) {
    data = null;
    err = 1;
    errMsg = error;
    return [err, data, errMsg];
  }
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
