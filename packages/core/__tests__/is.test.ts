/// <reference types="jest" />

import {
  isDef,
  isUndefined,
  isNull,
  isBoolean,
  isNumber,
  isString,
  isBigInt,
  isSymbol,
  isObject,
  isArray,
  isFunction,
  isBlob,
  isDate,
  isRegExp,
  isError,
  isMap,
  isSet,
  isPromise,
  isWindow,
  isNullOrUndefined,
  isNonNullable,
  isEmptyString,
  isNonEmptyString,
  isEmptyObject,
  isNonEmptyObject,
  isEmptyArray,
  isNonEmptyArray,
  isEmpty,
  isTargetInOptions,
  isValueInRange,
} from "../src/is.js";

describe("类型检查函数测试", () => {
  describe("isDef", () => {
    test("非undefined值应返回true", () => {
      expect(isDef(null)).toBe(true);
      expect(isDef(0)).toBe(true);
      expect(isDef("")).toBe(true);
      expect(isDef(false)).toBe(true);
      expect(isDef({})).toBe(true);
    });

    test("undefined值应返回false", () => {
      expect(isDef(undefined)).toBe(false);
    });
  });

  describe("isUndefined", () => {
    test("undefined值应返回true", () => {
      expect(isUndefined(undefined)).toBe(true);
    });

    test("非undefined值应返回false", () => {
      expect(isUndefined(null)).toBe(false);
      expect(isUndefined(0)).toBe(false);
      expect(isUndefined("")).toBe(false);
    });
  });

  describe("isNull", () => {
    test("null值应返回true", () => {
      expect(isNull(null)).toBe(true);
    });

    test("非null值应返回false", () => {
      expect(isNull(undefined)).toBe(false);
      expect(isNull(0)).toBe(false);
      expect(isNull("")).toBe(false);
    });
  });

  describe("isBoolean", () => {
    test("布尔值应返回true", () => {
      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
    });

    test("非布尔值应返回false", () => {
      expect(isBoolean(0)).toBe(false);
      expect(isBoolean("true")).toBe(false);
      expect(isBoolean(null)).toBe(false);
    });
  });

  describe("isNumber", () => {
    test("数字值应返回true", () => {
      expect(isNumber(0)).toBe(true);
      expect(isNumber(1)).toBe(true);
      expect(isNumber(-1)).toBe(true);
      expect(isNumber(1.5)).toBe(true);
      expect(isNumber(NaN)).toBe(true); // NaN 在 JavaScript 中是 number 类型
    });

    test("非数字值应返回false", () => {
      expect(isNumber("1")).toBe(false);
      expect(isNumber(null)).toBe(false);
      expect(isNumber(undefined)).toBe(false);
    });
  });

  describe("isString", () => {
    test("字符串值应返回true", () => {
      expect(isString("")).toBe(true);
      expect(isString("hello")).toBe(true);
      expect(isString(String(123))).toBe(true);
    });

    test("非字符串值应返回false", () => {
      expect(isString(123)).toBe(false);
      expect(isString(null)).toBe(false);
      expect(isString(undefined)).toBe(false);
    });
  });

  describe("isBigInt", () => {
    test("BigInt值应返回true", () => {
      expect(isBigInt(BigInt(123))).toBe(true);
      expect(isBigInt(BigInt(0))).toBe(true);
    });

    test("非BigInt值应返回false", () => {
      expect(isBigInt(123)).toBe(false);
      expect(isBigInt("123")).toBe(false);
      expect(isBigInt(null)).toBe(false);
    });
  });

  describe("isSymbol", () => {
    test("Symbol值应返回true", () => {
      expect(isSymbol(Symbol())).toBe(true);
      expect(isSymbol(Symbol("test"))).toBe(true);
    });

    test("非Symbol值应返回false", () => {
      expect(isSymbol("symbol")).toBe(false);
      expect(isSymbol(null)).toBe(false);
      expect(isSymbol({})).toBe(false);
    });
  });

  describe("isObject", () => {
    test("对象值应返回true", () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ a: 1 })).toBe(true);
    });

    test("非对象值应返回false", () => {
      expect(isObject(null)).toBe(false); // null 不是对象类型
      expect(isObject([])).toBe(false); // 数组不是普通对象
      expect(isObject(new Date())).toBe(false); // Date 不是普通对象
      expect(isObject(() => {})).toBe(false); // 函数不是普通对象
    });
  });

  describe("isArray", () => {
    test("数组值应返回true", () => {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
      expect(isArray([])).toBe(true);
    });

    test("非数组值应返回false", () => {
      expect(isArray({})).toBe(false);
      expect(isArray("array")).toBe(false);
      expect(isArray(null)).toBe(false);
    });
  });

  describe("isFunction", () => {
    test("函数值应返回true", () => {
      expect(isFunction(() => {})).toBe(true);
      expect(isFunction(function () {})).toBe(true);
      expect(isFunction(Array.isArray)).toBe(true);
    });

    test("非函数值应返回false", () => {
      expect(isFunction({})).toBe(false);
      expect(isFunction("function")).toBe(false);
      expect(isFunction(null)).toBe(false);
    });
  });

  describe("isBlob", () => {
    test("Blob对象应返回true", () => {
      // 创建一个模拟的Blob对象，只需要确保toString标签正确
      const mockBlob = {
        [Symbol.toStringTag]: "Blob",
      };

      expect(Object.prototype.toString.call(mockBlob)).toBe("[object Blob]");
      expect(isBlob(mockBlob)).toBe(true);
    });

    test("非Blob对象应返回false", () => {
      expect(isBlob({})).toBe(false);
      expect(isBlob("blob")).toBe(false);
      expect(isBlob(null)).toBe(false);
    });
  });

  describe("isDate", () => {
    test("Date对象应返回true", () => {
      expect(isDate(new Date())).toBe(true);
    });

    test("非Date对象应返回false", () => {
      expect(isDate("2023-01-01")).toBe(false);
      expect(isDate(123456789)).toBe(false);
      expect(isDate(null)).toBe(false);
    });
  });

  describe("isRegExp", () => {
    test("RegExp对象应返回true", () => {
      expect(isRegExp(/test/)).toBe(true);
      expect(isRegExp(new RegExp("test"))).toBe(true);
    });

    test("非RegExp对象应返回false", () => {
      expect(isRegExp("/test/")).toBe(false);
      expect(isRegExp(null)).toBe(false);
    });
  });

  describe("isError", () => {
    test("Error对象应返回true", () => {
      expect(isError(new Error())).toBe(true);
      expect(isError(new TypeError())).toBe(true);
    });

    test("非Error对象应返回false", () => {
      expect(isError({ message: "error" })).toBe(false);
      expect(isError("error")).toBe(false);
      expect(isError(null)).toBe(false);
    });
  });

  describe("isMap", () => {
    test("Map对象应返回true", () => {
      expect(isMap(new Map())).toBe(true);
    });

    test("非Map对象应返回false", () => {
      expect(isMap({})).toBe(false);
      expect(isMap([])).toBe(false);
      expect(isMap(null)).toBe(false);
    });
  });

  describe("isSet", () => {
    test("Set对象应返回true", () => {
      expect(isSet(new Set())).toBe(true);
    });

    test("非Set对象应返回false", () => {
      expect(isSet({})).toBe(false);
      expect(isSet([])).toBe(false);
      expect(isSet(null)).toBe(false);
    });
  });

  describe("isPromise", () => {
    test("Promise对象应返回true", () => {
      expect(isPromise(Promise.resolve())).toBe(true);
      expect(isPromise(new Promise(() => {}))).toBe(true);
    });

    test("非Promise对象应返回false", () => {
      expect(isPromise({})).toBe(false);
      expect(isPromise({ then: () => {} })).toBe(false); // 类Promise对象
      expect(isPromise(null)).toBe(false);
    });
  });

  describe("isWindow", () => {
    let originalWindow: any;

    beforeEach(() => {
      // 保存原始window引用
      originalWindow = global.window;

      // 模拟window对象
      (global as any).window = {
        [Symbol.toStringTag]: "Window",
      };
    });

    afterEach(() => {
      // 恢复原始window引用
      (global as any).window = originalWindow;
    });

    test("Window对象应返回true", () => {
      expect(isWindow(window)).toBe(true);
    });

    test("非Window对象应返回false", () => {
      expect(isWindow({})).toBe(false);
      expect(isWindow(null)).toBe(false);
    });

    test("在没有window的环境中应返回false", () => {
      // 临时移除window
      (global as any).window = undefined;
      expect(isWindow({})).toBe(false);
    });
  });

  describe("isNullOrUndefined", () => {
    test("null或undefined值应返回true", () => {
      expect(isNullOrUndefined(null)).toBe(true);
      expect(isNullOrUndefined(undefined)).toBe(true);
    });

    test("非null且非undefined值应返回false", () => {
      expect(isNullOrUndefined(0)).toBe(false);
      expect(isNullOrUndefined("")).toBe(false);
      expect(isNullOrUndefined(false)).toBe(false);
    });
  });

  describe("isNonNullable", () => {
    test("非null且非undefined值应返回true", () => {
      expect(isNonNullable(0)).toBe(true);
      expect(isNonNullable("")).toBe(true);
      expect(isNonNullable(false)).toBe(true);
    });

    test("null或undefined值应返回false", () => {
      expect(isNonNullable(null)).toBe(false);
      expect(isNonNullable(undefined)).toBe(false);
    });
  });

  describe("isEmptyString", () => {
    test("空字符串应返回true", () => {
      expect(isEmptyString("")).toBe(true);
    });

    test("非空字符串应返回false", () => {
      expect(isEmptyString("hello")).toBe(false);
      expect(isEmptyString(" ")).toBe(false);
    });

    test("非字符串值应返回false", () => {
      expect(isEmptyString(null)).toBe(false);
      expect(isEmptyString(undefined)).toBe(false);
      expect(isEmptyString(0)).toBe(false);
    });
  });

  describe("isEmptyObject", () => {
    test("空对象应返回true", () => {
      expect(isEmptyObject({})).toBe(true);
      expect(isEmptyObject(Object.create(null))).toBe(true);
    });

    test("非空对象应返回false", () => {
      expect(isEmptyObject({ a: 1 })).toBe(false);
    });

    test("null或非对象值应返回false", () => {
      expect(isEmptyObject(null)).toBe(false);
      expect(isEmptyObject([])).toBe(false);
      expect(isEmptyObject("")).toBe(false);
    });
  });

  describe("isEmptyArray", () => {
    test("空数组应返回true", () => {
      expect(isEmptyArray([])).toBe(true);
    });

    test("非空数组应返回false", () => {
      expect(isEmptyArray([1, 2, 3])).toBe(false);
    });

    test("非数组值应返回false", () => {
      expect(isEmptyArray({})).toBe(false);
      expect(isEmptyArray("")).toBe(false);
      expect(isEmptyArray(null)).toBe(false);
    });
  });

  describe("isEmpty", () => {
    test("空值应返回true", () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty("")).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
    });

    test("非空值应返回false", () => {
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty(false)).toBe(false);
      expect(isEmpty("hello")).toBe(false);
      expect(isEmpty([1, 2, 3])).toBe(false);
      expect(isEmpty({ a: 1 })).toBe(false);
    });
  });

  describe("isNonEmptyObject", () => {
    test("非空对象应返回true", () => {
      expect(isNonEmptyObject({ a: 1 })).toBe(true);
    });

    test("空对象应返回false", () => {
      expect(isNonEmptyObject({})).toBe(false);
    });

    test("非对象值应返回false", () => {
      expect(isNonEmptyObject(null)).toBe(false);
      expect(isNonEmptyObject([])).toBe(false);
      expect(isNonEmptyObject("")).toBe(false);
    });
  });

  describe("isNonEmptyString", () => {
    test("非空字符串应返回true", () => {
      expect(isNonEmptyString("hello")).toBe(true);
      expect(isNonEmptyString(" ")).toBe(true);
    });

    test("空字符串应返回false", () => {
      expect(isNonEmptyString("")).toBe(false);
    });

    test("非字符串值应返回false", () => {
      expect(isNonEmptyString(null)).toBe(false);
      expect(isNonEmptyString(undefined)).toBe(false);
      expect(isNonEmptyString(0)).toBe(false);
    });
  });

  describe("isNonEmptyArray", () => {
    test("非空数组应返回true", () => {
      expect(isNonEmptyArray([1, 2, 3])).toBe(true);
      expect(isNonEmptyArray([null])).toBe(true);
    });

    test("空数组应返回false", () => {
      expect(isNonEmptyArray([])).toBe(false);
    });

    test("非数组值应返回false", () => {
      expect(isNonEmptyArray({})).toBe(false);
      expect(isNonEmptyArray("")).toBe(false);
      expect(isNonEmptyArray(null)).toBe(false);
    });
  });

  describe("isTargetInOptions", () => {
    test("目标在选项中时应返回true", () => {
      expect(isTargetInOptions(1, 1, 2, 3)).toBe(true);
      expect(isTargetInOptions("a", "a", "b", "c")).toBe(true);
      expect(isTargetInOptions(1, [1, 2, 3])).toBe(true);
      expect(isTargetInOptions("a", ["a", "b", "c"])).toBe(true);
    });

    test("目标不在选项中时应返回false", () => {
      expect(isTargetInOptions(4, 1, 2, 3)).toBe(false);
      expect(isTargetInOptions("d", "a", "b", "c")).toBe(false);
      expect(isTargetInOptions(4, [1, 2, 3])).toBe(false);
      expect(isTargetInOptions("d", ["a", "b", "c"])).toBe(false);
    });

    test("混合选项时应正确处理", () => {
      expect(isTargetInOptions(1, 1, [2, 3], 4)).toBe(true);
      expect(isTargetInOptions(2, 1, [2, 3], 4)).toBe(true);
      expect(isTargetInOptions(5, 1, [2, 3], 4)).toBe(false);
    });
  });

  describe("isValueInRange", () => {
    test("值在范围内时应返回true", () => {
      expect(isValueInRange(5, [1, 10])).toBe(true);
      expect(isValueInRange(1, [1, 10])).toBe(true); // 边界值
      expect(isValueInRange(10, [1, 10])).toBe(true); // 边界值
    });

    test("值不在范围内时应返回false", () => {
      expect(isValueInRange(0, [1, 10])).toBe(false);
      expect(isValueInRange(11, [1, 10])).toBe(false);
    });
  });
});
