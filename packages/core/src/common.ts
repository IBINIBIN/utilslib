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
 * @param arr - 要进行搜索的数组。
 * @param compareAttr - 需要查找的属性名。
 * @param nextLevelAttr - 子级循环字段
 * @param value - 需要查找的属性值。
 */
export function findNodeByDFS<T extends Record<string, any>>(
  arr: NodeProps<T>["arr"],
  compareAttr: NodeProps<T>["compareAttr"],
  nextLevelAttr: NodeProps<T>["nextLevelAttr"],
  value: NodeProps<T>["value"]
) {
  return findNode<T>({ arr, compareAttr, nextLevelAttr, value });
}

/*---------------------------------------  findNodeByDFS -- end  ---------------------------------------*/
