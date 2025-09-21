/**
 * 将值或值数组转换为数组。
 *
 * @type {<T>(value: T | T[]) => T[]}
 * @param {T | T[]} value - 要转换的值或值数组。
 * @returns {T[]} 转换后的数组。
 */
export function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

/**
 * 从数组中排除指定的索引或索引范围，返回一个新的数组。
 *
 * @type {<T>(arr: T[], range: number | [number, number]) => T[]}
 * @param {T[]} arr - 要处理的数组。
 * @param {number | [number, number]} range - 要排除的单个索引或索引范围数组。
 * @returns {T[]} 排除指定索引或索引范围内元素后的新数组。
 * @template T - 数组元素类型。
 * @example
 * omitRange([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [2, 4]) // [1, 2, 6, 7, 8, 9, 10]
 * @example
 * omitRange([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 2) // [1, 2, 4, 5, 6, 7, 8, 9, 10]
 * @example
 * omitRange(['a', 'b', 'c', 'd', 'e'], [1, 3]) // ['a', 'e']
 */
export function omitRange<T>(arr: T[], range: number | [number, number]): T[] {
  const _range = typeof range === "number" ? [range, range] : range;
  const [start, end] = _range;
  return arr.filter((_, index) => index < start || index > end);
}

/**
 * 从数组中选取指定的索引或索引范围并返回新的数组。
 *
 * @type {<T>(arr: T[], range: number | [number, number]) => T[]}
 * @param {T[]} arr - 要选取元素的数组。
 * @param {number | [number, number]} range - 要选取的单个索引或索引范围数组。
 * @returns {T[]} 选取指定索引或索引范围内元素后的新数组。
 * @template T - 数组元素类型。
 * @example
 * pickRange([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [2, 4]) // [3, 4, 5]
 * @example
 * pickRange([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 2) // [3]
 * @example
 * pickRange(['a', 'b', 'c', 'd', 'e'], [1, 3]) // ['b', 'c', 'd']
 */
export function pickRange<T>(arr: T[], range: number | [number, number]): T[] {
  const _range = typeof range === "number" ? [range, range] : range;
  const [start, end] = _range;
  return arr.filter((_, index) => index >= start && index <= end);
}

/**
 * (A∪B) 并集
 *
 * @template T - 数组元素类型
 * @template K - 用于判断的属性键名类型
 * @param {T[]} A - 第一个数组
 * @param {T[]} B - 第二个数组
 * @param {K} [key] - 可选的用于判断的属性键名
 * @returns {T[]} 并集数组
 */
export function getArrayUnion<T, K extends keyof T>(A: T[], B: T[], key?: K): T[] {
  if (key) {
    const map = new Map<unknown, T>();
    A.forEach((item) => map.set(item[key], item));
    B.forEach((item) => map.set(item[key], item));
    return Array.from(map.values());
  }
  return Array.from(new Set([...A, ...B]));
}

/**
 * (A∩B) 交集
 *
 * @type  {<T, K extends keyof T>(A: T[], B: T[], key: K) => T[]}
 * @param {T[]} A - 第一个数组。「主数组,当返回的内容从主数组中获取」
 * @param {T[]} B - 第二个数组。
 * @param {K extends keyof T} [key] - 可选的字段属性，用于判断交集。
 * @returns {T[]} 交集的数组。
 */
export function getArrayIntersection<T, K extends keyof T = keyof T>(A: T[], B: T[], key?: K): T[] {
  if (key) {
    const set = new Set(B.map((item) => item[key]));
    return A.filter((item) => set.has(item[key]));
  }
  return A.filter((item) => B.includes(item));
}

/**
 * (A-B) 差集
 *
 * @template T - 数组元素类型
 * @template K - 用于判断的属性键名类型
 * @param {T[]} A - 第一个数组
 * @param {T[]} B - 第二个数组
 * @param {K} [key] - 可选的用于判断的属性键名
 * @returns {T[]} 差集数组
 */
export function getArrayDifference<T, K extends keyof T>(A: T[], B: T[], key?: K): T[] {
  if (key) {
    const set = new Set(B.map((item) => item[key]));
    return A.filter((item) => !set.has(item[key]));
  }
  return A.filter((item) => !B.includes(item));
}

/**
 * (A⊆U) 子集
 *
 * @template T - 数组元素类型
 * @template K - 用于判断的属性键名类型
 * @param {T[]} A - 待判断的子集数组
 * @param {T[]} B - 全集数组
 * @param {K} [key] - 可选的用于判断的属性键名
 * @returns {T[]} 子集数组
 */
export function getArraySubset<T, K extends keyof T>(A: T[], B: T[], key?: K): T[] {
  if (key) {
    const universeSet = new Set(B.map((item) => item[key]));
    return A.filter((item) => universeSet.has(item[key]));
  }
  return A.filter((item) => B.includes(item));
}
