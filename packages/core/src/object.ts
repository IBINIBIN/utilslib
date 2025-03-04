/**
 * 从对象中排除指定的属性，返回一个新的对象。
 *
 * @type {<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]) => Omit<T, K>}
 * @param {T} obj - 要处理的对象。
 * @param {K[]} keys - 要排除的属性键名数组。
 * @returns {Omit<T, K>} 排除指定属性后的新对象。
 * @template T - 对象类型。
 * @template K - 要排除的属性键名类型。
 */
export function omit<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const clone = { ...obj };
  keys.forEach((key) => delete clone[key]);
  return clone;
}

/**
 * 从对象中选取指定的属性并返回新的对象。
 *
 * @type {<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]) => Pick<T, K>}
 * @param {T} obj - 要选取属性的对象。
 * @param {K[]} keys - 要选取的属性键名数组。
 * @returns {Pick<T, K>} 选取指定属性后的新对象。
 * @template T - 对象类型。
 * @template K - 要选取的属性键名类型。
 */
export function pick<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const pickedObject: Partial<Pick<T, K>> = {};

  keys.forEach((key) => {
    if (obj.hasOwnProperty(key)) {
      pickedObject[key] = obj[key];
    }
  });

  return pickedObject as Pick<T, K>;
}

/**
 * 创建一个具有双向映射的枚举对象。
 *
 * @param {Object} enumObj - 原始枚举对象，包含键值对
 * @returns {Object} 返回具有双向映射且冻结的枚举对象
 *
 * @throws {TypeError} 当枚举值类型不是 string 或 number 时抛出错误
 */
export function createEnum<T extends { [key: string]: string | number }>(
  enumObj: T,
): Readonly<T & { [K in T[keyof T]]: keyof T }> {
  const result = Object.create({}) as T & { [K in T[keyof T]]: keyof T };

  for (const key in enumObj) {
    if (!Object.prototype.hasOwnProperty.call(enumObj, key)) continue;
    const value = enumObj[key];
    if (typeof value !== "string" && typeof value !== "number") {
      throw new TypeError(`Enum value must be string or number, got ${typeof value}`);
    }
    result[key] = value;
    Object.defineProperty(Object.getPrototypeOf(result), value, {
      value: key,
      enumerable: false,
      writable: false,
      configurable: false,
    });
  }

  return Object.freeze(result);
}

/**
 * 创建一个带有描述信息的双向映射枚举对象。
 * 此函数扩展了基本的枚举功能，为每个枚举值添加描述信息，并提供获取描述的方法。
 *
 * @param {Object} enumObj - 包含枚举定义的对象，每个属性都应该是一个包含 value 和 description 的对象
 * @returns {Readonly<Object>} 返回一个只读的枚举对象，包含：
 *   - 正向映射（键到值）
 *   - 反向映射（值到键）
 *   - getDescription 方法用于获取描述信息
 */
export function createEnumWithDescription<
  T extends {
    [key: string]: {
      value: string | number;
      description: string;
    };
  },
>(
  enumObj: T,
): Readonly<
  { [K in keyof T]: T[K]["value"] } & { [K in T[keyof T]["value"]]: keyof T } & {
    getDescription(key: keyof T): string;
  }
> {
  const [simpleEnum, descriptions] = Object.entries(enumObj).reduce(
    ([values, descs], [key, { value, description }]) => {
      return [((values[key] = value), values), descs.set(key, description).set(String(value), description)];
    },
    [{} as { [key: string]: string | number }, new Map<string | number, string>()],
  );

  const result = createEnum(simpleEnum) as any;
  Object.defineProperty(Object.getPrototypeOf(result), "desc", {
    value: new Proxy(descriptions, {
      get(target, prop: string) {
        return target.get(prop);
      },
    }),
    enumerable: false,
    writable: false,
    configurable: false,
  });

  return Object.freeze(result);
}
