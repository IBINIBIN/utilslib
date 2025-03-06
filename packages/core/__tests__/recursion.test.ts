/// <reference types="jest" />

import { walkTree, walkTreeBFS } from "../src/recursion.js";

describe("recursion.ts 测试", () => {
  // 准备测试数据
  interface TreeNode {
    id: number;
    name: string;
    children: TreeNode[];
  }

  const treeData: TreeNode[] = [
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
  ];

  describe("walkTree (DFS)", () => {
    test("应该以深度优先顺序遍历树", () => {
      const visitedIds: number[] = [];
      walkTree(treeData, "children" as keyof TreeNode, (node) => {
        visitedIds.push(node.id);
      });

      // 预期的DFS顺序: 1 -> 11 -> 111 -> 12 -> 2 -> 21
      expect(visitedIds).toEqual([1, 11, 111, 12, 2, 21]);
    });

    test("回调函数应该接收正确的上下文信息", () => {
      const contexts: Array<{
        id: number;
        level: number;
        index: number;
        parentId?: number;
        ancestorIds: number[];
      }> = [];

      walkTree(treeData, "children" as keyof TreeNode, (node, context) => {
        contexts.push({
          id: node.id,
          level: context.level,
          index: context.index,
          parentId: context.parent?.id,
          ancestorIds: context.ancestors.map((a) => a.data.id),
        });
      });

      // 验证每个节点的上下文信息
      expect(contexts).toEqual([
        { id: 1, level: 0, index: 0, parentId: undefined, ancestorIds: [] },
        { id: 11, level: 1, index: 0, parentId: 1, ancestorIds: [1] },
        { id: 111, level: 2, index: 0, parentId: 11, ancestorIds: [1, 11] },
        { id: 12, level: 1, index: 1, parentId: 1, ancestorIds: [1] },
        { id: 2, level: 0, index: 1, parentId: undefined, ancestorIds: [] },
        { id: 21, level: 1, index: 0, parentId: 2, ancestorIds: [2] },
      ]);
    });

    test("处理单个节点", () => {
      const singleNode: TreeNode = { id: 1, name: "Single", children: [] };
      const visitedIds: number[] = [];

      walkTree(singleNode, "children" as keyof TreeNode, (node) => {
        visitedIds.push(node.id);
      });

      expect(visitedIds).toEqual([1]);
    });

    test("处理空数组", () => {
      const mockCallback = jest.fn();
      walkTree([], "children" as keyof TreeNode, mockCallback);
      expect(mockCallback).not.toHaveBeenCalled();
    });

    test("处理null或undefined", () => {
      const mockCallback = jest.fn();
      walkTree(null, "children" as keyof TreeNode, mockCallback);
      walkTree(undefined, "children" as keyof TreeNode, mockCallback);
      expect(mockCallback).not.toHaveBeenCalled();
    });

    test("处理没有子节点属性的节点", () => {
      interface SimpleNode {
        id: number;
        name: string;
      }

      const noChildrenNodes: SimpleNode[] = [
        { id: 1, name: "Node 1" },
        { id: 2, name: "Node 2" },
      ];

      const visitedIds: number[] = [];
      walkTree(noChildrenNodes, "children" as keyof SimpleNode, (node) => {
        visitedIds.push(node.id);
      });

      expect(visitedIds).toEqual([1, 2]);
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

      const visitedIds: number[] = [];
      walkTree(invalidData, "children" as keyof InvalidNode, (node) => {
        visitedIds.push(node.id);
      });

      // 应该只访问根节点
      expect(visitedIds).toEqual([1]);
    });
  });

  describe("walkTreeBFS", () => {
    test("应该以广度优先顺序遍历树", () => {
      const visitedIds: number[] = [];
      walkTreeBFS(treeData, "children" as keyof TreeNode, (node) => {
        visitedIds.push(node.id);
      });

      // 预期的BFS顺序: 1 -> 2 -> 11 -> 12 -> 21 -> 111
      expect(visitedIds).toEqual([1, 2, 11, 12, 21, 111]);
    });

    test("回调函数应该接收正确的上下文信息", () => {
      const contexts: Array<{
        id: number;
        level: number;
        parentId?: number;
        ancestorIds: number[];
      }> = [];

      walkTreeBFS(treeData, "children" as keyof TreeNode, (node, context) => {
        contexts.push({
          id: node.id,
          level: context.level,
          parentId: context.parent?.id,
          ancestorIds: context.ancestors.map((a) => a.data.id),
        });
      });

      // 验证每个节点的层级和父节点信息
      expect(contexts).toContainEqual({ id: 1, level: 0, parentId: undefined, ancestorIds: [] });
      expect(contexts).toContainEqual({ id: 2, level: 0, parentId: undefined, ancestorIds: [] });
      expect(contexts).toContainEqual({ id: 11, level: 1, parentId: 1, ancestorIds: [1] });
      expect(contexts).toContainEqual({ id: 12, level: 1, parentId: 1, ancestorIds: [1] });
      expect(contexts).toContainEqual({ id: 21, level: 1, parentId: 2, ancestorIds: [2] });
      expect(contexts).toContainEqual({ id: 111, level: 2, parentId: 11, ancestorIds: [1, 11] });
    });

    test("处理单个节点", () => {
      const singleNode: TreeNode = { id: 1, name: "Single", children: [] };
      const visitedIds: number[] = [];

      walkTreeBFS(singleNode, "children" as keyof TreeNode, (node) => {
        visitedIds.push(node.id);
      });

      expect(visitedIds).toEqual([1]);
    });

    test("处理空数组", () => {
      const mockCallback = jest.fn();
      walkTreeBFS([], "children" as keyof TreeNode, mockCallback);
      expect(mockCallback).not.toHaveBeenCalled();
    });

    test("处理null或undefined", () => {
      const mockCallback = jest.fn();
      walkTreeBFS(null, "children" as keyof TreeNode, mockCallback);
      walkTreeBFS(undefined, "children" as keyof TreeNode, mockCallback);
      expect(mockCallback).not.toHaveBeenCalled();
    });

    test("处理没有子节点属性的节点", () => {
      interface SimpleNode {
        id: number;
        name: string;
      }

      const noChildrenNodes: SimpleNode[] = [
        { id: 1, name: "Node 1" },
        { id: 2, name: "Node 2" },
      ];

      const visitedIds: number[] = [];
      walkTreeBFS(noChildrenNodes, "children" as keyof SimpleNode, (node) => {
        visitedIds.push(node.id);
      });

      expect(visitedIds).toEqual([1, 2]);
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

      const visitedIds: number[] = [];
      walkTreeBFS(invalidData, "children" as keyof InvalidNode, (node) => {
        visitedIds.push(node.id);
      });

      // 应该只访问根节点
      expect(visitedIds).toEqual([1]);
    });
  });
});
