/**
 * 从对象中排除指定的属性，返回一个新的对象。
 *
 * @param obj - 要处理的对象。
 * @param keys - 要排除的属性键名数组。
 * @returns 排除指定属性后的新对象。
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const clone = { ...obj };
  keys.forEach((key) => delete clone[key]);
  return clone;
}