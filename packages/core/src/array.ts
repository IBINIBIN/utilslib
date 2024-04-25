/**
 * 获取两个数组的交集，通过指定字段属性进行判断。
 *
 * @type  {<T, K extends keyof T>(arr1: T[], arr2: T[], key: K) => T[]}
 * @param {T[]} arr1 - 第一个数组。「主数组,当返回的内容从主数组中获取」
 * @param {T[]} arr2 - 第二个数组。
 * @param {K extends keyof T} [key] - 可选的字段属性，用于判断交集。
 * @returns {T[]} 交集的数组。
 */
export function getArrayIntersection<T, K extends keyof T = keyof T>(
  arr1: T[],
  arr2: T[],
  key?: K
): T[] {
  if (key) {
    const set = new Set(arr2.map((item) => item[key]));
    return arr1.filter((item) => set.has(item[key]));
  }
  return arr1.filter((item) => arr2.includes(item));
}

/**
 * 确保给定数字在指定范围内。
 *
 * @param {number} numberToClamp - 要限制的数字。
 * @param {[number, number]} range - 范围，表示为 [min, max] 数组。
 * @returns {number} 在指定范围内的值。
 */
export function clampNumberWithinRange(numberToClamp: number, range: [number, number]): number {
  const [min, max] = range;
  return Math.max(min, Math.min(numberToClamp, max));
}

/**
 * 将值或值数组转换为数组。
 *
 * @type {<T>(value: T | T[]) => T[]}
 * @param {T | T[]} value - 要转换的值或值数组。
 * @returns {T[]} 转换后的数组。
 * @example
 * const result = toArray("value"); // ['value']
 * const resultArray = toArray(["value1", "value2"]); // ['value1', 'value2']
 */
export function toArray<T>(value: T | T[]): T[] {
  let list: T[];

  if (Array.isArray(value)) {
    list = value;
  } else {
    list = [value];
  }

  return list;
}
