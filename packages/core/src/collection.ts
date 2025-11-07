/**
 * 通用的条目迭代器
 * - Map: [key, value]
 * - Set: [value, value]
 * - Array/Iterable: [index, value]
 * - Object: [key, value]
 */
export function* entries<T, K, V>(
  data: Map<K, V> | Set<T> | Iterable<T> | Record<string, any>,
): Generator<[K | number | string | T, V | T], void, unknown> {
  if (data instanceof Map) yield* data;
  else if (data instanceof Set) {
    for (const v of data) yield [v, v] as [T, T];
  } else if (typeof (data as Iterable<T>)[Symbol.iterator] === "function") {
    let i = 0;
    for (const v of data as Iterable<T>) yield [i++, v] as [number, T];
  } else if (data) {
    yield* Object.entries(data) as [string, any][];
  }
}

type ArrayIteratee<T> = (value: T, index: number, collection: T[]) => boolean | void;
type MapIteratee<K, V> = (value: V, key: K, collection: Map<K, V>) => boolean | void;
type SetIteratee<T> = (value: T, value2: T, collection: Set<T>) => boolean | void;
type ObjectIteratee<T> = (value: T, key: string, collection: Record<string, T>) => boolean | void;

export function forEach<T>(collection: T[], iteratee: ArrayIteratee<T>): T[];
export function forEach<K, V>(collection: Map<K, V>, iteratee: MapIteratee<K, V>): Map<K, V>;
export function forEach<T>(collection: Set<T>, iteratee: SetIteratee<T>): Set<T>;
export function forEach<T>(collection: Record<string, T>, iteratee: ObjectIteratee<T>): Record<string, T>;
export function forEach(collection: null | undefined, iteratee: any): null | undefined;
export function forEach(collection: any, iteratee: any): any {
  if (collection == null) return collection;
  for (const [key, value] of entries(collection)) {
    if (iteratee(value, key, collection) === false) break;
  }
  return collection;
}

function filterData<T extends object, K extends keyof T>(
  data: T | T[] | Map<any, any> | Set<any>,
  keys: any[],
  shouldInclude: boolean, // true for pick, false for omit
): Pick<T, K> | T[] | Map<any, any> | Set<any> {
  const keySet = new Set(keys);

  // 根据数据类型创建对应的结果容器
  let result: any;
  if (data instanceof Map) {
    result = new Map();
  } else if (data instanceof Set) {
    result = new Set();
  } else if (Array.isArray(data)) {
    result = [];
  } else {
    result = {};
  }

  // 判断是否应该用 value 来比对（Array 和 Set）
  const compareByValue = Array.isArray(data) || data instanceof Set;

  forEach(data, (value: any, key: any) => {
    const compareTarget = compareByValue ? value : key;
    const matches = keySet.has(compareTarget);

    if (matches === shouldInclude) {
      if (result instanceof Map) {
        result.set(key, value);
      } else if (result instanceof Set) {
        result.add(value);
      } else if (Array.isArray(result)) {
        result.push(value);
      } else {
        result[key] = value;
      }
    }
  });

  return result;
}

export function pick<T extends object, K extends keyof T>(data: T, keys: K[]): Pick<T, K>;
export function pick<T>(data: T[], keys: T[]): T[]; // 注意：keys 是 T[] 而不是 number[]
export function pick<K, V>(data: Map<K, V>, keys: K[]): Map<K, V>;
export function pick<T>(data: Set<T>, keys: T[]): Set<T>;
export function pick(data: any, keys: any[]): any {
  return filterData(data, keys, true);
}

export function omit<T extends object, K extends keyof T>(data: T, keys: K[]): Omit<T, K>;
export function omit<T>(data: T[], keys: T[]): T[]; // 注意：keys 是 T[] 而不是 number[]
export function omit<K, V>(data: Map<K, V>, keys: K[]): Map<K, V>;
export function omit<T>(data: Set<T>, keys: T[]): Set<T>;
export function omit(data: any, keys: any[]): any {
  return filterData(data, keys, false);
}
