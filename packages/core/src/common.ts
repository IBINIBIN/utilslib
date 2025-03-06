/*======================================  findNodeByDFS -- start  ======================================*/

import { type ParentInfo, walkTree } from "./recursion";

/**
 * 使用深度优先搜索算法递归查找指定属性值的节点，并返回匹配节点的数据、父级数据列表和层级关系。
 *
 * @type {<T extends Record<string, any>>(arr: T[], compareAttr: string, nextLevelAttr: string, value: unknown) => { target: T; parent: T | undefined; ancestors: ParentInfo<T>[]; } | undefined}
 * @param {T[]} arr - 要进行搜索的数组。
 * @param {string} compareAttr - 需要查找的属性名。
 * @param {string} nextLevelAttr - 子级循环字段
 * @param {unknown} value - 需要查找的属性值。
 * @returns {{ target: T; parent: T | undefined; ancestors: ParentInfo<T>[]; } | undefined} 匹配节点的数据、父级数据列表和层级关系。
 */
export function findNodeByDFS<T extends Record<string, any>>(
  arr: T[],
  compareAttr: string,
  nextLevelAttr: string,
  value: unknown,
) {
  let result: { target: T; parent: T | undefined; ancestors: ParentInfo<T>[] } | undefined;
  walkTree(arr, nextLevelAttr, (node, context, breakLoop) => {
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

/*---------------------------------------  findNodeByDFS -- end  ---------------------------------------*/

/**
 * 打平嵌套的树形结构数组，并为每个节点添加 level 和 parentId 字段。
 *
 * @type {<
 *   T extends { level?: never; parentId?: never; [key: string]: any; },
 *   P extends keyof T,
 *   ID extends keyof T,
 *   R = T & { level: number; parentId: T[ID] }
 * >(
 *   arr: T[],
 *   childrenProperty: P,
 *   idAttr: ID,
 *   includeParent?: boolean
 * ) => R[]}
 * @param {T[]} arr - 嵌套的树形结构数组。
 * @param {P} childrenProperty - 子节点属性的键名。
 * @param {ID} idAttr - 节点 ID 属性的键名。
 * @param {boolean} [includeParent=true] - 是否包含父节点，默认为 true。
 * @returns {R[]} 打平后的数组。
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
>(arr: T[], childrenProperty: P, idAttr: ID, includeParent: boolean = true): R[] {
  const result: R[] = [];
  walkTree(arr, childrenProperty, (node, context) => {
    const { level, leaf, parent } = context;
    const data = node;

    if (leaf || includeParent) {
      result.push(Object.assign(data, { level, parentId: parent?.[idAttr] }));
    }
  });

  return result;
}
