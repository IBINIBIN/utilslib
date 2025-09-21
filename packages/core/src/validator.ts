import { isString, isObject, isNull } from "./type";
import { getArrayIntersection, getArraySubset } from "./array";

/**
 * 检查一个值是否为 `undefined` 或 `null`。
 *
 * @param {unknown} value - 要检查的值。
 * @returns {value is undefined | null} 如果值为 `undefined` 或 `null`，则返回 `true`，否则返回 `false`。
 */
export function isNullOrUndefined(value: unknown): value is undefined | null {
  return value === undefined || value === null;
}

/**
 * 检查一个值是否不为 `undefined` 或 `null`。
 *
 * @param {T} value - 要检查的值。
 * @returns {value is NonNullable<T>} 如果值不为 `undefined` 或 `null`，则返回 `true`，否则返回 `false`。
 */
export function isNotNullOrUndefined<T>(value: T): value is NonNullable<T> {
  return !isNullOrUndefined(value);
}

/**
 * 检查一个值是否为空字符串。
 *
 * @param {unknown} value - 要检查的值。
 * @returns {value is ""} 如果值为空字符串，则返回 true，否则返回 false。
 */
export function isEmptyString(value: unknown): value is "" {
  return isString(value) && value.length === 0;
}

/**
 * 检查一个值是否为非空字符串。
 *
 * @param {unknown} value - 要检查的值。
 * @returns {value is string} 如果值为非空字符串，则返回 true，否则返回 false。
 */
export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.length > 0;
}

/**
 * 检查一个值是否为空对象。
 *
 * @param {unknown} value - 要检查的值。
 * @returns {value is object} 如果值为空对象，则返回 true，否则返回 false。
 */
export function isEmptyObject(value: unknown): value is object {
  return isObject(value) && !isNull(value) && Object.keys(value).length === 0;
}

/**
 * 检查一个值是否为非空对象。
 *
 * @param {unknown} value - 要检查的值。
 * @returns {value is object} 如果值有最少一个可枚举属性，则返回 true，否则返回 false。
 */
export function isNonEmptyObject(value: unknown): value is object {
  return isObject(value) && Object.keys(value).length > 0;
}

/**
 * 检查一个值是否为空数组。
 *
 * @param {unknown} value - 要检查的值。
 * @returns {value is any[]} 如果值为空数组，则返回 true，否则返回 false。
 */
export function isEmptyArray(value: unknown): value is any[] {
  return Array.isArray(value) && value.length === 0;
}

/**
 * 检查一个值是否为非空数组。
 *
 * @param {unknown} value - 要检查的值。
 * @returns {value is any[]} 如果值为非空数组，则返回 true，否则返回 false。
 */
export function isNonEmptyArray(value: unknown): value is any[] {
  return Array.isArray(value) && value.length > 0;
}

/**
 * 检查一个值是否为空。
 * 注: 目前只支持检测部分类型 「undefined,null,string,array,object」
 * @param {unknown} value - 要检查的值。
 * @returns {value is undefined | null | [] | ""} 如果值为空，则返回 true，否则返回 false。
 */
export function isEmpty(value: unknown): value is undefined | null | [] | "" {
  return isNullOrUndefined(value) || !(isNonEmptyArray(value) || isNonEmptyObject(value) || isNonEmptyString(value));
}

/**
 * 检查指定目标是否在选项中（可以是单个或数组）。
 *
 * @param {T} target - 目标项。
 * @param {(T | T[])[]} options - 选项，可以是单个或数组。
 * @returns {boolean} 若目标项在选项中，则返回 true；否则返回 false。
 */
export function isTargetInOptions<T>(target: T, ...options: (T | T[])[]): boolean {
  return options.some((option) => {
    if (Array.isArray(option)) {
      return option.some((item) => target === item);
    }
    return target === option;
  });
}

/**
 * (A∩B) 判断两个数组是否存在交集
 *
 * @template T - 数组元素类型
 * @template K - 用于判断的属性键名类型
 * @param {T[]} A - 第一个数组
 * @param {T[]} B - 第二个数组
 * @param {K} [key] - 可选的用于判断的属性键名
 * @returns {boolean} 如果存在交集，则返回 true，否则返回 false。
 */
export function isNonEmptyIntersection(...args: Parameters<typeof getArrayIntersection>): boolean {
  const [A, B, key] = args;
  return Boolean(getArrayIntersection(A, B, key).length);
}

/**
 * (A⊆U) 判断A是否为U的子集
 *
 * @template T - 数组元素类型
 * @template K - 用于判断的属性键名类型
 * @param {T[]} A - 待判断的子集数组
 * @param {T[]} B - 全集数组
 * @param {K} [key] - 可选的用于判断的属性键名
 * @returns {boolean} 如果A是U的子集，则返回 true，否则返回 false。
 */
export function isSubset(...args: Parameters<typeof getArraySubset>): boolean {
  const [A, B, key] = args;
  return Boolean(getArraySubset(A, B, key).length);
}

/**
 * 检查指定目标是否包含选项中的任一内容（选项可以是单个或数组）。
 * 使用 includes 方法进行部分匹配检查。
 *
 * @param {string} target - 目标字符串。
 * @param {(string | string[])[]} options - 选项，可以是单个字符串或字符串数组。
 * @returns {boolean} 若目标字符串包含任一选项内容，则返回 true；否则返回 false。
 */
export function isTargetIncludingOptions<T extends string>(target: T, ...options: (T | T[])[]): boolean {
  return options.some((option) => {
    if (Array.isArray(option)) {
      return option.some((item) => target.includes(item));
    }
    return target.includes(option);
  });
}

/**
 * 检查选项中是否有任一内容包含指定目标（选项可以是单个字符串或字符串数组）。
 * 使用 includes 方法进行部分匹配检查。
 *
 * @param {string} target - 目标字符串。
 * @param {(string | string[])[]} options - 选项，可以是单个字符串或字符串数组。
 * @returns {boolean} 若任一选项内容包含目标字符串，则返回 true；否则返回 false。
 */
export function isTargetIncludedInOptions<T extends string>(target: T, ...options: (T | T[])[]): boolean {
  return options.some((option) => {
    if (Array.isArray(option)) {
      return option.some((item) => item.includes(target));
    }
    return option.includes(target);
  });
}
