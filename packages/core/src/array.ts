/**
 * 获取两个数组的交集，通过指定字段属性进行判断。
 *
 * @param arr1 - 第一个数组。
 * @param arr2 - 第二个数组。
 * @param key - 可选的字段属性，用于判断交集。
 * @returns 交集的数组。
 */
export function getArrayIntersection<T, K extends keyof T = keyof T>(
  arr1: T[],
  arr2: T[],
  key?: K
): T[] {
  if (key) {
    const set = new Set(arr1.map((item) => item[key]));
    return arr2.filter((item) => set.has(item[key]));
  }
  return arr1.filter((item) => arr2.includes(item));
}

// /**
//  * 检查指定目标是否在选项中（选项可以是单个对象或对象数组）。
//  *
//  * @param target - 目标项。
//  * @param options - 选项，可以是单个对象或对象数组。
//  * @returns 若目标项在选项中，则返回 true；否则返回 false。
//  */
// export function isTargetInOptions<T>(target: T, ...options: (T | T[])[]): boolean {
//   return options.some((option) => {
//     if (Array.isArray(option)) {
//       return option.some((item) => item === target);
//     }
//     return option === target;
//   });
// }

/**
 * 确保给定数字在指定范围内。
 *
 * @param numberToClamp - 要限制的数字。
 * @param range - 范围，表示为 [min, max] 数组。
 * @returns 在指定范围内的值。
 */
export function clampNumberWithinRange(numberToClamp: number, range: [number, number]): number {
  const [min, max] = range;
  return Math.max(min, Math.min(numberToClamp, max));
}
