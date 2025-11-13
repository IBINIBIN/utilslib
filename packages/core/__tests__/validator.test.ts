import {
  isNullOrUndefined,
  isNotNullOrUndefined,
  isEmptyString,
  isNonEmptyString,
  isEmptyObject,
  isNonEmptyObject,
  isEmptyArray,
  isNonEmptyArray,
  isEmpty,
  isTargetInOptions,
  isNonEmptyIntersection,
  isSubset,
  isTargetIncludingOptions,
  isTargetIncludedInOptions,
} from "../src/validator";
import { getArrayIntersection, getArraySubset } from "../src/array";

describe("Validator Utils", () => {
  describe("isNullOrUndefined", () => {
    it("should return true for null and undefined", () => {
      expect(isNullOrUndefined(null)).toBe(true);
      expect(isNullOrUndefined(undefined)).toBe(true);
    });

    it("should return false for other falsy values", () => {
      expect(isNullOrUndefined(0)).toBe(false);
      expect(isNullOrUndefined("")).toBe(false);
      expect(isNullOrUndefined(false)).toBe(false);
      expect(isNullOrUndefined(NaN)).toBe(false);
    });

    it("should return false for truthy values", () => {
      expect(isNullOrUndefined(1)).toBe(false);
      expect(isNullOrUndefined("test")).toBe(false);
      expect(isNullOrUndefined(true)).toBe(false);
      expect(isNullOrUndefined({})).toBe(false);
      expect(isNullOrUndefined([])).toBe(false);
    });
  });

  describe("isNotNullOrUndefined", () => {
    it("should return false for null and undefined", () => {
      expect(isNotNullOrUndefined(null)).toBe(false);
      expect(isNotNullOrUndefined(undefined)).toBe(false);
    });

    it("should return true for other values", () => {
      expect(isNotNullOrUndefined(0)).toBe(true);
      expect(isNotNullOrUndefined("")).toBe(true);
      expect(isNotNullOrUndefined(false)).toBe(true);
      expect(isNotNullOrUndefined(1)).toBe(true);
      expect(isNotNullOrUndefined("test")).toBe(true);
    });
  });

  describe("isEmptyString", () => {
    it("should return true for empty string", () => {
      expect(isEmptyString("")).toBe(true);
    });

    it("should return false for non-empty strings", () => {
      expect(isEmptyString("test")).toBe(false);
      expect(isEmptyString(" ")).toBe(false);
      expect(isEmptyString("0")).toBe(false);
    });

    it("should return false for non-string values", () => {
      expect(isEmptyString(null)).toBe(false);
      expect(isEmptyString(undefined)).toBe(false);
      expect(isEmptyString(0)).toBe(false);
      expect(isEmptyString(false)).toBe(false);
    });
  });

  describe("isNonEmptyString", () => {
    it("should return true for non-empty strings", () => {
      expect(isNonEmptyString("test")).toBe(true);
      expect(isNonEmptyString(" ")).toBe(true);
      expect(isNonEmptyString("0")).toBe(true);
    });

    it("should return false for empty string", () => {
      expect(isNonEmptyString("")).toBe(false);
    });

    it("should return false for non-string values", () => {
      expect(isNonEmptyString(null)).toBe(false);
      expect(isNonEmptyString(undefined)).toBe(false);
      expect(isNonEmptyString(0)).toBe(false);
    });
  });

  describe("isEmptyObject", () => {
    it("should return true for empty objects", () => {
      expect(isEmptyObject({})).toBe(true);
      expect(isEmptyObject(Object.create(null))).toBe(true);
    });

    it("should return false for non-empty objects", () => {
      expect(isEmptyObject({ a: 1 })).toBe(false);
      expect(isEmptyObject({ length: 0 })).toBe(false);
    });

    it("should return false for non-object values", () => {
      expect(isEmptyObject(null)).toBe(false);
      expect(isEmptyObject([])).toBe(false);
      expect(isEmptyObject(() => {})).toBe(false);
    });
  });

  describe("isNonEmptyObject", () => {
    it("should return true for non-empty objects", () => {
      expect(isNonEmptyObject({ a: 1 })).toBe(true);
      expect(isNonEmptyObject({ length: 0 })).toBe(true);
    });

    it("should return false for empty objects", () => {
      expect(isNonEmptyObject({})).toBe(false);
      expect(isNonEmptyObject(Object.create(null))).toBe(false);
    });

    it("should return false for non-object values", () => {
      expect(isNonEmptyObject(null)).toBe(false);
      expect(isNonEmptyObject([])).toBe(false);
      expect(isNonEmptyObject(() => {})).toBe(false);
    });
  });

  describe("isEmptyArray", () => {
    it("should return true for empty arrays", () => {
      expect(isEmptyArray([])).toBe(true);
      expect(isEmptyArray([])).toBe(true);
    });

    it("should return false for non-empty arrays", () => {
      expect(isEmptyArray([1])).toBe(false);
      expect(isEmptyArray([undefined])).toBe(false);
      expect(isEmptyArray([null])).toBe(false);
    });

    it("should return false for non-array values", () => {
      expect(isEmptyArray({})).toBe(false);
      expect(isEmptyArray("")).toBe(false);
      expect(isEmptyArray(null)).toBe(false);
    });
  });

  describe("isNonEmptyArray", () => {
    it("should return true for non-empty arrays", () => {
      expect(isNonEmptyArray([1])).toBe(true);
      expect(isNonEmptyArray([undefined])).toBe(true);
      expect(isNonEmptyArray([null])).toBe(true);
      expect(isNonEmptyArray([1, 2, 3])).toBe(true);
    });

    it("should return false for empty arrays", () => {
      expect(isNonEmptyArray([])).toBe(false);
      expect(isNonEmptyArray([])).toBe(false);
    });

    it("should return false for non-array values", () => {
      expect(isNonEmptyArray({})).toBe(false);
      expect(isNonEmptyArray("test")).toBe(false);
      expect(isNonEmptyArray(null)).toBe(false);
    });
  });

  describe("isEmpty", () => {
    it("should return true for empty values", () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty("")).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
    });

    it("should return false for non-empty values", () => {
      expect(isEmpty("test")).toBe(false);
      expect(isEmpty([1])).toBe(false);
      expect(isEmpty({ a: 1 })).toBe(false);
    });

    it("should return true for unsupported types (treated as empty)", () => {
      expect(isEmpty(0)).toBe(true);
      expect(isEmpty(false)).toBe(true);
      expect(isEmpty(() => {})).toBe(true);
      expect(isEmpty(new Date())).toBe(true);
      expect(isEmpty(/regex/)).toBe(true);
    });
  });

  describe("isTargetInOptions", () => {
    it("should check if target is in single options", () => {
      expect(isTargetInOptions(1, 1, 2, 3)).toBe(true);
      expect(isTargetInOptions(2, 1, 2, 3)).toBe(true);
      expect(isTargetInOptions(4, 1, 2, 3)).toBe(false);
    });

    it("should check if target is in array options", () => {
      expect(isTargetInOptions(1, [1, 2], [3, 4], 5)).toBe(true);
      expect(isTargetInOptions(3, [1, 2], [3, 4], 5)).toBe(true);
      expect(isTargetInOptions(6, [1, 2], [3, 4], 5)).toBe(false);
    });

    it("should work with strings", () => {
      expect(isTargetInOptions("apple", "apple", "banana", ["orange", "grape"])).toBe(true);
      expect(isTargetInOptions("orange", "apple", "banana", ["orange", "grape"])).toBe(true);
      expect(isTargetInOptions("pear", "apple", "banana", ["orange", "grape"])).toBe(false);
    });

    it("should handle mixed types", () => {
      expect(isTargetInOptions("1", 1, ["1", 2], 3)).toBe(true);
      expect(isTargetInOptions(1, 1, ["1", 2], 3)).toBe(true);
    });

    it("should handle empty options", () => {
      expect(isTargetInOptions(1)).toBe(false);
      expect(isTargetInOptions("test")).toBe(false);
    });
  });

  describe("isNonEmptyIntersection", () => {
    it("should return true when arrays have intersection", () => {
      expect(isNonEmptyIntersection([1, 2, 3], [3, 4, 5])).toBe(true);
      expect(isNonEmptyIntersection(["a", "b"], ["b", "c"])).toBe(true);
    });

    it("should return false when arrays have no intersection", () => {
      expect(isNonEmptyIntersection([1, 2, 3], [4, 5, 6])).toBe(false);
      expect(isNonEmptyIntersection(["a", "b"], ["c", "d"])).toBe(false);
    });

    it("should handle empty arrays", () => {
      expect(isNonEmptyIntersection([], [1, 2, 3])).toBe(false);
      expect(isNonEmptyIntersection([1, 2, 3], [])).toBe(false);
      expect(isNonEmptyIntersection([], [])).toBe(false);
    });
  });

  describe("isSubset", () => {
    it("should return true when A is subset of B", () => {
      expect(isSubset([1, 2], [1, 2, 3])).toBe(true);
      expect(isSubset(["a"], ["a", "b", "c"])).toBe(true);
    });

    it("should return false when A is not subset of B", () => {
      expect(isSubset(["d"], ["a", "b", "c"])).toBe(false);
    });

    it("should handle empty arrays", () => {
      expect(isSubset([], [1, 2, 3])).toBe(false); // Current implementation behavior
      expect(isSubset([1, 2], [])).toBe(false);
      expect(isSubset([], [])).toBe(false); // Current implementation returns false
    });
  });

  describe("isTargetIncludingOptions", () => {
    it("should check if target includes any option", () => {
      expect(isTargetIncludingOptions("hello world", "hello", "world")).toBe(true);
      expect(isTargetIncludingOptions("hello world", ["hello", "test"], "world")).toBe(true);
      expect(isTargetIncludingOptions("hello world", "test", "example")).toBe(false);
    });

    it("should work with multiple array options", () => {
      expect(isTargetIncludingOptions("hello world", ["hello"], ["world"], ["test"])).toBe(true);
      expect(isTargetIncludingOptions("hello world", ["test"], ["example"], ["demo"])).toBe(false);
    });

    it("should handle empty strings", () => {
      expect(isTargetIncludingOptions("", "test")).toBe(false);
      expect(isTargetIncludingOptions("test", "")).toBe(true);
    });

    it("should handle partial matches", () => {
      expect(isTargetIncludingOptions("javascript", "java", "script")).toBe(true);
      expect(isTargetIncludingOptions("typescript", "java")).toBe(false);
    });
  });

  describe("isTargetIncludedInOptions", () => {
    it("should check if target is included in any option", () => {
      expect(isTargetIncludedInOptions("test", "hello test world", "example")).toBe(true);
      expect(isTargetIncludedInOptions("test", ["hello test world"], ["demo"])).toBe(true);
      expect(isTargetIncludedInOptions("test", "hello world", "example")).toBe(false);
    });

    it("should work with multiple array options", () => {
      expect(isTargetIncludedInOptions("test", ["hello test world"], ["test example"], ["demo test"])).toBe(true);
      expect(isTargetIncludedInOptions("test", ["hello world"], ["example"], ["demo"])).toBe(false);
    });

    it("should handle empty strings", () => {
      expect(isTargetIncludedInOptions("", "test")).toBe(true); // test.includes('') returns true
      expect(isTargetIncludedInOptions("test", "")).toBe(false); // ''.includes('test') returns false
      expect(isTargetIncludedInOptions("", "")).toBe(true); // Empty string includes empty string
      expect(isTargetIncludedInOptions("test", "test")).toBe(true);
    });

    it("should handle exact matches", () => {
      expect(isTargetIncludedInOptions("test", "test")).toBe(true);
      expect(isTargetIncludedInOptions("test", ["test"])).toBe(true);
    });
  });
});
