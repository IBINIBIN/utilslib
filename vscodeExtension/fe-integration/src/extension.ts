import * as vscode from "vscode";

interface CodeInfoProps {
  type: "css" | "js";
  code: string;
  name: string;
  intro?: string;
}

export async function activate(context: vscode.ExtensionContext) {
  const generateCodeCommandList = codeList.map((d) => {
    const { type, code, name } = d;
    return vscode.commands.registerCommand(
      `fe-integration.${type}.${name}`,
      () => {
        // 获取当前活动编辑器
        const editor = vscode.window.activeTextEditor;
        if (editor) {
          // 获取当前光标位置
          const position = editor.selection.active;
          // 插入代码
          editor.edit((editBuilder) => {
            editBuilder.insert(position, code);
          });
        }
      }
    );
  });
  context.subscriptions.push(...generateCodeCommandList);

  const optionsCommand = ["css", "js"].map((type) =>
    vscode.commands.registerCommand(
      `fe-integration.${type}.options`,
      async () => {
        const options = codeList
          .filter((item) => item.type === type)
          .map((item) => `${item.name}${item.intro ? " - " + item.intro : ""}`);

        const selectedOption = await vscode.window.showQuickPick(options, {
          title: "生成代码",
          placeHolder: "搜索你想生成的代码",
        });

        if (selectedOption) {
          vscode.commands.executeCommand(
            `fe-integration.${type}.${selectedOption.split(" - ")[0]}`
          );
        }
      }
    )
  );

  context.subscriptions.push(...optionsCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}

const codeList: CodeInfoProps[] = [
  {
    code: "\n.fs-8 {\n  font-size: 12px;\n  zoom: 0.6666;\n}\n",
    type: "css",
    name: "fs-8",
    intro: "",
  },
  {
    code: "\n.fs-10 {\n  font-size: 12px;\n  zoom: 0.8333;\n}\n",
    type: "css",
    name: "fs-10",
    intro: "",
  },
  {
    code: "/* 单行文本溢出隐藏 */\n.overflow-ellipsis {\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n",
    type: "css",
    name: "overflow-ellipsis",
    intro: "单行文本溢出隐藏",
  },
  {
    code: "/* 多行文本溢出隐藏 */\n.multi-line-overflow-ellipsis {\n  display: -webkit-box;\n  -webkit-line-clamp: 2;\n  /* 设置显示行数 */\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n}\n",
    type: "css",
    name: "multi-line-overflow-ellipsis",
    intro: "多行文本溢出隐藏",
  },
  {
    code: "/**\n * 将小驼峰命名转换为蛇形变量名称。\n *\n * @param camelCase - 要转换的小驼峰命名字符串。\n * @returns 转换后的蛇形变量名称。\n *\n * @example\n * 随便写点文案\n * ```\n * console\n * ```\n *\n * @example\n * ```js\n * camelToSnake('fooBar') // => 'foo_bar'\n * camelToSnake('fooBarBaz') // => 'foo_bar_baz'\n * camelToSnake('foo') // => 'foo'\n * ```\n */\nfunction camelToSnake(camelCase) {\n    return camelCase.replace(/[A-Z]/g, function (match) {\n        return `_${match.toLowerCase()}`;\n    });\n}\n",
    type: "js",
    name: "camelToSnake",
    intro: "将小驼峰命名转换为蛇形变量名称。",
  },
  {
    code: 'function getType(value) {\n    return Object.prototype.toString.call(value).slice(8, -1);\n}\nfunction isString(value) {\n    return getType(value) === "String";\n}\nfunction isEmptyString(value) {\n    return isString(value) && value.length === 0;\n}\n/**\n * 将单词的首字母转为大写并返回，如果无法转为大写则返回原单词。\n *\n * @param word - 要处理的单词。\n * @returns 首字母大写后的单词，如果无法转为大写或参数未提供则返回原单词。\n */\nfunction capitalize(word) {\n    if (isString(word) && !isEmptyString(word)) {\n        const firstChar = word.charAt(0).toUpperCase();\n        return (firstChar + word.slice(1));\n    }\n    return word;\n}\n',
    type: "js",
    name: "capitalize",
    intro: "将单词的首字母转为大写并返回，如果无法转为大写则返回原单词。",
  },
  {
    code: "/**\n * 通用错误捕获函数，用于执行可能会抛出异常的函数，并捕获异常信息。\n *\n * @param fn - 可能会抛出异常的函数。\n * @returns 返回一个元组，包含错误标识、函数执行结果或 null 、异常信息或 null。\n */\nasync function catchError(fn) {\n    let data;\n    let err;\n    let errMsg;\n    try {\n        data = await fn.apply(this, arguments);\n        err = 0;\n        errMsg = null;\n        return [err, data, errMsg];\n    }\n    catch (error) {\n        data = null;\n        err = 1;\n        errMsg = error;\n        return [err, data, errMsg];\n    }\n}\n",
    type: "js",
    name: "catchError",
    intro: "通用错误捕获函数，用于执行可能会抛出异常的函数，并捕获异常信息。",
  },
  {
    code: "/**\n * 确保给定数字在指定范围内。\n *\n * @param numberToClamp - 要限制的数字。\n * @param range - 范围，表示为 [min, max] 数组。\n * @returns 在指定范围内的值。\n */\nfunction clampNumberWithinRange(numberToClamp, range) {\n    const [min, max] = range;\n    return Math.max(min, Math.min(numberToClamp, max));\n}\n",
    type: "js",
    name: "clampNumberWithinRange",
    intro: "确保给定数字在指定范围内。",
  },
  {
    code: "/**\nexport function retry(fn: Function, retryCount: number = 0) {\n  return function (this: unknown) {\n    fn.apply(this, arguments);\n  };\n}\n */\n/*======================================  findNodeByDFS -- start  ======================================*/\nfunction findNode({ arr, compareAttr, nextLevelAttr, value, layerNodeList = [], layerIndexList = [], }) {\n    for (let i = 0; i < arr.length; i++) {\n        const data = arr[i];\n        if (data[compareAttr] === value) {\n            const [parent] = layerNodeList.slice(-1);\n            return {\n                target: data,\n                layerIndexList: [...layerIndexList, i],\n                layerNodeList: [...layerNodeList, data],\n                parent\n            };\n        }\n        const nextLevelList = data[nextLevelAttr];\n        if (Array.isArray(nextLevelList) && nextLevelList.length) {\n            const result = findNode({\n                arr: nextLevelList,\n                compareAttr,\n                nextLevelAttr,\n                value,\n                layerNodeList: [...layerNodeList, data],\n                layerIndexList: [...layerIndexList, i]\n            });\n            if (result) {\n                return result;\n            }\n        }\n    }\n    return undefined;\n}\n/**\n * 使用深度优先搜索算法递归查找指定属性值的节点，并返回匹配节点的数据、父级数据列表和层级关系。\n *\n * @param arr - 要进行搜索的数组。\n * @param compareAttr - 需要查找的属性名。\n * @param nextLevelAttr - 子级循环字段\n * @param value - 需要查找的属性值。\n */\nfunction findNodeByDFS(arr, compareAttr, nextLevelAttr, value) {\n    return findNode({ arr, compareAttr, nextLevelAttr, value });\n}\n",
    type: "js",
    name: "findNodeByDFS",
    intro:
      "使用深度优先搜索算法递归查找指定属性值的节点，并返回匹配节点的数据、父级数据列表和层级关系。",
  },
  {
    code: '/**\n * 格式化数字，如果超过指定值则显示为指定值+。\n *\n * @param value - 要格式化的数字。\n * @param threshold - 阈值，超过该值则显示为该值+。默认值为 99。\n * @returns 格式化后的字符串。\n */\nfunction formatNumber(value, threshold = 99) {\n    const num = Number(value);\n    if (isNaN(num)) {\n        return "";\n    }\n    if (num > threshold) {\n        return `${threshold}+`;\n    }\n    return String(num);\n}\n',
    type: "js",
    name: "formatNumber",
    intro: "格式化数字，如果超过指定值则显示为指定值+。",
  },
  {
    code: '/**\n * 获取文件名的后缀。\n *\n * @param filename - 文件名。\n * @returns 文件名的后缀。\n */\n// export const getFileExtension = (filename: string): string => {\n//   return filename.slice(filename.lastIndexOf(".") + 1);\n// };\n/**\n * 格式化价格，添加千位分隔符并保留指定的小数位数。\n *\n * @param value - 要格式化的价格。\n * @param decimalPlaces - 可选的小数位数，默认为不处理小数位数。\n * @returns 格式化后的价格。\n */\nfunction formatPrice(value, decimalPlaces = -1) {\n    const numberValue = typeof value === "number" ? value : parseFloat(value);\n    if (isNaN(numberValue)) {\n        return value.toString();\n    }\n    const options = {\n        minimumFractionDigits: decimalPlaces >= 0 ? decimalPlaces : 0,\n        maximumFractionDigits: decimalPlaces >= 0 ? decimalPlaces : 2\n    };\n    return numberValue.toLocaleString(undefined, options);\n}\n',
    type: "js",
    name: "formatPrice",
    intro:
      "获取文件名的后缀。,格式化价格，添加千位分隔符并保留指定的小数位数。",
  },
  {
    code: '/**\n * 生成指定长度的随机字符串。\n *\n * @param length - 随机字符串的长度。默认值为 8。\n * @returns 生成的随机字符串。\n * @example\n * ```ts\n * generateRandomString(8) // => "aBcDeFgH"\n *\n */\nfunction generateRandomString(length = 8) {\n    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";\n    let randomString = "";\n    for (let i = 0; i < length; i++) {\n        const randomIndex = Math.floor(Math.random() * characters.length);\n        randomString += characters[randomIndex];\n    }\n    return randomString;\n}\n',
    type: "js",
    name: "generateRandomString",
    intro: "生成指定长度的随机字符串。",
  },
  {
    code: "/**\n * 获取两个数组的交集，通过指定字段属性进行判断。\n *\n * @param arr1 - 第一个数组。\n * @param arr2 - 第二个数组。\n * @param key - 可选的字段属性，用于判断交集。\n * @returns 交集的数组。\n */\nfunction getArrayIntersection(arr1, arr2, key) {\n    if (key) {\n        const set = new Set(arr1.map((item) => item[key]));\n        return arr2.filter((item) => set.has(item[key]));\n    }\n    return arr1.filter((item) => arr2.includes(item));\n}\n",
    type: "js",
    name: "getArrayIntersection",
    intro: "获取两个数组的交集，通过指定字段属性进行判断。",
  },
  {
    code: "/**\n * 从文件路径中提取文件名。\n *\n * @param path - 包含文件名的路径。\n * @returns 提取出的文件名。\n */\nfunction getBasename(path) {\n    const match = path.match(/\\/([^\\/]+)$/);\n    return match ? match[1] : path;\n}\n",
    type: "js",
    name: "getBasename",
    intro: "从文件路径中提取文件名。",
  },
  {
    code: 'function getBasename(path) {\n    const match = path.match(/\\/([^\\/]+)$/);\n    return match ? match[1] : path;\n}\n/**\n * 获取文件名（不包含扩展名）。\n *\n * @param fileName - 文件名。\n * @returns 提取的文件名。\n */\nfunction getFileName(fileName) {\n    const name = getBasename(fileName);\n    const lastDotIndex = name.lastIndexOf(".");\n    if (lastDotIndex === -1) {\n        return name;\n    }\n    return name.slice(0, lastDotIndex);\n}\n',
    type: "js",
    name: "getFileName",
    intro: "获取文件名（不包含扩展名）。",
  },
  {
    code: "/**\n * 检查一个值是否为 Array 类型。\n *\n * @param value - 要检查的值。\n * @returns 如果值为 Array 类型，则返回 true，否则返回 false。\n */\nfunction isArray(value) {\n    return Array.isArray(value);\n}\n",
    type: "js",
    name: "isArray",
    intro: "检查一个值是否为 Array 类型。",
  },
  {
    code: 'function isBigInt(value) {\n    return typeof value === "bigint";\n}\n',
    type: "js",
    name: "isBigInt",
    intro: "",
  },
  {
    code: 'function getType(value) {\n    return Object.prototype.toString.call(value).slice(8, -1);\n}\n/**\n * 检查一个值是否为 Blob 类型。\n *\n * @param value - 要检查的值。\n * @returns 如果值为 Blob 类型，则返回 true，否则返回 false。\n */\nfunction isBlob(value) {\n    return getType(value) === "Blob";\n}\n',
    type: "js",
    name: "isBlob",
    intro: "检查一个值是否为 Blob 类型。",
  },
  {
    code: 'function getType(value) {\n    return Object.prototype.toString.call(value).slice(8, -1);\n}\n/**\n * 检查一个值是否为 boolean 类型。\n *\n * @param value - 要检查的值。\n * @returns 如果值为 boolean 类型，则返回 true，否则返回 false。\n */\nfunction isBoolean(value) {\n    return getType(value) === "Boolean";\n}\n',
    type: "js",
    name: "isBoolean",
    intro: "检查一个值是否为 boolean 类型。",
  },
  {
    code: 'function getType(value) {\n    return Object.prototype.toString.call(value).slice(8, -1);\n}\n/**\n * 检查一个值是否为 Date 类型。\n *\n * @param value - 要检查的值。\n * @returns 如果值为 Date 类型，则返回 true，否则返回 false。\n */\nfunction isDate(value) {\n    return getType(value) === "Date";\n}\n',
    type: "js",
    name: "isDate",
    intro: "检查一个值是否为 Date 类型。",
  },
  {
    code: '/**\n * 检查一个值是否为非undefined。\n * 注: 非「undefined」类型\n *\n * @param value - 要检查的值。\n * @returns 如果值不为 Undefined 类型，则返回 true，否则返回 false。\n */\nfunction isDef(value) {\n    return typeof value !== "undefined";\n}\n',
    type: "js",
    name: "isDef",
    intro: "检查一个值是否为非undefined。\n注: 非「undefined」类型",
  },
  {
    code: 'function getType(value) {\n    return Object.prototype.toString.call(value).slice(8, -1);\n}\nfunction isUndefined(value) {\n    return getType(value) === "Undefined";\n}\nfunction isNull(value) {\n    return getType(value) === "Null";\n}\nfunction isString(value) {\n    return getType(value) === "String";\n}\nfunction isObject(value) {\n    return getType(value) === "Object";\n}\nfunction isEmptyString(value) {\n    return isString(value) && value.length === 0;\n}\n/**\n * 检查一个值是否为空。\n *\n * @param value - 要检查的值。\n * @returns 如果值为空，则返回 true，否则返回 false。\n */\nfunction isEmpty(value) {\n    return (isUndefined(value) ||\n        isNull(value) ||\n        isEmptyArray(value) ||\n        isEmptyObject(value) ||\n        isEmptyString(value));\n}\nfunction isEmptyObject(value) {\n    return isObject(value) && !isNull(value) && Object.keys(value).length === 0;\n}\nfunction isEmptyArray(value) {\n    return Array.isArray(value) && value.length === 0;\n}\n',
    type: "js",
    name: "isEmpty",
    intro: "检查一个值是否为空。",
  },
  {
    code: "/**\n * 检查一个值是否为空数组。\n *\n * @param value - 要检查的值。\n * @returns 如果值为空数组，则返回 true，否则返回 false。\n */\nfunction isEmptyArray(value) {\n    return Array.isArray(value) && value.length === 0;\n}\n",
    type: "js",
    name: "isEmptyArray",
    intro: "检查一个值是否为空数组。",
  },
  {
    code: 'function getType(value) {\n    return Object.prototype.toString.call(value).slice(8, -1);\n}\nfunction isNull(value) {\n    return getType(value) === "Null";\n}\nfunction isObject(value) {\n    return getType(value) === "Object";\n}\n/**\n * 检查一个值是否为空对象。\n *\n * @param value - 要检查的值。\n * @returns 如果值为空对象，则返回 true，否则返回 false。\n */\nfunction isEmptyObject(value) {\n    return isObject(value) && !isNull(value) && Object.keys(value).length === 0;\n}\n',
    type: "js",
    name: "isEmptyObject",
    intro: "检查一个值是否为空对象。",
  },
  {
    code: 'function getType(value) {\n    return Object.prototype.toString.call(value).slice(8, -1);\n}\nfunction isString(value) {\n    return getType(value) === "String";\n}\n/**\n * 检查一个值是否为空字符串。\n *\n * @param value - 要检查的值。\n * @returns 如果值为空字符串，则返回 true，否则返回 false。\n */\nfunction isEmptyString(value) {\n    return isString(value) && value.length === 0;\n}\n',
    type: "js",
    name: "isEmptyString",
    intro: "检查一个值是否为空字符串。",
  },
  {
    code: 'function getType(value) {\n    return Object.prototype.toString.call(value).slice(8, -1);\n}\n/**\n * 检查一个值是否为 Error 类型。\n *\n * @param value - 要检查的值。\n * @returns 如果值为 Error 类型，则返回 true，否则返回 false。\n */\nfunction isError(value) {\n    return getType(value) === "Error";\n}\n',
    type: "js",
    name: "isError",
    intro: "检查一个值是否为 Error 类型。",
  },
  {
    code: 'function getType(value) {\n    return Object.prototype.toString.call(value).slice(8, -1);\n}\n/**\n * 检查一个值是否为 Function 类型。\n *\n * @param value - 要检查的值。\n * @returns 如果值为 Function 类型，则返回 true，否则返回 false。\n */\nfunction isFunction(value) {\n    return getType(value) === "Function";\n}\n',
    type: "js",
    name: "isFunction",
    intro: "检查一个值是否为 Function 类型。",
  },
  {
    code: "/**\n * 检查一个值是否为非空数组。\n *\n * @param value - 要检查的值。\n * @returns 如果值为非空数组，则返回 true，否则返回 false。\n */\nfunction isHasArray(value) {\n    return Array.isArray(value) && value.length > 0;\n}\n",
    type: "js",
    name: "isHasArray",
    intro: "检查一个值是否为非空数组。",
  },
  {
    code: 'function getType(value) {\n    return Object.prototype.toString.call(value).slice(8, -1);\n}\nfunction isObject(value) {\n    return getType(value) === "Object";\n}\n/**\n * 检查一个值是否为非空对象。\n *\n * @param value - 要检查的值。\n * @returns 如果值有最少一个可枚举属性，则返回 true，否则返回 false。\n */\nfunction isHasObject(value) {\n    return isObject(value) && Object.keys(value).length > 0;\n}\n',
    type: "js",
    name: "isHasObject",
    intro: "检查一个值是否为非空对象。",
  },
  {
    code: 'function getType(value) {\n    return Object.prototype.toString.call(value).slice(8, -1);\n}\nfunction isString(value) {\n    return getType(value) === "String";\n}\n/**\n * 检查一个值是否为非空字符串。\n *\n * @param value - 要检查的值。\n * @returns 如果值为非空字符串，则返回 true，否则返回 false。\n */\nfunction isHasString(value) {\n    return isString(value) && value.length > 0;\n}\n',
    type: "js",
    name: "isHasString",
    intro: "检查一个值是否为非空字符串。",
  },
  {
    code: 'function getType(value) {\n    return Object.prototype.toString.call(value).slice(8, -1);\n}\n/**\n * 检查一个值是否为 Map 类型。\n *\n * @param value - 要检查的值。\n * @returns 如果值为 Map 类型，则返回 true，否则返回 false。\n */\nfunction isMap(value) {\n    return getType(value) === "Map";\n}\n',
    type: "js",
    name: "isMap",
    intro: "检查一个值是否为 Map 类型。",
  },
  {
    code: "function isNullOrUndefined(value) {\n    return value === undefined || value === null;\n}\n/**\n * 检查一个值是否为 `undefined` 或 `null`。\n *\n * @param value - 要检查的值。\n * @returns 如果值为 `undefined` 或 `null`，则返回 `true`，否则返回 `false`。\n */\nfunction isNonNullable(value) {\n    return !isNullOrUndefined(value);\n}\n",
    type: "js",
    name: "isNonNullable",
    intro: "检查一个值是否为 `undefined` 或 `null`。",
  },
  {
    code: 'function getType(value) {\n    return Object.prototype.toString.call(value).slice(8, -1);\n}\n/**\n * 检查一个值是否为 Null 类型。\n *\n * @param value - 要检查的值。\n * @returns 如果值为 Null 类型，则返回 true，否则返回 false。\n */\nfunction isNull(value) {\n    return getType(value) === "Null";\n}\n',
    type: "js",
    name: "isNull",
    intro: "检查一个值是否为 Null 类型。",
  },
  {
    code: "/**\n * 检查一个值是否为 `undefined` 或 `null`。\n *\n * @param value - 要检查的值。\n * @returns 如果值为 `undefined` 或 `null`，则返回 `true`，否则返回 `false`。\n */\nfunction isNullOrUndefined(value) {\n    return value === undefined || value === null;\n}\n",
    type: "js",
    name: "isNullOrUndefined",
    intro: "检查一个值是否为 `undefined` 或 `null`。",
  },
  {
    code: 'function getType(value) {\n    return Object.prototype.toString.call(value).slice(8, -1);\n}\n/**\n * 检查一个值是否为 Number 类型。\n *\n * @param value - 要检查的值。\n * @returns 如果值为 Number 类型，则返回 true，否则返回 false。\n */\nfunction isNumber(value) {\n    return getType(value) === "Number";\n}\n',
    type: "js",
    name: "isNumber",
    intro: "检查一个值是否为 Number 类型。",
  },
  {
    code: 'function getType(value) {\n    return Object.prototype.toString.call(value).slice(8, -1);\n}\n/**\n * 检查一个值是否为 Object 类型。\n *\n * @param value - 要检查的值。\n * @returns 如果值为 Object 类型，则返回 true，否则返回 false。\n */\nfunction isObject(value) {\n    return getType(value) === "Object";\n}\n',
    type: "js",
    name: "isObject",
    intro: "检查一个值是否为 Object 类型。",
  },
  {
    code: 'function getType(value) {\n    return Object.prototype.toString.call(value).slice(8, -1);\n}\n/**\n * 检查一个值是否为 Promise 类型。\n *\n * @param value - 要检查的值。\n * @returns 如果值为 Promise 类型，则返回 true，否则返回 false。\n */\nfunction isPromise(value) {\n    return getType(value) === "Promise";\n}\n',
    type: "js",
    name: "isPromise",
    intro: "检查一个值是否为 Promise 类型。",
  },
  {
    code: 'function getType(value) {\n    return Object.prototype.toString.call(value).slice(8, -1);\n}\n/**\n * 检查一个值是否为 RegExp 类型。\n *\n * @param value - 要检查的值。\n * @returns 如果值为 RegExp 类型，则返回 true，否则返回 false。\n */\nfunction isRegExp(value) {\n    return getType(value) === "RegExp";\n}\n',
    type: "js",
    name: "isRegExp",
    intro: "检查一个值是否为 RegExp 类型。",
  },
  {
    code: 'function getType(value) {\n    return Object.prototype.toString.call(value).slice(8, -1);\n}\n/**\n * 检查一个值是否为 Set 类型。\n *\n * @param value - 要检查的值。\n * @returns 如果值为 Set 类型，则返回 true，否则返回 false。\n */\nfunction isSet(value) {\n    return getType(value) === "Set";\n}\n',
    type: "js",
    name: "isSet",
    intro: "检查一个值是否为 Set 类型。",
  },
  {
    code: 'function getType(value) {\n    return Object.prototype.toString.call(value).slice(8, -1);\n}\n/**\n * 检查一个值是否为 String 类型。\n *\n * @param value - 要检查的值。\n * @returns 如果值为 String 类型，则返回 true，否则返回 false。\n */\nfunction isString(value) {\n    return getType(value) === "String";\n}\n',
    type: "js",
    name: "isString",
    intro: "检查一个值是否为 String 类型。",
  },
  {
    code: 'function getType(value) {\n    return Object.prototype.toString.call(value).slice(8, -1);\n}\n/**\n * 检查一个值是否为 Symbol 类型。\n *\n * @param value - 要检查的值。\n * @returns 如果值为 Symbol 类型，则返回 true，否则返回 false。\n */\nfunction isSymbol(value) {\n    return getType(value) === "Symbol";\n}\n',
    type: "js",
    name: "isSymbol",
    intro: "检查一个值是否为 Symbol 类型。",
  },
  {
    code: "/**\n * 检查指定目标是否在选项中（选项可以是单个对象或对象数组）。\n *\n * @param target - 目标项。\n * @param options - 选项，可以是单个对象或对象数组。\n * @returns 若目标项在选项中，则返回 true；否则返回 false。\n */\nfunction isTargetInOptions(target, ...options) {\n    return options.some((option) => {\n        if (Array.isArray(option)) {\n            return option.some((item) => item === target);\n        }\n        return option === target;\n    });\n}\n",
    type: "js",
    name: "isTargetInOptions",
    intro: "检查指定目标是否在选项中（选项可以是单个对象或对象数组）。",
  },
  {
    code: 'function getType(value) {\n    return Object.prototype.toString.call(value).slice(8, -1);\n}\n/**\n * 检查一个值是否为 Undefined 类型。\n *\n * @param value - 要检查的值。\n * @returns 如果值为 Undefined 类型，则返回 true，否则返回 false。\n */\nfunction isUndefined(value) {\n    return getType(value) === "Undefined";\n}\n',
    type: "js",
    name: "isUndefined",
    intro: "检查一个值是否为 Undefined 类型。",
  },
  {
    code: "/**\n * 检测给定的值(数字)是否在指定范围内。\n *\n * @param value - 要检测的值。\n * @param range - 范围，包含最小值和最大值。\n * @returns 如果值在范围内，则返回 true，否则返回 false。\n */\nfunction isValueInRange(value, range) {\n    const [min, max] = range;\n    return value >= min && value <= max;\n}\n",
    type: "js",
    name: "isValueInRange",
    intro: "检测给定的值(数字)是否在指定范围内。",
  },
  {
    code: 'function getType(value) {\n    return Object.prototype.toString.call(value).slice(8, -1);\n}\n/**\n * 检查一个值是否为 Window 类型。\n *\n * @param value - 要检查的值。\n * @returns 如果值为 Window 类型，则返回 true，否则返回 false。\n */\nfunction isWindow(value) {\n    return typeof window !== "undefined" && getType(value) === "Window";\n}\n',
    type: "js",
    name: "isWindow",
    intro: "检查一个值是否为 Window 类型。",
  },
  {
    code: '/**\n * 将数字转换为中文数字。\n *\n * @param value - 要转换的数字。\n * @returns 转换后的中文数字。\n */\nfunction numberToChinese(value) {\n    const numberValue = typeof value === "number" ? value.toString() : value;\n    const chineseDigits = [\n        "零",\n        "一",\n        "二",\n        "三",\n        "四",\n        "五",\n        "六",\n        "七",\n        "八",\n        "九",\n    ];\n    const chineseUnits = ["", "十", "百", "千", "万", "亿"];\n    const numArray = Array.from(numberValue).reverse();\n    const chineseArray = numArray.map((num, index) => {\n        const digit = parseInt(num);\n        const digitChinese = chineseDigits[digit];\n        if (digit === 0) {\n            // 如果当前数字为零，则不处理\n            return "";\n        }\n        const unit = index % 4;\n        const unitChinese = chineseUnits[unit];\n        const isUnitFirst = index === 0 || (index > 0 && digit !== 1 && unit === 0);\n        return isUnitFirst ? digitChinese + unitChinese : digitChinese;\n    });\n    return chineseArray.reverse().join("");\n}\n',
    type: "js",
    name: "numberToChinese",
    intro: "将数字转换为中文数字。",
  },
  {
    code: "/**\n * 从对象中排除指定的属性，返回一个新的对象。\n *\n * @param obj - 要处理的对象。\n * @param keys - 要排除的属性键名数组。\n * @returns 排除指定属性后的新对象。\n */\nfunction omit(obj, keys) {\n    const clone = { ...obj };\n    keys.forEach((key) => delete clone[key]);\n    return clone;\n}\n",
    type: "js",
    name: "omit",
    intro: "从对象中排除指定的属性，返回一个新的对象。",
  },
  {
    code: "/**\n * 确保传入的方法只能被执行一次\n *\n * @param func - 要执行的方法。\n * @returns 返回一个新的方法，该方法只会执行一次\n */\nfunction once(fn) {\n    // 利用闭包判断函数是否执行过\n    let called = false;\n    return function () {\n        if (!called) {\n            called = true;\n            return fn.apply(this, arguments);\n        }\n    };\n}\n",
    type: "js",
    name: "once",
    intro: "确保传入的方法只能被执行一次",
  },
  {
    code: "/**\n * 从对象中选取指定的属性并返回新的对象。\n *\n * @param obj - 要选取属性的对象。\n * @param keys - 要选取的属性键名数组。\n * @returns 选取指定属性后的新对象。\n */\nfunction pick(obj, keys) {\n    const pickedObject = {};\n    keys.forEach((key) => {\n        if (obj.hasOwnProperty(key)) {\n            pickedObject[key] = obj[key];\n        }\n    });\n    return pickedObject;\n}\n",
    type: "js",
    name: "pick",
    intro: "从对象中选取指定的属性并返回新的对象。",
  },
  {
    code: "/**\n * 将蛇形变量名称转换为小驼峰命名。\n *\n * @param snakeCase - 要转换的蛇形变量名称。\n * @returns 转换后的小驼峰命名。\n */\nfunction snakeToCamel(snakeCase) {\n    return snakeCase.replace(/_([a-z])/g, function (_, char) {\n        return char.toUpperCase();\n    });\n}\n",
    type: "js",
    name: "snakeToCamel",
    intro: "将蛇形变量名称转换为小驼峰命名。",
  },
  {
    code: '/**\n * 下载一个 Blob 对象作为指定文件名的文件。\n *\n * @param fileName - 要保存的文件名。\n * @param blob - 要下载的 Blob 对象。\n */\nfunction downloadFile(type, fileName, blob) {\n    const downloadLink = document.createElement("a");\n    downloadLink.href = URL.createObjectURL(blob);\n    downloadLink.download = fileName;\n    downloadLink.click();\n    URL.revokeObjectURL(downloadLink.href);\n}\n',
    type: "js",
    name: "downloadFile",
    intro: "下载一个 Blob 对象作为指定文件名的文件。",
  },
  {
    code: '/**\n * 获取给定图片链接的宽度和高度。\n *\n * @param imageUrl - 图片链接。\n * @returns 返回一个 Promise，解析为包含宽度和高度的对象 { width, height }。\n */\nfunction getImageSize(imageUrl) {\n    return new Promise((resolve, reject) => {\n        const image = new Image();\n        image.onload = () => {\n            resolve({ width: image.width, height: image.height });\n        };\n        image.onerror = () => {\n            reject(new Error("Failed to load image."));\n        };\n        image.src = imageUrl;\n    });\n}\n',
    type: "js",
    name: "getImageSize",
    intro: "获取给定图片链接的宽度和高度。",
  },
  {
    code: '/**\n * 获取给定内容插入到指定 DOM 节点后，该节点在父容器中占据的行数。\n *\n * @bate\n * @param parent - 父容器 DOM 节点。\n * @param content - 要插入的内容。\n * @param insertBefore - 要插入在哪个 DOM 节点之前，默认为 null，表示插入到末尾。\n * @returns 插入内容后节点在父容器中占据的行数。\n */\nfunction getLinesCountAfterInsertion(parent, content, insertBefore = null) {\n    const clone = document.createElement("div");\n    clone.style.cssText = "visibility: hidden;";\n    if (typeof content === "string") {\n        clone.innerHTML = content;\n    }\n    else if (content instanceof HTMLElement) {\n        clone.appendChild(content);\n    }\n    parent.insertBefore(clone, insertBefore);\n    const lineHeight = parseFloat(getComputedStyle(clone).lineHeight);\n    const clientHeight = clone.clientHeight;\n    parent.removeChild(clone);\n    return Math.ceil(clientHeight / lineHeight);\n}\n',
    type: "js",
    name: "getLinesCountAfterInsertion",
    intro: "获取给定内容插入到指定 DOM 节点后，该节点在父容器中占据的行数。",
  },
  {
    code: 'function getType(value) {\n    return Object.prototype.toString.call(value).slice(8, -1);\n}\nfunction isString(value) {\n    return getType(value) === "String";\n}\n/**\n * 监听鼠标点击事件，如果点击事件不包含指定的元素，则触发回调函数，并返回一个销毁监听事件的方法。\n *\n * @param target - 要监听的目标元素或元素数组。\n * @param callback - 鼠标点击事件不包含目标元素时触发的回调函数。\n * @returns 一个函数，用于销毁监听事件。\n */\nfunction listenClickOutside(target, callback) {\n    let targets = [];\n    if (typeof target === "string") {\n        targets = [...document.querySelectorAll(target)].filter(Boolean);\n    }\n    else if (target instanceof Element) {\n        targets = [target];\n    }\n    else if (Array.isArray(target)) {\n        targets = target\n            .map((item) => {\n            if (isString(item)) {\n                return [...document.querySelectorAll(item)].filter((item) => item instanceof Element);\n            }\n            else if (item instanceof Element) {\n                return [item];\n            }\n            else {\n                return [];\n            }\n        })\n            .flat();\n    }\n    targets = targets.filter(el => el instanceof Element);\n    const handleClickOutside = (event) => {\n        const isClickOutside = targets.every((target) => !target.contains(event.target));\n        if (isClickOutside) {\n            callback();\n        }\n    };\n    document.addEventListener("click", handleClickOutside);\n    return () => {\n        document.removeEventListener("click", handleClickOutside);\n    };\n}\n',
    type: "js",
    name: "listenClickOutside",
    intro:
      "监听鼠标点击事件，如果点击事件不包含指定的元素，则触发回调函数，并返回一个销毁监听事件的方法。",
  },
  {
    code: 'function getType(value) {\n    return Object.prototype.toString.call(value).slice(8, -1);\n}\nfunction isString(value) {\n    return getType(value) === "String";\n}\nfunction isObject(value) {\n    return getType(value) === "Object";\n}\nfunction isHasObject(value) {\n    return isObject(value) && Object.keys(value).length > 0;\n}\n/**\n * 动态加载一组 JavaScript 文件。\n *\n * @param files - 要加载的 JavaScript 文件数组。\n * @returns 返回一个 Promise，在所有文件加载完成后解析。\n */\nfunction loadJS(files, config) {\n    // 获取head标签\n    const head = document.getElementsByTagName("head")[0];\n    if (isString(files))\n        files = [files];\n    // 使用 Promise.all 并行加载所有文件\n    return Promise.all(files.map((file) => {\n        return new Promise((resolve, reject) => {\n            // 创建script标签并添加到head\n            const scriptElement = document.createElement("script");\n            scriptElement.type = "text/javascript";\n            scriptElement.async = true;\n            scriptElement.src = file;\n            // 添加自定义属性\n            if (isHasObject(config)) {\n                Object.entries(config).forEach(([key, val]) => {\n                    scriptElement.setAttribute(key, String(val));\n                });\n            }\n            // 监听load事件，如果加载完成则resolve\n            scriptElement.addEventListener("load", () => resolve(), false);\n            // 监听error事件，如果加载失败则reject\n            scriptElement.addEventListener("error", () => reject(new Error(`Failed to load script: ${file}`)), false);\n            head.appendChild(scriptElement);\n        });\n    }));\n}\n',
    type: "js",
    name: "loadJS",
    intro: "动态加载一组 JavaScript 文件。",
  },
];
// codeList -- end
