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

/**
 * 从对象中选取指定的属性并返回新的对象。
 *
 * @param obj - 要选取属性的对象。
 * @param keys - 要选取的属性键名数组。
 * @returns 选取指定属性后的新对象。
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const pickedObject: Partial<Pick<T, K>> = {};

  keys.forEach((key) => {
    if (obj.hasOwnProperty(key)) {
      pickedObject[key] = obj[key];
    }
  });

  return pickedObject as Pick<T, K>;
}
