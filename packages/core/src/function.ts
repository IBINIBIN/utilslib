/**
 * 确保传入的方法只能被执行一次
 *
 * @param func - 要执行的方法。
 * @returns 返回一个新的方法，该方法只会执行一次
 */
export function once(fn: Function) {
  // 利用闭包判断函数是否执行过
  let called = false;
  return function (this: unknown) {
    if (!called) {
      called = true;
      return fn.apply(this, arguments);
    }
  };
}

/**
 * 通用错误捕获函数，用于执行可能会抛出异常的函数，并捕获异常信息。
 *
 * @param fn - 可能会抛出异常的函数。
 * @returns 返回一个元组，包含错误标识、函数执行结果或 null 、异常信息或 null。 
 */
export async function catchError<F extends (...args: any) => any>(
  this: unknown,
  fn: F
): Promise<[0, ReturnType<F>, null] | [1, null, unknown]> {
  let data;
  let err: 0 | 1 = 1;
  let errMsg = null;

  try {
    data = await fn.apply(this, arguments);
  } catch (error) {
    data = null;
    err = 1;
    errMsg = error;
  }
  return [err, data, errMsg];
}

/**
export function retry(fn: Function, retryCount: number = 0) {
  return function (this: unknown) {
    fn.apply(this, arguments);
  };
}
 */