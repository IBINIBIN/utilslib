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

/**
 * 根据指定条件筛选列表
 * @template T
 * @param {T[]} list - 要筛选的列表
 * @param {string | keyof T} property - 属性名或属性键
 * @param {T[keyof T][]} includes - 包含的值列表
 * @param {T[keyof T][]} [excludes] - 排除的值列表
 * @returns {T[]} - 筛选后的列表
 */
export function filterList<T extends Record<string, any>, R extends keyof T>(
  list: T[],
  property: R,
  includes: T[R][],
  excludes?: T[R][]
): T[];

/**
 * 根据指定条件筛选列表
 * @template T
 * @param {T[]} list - 要筛选的列表
 * @param {T[]} includes - 包含的值列表
 * @param {T[]} [excludes] - 排除的值列表
 * @returns {T[]} - 筛选后的列表
 */
export function filterList<T>(list: T[], includes: T[], excludes?: T[]): T[];

/**
 * 根据指定条件筛选列表
 * @template T
 * @param {T[]} list - 要筛选的列表
 * @param {any} arg1 - 属性名或包含的值列表
 * @param {any[]} [arg2=[]] - 包含的值列表或排除的值列表
 * @param {any[]} [arg3=[]] - 排除的值列表
 * @returns {T[]} - 筛选后的列表
 */
export function filterList<T>(list: T[], arg1: any, arg2: any = [], arg3: any = []): T[] {
  if (typeof arg1 === "string") {
    const property = arg1;
    const includes = arg2;
    const excludes = arg3;

    const includesSet = new Set(includes);
    const excludesSet = new Set(excludes);

    return list.filter((item) => {
      if (includesSet.size > 0 && excludesSet.size > 0) {
        return (
          includesSet.has((item as any)[property]) && !excludesSet.has((item as any)[property])
        );
      } else if (includesSet.size > 0) {
        return includesSet.has((item as any)[property]);
      } else if (excludesSet.size > 0) {
        return !excludesSet.has((item as any)[property]);
      } else {
        return true;
      }
    });
  } else {
    const includes = arg1 as T[];
    const excludes = arg2 as T[];

    const includesSet = new Set(includes);
    const excludesSet = new Set(excludes);

    return list.filter((item) => {
      if (includesSet.size > 0 && excludesSet.size > 0) {
        return includesSet.has(item) && !excludesSet.has(item);
      } else if (includesSet.size > 0) {
        return includesSet.has(item);
      } else if (excludesSet.size > 0) {
        return !excludesSet.has(item);
      } else {
        return true;
      }
    });
  }
}
