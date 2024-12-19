import { isObject } from "./is";

/**
 * 递归处理对象，应用回调函数并处理子节点。
 *
 * @template T - 对象的类型
 * @template K - 子节点键的类型
 * @param {T} obj - 要处理的对象
 * @param {K} childrenKey - 指定子节点的键
 * @param {(item: T) => T} cb - 应用到对象的回调函数
 * @returns {any} 处理后的对象
 */
export function recursionHandler<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  childrenKey: K,
  cb: (item: T) => T
): any {
  const _obj = cb(obj);

  if (isObject(_obj)) {
    const result = { ..._obj };
    if (result.hasOwnProperty(childrenKey)) {
      result[childrenKey] = recursionHandler(result[childrenKey], childrenKey, cb);
    }
    return result;
  }

  return _obj;
}
