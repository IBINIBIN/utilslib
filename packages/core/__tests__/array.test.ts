import {
  toArray,
  omitRange,
  pickRange,
  getArrayUnion,
  getArrayIntersection,
  getArrayDifference,
  getArraySubset,
} from "../src/array";

describe("Array Utils", () => {
  describe("toArray", () => {
    it("should convert single value to array", () => {
      expect(toArray(42)).toEqual([42]);
      expect(toArray("hello")).toEqual(["hello"]);
      expect(toArray({ a: 1 })).toEqual([{ a: 1 }]);
      expect(toArray(null)).toEqual([null]);
      expect(toArray(undefined)).toEqual([undefined]);
    });

    it("should return array as-is", () => {
      const arr = [1, 2, 3];
      expect(toArray(arr)).toBe(arr);
      expect(toArray([])).toEqual([]);
    });
  });

  describe("omitRange", () => {
    it("should omit single index", () => {
      expect(omitRange([1, 2, 3, 4, 5], 2)).toEqual([1, 2, 4, 5]);
      expect(omitRange(["a", "b", "c"], 0)).toEqual(["b", "c"]);
      expect(omitRange(["a", "b", "c"], 2)).toEqual(["a", "b"]);
    });

    it("should omit range of indices", () => {
      expect(omitRange([1, 2, 3, 4, 5], [1, 3])).toEqual([1, 5]);
      expect(omitRange(["a", "b", "c", "d", "e"], [0, 2])).toEqual(["d", "e"]);
      expect(omitRange([0, 1, 2, 3, 4, 5, 6], [2, 4])).toEqual([0, 1, 5, 6]);
    });

    it("should handle edge cases", () => {
      expect(omitRange([], 0)).toEqual([]);
      expect(omitRange([1], 0)).toEqual([]);
      expect(omitRange([1, 2, 3], [5, 10])).toEqual([1, 2, 3]);
      expect(omitRange([1, 2, 3], [1, 1])).toEqual([1, 3]);
    });
  });

  describe("pickRange", () => {
    it("should pick single index", () => {
      expect(pickRange([1, 2, 3, 4, 5], 2)).toEqual([3]);
      expect(pickRange(["a", "b", "c"], 0)).toEqual(["a"]);
      expect(pickRange(["a", "b", "c"], 2)).toEqual(["c"]);
    });

    it("should pick range of indices", () => {
      expect(pickRange([1, 2, 3, 4, 5], [1, 3])).toEqual([2, 3, 4]);
      expect(pickRange(["a", "b", "c", "d", "e"], [0, 2])).toEqual(["a", "b", "c"]);
      expect(pickRange([0, 1, 2, 3, 4, 5, 6], [2, 4])).toEqual([2, 3, 4]);
    });

    it("should handle edge cases", () => {
      expect(pickRange([], 0)).toEqual([]);
      expect(pickRange([1], 0)).toEqual([1]);
      expect(pickRange([1, 2, 3], [5, 10])).toEqual([]);
      expect(pickRange([1, 2, 3], [1, 1])).toEqual([2]);
    });
  });

  describe("getArrayUnion", () => {
    it("should get union of primitive arrays without key", () => {
      expect(getArrayUnion([1, 2, 3], [3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
      expect(getArrayUnion(["a", "b"], ["b", "c"])).toEqual(["a", "b", "c"]);
      expect(getArrayUnion([1, 2], [3, 4])).toEqual([1, 2, 3, 4]);
    });

    it("should get union of object arrays with key", () => {
      const arr1 = [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
      ];
      const arr2 = [
        { id: 2, name: "Bob" },
        { id: 3, name: "Charlie" },
      ];

      const result = getArrayUnion(arr1, arr2, "id");
      expect(result).toHaveLength(3);
      expect(result.map((item) => item.id)).toEqual([1, 2, 3]);
    });

    it("should handle duplicates within arrays", () => {
      expect(getArrayUnion([1, 1, 2], [2, 2, 3])).toEqual([1, 2, 3]);
    });

    it("should handle empty arrays", () => {
      expect(getArrayUnion([], [1, 2, 3])).toEqual([1, 2, 3]);
      expect(getArrayUnion([1, 2, 3], [])).toEqual([1, 2, 3]);
      expect(getArrayUnion([], [])).toEqual([]);
    });
  });

  describe("getArrayIntersection", () => {
    it("should get intersection of primitive arrays without key", () => {
      expect(getArrayIntersection([1, 2, 3], [3, 4, 5])).toEqual([3]);
      expect(getArrayIntersection(["a", "b", "c"], ["b", "c", "d"])).toEqual(["b", "c"]);
      expect(getArrayIntersection([1, 2, 3], [4, 5, 6])).toEqual([]);
    });

    it("should get intersection of object arrays with key", () => {
      const arr1 = [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
      ];
      const arr2 = [
        { id: 2, name: "Robert" },
        { id: 3, name: "Charlie" },
      ];

      const result = getArrayIntersection(arr1, arr2, "id");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
      expect(result[0].name).toBe("Bob"); // Should preserve from first array
    });

    it("should handle empty arrays", () => {
      expect(getArrayIntersection([], [1, 2, 3])).toEqual([]);
      expect(getArrayIntersection([1, 2, 3], [])).toEqual([]);
      expect(getArrayIntersection([], [])).toEqual([]);
    });

    it("should preserve order from first array", () => {
      const arr1 = [3, 2, 1];
      const arr2 = [1, 2, 3];
      expect(getArrayIntersection(arr1, arr2)).toEqual([3, 2, 1]);
    });
  });

  describe("getArrayDifference", () => {
    it("should get difference of primitive arrays without key", () => {
      expect(getArrayDifference([1, 2, 3], [3, 4, 5])).toEqual([1, 2]);
      expect(getArrayDifference(["a", "b", "c"], ["b", "c", "d"])).toEqual(["a"]);
      expect(getArrayDifference([1, 2, 3], [4, 5, 6])).toEqual([1, 2, 3]);
    });

    it("should get difference of object arrays with key", () => {
      const arr1 = [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
      ];
      const arr2 = [
        { id: 2, name: "Robert" },
        { id: 3, name: "Charlie" },
      ];

      const result = getArrayDifference(arr1, arr2, "id");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].name).toBe("Alice");
    });

    it("should handle empty arrays", () => {
      expect(getArrayDifference([], [1, 2, 3])).toEqual([]);
      expect(getArrayDifference([1, 2, 3], [])).toEqual([1, 2, 3]);
      expect(getArrayDifference([], [])).toEqual([]);
    });
  });

  describe("getArraySubset", () => {
    it("should get subset of primitive arrays without key", () => {
      expect(getArraySubset([1, 2, 3], [1, 2, 3, 4, 5])).toEqual([1, 2, 3]);
      expect(getArraySubset(["a", "b", "c"], ["b", "c", "d"])).toEqual(["b", "c"]);
      expect(getArraySubset([1, 2, 3], [4, 5, 6])).toEqual([]);
    });

    it("should get subset of object arrays with key", () => {
      const subset = [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
      ];
      const superset = [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
        { id: 3, name: "Charlie" },
      ];

      const result = getArraySubset(subset, superset, "id");
      expect(result).toHaveLength(2);
      expect(result.map((item) => item.id)).toEqual([1, 2]);
    });

    it("should handle empty arrays", () => {
      expect(getArraySubset([], [1, 2, 3])).toEqual([]);
      expect(getArraySubset([1, 2, 3], [])).toEqual([]);
      expect(getArraySubset([], [])).toEqual([]);
    });
  });
});
