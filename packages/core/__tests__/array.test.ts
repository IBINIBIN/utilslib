/// <reference types="jest" />

import {
  clampNumberWithinRange,
  toArray,
  filterList,
  omitRange,
  pickRange,
  getArrayUnion,
  getArrayIntersection,
  getArrayDifference,
  getArraySubset,
  isSubset,
} from "../src/array.js";

describe("array.ts 测试", () => {
  describe("clampNumberWithinRange", () => {
    test("当数字在范围内时应返回原数字", () => {
      expect(clampNumberWithinRange(5, [1, 10])).toBe(5);
    });

    test("当数字小于最小值时应返回最小值", () => {
      expect(clampNumberWithinRange(0, [1, 10])).toBe(1);
    });

    test("当数字大于最大值时应返回最大值", () => {
      expect(clampNumberWithinRange(11, [1, 10])).toBe(10);
    });

    test("当数字等于边界值时应返回边界值", () => {
      expect(clampNumberWithinRange(1, [1, 10])).toBe(1);
      expect(clampNumberWithinRange(10, [1, 10])).toBe(10);
    });
  });

  describe("toArray", () => {
    test("将非数组值转换为包含该值的数组", () => {
      expect(toArray("value")).toEqual(["value"]);
      expect(toArray(123)).toEqual([123]);
      expect(toArray(null)).toEqual([null]);
      expect(toArray(undefined)).toEqual([undefined]);
    });

    test("保持数组值不变", () => {
      expect(toArray(["value1", "value2"])).toEqual(["value1", "value2"]);
      expect(toArray([1, 2, 3])).toEqual([1, 2, 3]);
      expect(toArray([])).toEqual([]);
    });
  });

  describe("filterList", () => {
    const list = [
      { id: 1, name: "Alice", age: 25 },
      { id: 2, name: "Bob", age: 30 },
      { id: 3, name: "Charlie", age: 35 },
      { id: 4, name: "David", age: 30 },
    ];

    test("根据属性和包含值过滤列表", () => {
      expect(filterList(list, { property: "age", includes: [30] })).toEqual([
        { id: 2, name: "Bob", age: 30 },
        { id: 4, name: "David", age: 30 },
      ]);
    });

    test("根据属性和排除值过滤列表", () => {
      expect(filterList(list, { property: "age", excludes: [30] })).toEqual([
        { id: 1, name: "Alice", age: 25 },
        { id: 3, name: "Charlie", age: 35 },
      ]);
    });

    test("同时使用包含和排除值过滤列表", () => {
      expect(filterList(list, { property: "age", includes: [25, 30], excludes: [30] })).toEqual([
        { id: 1, name: "Alice", age: 25 },
      ]);
    });

    test("当没有指定包含或排除值时返回原列表", () => {
      expect(filterList(list, { property: "age" })).toEqual(list);
    });

    test("当没有指定属性时直接比较元素", () => {
      const simpleList = [1, 2, 3, 4, 5];
      expect(filterList(simpleList, { includes: [1, 3, 5] })).toEqual([1, 3, 5]);
      expect(filterList(simpleList, { excludes: [2, 4] })).toEqual([1, 3, 5]);
      expect(filterList(simpleList, { includes: [1, 2, 3], excludes: [2] })).toEqual([1, 3]);
    });

    test("空列表返回空数组", () => {
      expect(filterList([] as Array<{ property: string; age: number }>, { property: "age", includes: [30] })).toEqual(
        [],
      );
    });
  });

  describe("omitRange", () => {
    test("排除单个索引", () => {
      expect(omitRange([1, 2, 3, 4, 5], 2)).toEqual([1, 2, 4, 5]);
    });

    test("排除索引范围", () => {
      expect(omitRange([1, 2, 3, 4, 5, 6, 7], [2, 4])).toEqual([1, 2, 6, 7]);
    });

    test("排除范围包含数组的开始", () => {
      expect(omitRange([1, 2, 3, 4, 5], [0, 2])).toEqual([4, 5]);
    });

    test("排除范围包含数组的结尾", () => {
      expect(omitRange([1, 2, 3, 4, 5], [3, 4])).toEqual([1, 2, 3]);
    });

    test("排除范围超出数组长度", () => {
      expect(omitRange([1, 2, 3], [2, 10])).toEqual([1, 2]);
    });

    test("排除范围覆盖整个数组", () => {
      expect(omitRange([1, 2, 3], [0, 2])).toEqual([]);
    });

    test("空数组返回空数组", () => {
      expect(omitRange([], [0, 1])).toEqual([]);
    });
  });

  describe("pickRange", () => {
    test("选取单个索引", () => {
      expect(pickRange([1, 2, 3, 4, 5], 2)).toEqual([3]);
    });

    test("选取索引范围", () => {
      expect(pickRange([1, 2, 3, 4, 5, 6, 7], [2, 4])).toEqual([3, 4, 5]);
    });

    test("选取范围包含数组的开始", () => {
      expect(pickRange([1, 2, 3, 4, 5], [0, 2])).toEqual([1, 2, 3]);
    });

    test("选取范围包含数组的结尾", () => {
      expect(pickRange([1, 2, 3, 4, 5], [3, 4])).toEqual([4, 5]);
    });

    test("选取范围超出数组长度", () => {
      expect(pickRange([1, 2, 3], [2, 10])).toEqual([3]);
    });

    test("选取范围覆盖整个数组", () => {
      expect(pickRange([1, 2, 3], [0, 2])).toEqual([1, 2, 3]);
    });

    test("空数组返回空数组", () => {
      expect(pickRange([], [0, 1])).toEqual([]);
    });
  });

  describe("getArrayUnion", () => {
    test("简单值数组的并集", () => {
      expect(getArrayUnion([1, 2, 3], [3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
      expect(getArrayUnion(["a", "b"], ["b", "c"])).toEqual(["a", "b", "c"]);
    });

    test("对象数组根据指定键的并集", () => {
      const A = [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
      ];
      const B = [
        { id: 2, name: "Bobby" },
        { id: 3, name: "Charlie" },
      ];

      // 使用id作为键，注意id为2的对象会以B中的为准
      const result = getArrayUnion(A, B, "id");
      expect(result).toHaveLength(3);
      expect(result).toContainEqual({ id: 1, name: "Alice" });
      expect(result).toContainEqual({ id: 2, name: "Bobby" });
      expect(result).toContainEqual({ id: 3, name: "Charlie" });
    });

    test("空数组的并集", () => {
      expect(getArrayUnion([], [1, 2, 3])).toEqual([1, 2, 3]);
      expect(getArrayUnion([1, 2, 3], [])).toEqual([1, 2, 3]);
      expect(getArrayUnion([], [])).toEqual([]);
    });
  });

  describe("getArrayIntersection", () => {
    test("简单值数组的交集", () => {
      expect(getArrayIntersection([1, 2, 3], [3, 4, 5])).toEqual([3]);
      expect(getArrayIntersection(["a", "b", "c"], ["b", "c", "d"])).toEqual(["b", "c"]);
    });

    test("对象数组根据指定键的交集", () => {
      const A = [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
        { id: 3, name: "Charlie" },
      ];
      const B = [
        { id: 2, name: "Bobby" },
        { id: 3, name: "Charles" },
        { id: 4, name: "David" },
      ];

      // 使用id作为键，返回A中的对象
      const result = getArrayIntersection(A, B, "id");
      expect(result).toHaveLength(2);
      expect(result).toContainEqual({ id: 2, name: "Bob" });
      expect(result).toContainEqual({ id: 3, name: "Charlie" });
    });

    test("空数组的交集", () => {
      expect(getArrayIntersection([], [1, 2, 3])).toEqual([]);
      expect(getArrayIntersection([1, 2, 3], [])).toEqual([]);
      expect(getArrayIntersection([], [])).toEqual([]);
    });

    test("没有交集的数组", () => {
      expect(getArrayIntersection([1, 2], [3, 4])).toEqual([]);
    });
  });

  describe("getArrayDifference", () => {
    test("简单值数组的差集", () => {
      expect(getArrayDifference([1, 2, 3, 4], [3, 4, 5])).toEqual([1, 2]);
      expect(getArrayDifference(["a", "b", "c"], ["c", "d"])).toEqual(["a", "b"]);
    });

    test("对象数组根据指定键的差集", () => {
      const A = [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
        { id: 3, name: "Charlie" },
      ];
      const B = [
        { id: 2, name: "Bobby" },
        { id: 3, name: "Charles" },
      ];

      // 使用id作为键
      const result = getArrayDifference(A, B, "id");
      expect(result).toHaveLength(1);
      expect(result).toContainEqual({ id: 1, name: "Alice" });
    });

    test("空数组的差集", () => {
      expect(getArrayDifference([], [1, 2, 3])).toEqual([]);
      expect(getArrayDifference([1, 2, 3], [])).toEqual([1, 2, 3]);
    });

    test("完全相同的数组差集为空", () => {
      expect(getArrayDifference([1, 2, 3], [1, 2, 3])).toEqual([]);
    });

    test("完全不同的数组差集为第一个数组", () => {
      expect(getArrayDifference([1, 2, 3], [4, 5, 6])).toEqual([1, 2, 3]);
    });
  });

  describe("getArraySubset", () => {
    test("简单值数组的子集", () => {
      expect(getArraySubset([1, 2], [1, 2, 3, 4])).toEqual([1, 2]);
      expect(getArraySubset([1, 2, 5], [1, 2, 3, 4])).toEqual([1, 2]);
    });

    test("对象数组根据指定键的子集", () => {
      const A = [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
        { id: 5, name: "Eve" },
      ];
      const B = [
        { id: 1, name: "Alicia" },
        { id: 2, name: "Bobby" },
        { id: 3, name: "Charlie" },
        { id: 4, name: "David" },
      ];

      // 使用id作为键，返回A中的对象
      const result = getArraySubset(A, B, "id");
      expect(result).toHaveLength(2);
      expect(result).toContainEqual({ id: 1, name: "Alice" });
      expect(result).toContainEqual({ id: 2, name: "Bob" });
    });

    test("空数组的子集", () => {
      expect(getArraySubset([], [1, 2, 3])).toEqual([]);
      expect(getArraySubset([1, 2, 3], [])).toEqual([]);
    });
  });

  describe("isSubset", () => {
    test("检查是否为子集 - 简单值数组", () => {
      expect(isSubset([1, 2], [1, 2, 3, 4])).toBe(true);
      expect(isSubset([1, 2, 5], [1, 2, 3, 4])).toBe(true); // 部分匹配也返回true
      expect(isSubset([5, 6], [1, 2, 3, 4])).toBe(false);
    });

    test("检查是否为子集 - 对象数组", () => {
      const A = [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
        { id: 5, name: "Eve" },
      ];
      const B = [
        { id: 1, name: "Alicia" },
        { id: 2, name: "Bobby" },
        { id: 3, name: "Charlie" },
      ];

      expect(isSubset(A, B, "id")).toBe(true); // id 1和2匹配

      const C = [
        { id: 5, name: "Eve" },
        { id: 6, name: "Frank" },
      ];
      expect(isSubset(C, B, "id")).toBe(false); // 没有匹配的id
    });

    test("空数组的子集判断", () => {
      expect(isSubset([], [1, 2, 3])).toBe(false);
      expect(isSubset([1, 2, 3], [])).toBe(false);
      expect(isSubset([], [])).toBe(false);
    });
  });
});
