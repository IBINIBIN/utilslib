/*====================================== 类型检查方法 -- start ======================================*/
/**
 * onsdfljfosiej
 *
 * @param value - 要获取类型的值。
 * @returns 值的类型字符串。
 */
function getType(value: unknown): string {
  return Object.prototype.toString.call(value).slice(8, -1);
}

/**
 * 检查一个值是否已定义
 * 注: 非「undefined」类型
 *
 * @param value - 要检查的值。
 * @returns 如果值不为 Undefined 类型，则返回 true，否则返回 false。
 */
export function isDef<T extends any>(value?: T): value is T {
  return typeof value !== "undefined";
}

/**
 * 检查一个值是否为 Undefined 类型。
 *
 * @param value - 要检查的值。
 * @returns 如果值为 Undefined 类型，则返回 true，否则返回 false。
 */
export function isUndefined(value: unknown): value is undefined {
  return getType(value) === "Undefined";
}

/**
 * 检查一个值是否为 Null 类型。
 *
 * @param value - 要检查的值。
 * @returns 如果值为 Null 类型，则返回 true，否则返回 false。
 */
export function isNull(value: unknown): value is null {
  return getType(value) === "Null";
}

/**
 * 检查一个值是否为 boolean 类型。
 *
 * @param value - 要检查的值。
 * @returns 如果值为 boolean 类型，则返回 true，否则返回 false。
 */
export function isBoolean(value: unknown): value is boolean {
  return getType(value) === "Boolean";
}

/**
 * 检查一个值是否为 Number 类型。
 *
 * @param value - 要检查的值。
 * @returns 如果值为 Number 类型，则返回 true，否则返回 false。
 */
export function isNumber(value: unknown): value is number {
  return getType(value) === "Number";
}

/**
 * 检查一个值是否为 String 类型。
 *
 * @param value - 要检查的值。
 * @returns 如果值为 String 类型，则返回 true，否则返回 false。
 */
export function isString(value: unknown): value is string {
  return getType(value) === "String";
}

/**
 * 检查一个值是否为 Symbol 类型。
 *
 * @param value - 要检查的值。
 * @returns 如果值为 Symbol 类型，则返回 true，否则返回 false。
 */
export function isSymbol(value: unknown): value is symbol {
  return getType(value) === "Symbol";
}

/**
 * 检查一个值是否为 Object 类型。
 *
 * @param value - 要检查的值。
 * @returns 如果值为 Object 类型，则返回 true，否则返回 false。
 */
export function isObject(value: unknown): value is object {
  return getType(value) === "Object";
}

/**
 * 检查一个值是否为 Array 类型。
 *
 * @param value - 要检查的值。
 * @returns 如果值为 Array 类型，则返回 true，否则返回 false。
 */
export function isArray(value: unknown): value is any[] {
  return Array.isArray(value);
}

/**
 * 检查一个值是否为 Function 类型。
 *
 * @param value - 要检查的值。
 * @returns 如果值为 Function 类型，则返回 true，否则返回 false。
 */
export function isFunction(value: unknown): value is Function {
  return getType(value) === "Function";
}

/**
 * 检查一个值是否为 Date 类型。
 *
 * @param value - 要检查的值。
 * @returns 如果值为 Date 类型，则返回 true，否则返回 false。
 */
export function isDate(value: unknown): value is Date {
  return getType(value) === "Date";
}

/**
 * 检查一个值是否为 RegExp 类型。
 *
 * @param value - 要检查的值。
 * @returns 如果值为 RegExp 类型，则返回 true，否则返回 false。
 */
export function isRegExp(value: unknown): value is RegExp {
  return getType(value) === "RegExp";
}

/**
 * 检查一个值是否为 Error 类型。
 *
 * @param value - 要检查的值。
 * @returns 如果值为 Error 类型，则返回 true，否则返回 false。
 */
export function isError(value: unknown): value is Error {
  return getType(value) === "Error";
}

/**
 * 检查一个值是否为 Map 类型。
 *
 * @param value - 要检查的值。
 * @returns 如果值为 Map 类型，则返回 true，否则返回 false。
 */
export function isMap(value: unknown): value is Map<any, any> {
  return getType(value) === "Map";
}

/**
 * 检查一个值是否为 Set 类型。
 *
 * @param value - 要检查的值。
 * @returns 如果值为 Set 类型，则返回 true，否则返回 false。
 */
export function isSet(value: unknown): value is Set<any> {
  return getType(value) === "Set";
}

/**
 * 检查一个值是否为 Promise 类型。
 *
 * @param value - 要检查的值。
 * @returns 如果值为 Promise 类型，则返回 true，否则返回 false。
 */
export function isPromise(value: unknown): value is Promise<any> {
  return getType(value) === "Promise";
}

/**
 * 检查一个值是否为 Window 类型。
 *
 * @param value - 要检查的值。
 * @returns 如果值为 Window 类型，则返回 true，否则返回 false。
 */
export function isWindow(value: any): boolean {
  return typeof window !== "undefined" && getType(value) === "Window";
}

/*---------------------------------------  类型检查方法 -- end  ---------------------------------------*/

/*========================================== is公共方法 ==========================================*/

/**
 * 检查一个值是否为 `undefined` 或 `null`。
 *
 * @param value - 要检查的值。
 * @returns 如果值为 `undefined` 或 `null`，则返回 `true`，否则返回 `false`。
 */
export function isNullOrUndefined(value: unknown): value is undefined | null {
  return value === undefined || value === null;
}

/**
 * 检查一个值是否为 `undefined` 或 `null`。
 *
 * @param value - 要检查的值。
 * @returns 如果值为 `undefined` 或 `null`，则返回 `true`，否则返回 `false`。
 */
export function isNonNullable<T extends unknown>(
  value: T
): value is NonNullable<T> {
  return !isNullOrUndefined(value);
}

/**
 * 检查一个值是否为空字符串。
 *
 * @param value - 要检查的值。
 * @returns 如果值为为空字符串，则返回 true，否则返回 false。
 */
export function isEmptyString(value: unknown): value is "" {
  return typeof value === "string" && value.length === 0;
}

/**
 * 检查一个值是否为空。
 *
 * @param value - 要检查的值。
 * @returns 如果值为空，则返回 true，否则返回 false。
 */
export function isEmpty(value: unknown): value is undefined | null | [] | "" {
  return (
    isUndefined(value) ||
    isNull(value) ||
    isEmptyArray(value) ||
    isEmptyObject(value) ||
    isEmptyString(value)
  );
}

/**
 * 检查一个值是否为空对象。
 *
 * @param value - 要检查的值。
 * @returns 如果值为为空对象，则返回 true，否则返回 false。
 */
export function isEmptyObject(value: unknown): value is Record<string, any> {
  return isObject(value) && !isNull(value) && Object.keys(value).length === 0;
}

/**
 * 检查一个值是否为空数组。
 *
 * @param value - 要检查的值。
 * @returns 如果值为空数组，则返回 true，否则返回 false。
 */
export function isEmptyArray(value: unknown): value is any[] {
  return Array.isArray(value) && value.length === 0;
}

/**
 * 检查指定目标是否在选项中（选项可以是单个对象或对象数组）。
 *
 * @param target - 目标项。
 * @param options - 选项，可以是单个对象或对象数组。
 * @returns 若目标项在选项中，则返回 true；否则返回 false。
 */
export function isTargetInOptions<T>(
  target: T,
  ...options: (T | T[])[]
): boolean {
  return options.some((option) => {
    if (Array.isArray(option)) {
      return option.some((item) => item === target);
    }
    return option === target;
  });
}

/**
 * 检测给定的值是否在指定范围内。
 *
 * @param value - 要检测的值。
 * @param range - 范围，包含最小值和最大值。
 * @returns 如果值在范围内，则返回 true，否则返回 false。
 */
export function isValueInRange(
  value: number,
  range: [number, number]
): boolean {
  const [min, max] = range;
  return value >= min && value <= max;
}
