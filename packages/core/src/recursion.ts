import { toArray } from "./array";
import { isNonEmptyArray } from "./is";

/**
 * 父节点信息接口
 * @template T - 树节点类型
 */
export interface ParentInfo<T> {
  /** 在同级节点中的索引 */
  index: number;
  /** 父节点数据 */
  data: T;
}

/**
 * 遍历树的回调函数类型
 * @template T - 树节点类型
 */
type WalkTreeCallback<T> = (
  item: T,
  context: {
    /** 当前节点的层级 */
    level: number;
    /** 当前节点在同级节点中的索引 */
    index: number;
    /** 当前节点是否为叶子节点 */
    leaf: boolean;
    /** 当前节点的同级节点列表 */
    peerList: T[];
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
 *
 * @template T - 树节点类型
 * @param {T | T[]} o - 要遍历的树或节点数组
 * @param {keyof T} childrenKey - 子节点属性的键名
 * @param {WalkTreeCallback<T>} cb - 遍历时的回调函数
 */
export function walkTree<T extends Record<string, any>, K extends keyof T>(
  o: T | T[] | null | undefined,
  childrenKey: K,
  cb: WalkTreeCallback<T>,
): void {
  if (!o) return;

  const rootNodes = toArray(o);
  let breakLoop = false;

  /**
   * DFS递归遍历函数
   * @param nodes - 当前层级的节点数组
   * @param level - 当前层级
   * @param ancestors - 祖先节点数组
   */
  function dfsTraverse(nodes: T[], level: number, ancestors: ParentInfo<T>[] = []): boolean {
    // 确保nodes是数组
    if (!isNonEmptyArray(nodes)) return false;

    // 如果已经设置了中断标志，直接返回true表示需要中断
    if (breakLoop) return true;

    for (let index = 0; index < nodes.length; index++) {
      const node = nodes[index];
      let leaf = true;
      isNonEmptyArray(node[childrenKey]) && (leaf = false);

      // 调用回调函数
      cb(
        node,
        {
          level,
          index,
          leaf,
          peerList: nodes,
          parent: ancestors.slice(-1)[0]?.data,
          ancestors: [...ancestors], // 复制祖先节点数组
        },
        () => {
          breakLoop = true;
        },
      );

      // 检查是否需要中断遍历
      if (breakLoop) return true;

      // 如果有子节点，递归遍历
      if (isNonEmptyArray(node[childrenKey])) {
        const newAncestors = [...ancestors, { index, data: node }];
        // 如果子节点遍历返回true，表示需要中断，则直接返回true
        if (dfsTraverse(node[childrenKey], level + 1, newAncestors)) {
          return true;
        }
      }
    }

    // 完成当前层级的遍历，没有中断
    return false;
  }

  // 开始DFS遍历
  dfsTraverse(rootNodes, 0);
}

/**
 * 遍历树形结构，并为每个节点调用回调函数
 *
 * @template T - 树节点类型
 * @param {T | T[]} o - 要遍历的树或节点数组
 * @param {keyof T} childrenKey - 子节点属性的键名
 * @param {WalkTreeCallback<T>} cb - 遍历时的回调函数
 */
export function walkTreeBFS<T extends Record<string, any>, K extends keyof T>(
  o: T | T[] | null | undefined,
  childrenKey: K,
  cb: WalkTreeCallback<T>,
): void {
  if (!o) return;

  // 使用类型谓词函数过滤
  const l = [[[...toArray(o)]]];
  // 只存储父节点引用，不存储完整的祖先节点数组
  const parentMap = new Map<T, ParentInfo<T>>();

  // 在回调函数中构建祖先节点数组的辅助函数
  const getAncestors = (node: T): ParentInfo<T>[] => {
    const ancestors: ParentInfo<T>[] = [];
    let current = node;
    while (current) {
      const parent = parentMap.get(current);
      if (!parent) break;
      ancestors.unshift(parent);
      current = parent.data;
    }
    return ancestors;
  };

  let level = 0;
  while (l.length) {
    const levelList = l.shift();
    const nextList: T[][] = [];

    while (levelList && levelList.length) {
      const group = levelList.shift();
      let index = 0;

      while (group && group.length) {
        const item = group.shift();
        if (item) {
          let leaf = true;
          isNonEmptyArray(item[childrenKey]) && (leaf = false);

          // 获取当前节点的父节点
          const parent = parentMap.get(item);
          cb(
            item,
            {
              level,
              index,
              leaf,
              peerList: group || [],
              parent: parent?.data,
              ancestors: getAncestors(item),
            },
            () => {
              // BFS模式下的breakLoop实现
              // 清空队列以停止遍历
              l.length = 0;
              levelList.length = 0;
              if (group) group.length = 0;
            },
          );

          if (isNonEmptyArray(item[childrenKey])) {
            // 为子节点设置父节点
            item[childrenKey].forEach((child: T) => parentMap.set(child, { index, data: item }));
            nextList.push([...item[childrenKey]]);
          }
        }
        index++;
      }
    }

    if (!nextList.length) break;
    l.push(nextList);
    level++;
  }
}
