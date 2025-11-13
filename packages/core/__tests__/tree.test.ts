import { walkTree, walkTreeBFS, findNodeByDFS, flattenTreeArray } from "../src/tree";

interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
}

interface FlatTreeNode extends TreeNode {
  level: number;
  parentId: string;
}

describe("Tree Utils", () => {
  const sampleTree: TreeNode[] = [
    {
      id: "1",
      name: "Root 1",
      children: [
        {
          id: "1-1",
          name: "Child 1-1",
          children: [
            { id: "1-1-1", name: "Leaf 1-1-1" },
            { id: "1-1-2", name: "Leaf 1-1-2" },
          ],
        },
        {
          id: "1-2",
          name: "Child 1-2",
        },
      ],
    },
    {
      id: "2",
      name: "Root 2",
      children: [{ id: "2-1", name: "Child 2-1" }],
    },
    {
      id: "3",
      name: "Root 3 (leaf)",
    },
  ];

  describe("walkTree", () => {
    it("should traverse tree in DFS order", () => {
      const visited: string[] = [];
      const levels: number[] = [];

      walkTree(sampleTree, "children", (node, context) => {
        visited.push(node.id);
        levels.push(context.level);
      });

      // Should follow DFS order
      expect(visited).toEqual(["1", "1-1", "1-1-1", "1-1-2", "1-2", "2", "2-1", "3"]);
      expect(levels).toEqual([0, 1, 2, 2, 1, 0, 1, 0]);
    });

    it("should provide correct context information", () => {
      const nodes: any[] = [];

      walkTree(sampleTree, "children", (node, context) => {
        nodes.push({
          id: node.id,
          level: context.level,
          index: context.index,
          leaf: context.leaf,
          parent: context.parent?.id,
          ancestors: context.ancestors.map((a) => a.data.id),
        });
      });

      // Check specific node contexts
      const root1 = nodes.find((n) => n.id === "1");
      expect(root1).toMatchObject({
        id: "1",
        level: 0,
        index: 0,
        leaf: false,
        parent: undefined,
        ancestors: [],
      });

      const leaf = nodes.find((n) => n.id === "1-1-1");
      expect(leaf).toMatchObject({
        id: "1-1-1",
        level: 2,
        leaf: true,
        parent: "1-1",
        ancestors: ["1", "1-1"],
      });
    });

    it("should handle breakLoop functionality", () => {
      const visited: string[] = [];

      walkTree(sampleTree, "children", (node, context, breakLoop) => {
        visited.push(node.id);
        if (node.id === "1-1-1") {
          breakLoop();
        }
      });

      expect(visited).toEqual(["1", "1-1", "1-1-1"]);
    });

    it("should handle different collection types", () => {
      const mapTree = {
        first: { id: "first", name: "First", children: [] },
        second: { id: "second", name: "Second", children: [] },
      };

      const visited: string[] = [];
      walkTree(mapTree as any, "children" as any, (node: any) => {
        visited.push(node.id);
      });

      expect(visited).toEqual(["first", "second"]);
    });

    it("should handle null and undefined input", () => {
      const visited: string[] = [];
      walkTree(null as any, "children", () => visited.push("test"));
      walkTree(undefined as any, "children", () => visited.push("test"));
      expect(visited).toEqual([]);
    });

    it("should handle empty collections", () => {
      const visited: string[] = [];
      walkTree([], "children", () => visited.push("test"));
      walkTree(new Map() as any, "children" as any, () => visited.push("test"));
      walkTree(new Set() as any, "children" as any, () => visited.push("test"));
      walkTree({} as any, "children" as any, () => visited.push("test"));

      expect(visited).toEqual([]);
    });

    it("should handle single node (not array)", () => {
      const singleNode = { id: "single", name: "Single", children: [] };
      const visited: string[] = [];

      walkTree([singleNode], "children", (node) => {
        visited.push(node.id);
      });

      expect(visited).toEqual(["single"]);
    });
  });

  describe("walkTreeBFS", () => {
    it("should traverse tree in BFS order", () => {
      const visited: string[] = [];
      const levels: number[] = [];

      walkTreeBFS(sampleTree, "children", (node, context) => {
        visited.push(node.id);
        levels.push(context.level);
      });

      // Should follow BFS order
      expect(visited).toEqual(["1", "2", "3", "1-1", "1-2", "2-1", "1-1-1", "1-1-2"]);
      expect(levels).toEqual([0, 0, 0, 1, 1, 1, 2, 2]);
    });

    it("should provide correct context information", () => {
      const nodes: any[] = [];

      walkTreeBFS(sampleTree, "children", (node, context) => {
        nodes.push({
          id: node.id,
          level: context.level,
          index: context.index,
          leaf: context.leaf,
          parent: context.parent?.id,
          ancestors: context.ancestors.map((a) => a.data.id),
        });
      });

      // Check that BFS contexts are correct
      expect(nodes.filter((n) => n.level === 0).map((n) => n.id)).toEqual(["1", "2", "3"]);
      expect(
        nodes
          .filter((n) => n.level === 1)
          .map((n) => n.id)
          .sort(),
      ).toEqual(["1-1", "1-2", "2-1"]);
    });

    it("should handle breakLoop functionality", () => {
      const visited: string[] = [];

      walkTreeBFS(sampleTree, "children", (node, context, breakLoop) => {
        visited.push(node.id);
        if (node.id === "2") {
          breakLoop();
        }
      });

      expect(visited).toEqual(["1", "2"]);
    });
  });

  describe("findNodeByDFS", () => {
    it("should find node by attribute value", () => {
      const result = findNodeByDFS(sampleTree, "id", "children", "1-1-2");

      expect(result).toBeDefined();
      expect(result!.target).toMatchObject({
        id: "1-1-2",
        name: "Leaf 1-1-2",
      });
      expect(result!.parent?.id).toBe("1-1");
      expect(result!.ancestors).toHaveLength(2);
      expect(result!.ancestors.map((a) => a.data.id)).toEqual(["1", "1-1"]);
    });

    it("should return undefined when node not found", () => {
      const result = findNodeByDFS(sampleTree, "id", "children", "non-existent");
      expect(result).toBeUndefined();
    });

    it("should find root node", () => {
      const result = findNodeByDFS(sampleTree, "id", "children", "2");

      expect(result).toBeDefined();
      expect(result!.target.id).toBe("2");
      expect(result!.parent).toBeUndefined();
      expect(result!.ancestors).toHaveLength(0);
    });

    it("should search by different attributes", () => {
      const result = findNodeByDFS(sampleTree, "name", "children", "Leaf 1-1-1");
      expect(result?.target.id).toBe("1-1-1");
    });
  });

  describe("flattenTreeArray", () => {
    it("should flatten tree structure with level and parentId", () => {
      const result = flattenTreeArray<TreeNode, "children", "id", FlatTreeNode>(sampleTree, "children", "id");

      expect(result).toHaveLength(8);

      // Check root nodes
      const root1 = result.find((n) => n.id === "1");
      expect(root1).toMatchObject({
        id: "1",
        name: "Root 1",
        level: 0,
        parentId: undefined,
      });

      // Check leaf nodes
      const leaf = result.find((n) => n.id === "1-1-2");
      expect(leaf).toMatchObject({
        id: "1-1-2",
        name: "Leaf 1-1-2",
        level: 2,
        parentId: "1-1",
      });
    });

    it("should respect includeParent parameter", () => {
      const includeAll = flattenTreeArray(sampleTree, "children", "id", true);
      const excludeParents = flattenTreeArray(sampleTree, "children", "id", false);

      // When excludeParents is true, only leaf nodes should be included
      const leafNodes = sampleTree.flatMap((node) => {
        const leaves: TreeNode[] = [];
        const findLeaves = (n: TreeNode) => {
          if (!n.children || n.children.length === 0) {
            leaves.push(n);
          } else {
            n.children.forEach(findLeaves);
          }
        };
        findLeaves(node);
        return leaves;
      });

      expect(excludeParents).toHaveLength(leafNodes.length);
      expect(includeAll.length).toBeGreaterThan(excludeParents.length);
    });

    it("should handle different collection types", () => {
      const mapTree = {
        first: { id: "first", name: "First", children: [] },
        second: { id: "second", name: "Second", children: [] },
      };

      const result = flattenTreeArray(mapTree as any, "children" as any, "id" as any);
      expect(result).toHaveLength(2);
    });

    it("should handle empty tree", () => {
      const result = flattenTreeArray([], "children", "id");
      expect(result).toEqual([]);
    });

    it("should handle tree with no children", () => {
      const noChildrenTree = [
        { id: "1", name: "Node 1" },
        { id: "2", name: "Node 2" },
      ];

      const result = flattenTreeArray(noChildrenTree, "children" as any, "id");
      expect(result).toHaveLength(2);
      result.forEach((node) => {
        expect(node.level).toBe(0);
        expect(node.parentId).toBeUndefined();
      });
    });
  });

  describe("ParentInfo interface", () => {
    it("should work with type definitions", () => {
      const parentInfo = { index: 0, data: "parent" };

      expect(parentInfo.index).toBe(0);
      expect(parentInfo.data).toBe("parent");
    });

    it("should handle different index types", () => {
      const numberIndex = { index: 1, data: "test" };
      const stringIndex = { index: "key", data: "test" };
      const valueIndex = { index: "test", data: "test" };

      expect(numberIndex.index).toBe(1);
      expect(stringIndex.index).toBe("key");
      expect(valueIndex.index).toBe("test");
    });
  });
});
