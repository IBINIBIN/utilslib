// #region ====================== 类型检查方法 ======================

/**
 * 获取值的类型字符串。
 *
 * @param {unknown} value - 要获取类型的值。
 * @returns {string} 值的类型字符串。
 */
function getType(value: unknown): string {
  return Object.prototype.toString.call(value).slice(8, -1);
}

/**
 * 检查一个值是否为非undefined。
 * 注: 非「undefined」类型
 *
 * @param {T | undefined} value - 要检查的值。
 * @returns {value is T} 如果值不为 Undefined 类型，则返回 true，否则返回 false。
 */
export function isDef<T>(value: T | undefined): value is T {
  return typeof value !== "undefined";
}

/**
 * 检查一个值是否为 Undefined 类型。
 *
 * @param {unknown} value - 要检查的值。
 * @returns {value is undefined} 如果值为 Undefined 类型，则返回 true，否则返回 false。
 */
export function isUndefined(value: unknown): value is undefined {
  return typeof value === "undefined";
}

/**
 * 检查一个值是否为 Null 类型。
 *
 * @param {unknown} value - 要检查的值。
 * @returns {value is null} 如果值为 Null 类型，则返回 true，否则返回 false。
 */
export function isNull(value: unknown): value is null {
  return getType(value) === "Null";
}

/**
 * 检查一个值是否为 boolean 类型。
 *
 * @param {unknown} value - 要检查的值。
 * @returns {value is boolean} 如果值为 boolean 类型，则返回 true，否则返回 false。
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

/**
 * 检查一个值是否为 Number 类型。
 *
 * @param {unknown} value - 要检查的值。
 * @returns {value is number} 如果值为 Number 类型，则返回 true，否则返回 false。
 */
export function isNumber(value: unknown): value is number {
  return typeof value === "number";
}

/**
 * 检查一个值是否为 String 类型。
 *
 * @param {unknown} value - 要检查的值。
 * @returns {value is string} 如果值为 String 类型，则返回 true，否则返回 false。
 */
export function isString(value: unknown): value is string {
  return typeof value === "string";
}

/**
 * 检查一个值是否为 BigInt 类型。
 *
 * @param {unknown} value - 要检查的值。
 * @returns {value is BigInt} 如果值为 BigInt 类型，则返回 true，否则返回 false。
 */
export function isBigInt(value: unknown): value is bigint {
  return typeof value === "bigint";
}

/**
 * 检查一个值是否为 Symbol 类型。
 *
 * @param {unknown} value - 要检查的值。
 * @returns {value is symbol} 如果值为 Symbol 类型，则返回 true，否则返回 false。
 */
export function isSymbol(value: unknown): value is symbol {
  return getType(value) === "Symbol";
}

/**
 * 检查一个值是否为 Object 类型。
 *
 * @param {unknown} value - 要检查的值。
 * @returns {value is object} 如果值为 Object 类型，则返回 true，否则返回 false。
 */
export function isObject(value: unknown): value is object {
  return getType(value) === "Object";
}

/**
 * 检查一个值是否为 Array 类型。
 *
 * @param {unknown} value - 要检查的值。
 * @returns {value is any[]} 如果值为 Array 类型，则返回 true，否则返回 false。
 */
export function isArray(value: unknown): value is any[] {
  return Array.isArray(value);
}

/**
 * 检查一个值是否为 Function 类型。
 *
 * @param {unknown} value - 要检查的值。
 * @returns {value is Function} 如果值为 Function 类型，则返回 true，否则返回 false。
 */
export function isFunction(value: unknown): value is Function {
  return getType(value) === "Function";
}

/**
 * 检查一个值是否为 Blob 类型。
 *
 * @param {unknown} value - 要检查的值。
 * @returns {value is Blob} 如果值为 Blob 类型，则返回 true，否则返回 false。
 */
export function isBlob(value: unknown): value is Blob {
  return getType(value) === "Blob";
}

/**
 * 检查一个值是否为 Date 类型。
 *
 * @param {unknown} value - 要检查的值。
 * @returns {value is Date} 如果值为 Date 类型，则返回 true，否则返回 false。
 */
export function isDate(value: unknown): value is Date {
  return getType(value) === "Date";
}

/**
 * 检查一个值是否为 RegExp 类型。
 *
 * @param {unknown} value - 要检查的值。
 * @returns {value is RegExp} 如果值为 RegExp 类型，则返回 true，否则返回 false。
 */
export function isRegExp(value: unknown): value is RegExp {
  return getType(value) === "RegExp";
}

/**
 * 检查一个值是否为 Error 类型。
 *
 * @param {unknown} value - 要检查的值。
 * @returns {value is Error} 如果值为 Error 类型，则返回 true，否则返回 false。
 */
export function isError(value: unknown): value is Error {
  return getType(value) === "Error";
}

/**
 * 检查一个值是否为 Map 类型。
 *
 * @param {unknown} value - 要检查的值。
 * @returns {value is Map<any, any>} 如果值为 Map 类型，则返回 true，否则返回 false。
 */
export function isMap(value: unknown): value is Map<any, any> {
  return getType(value) === "Map";
}

/**
 * 检查一个值是否为 Set 类型。
 *
 * @param {unknown} value - 要检查的值。
 * @returns {value is Set<any>} 如果值为 Set 类型，则返回 true，否则返回 false。
 */
export function isSet(value: unknown): value is Set<any> {
  return getType(value) === "Set";
}

/**
 * 检查一个值是否为 Promise 类型。
 *
 * @param {unknown} value - 要检查的值。
 * @returns {value is Promise<any>} 如果值为 Promise 类型，则返回 true，否则返回 false。
 */
export function isPromise(value: unknown): value is Promise<any> {
  return getType(value) === "Promise";
}

/**
 * 检查一个值是否为 Window 类型。
 *
 * @param {any} value - 要检查的值。
 * @returns {boolean} 如果值为 Window 类型，则返回 true，否则返回 false。
 */
export function isWindow(value: any): boolean {
  return typeof window !== "undefined" && getType(value) === "Window";
}

// #endregion -- end

// #region ====================== is公共方法 ======================

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
 * 检查一个值是否为 `undefined` 或 `null`。
 *
 * @param {T} value - 要检查的值。
 * @returns {value is NonNullable<T>} 如果值为 `undefined` 或 `null`，则返回 `true`，否则返回 `false`。
 */
export function isNonNullable<T>(value: T): value is NonNullable<T> {
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
export function isHasString(value: unknown): value is string {
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
export function isHasObject(value: unknown): value is object {
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
 * 检查一个值是否为空。
 *
 * @param {unknown} value - 要检查的值。
 * @returns {value is undefined | null | [] | ""} 如果值为空，则返回 true，否则返回 false。
 */
export function isEmpty(value: unknown): value is undefined | null | [] | "" {
  return isUndefined(value) || isNull(value) || isEmptyArray(value) || isEmptyObject(value) || isEmptyString(value);
}

/**
 * 检查一个值是否为非空数组。
 *
 * @param {unknown} value - 要检查的值。
 * @returns {value is any[]} 如果值为非空数组，则返回 true，否则返回 false。
 */
export function isHasArray(value: unknown): value is any[] {
  return Array.isArray(value) && value.length > 0;
}

/**
 * 检查指定目标是否在选项中（选项可以是单个对象或对象数组）。
 *
 * @param {T} target - 目标项。
 * @param {(T | T[])[]} options - 选项，可以是单个对象或对象数组。
 * @returns {boolean} 若目标项在选项中，则返回 true；否则返回 false。
 */
export function isTargetInOptions<T>(target: T, ...options: (T | T[])[]): boolean {
  return options.some((option) => {
    if (Array.isArray(option)) {
      return option.some((item) => item === target);
    }
    return option === target;
  });
}

/**
 * 检测给定的值(数字)是否在指定范围内。
 *
 * @param {number} value - 要检测的值。
 * @param {[number, number]} range - 范围，包含最小值和最大值。
 * @returns {boolean} 如果值在范围内，则返回 true，否则返回 false。
 */
export function isValueInRange(value: number, range: [number, number]): boolean {
  const [min, max] = range;
  return value >= min && value <= max;
}

// #endregion -- end
