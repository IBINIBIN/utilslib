import {
  isDef,
  isUndefined,
  isBoolean,
  isString,
  isBigInt,
  isSymbol,
  isNull,
  isObject,
  isArray,
  isFunction,
  isBlob,
  isDate,
  isRegExp,
  isError,
  isMap,
  isWeakMap,
  isSet,
  isWeakSet,
  isPromise,
} from "../src/type";

describe("Type Utils", () => {
  describe("isDef", () => {
    it("should return true for defined values", () => {
      expect(isDef(null)).toBe(true);
      expect(isDef(0)).toBe(true);
      expect(isDef("")).toBe(true);
      expect(isDef(false)).toBe(true);
      expect(isDef({})).toBe(true);
    });

    it("should return false for undefined", () => {
      expect(isDef(undefined)).toBe(false);
    });
  });

  describe("isUndefined", () => {
    it("should return true for undefined", () => {
      expect(isUndefined(undefined)).toBe(true);
    });

    it("should return false for other types", () => {
      expect(isUndefined(null)).toBe(false);
      expect(isUndefined(0)).toBe(false);
      expect(isUndefined("")).toBe(false);
      expect(isUndefined(false)).toBe(false);
    });
  });

  describe("isBoolean", () => {
    it("should return true for boolean values", () => {
      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
    });

    it("should return false for non-boolean values", () => {
      expect(isBoolean(1)).toBe(false);
      expect(isBoolean(0)).toBe(false);
      expect(isBoolean("true")).toBe(false);
      expect(isBoolean(null)).toBe(false);
    });
  });

  describe("isString", () => {
    it("should return true for string values", () => {
      expect(isString("")).toBe(true);
      expect(isString("hello")).toBe(true);
      expect(isString("123")).toBe(true);
    });

    it("should return false for non-string values", () => {
      expect(isString(123)).toBe(false);
      expect(isString(null)).toBe(false);
      expect(isString({})).toBe(false);
      expect(isString([])).toBe(false);
    });
  });

  describe("isBigInt", () => {
    it("should return true for bigint values", () => {
      expect(isBigInt(BigInt(123))).toBe(true);
      expect(isBigInt(BigInt("123"))).toBe(true);
      expect(isBigInt(BigInt(0))).toBe(true);
    });

    it("should return false for non-bigint values", () => {
      expect(isBigInt(123)).toBe(false);
      expect(isBigInt("123")).toBe(false);
      expect(isBigInt(null)).toBe(false);
    });
  });

  describe("isSymbol", () => {
    it("should return true for symbol values", () => {
      expect(isSymbol(Symbol())).toBe(true);
      expect(isSymbol(Symbol("test"))).toBe(true);
      expect(isSymbol(Symbol.for("test"))).toBe(true);
    });

    it("should return false for non-symbol values", () => {
      expect(isSymbol("symbol")).toBe(false);
      expect(isSymbol(123)).toBe(false);
      expect(isSymbol(null)).toBe(false);
    });
  });

  describe("isNull", () => {
    it("should return true for null", () => {
      expect(isNull(null)).toBe(true);
    });

    it("should return false for non-null values", () => {
      expect(isNull(undefined)).toBe(false);
      expect(isNull(0)).toBe(false);
      expect(isNull("")).toBe(false);
      expect(isNull(false)).toBe(false);
    });
  });

  describe("isObject", () => {
    it("should return true for plain objects", () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ a: 1 })).toBe(true);
      expect(isObject(Object.create(null))).toBe(true);
    });

    it("should return false for non-plain objects", () => {
      expect(isObject(null)).toBe(false);
      expect(isObject([])).toBe(false);
      expect(isObject(new Date())).toBe(false);
      expect(isObject(/regex/)).toBe(false);
      expect(isObject(() => {})).toBe(false);
    });
  });

  describe("isArray", () => {
    it("should return true for arrays", () => {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
      expect(isArray([])).toBe(true);
    });

    it("should return false for non-arrays", () => {
      expect(isArray({})).toBe(false);
      expect(isArray("array")).toBe(false);
      expect(isArray(null)).toBe(false);
    });
  });

  describe("isFunction", () => {
    it("should return true for functions", () => {
      expect(isFunction(() => {})).toBe(true);
      expect(isFunction(function () {})).toBe(true);
      expect(isFunction(async function () {})).toBe(true);
      expect(isFunction(class {})).toBe(true);
    });

    it("should return false for generator functions", () => {
      expect(isFunction(function* () {})).toBe(false);
    });

    it("should return false for non-functions", () => {
      expect(isFunction({})).toBe(false);
      expect(isFunction("function")).toBe(false);
      expect(isFunction(null)).toBe(false);
    });
  });

  describe("isBlob", () => {
    it("should return true for Blob objects", () => {
      const blob = new Blob(["test"]);
      expect(isBlob(blob)).toBe(true);
    });

    it("should return false for non-Blob objects", () => {
      expect(isBlob({})).toBe(false);
      expect(isBlob([])).toBe(false);
      expect(isBlob(null)).toBe(false);
      expect(isBlob("blob")).toBe(false);
    });
  });

  describe("isDate", () => {
    it("should return true for Date objects", () => {
      expect(isDate(new Date())).toBe(true);
      expect(isDate(new Date("2023-01-01"))).toBe(true);
    });

    it("should return false for non-Date objects", () => {
      expect(isDate({})).toBe(false);
      expect(isDate("2023-01-01")).toBe(false);
      expect(isDate(Date.now())).toBe(false);
    });
  });

  describe("isRegExp", () => {
    it("should return true for RegExp objects", () => {
      expect(isRegExp(/regex/)).toBe(true);
      expect(isRegExp(new RegExp("regex"))).toBe(true);
    });

    it("should return false for non-RegExp objects", () => {
      expect(isRegExp("/regex/")).toBe(false);
      expect(isRegExp({})).toBe(false);
      expect(isRegExp("regex")).toBe(false);
    });
  });

  describe("isError", () => {
    it("should return true for Error objects", () => {
      expect(isError(new Error())).toBe(true);
      expect(isError(new TypeError())).toBe(true);
      expect(isError(new ReferenceError())).toBe(true);
      expect(isError(new SyntaxError())).toBe(true);
    });

    it("should return false for non-Error objects", () => {
      expect(isError({ message: "error" })).toBe(false);
      expect(isError("error")).toBe(false);
      expect(isError(null)).toBe(false);
    });
  });

  describe("isMap", () => {
    it("should return true for Map objects", () => {
      expect(isMap(new Map())).toBe(true);
      expect(isMap(new Map([["key", "value"]]))).toBe(true);
    });

    it("should return false for non-Map objects", () => {
      expect(isMap({})).toBe(false);
      expect(isMap([])).toBe(false);
      expect(isMap(new WeakMap())).toBe(false);
    });
  });

  describe("isWeakMap", () => {
    it("should return true for WeakMap objects", () => {
      expect(isWeakMap(new WeakMap())).toBe(true);
      const key = {};
      const weakMap = new WeakMap();
      weakMap.set(key, "value");
      expect(isWeakMap(weakMap)).toBe(true);
    });

    it("should return false for non-WeakMap objects", () => {
      expect(isWeakMap({})).toBe(false);
      expect(isWeakMap(new Map())).toBe(false);
      expect(isWeakMap([])).toBe(false);
    });
  });

  describe("isSet", () => {
    it("should return true for Set objects", () => {
      expect(isSet(new Set())).toBe(true);
      expect(isSet(new Set([1, 2, 3]))).toBe(true);
    });

    it("should return false for non-Set objects", () => {
      expect(isSet({})).toBe(false);
      expect(isSet([])).toBe(false);
      expect(isSet(new WeakSet())).toBe(false);
    });
  });

  describe("isWeakSet", () => {
    it("should return true for WeakSet objects", () => {
      expect(isWeakSet(new WeakSet())).toBe(true);
      const obj = {};
      const weakSet = new WeakSet();
      weakSet.add(obj);
      expect(isWeakSet(weakSet)).toBe(true);
    });

    it("should return false for non-WeakSet objects", () => {
      expect(isWeakSet({})).toBe(false);
      expect(isWeakSet(new Set())).toBe(false);
      expect(isWeakSet([])).toBe(false);
    });
  });

  describe("isPromise", () => {
    it("should return true for Promise objects", () => {
      expect(isPromise(Promise.resolve())).toBe(true);
      expect(isPromise(new Promise(() => {}))).toBe(true);
      expect(isPromise(Promise.reject().catch(() => {}))).toBe(true);
    });

    it("should return false for non-Promise objects", () => {
      expect(isPromise({})).toBe(false);
      expect(isPromise({ then: () => {} })).toBe(false);
      expect(isPromise(() => {})).toBe(false);
    });
  });
});
