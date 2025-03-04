/*======================================  findNodeByDFS -- start  ======================================*/

interface NodeProps<T extends Record<string, any>> {
  arr: T[];
  compareAttr: string;
  nextLevelAttr: string;
  value: unknown;
  layerNodeList?: T[];
  layerIndexList?: number[];
}

interface TargetData<T> {
  target: T;
  parent: T | undefined;
  layerIndexList: number[];
  layerNodeList: T[];
}

function findNode<T extends Record<string, any>>({
  arr,
  compareAttr,
  nextLevelAttr,
  value,
  layerNodeList = [],
  layerIndexList = [],
}: NodeProps<T>): TargetData<T> | undefined {
  for (let i = 0; i < arr.length; i++) {
    const data = arr[i];

    if (data[compareAttr] === value) {
      const [parent] = layerNodeList.slice(-1);
      return {
        target: data,
        layerIndexList: [...layerIndexList, i],
        layerNodeList: [...layerNodeList, data],
        parent,
      };
    }

    const nextLevelList = data[nextLevelAttr];
    if (Array.isArray(nextLevelList) && nextLevelList.length) {
      const result = findNode({
        arr: nextLevelList,
        compareAttr,
        nextLevelAttr,
        value,
        layerNodeList: [...layerNodeList, data],
        layerIndexList: [...layerIndexList, i],
      });
      if (result) {
        return result;
      }
    }
  }

  return undefined;
}

/**
 * 使用深度优先搜索算法递归查找指定属性值的节点，并返回匹配节点的数据、父级数据列表和层级关系。
 *
 * @type {<T extends Record<string, any>>(arr: T[], compareAttr: string, nextLevelAttr: string, value: unknown) => TargetData<T> | undefined}
 * @param {T[]} arr - 要进行搜索的数组。
 * @param {string} compareAttr - 需要查找的属性名。
 * @param {string} nextLevelAttr - 子级循环字段
 * @param {unknown} value - 需要查找的属性值。
 * @returns {TargetData<T> | undefined} 匹配节点的数据、父级数据列表和层级关系。
 */
export function findNodeByDFS<T extends Record<string, any>>(
  arr: NodeProps<T>["arr"],
  compareAttr: NodeProps<T>["compareAttr"],
  nextLevelAttr: NodeProps<T>["nextLevelAttr"],
  value: NodeProps<T>["value"],
) {
  return findNode<T>({ arr, compareAttr, nextLevelAttr, value });
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
  function flattenRecursive(nodes: T[], level: number, parentId: T[ID] | undefined): R[] {
    return nodes.reduce((prev: R[], node: T) => {
      const children: T[P] = node[childrenProperty];
      const id: T[ID] = node[idAttr];
      const flattenedNode: R = Object.assign(node, { level, parentId });

      let childrenArray: R[] = [flattenedNode];
      if (Array.isArray(children)) {
        childrenArray = flattenRecursive(children, level + 1, id).concat(includeParent ? flattenedNode : []);
      }

      return prev.concat(childrenArray);
    }, []);
  }

  return flattenRecursive(arr, 0, undefined);
}
