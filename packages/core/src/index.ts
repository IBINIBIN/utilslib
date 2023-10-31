export * from './array'
export * from './is'
export * from './object'
export * from './string'

/**
 * This comment _supports_ [Markdown](https://marked.js.org/)
 */
export class DocumentMe {}

/**
 * aaaaaaaaaaaaa
 * 
 * @param value - 要获取类型的值。
 * @returns 值的类型字符串。
 */
export function clampNumberWithinRangsnfoiee(numberToClamp: number, range: [number, number]): number {
  const [min, max] = range;
  return Math.max(min, Math.min(numberToClamp, max));
}