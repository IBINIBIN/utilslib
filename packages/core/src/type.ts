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
 * 检查一个值是否为 boolean 类型。
 *
 * @param {unknown} value - 要检查的值。
 * @returns {value is boolean} 如果值为 boolean 类型，则返回 true，否则返回 false。
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
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
 * 检查一个值是否为 bigint 类型。
 *
 * @param {unknown} value - 要检查的值。
 * @returns {value is bigint} 如果值为 bigint 类型，则返回 true，否则返回 false。
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
  return typeof value === "symbol";
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
  return getType(value) === "Array";
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
 * 检查一个值是否为 WeakMap 类型。
 *
 * @param {unknown} value - 要检查的值。
 * @returns {value is WeakMap<any, any>} 如果值为 WeakMap 类型，则返回 true，否则返回 false。
 */
export function isWeakMap(value: unknown): value is WeakMap<any, any> {
  return getType(value) === "WeakMap";
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
 * 检查一个值是否为 WeakSet 类型。
 *
 * @param {unknown} value - 要检查的值。
 * @returns {value is WeakSet<any>} 如果值为 WeakSet 类型，则返回 true，否则返回 false。
 */
export function isWeakSet(value: unknown): value is WeakSet<any> {
  return getType(value) === "WeakSet";
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
