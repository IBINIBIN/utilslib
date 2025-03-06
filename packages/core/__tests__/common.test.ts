/// <reference types="jest" />

import { findNodeByDFS, flattenTreeArray } from "../src/common.js";
import { type ParentInfo } from "../src/recursion.js";

describe("common.ts 测试", () => {
  // 测试数据
  const treeData = [
    {
      id: 1,
      name: "Node 1",
      children: [
        {
          id: 11,
          name: "Node 1.1",
          children: [{ id: 111, name: "Node 1.1.1", children: [] }],
        },
        {
          id: 12,
          name: "Node 1.2",
          children: [],
        },
      ],
    },
    {
      id: 2,
      name: "Node 2",
      children: [
        {
          id: 21,
          name: "Node 2.1",
          children: [],
        },
      ],
    },
    {
      id: 3,
      name: "Node 3",
      children: [],
    },
  ];

  describe("findNodeByDFS", () => {
    test("查找存在的节点", () => {
      const result = findNodeByDFS(treeData, "id", "children", 12);
      expect(result).toBeDefined();
      expect(result?.target).toEqual({
        id: 12,
        name: "Node 1.2",
        children: [],
      });
      expect(result?.parent).toEqual({
        id: 1,
        name: "Node 1",
        children: expect.any(Array),
      });

      // 测试ancestors
      expect(result?.ancestors).toHaveLength(1);
      expect(result?.ancestors[0].data).toEqual({
        id: 1,
        name: "Node 1",
        children: expect.any(Array),
      });
      expect(result?.ancestors[0].index).toBe(0);
    });

    test("查找深层嵌套的节点", () => {
      const result = findNodeByDFS(treeData, "id", "children", 111);
      expect(result).toBeDefined();
      expect(result?.target).toEqual({
        id: 111,
        name: "Node 1.1.1",
        children: [],
      });
      expect(result?.parent).toEqual({
        id: 11,
        name: "Node 1.1",
        children: expect.any(Array),
      });

      // 测试ancestors
      expect(result?.ancestors).toHaveLength(2);
      expect(result?.ancestors[0].data.id).toBe(1);
      expect(result?.ancestors[1].data.id).toBe(11);
      expect(result?.ancestors.map((a) => a.index)).toEqual([0, 0]);
    });

    test("查找根级节点", () => {
      const result = findNodeByDFS(treeData, "id", "children", 3);
      expect(result).toBeDefined();
      expect(result?.target).toEqual({
        id: 3,
        name: "Node 3",
        children: [],
      });
      expect(result?.parent).toBeUndefined();

      // 根节点没有祖先
      expect(result?.ancestors).toHaveLength(0);
    });

    test("查找不存在的节点", () => {
      const result = findNodeByDFS(treeData, "id", "children", 999);
      expect(result).toBeUndefined();
    });

    test("处理空数组", () => {
      const result = findNodeByDFS([], "id", "children", 1);
      expect(result).toBeUndefined();
    });

    test("处理不同属性名", () => {
      const customData = [
        {
          key: "a",
          label: "A",
          items: [{ key: "a1", label: "A1", items: [] }],
        },
      ];

      const result = findNodeByDFS(customData, "key", "items", "a1");
      expect(result).toBeDefined();
      expect(result?.target).toEqual({
        key: "a1",
        label: "A1",
        items: [],
      });
      expect(result?.ancestors).toHaveLength(1);
      expect(result?.ancestors[0].data.key).toBe("a");
    });

    test("处理没有子节点属性的节点", () => {
      const dataWithMissingChildren = [
        {
          id: 1,
          name: "Node 1",
          // 没有children属性
        },
        {
          id: 2,
          name: "Node 2",
          children: [
            { id: 21, name: "Node 2.1" }, // 没有children属性
          ],
        },
      ];

      const result = findNodeByDFS(dataWithMissingChildren, "id", "children", 21);
      expect(result).toBeDefined();
      expect(result?.target).toEqual({
        id: 21,
        name: "Node 2.1",
      });
      expect(result?.ancestors).toHaveLength(1);
      expect(result?.ancestors[0].data.id).toBe(2);
    });

    test("处理子节点不是数组的情况", () => {
      interface InvalidNode {
        id: number;
        name: string;
        children: string; // 故意设置为string类型
      }

      const invalidData: InvalidNode[] = [
        {
          id: 1,
          name: "Node 1",
          children: "not an array", // 不是数组
        },
      ];

      const result = findNodeByDFS(invalidData, "id", "children", 11);
      expect(result).toBeUndefined();
    });

    test("处理null和undefined", () => {
      // @ts-expect-error null 不是有效的输入
      expect(findNodeByDFS(null, "id", "children", 1)).toBeUndefined();
      // @ts-expect-error undefined 不是有效的输入
      expect(findNodeByDFS(undefined, "id", "children", 1)).toBeUndefined();
    });
  });

  describe("flattenTreeArray", () => {
    test("默认包含父节点的扁平化", () => {
      const flattened = flattenTreeArray(treeData, "children", "id");

      // 所有节点，包括Node 3
      expect(flattened).toHaveLength(7);

      // 验证每个节点都有正确的level和parentId
      const node1 = flattened.find((item) => item.id === 1);
      expect(node1).toHaveProperty("level", 0);
      expect(node1).toHaveProperty("parentId", undefined);

      const node11 = flattened.find((item) => item.id === 11);
      expect(node11).toHaveProperty("level", 1);
      expect(node11).toHaveProperty("parentId", 1);

      const node111 = flattened.find((item) => item.id === 111);
      expect(node111).toHaveProperty("level", 2);
      expect(node111).toHaveProperty("parentId", 11);
    });

    test("不包含父节点的扁平化", () => {
      const flattened = flattenTreeArray(treeData, "children", "id", false);

      // 只有叶子节点: 111, 12, 21, 3
      expect(flattened).toHaveLength(4);

      const nodeIds = flattened.map((item) => item.id);
      expect(nodeIds).toContain(111);
      expect(nodeIds).toContain(12);
      expect(nodeIds).toContain(21);
      expect(nodeIds).toContain(3); // Node 3 也是叶子节点

      // 验证不包含父节点
      expect(nodeIds).not.toContain(1);
      expect(nodeIds).not.toContain(11);
      expect(nodeIds).not.toContain(2);
    });

    test("处理空数组", () => {
      const flattened = flattenTreeArray([], "children", "id");
      expect(flattened).toEqual([]);
    });

    test("处理没有子节点的节点", () => {
      interface SimpleNode {
        id: number;
        name: string;
      }

      const data: SimpleNode[] = [
        { id: 1, name: "Node 1" },
        { id: 2, name: "Node 2" },
      ];

      const flattened = flattenTreeArray(data, "children" as keyof SimpleNode, "id");
      expect(flattened).toHaveLength(2);

      const node1 = flattened.find((item) => item.id === 1);
      expect(node1).toHaveProperty("level", 0);
      expect(node1).toHaveProperty("parentId", undefined);
    });

    test("处理不同属性名", () => {
      const customData = [
        {
          key: "a",
          label: "A",
          items: [{ key: "a1", label: "A1", items: [] }],
        },
      ];

      const flattened = flattenTreeArray(customData, "items", "key");
      expect(flattened).toHaveLength(2);

      const nodeA = flattened.find((item) => item.key === "a");
      expect(nodeA).toHaveProperty("level", 0);
      expect(nodeA).toHaveProperty("parentId", undefined);

      const nodeA1 = flattened.find((item) => item.key === "a1");
      expect(nodeA1).toHaveProperty("level", 1);
      expect(nodeA1).toHaveProperty("parentId", "a");
    });

    test("处理子节点不是数组的情况", () => {
      interface InvalidNode {
        id: number;
        name: string;
        children: string; // 故意设置为string类型
      }

      const invalidData: InvalidNode[] = [
        {
          id: 1,
          name: "Node 1",
          children: "not an array", // 不是数组
        },
      ];

      const flattened = flattenTreeArray(invalidData, "children" as keyof InvalidNode, "id");
      expect(flattened).toHaveLength(1);
      expect(flattened[0]).toHaveProperty("level", 0);
    });

    test("处理null和undefined", () => {
      // @ts-expect-error null 不是有效的输入
      expect(flattenTreeArray(null, "children", "id")).toEqual([]);
      // @ts-expect-error undefined 不是有效的输入
      expect(flattenTreeArray(undefined, "children", "id")).toEqual([]);
    });

    test("处理复杂的嵌套结构", () => {
      const complexData = [
        {
          id: 1,
          name: "Root 1",
          children: [
            {
              id: 11,
              name: "Level 1.1",
              children: [
                {
                  id: 111,
                  name: "Level 1.1.1",
                  children: [{ id: 1111, name: "Level 1.1.1.1", children: [] }],
                },
              ],
            },
          ],
        },
      ];

      const flattened = flattenTreeArray(complexData, "children", "id");
      expect(flattened).toHaveLength(4);

      const levels = flattened.map((item) => item.level);
      expect(levels).toEqual([0, 1, 2, 3]);

      const ids = flattened.map((item) => item.id);
      expect(ids).toEqual([1, 11, 111, 1111]);
    });
  });
});
