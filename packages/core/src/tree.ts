import { entries } from "./collection";

/**
 * 检查集合是否非空
 */
function isNonEmptyCollection(data: any): boolean {
  if (!data) return false;
  if (Array.isArray(data)) return data.length > 0;
  if (data instanceof Map || data instanceof Set) return data.size > 0;
  if (typeof data === "object") return Object.keys(data).length > 0;
  return false;
}

/**
 * 父节点信息接口
 * @template T - 树节点类型
 */
export interface ParentInfo<T> {
  /** 在同级节点中的索引（数组为number，Map/Object为key，Set为值本身） */
  index: number | string | T;
  /** 父节点数据 */
  data: T;
}

/**
 * 遍历树的回调函数类型
 * @template T - 树节点类型
 * @template C - 子节点集合类型
 */
type WalkTreeCallback<T, C = any> = (
  item: T,
  context: {
    /** 当前节点的层级 */
    level: number;
    /** 当前节点在同级节点中的索引（数组为number，Map/Object为key，Set为值本身） */
    index: number | string | T;
    /** 当前节点是否为叶子节点 */
    leaf: boolean;
    /** 当前节点的同级节点列表（保持原始集合类型） */
    peerList: C;
    /** 当前节点的父节点信息 */
    parent?: T;
    /** 当前节点的所有祖先节点列表 */
    ancestors: ParentInfo<T>[];
  },
  // 停止遍历
  breakLoop: () => void,
) => void;

/**
 * 使用深度优先搜索（DFS）遍历树形结构，并为每个节点调用回调函数
 * 支持遍历 Array、Map、Set、Object 等多种集合类型
 *
 * @template T - 树节点类型
 * @param {T | T[] | Map | Set | Object | null | undefined} o - 要遍历的树或节点集合
 * @param {keyof T} childrenKey - 子节点属性的键名
 * @param {WalkTreeCallback<T>} cb - 遍历时的回调函数
 */
export function walkTree<T extends Record<string, any>, K extends keyof T>(
  o: T | T[] | Map<any, T> | Set<T> | Record<string, T> | null | undefined,
  childrenKey: K,
  cb: WalkTreeCallback<T>,
): void {
  if (!o) return;

  // 保持根节点的原始集合类型
  const rootNodes = Array.isArray(o) ? o : o instanceof Map || o instanceof Set || typeof o === "object" ? o : [o];
  let breakLoop = false;

  // DFS递归遍历函数
  function dfsTraverse(nodes: any, level: number, ancestors: ParentInfo<T>[] = []): boolean {
    if (!isNonEmptyCollection(nodes)) return false;
    if (breakLoop) return true;

    // 使用 entries 遍历，支持多种集合类型
    for (const [index, node] of entries(nodes)) {
      const typedNode = node as T;
      const children = typedNode[childrenKey];
      const leaf = !isNonEmptyCollection(children);

      // 调用回调函数
      cb(
        typedNode,
        {
          level,
          index: index as number | string | T,
          leaf,
          peerList: nodes,
          parent: ancestors.slice(-1)[0]?.data,
          ancestors: [...ancestors],
        },
        () => {
          breakLoop = true;
        },
      );

      if (breakLoop) return true;

      if (!leaf) {
        const newAncestors = [...ancestors, { index: index as number | string | T, data: typedNode }];
        if (dfsTraverse(children, level + 1, newAncestors)) return true;
      }
    }

    return false;
  }

  dfsTraverse(rootNodes, 0);
}

/**
 * 使用广度优先搜索（BFS）遍历树形结构，并为每个节点调用回调函数
 * 支持遍历 Array、Map、Set、Object 等多种集合类型
 *
 * @template T - 树节点类型
 * @param {T | T[] | Map | Set | Object | null | undefined} o - 要遍历的树或节点集合
 * @param {keyof T} childrenKey - 子节点属性的键名
 * @param {WalkTreeCallback<T>} cb - 遍历时的回调函数
 */
export function walkTreeBFS<T extends Record<string, any>, K extends keyof T>(
  o: T | T[] | Map<any, T> | Set<T> | Record<string, T> | null | undefined,
  childrenKey: K,
  cb: WalkTreeCallback<T>,
): void {
  if (!o) return;

  // 初始化队列，支持多种集合类型
  const queue: Array<{ node: T; level: number; index: number | string | T; ancestors: ParentInfo<T>[] }> = [];

  // 将根节点添加到队列
  const rootNodes = Array.isArray(o) ? o : o instanceof Map || o instanceof Set || typeof o === "object" ? o : [o];
  for (const [index, node] of entries(rootNodes)) {
    queue.push({ node: node as T, level: 0, index: index as number | string | T, ancestors: [] });
  }

  let shouldBreak = false;

  while (queue.length && !shouldBreak) {
    const { node, level, index, ancestors } = queue.shift()!;
    const children = node[childrenKey];
    const leaf = !isNonEmptyCollection(children);

    // 调用回调函数
    cb(
      node,
      {
        level,
        index,
        leaf,
        peerList: [], // BFS模式下同级列表不易获取
        parent: ancestors.slice(-1)[0]?.data,
        ancestors: [...ancestors],
      },
      () => {
        shouldBreak = true; // 标记需要中断遍历，直接影响while循环条件
      },
    );

    // 如果没有中断并且节点有子节点，则将子节点添加到队列
    if (!shouldBreak && !leaf && isNonEmptyCollection(children)) {
      for (const [childIndex, child] of entries(children)) {
        queue.push({
          node: child as T,
          level: level + 1,
          index: childIndex as number | string | T,
          ancestors: [...ancestors, { index, data: node }],
        });
      }
    }
  }
}

/*==========================================  以下为通过 walkTree 实现的函数  ==========================================*/

/**
 * 使用深度优先搜索算法递归查找指定属性值的节点，并返回匹配节点的数据、父级数据列表和层级关系。
 * 支持在 Array、Map、Set、Object 等多种集合类型中查找
 *
 * @template T - 树节点类型
 * @param {T[] | Map | Set | Object} collection - 要进行搜索的集合
 * @param {string} compareAttr - 需要查找的属性名
 * @param {string} nextLevelAttr - 子级循环字段
 * @param {unknown} value - 需要查找的属性值
 * @returns {{ target: T; parent: T | undefined; ancestors: ParentInfo<T>[]; } | undefined} 匹配节点的数据、父级数据列表和层级关系
 */
export function findNodeByDFS<T extends Record<string, any>>(
  collection: T[] | Map<any, T> | Set<T> | Record<string, T>,
  compareAttr: string,
  nextLevelAttr: string,
  value: unknown,
) {
  let result: { target: T; parent: T | undefined; ancestors: ParentInfo<T>[] } | undefined;
  walkTree(collection, nextLevelAttr, (node, context, breakLoop) => {
    const { parent, ancestors } = context;

    if (node[compareAttr] === value) {
      result = {
        target: node,
        ancestors,
        parent,
      };
      breakLoop();
    }
  });
  return result;
}

/**
 * 打平嵌套的树形结构，并为每个节点添加 level 和 parentId 字段。
 * 支持 Array、Map、Set、Object 等多种集合类型
 *
 * @template T - 树节点类型
 * @template P - 子节点属性的键名类型
 * @template ID - 节点 ID 属性的键名类型
 * @template R - 返回类型
 * @param {T[] | Map | Set | Object} collection - 嵌套的树形结构集合
 * @param {P} childrenProperty - 子节点属性的键名
 * @param {ID} idAttr - 节点 ID 属性的键名
 * @param {boolean} [includeParent=true] - 是否包含父节点，默认为 true
 * @returns {R[]} 打平后的数组
 */
export function flattenTreeArray<
  T extends {
    level?: never;
    parentId?: never;
    [key: string]: any;
  },
  P extends keyof T,
  ID extends keyof T,
  R = T & { level: number; parentId: T[ID] },
>(
  collection: T[] | Map<any, T> | Set<T> | Record<string, T>,
  childrenProperty: P,
  idAttr: ID,
  includeParent: boolean = true,
): R[] {
  const result: R[] = [];
  walkTree(collection, childrenProperty, (node, context) => {
    const { level, leaf, parent } = context;
    const data = node;

    if (leaf || includeParent) {
      result.push(Object.assign({}, data, { level, parentId: parent?.[idAttr] }) as R);
    }
  });

  return result;
}
