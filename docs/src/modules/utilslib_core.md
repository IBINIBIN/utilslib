[@utilslib](../README.md) / [Modules](../modules.md) / @utilslib/core

# Module: @utilslib/core

## Table of contents

### Functions

- [camelToSnake](utilslib_core.md#cameltosnake)
- [capitalize](utilslib_core.md#capitalize)
- [catchError](utilslib_core.md#catcherror)
- [clampNumberWithinRange](utilslib_core.md#clampnumberwithinrange)
- [createRandomString](utilslib_core.md#createrandomstring)
- [filterList](utilslib_core.md#filterlist)
- [findNodeByDFS](utilslib_core.md#findnodebydfs)
- [flattenTreeArray](utilslib_core.md#flattentreearray)
- [formatNumber](utilslib_core.md#formatnumber)
- [formatPrice](utilslib_core.md#formatprice)
- [getArrayIntersection](utilslib_core.md#getarrayintersection)
- [getBasename](utilslib_core.md#getbasename)
- [getFileExtension](utilslib_core.md#getfileextension)
- [getFileName](utilslib_core.md#getfilename)
- [isArray](utilslib_core.md#isarray)
- [isBigInt](utilslib_core.md#isbigint)
- [isBlob](utilslib_core.md#isblob)
- [isBoolean](utilslib_core.md#isboolean)
- [isDate](utilslib_core.md#isdate)
- [isDef](utilslib_core.md#isdef)
- [isEmpty](utilslib_core.md#isempty)
- [isEmptyArray](utilslib_core.md#isemptyarray)
- [isEmptyObject](utilslib_core.md#isemptyobject)
- [isEmptyString](utilslib_core.md#isemptystring)
- [isError](utilslib_core.md#iserror)
- [isFunction](utilslib_core.md#isfunction)
- [isHasArray](utilslib_core.md#ishasarray)
- [isHasObject](utilslib_core.md#ishasobject)
- [isHasString](utilslib_core.md#ishasstring)
- [isMap](utilslib_core.md#ismap)
- [isNonNullable](utilslib_core.md#isnonnullable)
- [isNull](utilslib_core.md#isnull)
- [isNullOrUndefined](utilslib_core.md#isnullorundefined)
- [isNumber](utilslib_core.md#isnumber)
- [isObject](utilslib_core.md#isobject)
- [isPromise](utilslib_core.md#ispromise)
- [isRegExp](utilslib_core.md#isregexp)
- [isSet](utilslib_core.md#isset)
- [isString](utilslib_core.md#isstring)
- [isSymbol](utilslib_core.md#issymbol)
- [isTargetInOptions](utilslib_core.md#istargetinoptions)
- [isUndefined](utilslib_core.md#isundefined)
- [isValueInRange](utilslib_core.md#isvalueinrange)
- [isWindow](utilslib_core.md#iswindow)
- [numberToChinese](utilslib_core.md#numbertochinese)
- [omit](utilslib_core.md#omit)
- [once](utilslib_core.md#once)
- [pick](utilslib_core.md#pick)
- [snakeToCamel](utilslib_core.md#snaketocamel)
- [toArray](utilslib_core.md#toarray)

## Functions

### camelToSnake

▸ **camelToSnake**(`camelCase`): `string`

将小驼峰命名转换为蛇形变量名称。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `camelCase` | `string` | 要转换的小驼峰命名字符串。 |

#### Returns

`string`

转换后的蛇形变量名称。

**`Example`**

```js
camelToSnake('fooBar') // => 'foo_bar'
camelToSnake('fooBarBaz') // => 'foo_bar_baz'
camelToSnake('foo') // => 'foo'
```

#### Defined in

[string.ts:125](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/string.ts#L125)

___

### capitalize

▸ **capitalize**<`T`\>(`word`): `T`

将单词的首字母转为大写并返回，如果无法转为大写则返回原单词。

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `word` | `T` | 要处理的单词。 |

#### Returns

`T`

首字母大写后的单词，如果无法转为大写或参数未提供则返回原单词。

#### Defined in

[string.ts:171](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/string.ts#L171)

___

### catchError

▸ **catchError**<`F`, `R`\>(`this`, `fn`): `Promise`<[``0``, `R`, ``null``] \| [``1``, ``null``, `unknown`]\>

通用错误捕获函数，用于执行可能会抛出异常的函数，并捕获异常信息。

#### Type parameters

| Name | Type |
| :------ | :------ |
| `F` | extends (...`args`: `any`) => `any` |
| `R` | `UnpackPromise`<`ReturnType`<`F`\>\> |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `this` | `unknown` | - |
| `fn` | `F` | 可能会抛出异常的函数。 |

#### Returns

`Promise`<[``0``, `R`, ``null``] \| [``1``, ``null``, `unknown`]\>

返回一个元组，包含错误标识、函数执行结果或 null 、异常信息或 null。

#### Defined in

[function.ts:30](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/function.ts#L30)

___

### clampNumberWithinRange

▸ **clampNumberWithinRange**(`numberToClamp`, `range`): `number`

确保给定数字在指定范围内。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `numberToClamp` | `number` | 要限制的数字。 |
| `range` | [`number`, `number`] | 范围，表示为 [min, max] 数组。 |

#### Returns

`number`

在指定范围内的值。

#### Defined in

[array.ts:29](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/array.ts#L29)

___

### createRandomString

▸ **createRandomString**(`length?`): `string`

生成指定长度的随机字符串。

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `length` | `number` | `8` | 随机字符串的长度。默认值为 8。 |

#### Returns

`string`

生成的随机字符串。

**`Example`**

```ts
createRandomString(8) // => "aBcDeFgH"

#### Defined in

[string.ts:12](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/string.ts#L12)

___

### filterList

▸ **filterList**<`T`, `R`\>(`list`, `property`, `includes`, `excludes?`): `T`[]

根据指定条件筛选列表

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Record`<`string`, `any`\> |
| `R` | extends `string` \| `number` \| `symbol` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `list` | `T`[] | 要筛选的列表 |
| `property` | `R` | 属性名或属性键 |
| `includes` | `T`[`R`][] | 包含的值列表 |
| `excludes?` | `T`[`R`][] | 排除的值列表 |

#### Returns

`T`[]

- 筛选后的列表

#### Defined in

[array.ts:65](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/array.ts#L65)

▸ **filterList**<`T`\>(`list`, `includes`, `excludes?`): `T`[]

根据指定条件筛选列表

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `list` | `T`[] | 要筛选的列表 |
| `includes` | `T`[] | 包含的值列表 |
| `excludes?` | `T`[] | 排除的值列表 |

#### Returns

`T`[]

- 筛选后的列表

#### Defined in

[array.ts:80](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/array.ts#L80)

___

### findNodeByDFS

▸ **findNodeByDFS**<`T`\>(`arr`, `compareAttr`, `nextLevelAttr`, `value`): `undefined` \| `TargetData`<`T`\>

使用深度优先搜索算法递归查找指定属性值的节点，并返回匹配节点的数据、父级数据列表和层级关系。

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Record`<`string`, `any`\> |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `arr` | `T`[] | 要进行搜索的数组。 |
| `compareAttr` | `string` | 需要查找的属性名。 |
| `nextLevelAttr` | `string` | 子级循环字段 |
| `value` | `unknown` | 需要查找的属性值。 |

#### Returns

`undefined` \| `TargetData`<`T`\>

匹配节点的数据、父级数据列表和层级关系。

#### Defined in

[common.ts:69](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/common.ts#L69)

___

### flattenTreeArray

▸ **flattenTreeArray**<`T`, `P`, `ID`, `R`\>(`arr`, `childrenProperty`, `idAttr`, `includeParent?`): `R`[]

打平嵌套的树形结构数组，并为每个节点添加 level 和 parentId 字段。

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Object` |
| `P` | extends `string` \| `number` \| `symbol` |
| `ID` | extends `string` \| `number` \| `symbol` |
| `R` | `never` |

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `arr` | `T`[] | `undefined` | 嵌套的树形结构数组。 |
| `childrenProperty` | `P` | `undefined` | 子节点属性的键名。 |
| `idAttr` | `ID` | `undefined` | 节点 ID 属性的键名。 |
| `includeParent?` | `boolean` | `true` | 是否包含父节点，默认为 true。 |

#### Returns

`R`[]

打平后的数组。

#### Defined in

[common.ts:100](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/common.ts#L100)

___

### formatNumber

▸ **formatNumber**(`value`, `threshold?`): `string`

格式化数字，如果超过指定值则显示为指定值+。

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `value` | `string` \| `number` | `undefined` | 要格式化的数字。 |
| `threshold` | `number` | `99` | 阈值，超过该值则显示为该值+。默认值为 99。 |

#### Returns

`string`

格式化后的字符串。

#### Defined in

[string.ts:150](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/string.ts#L150)

___

### formatPrice

▸ **formatPrice**(`value`, `decimalPlaces?`): `string`

格式化价格，添加千位分隔符并保留指定的小数位数。

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `value` | `string` \| `number` | `undefined` | 要格式化的价格。 |
| `decimalPlaces` | `number` | `-1` | 可选的小数位数，默认为不处理小数位数。 |

#### Returns

`string`

格式化后的价格。

#### Defined in

[string.ts:67](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/string.ts#L67)

___

### getArrayIntersection

▸ **getArrayIntersection**<`T`, `K`\>(`arr1`, `arr2`, `key?`): `T`[]

获取两个数组的交集，通过指定字段属性进行判断。

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T` |
| `K` | extends `string` \| `number` \| `symbol` = keyof `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `arr1` | `T`[] | 第一个数组。「主数组,当返回的内容从主数组中获取」 |
| `arr2` | `T`[] | 第二个数组。 |
| `key?` | `K` | 可选的字段属性，用于判断交集。 |

#### Returns

`T`[]

交集的数组。

#### Defined in

[array.ts:10](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/array.ts#L10)

___

### getBasename

▸ **getBasename**(`path`): `string`

从文件路径中提取文件名。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `path` | `string` | 包含文件名的路径。 |

#### Returns

`string`

提取出的文件名。

#### Defined in

[string.ts:30](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/string.ts#L30)

___

### getFileExtension

▸ **getFileExtension**(`filename`): `string`

获取文件名的后缀。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `filename` | `string` | 文件名。 |

#### Returns

`string`

文件名的后缀。

#### Defined in

[string.ts:56](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/string.ts#L56)

___

### getFileName

▸ **getFileName**<`T`\>(`fileName`): `string` \| ``""``

获取文件名（不包含扩展名）。

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fileName` | `string` | 文件名。 |

#### Returns

`string` \| ``""``

提取的文件名。

#### Defined in

[string.ts:41](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/string.ts#L41)

___

### isArray

▸ **isArray**(`value`): value is any[]

检查一个值是否为 Array 类型。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `unknown` | 要检查的值。 |

#### Returns

value is any[]

如果值为 Array 类型，则返回 true，否则返回 false。

#### Defined in

[is.ts:110](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/is.ts#L110)

___

### isBigInt

▸ **isBigInt**(`value`): value is BigInt

检查一个值是否为 BigInt 类型。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `unknown` | 要检查的值。 |

#### Returns

value is BigInt

如果值为 BigInt 类型，则返回 true，否则返回 false。

#### Defined in

[is.ts:80](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/is.ts#L80)

___

### isBlob

▸ **isBlob**(`value`): value is Blob

检查一个值是否为 Blob 类型。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `unknown` | 要检查的值。 |

#### Returns

value is Blob

如果值为 Blob 类型，则返回 true，否则返回 false。

#### Defined in

[is.ts:130](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/is.ts#L130)

___

### isBoolean

▸ **isBoolean**(`value`): value is boolean

检查一个值是否为 boolean 类型。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `unknown` | 要检查的值。 |

#### Returns

value is boolean

如果值为 boolean 类型，则返回 true，否则返回 false。

#### Defined in

[is.ts:50](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/is.ts#L50)

___

### isDate

▸ **isDate**(`value`): value is Date

检查一个值是否为 Date 类型。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `unknown` | 要检查的值。 |

#### Returns

value is Date

如果值为 Date 类型，则返回 true，否则返回 false。

#### Defined in

[is.ts:140](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/is.ts#L140)

___

### isDef

▸ **isDef**<`T`\>(`value`): value is T

检查一个值是否为非undefined。
注: 非「undefined」类型

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `unknown` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `undefined` \| `T` | 要检查的值。 |

#### Returns

value is T

如果值不为 Undefined 类型，则返回 true，否则返回 false。

#### Defined in

[is.ts:20](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/is.ts#L20)

___

### isEmpty

▸ **isEmpty**(`value`): value is undefined \| null \| "" \| []

检查一个值是否为空。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `unknown` | 要检查的值。 |

#### Returns

value is undefined \| null \| "" \| []

如果值为空，则返回 true，否则返回 false。

#### Defined in

[is.ts:284](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/is.ts#L284)

___

### isEmptyArray

▸ **isEmptyArray**(`value`): value is any[]

检查一个值是否为空数组。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `unknown` | 要检查的值。 |

#### Returns

value is any[]

如果值为空数组，则返回 true，否则返回 false。

#### Defined in

[is.ts:274](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/is.ts#L274)

___

### isEmptyObject

▸ **isEmptyObject**(`value`): value is object

检查一个值是否为空对象。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `unknown` | 要检查的值。 |

#### Returns

value is object

如果值为空对象，则返回 true，否则返回 false。

#### Defined in

[is.ts:254](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/is.ts#L254)

___

### isEmptyString

▸ **isEmptyString**(`value`): value is ""

检查一个值是否为空字符串。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `unknown` | 要检查的值。 |

#### Returns

value is ""

如果值为空字符串，则返回 true，否则返回 false。

#### Defined in

[is.ts:234](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/is.ts#L234)

___

### isError

▸ **isError**(`value`): value is Error

检查一个值是否为 Error 类型。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `unknown` | 要检查的值。 |

#### Returns

value is Error

如果值为 Error 类型，则返回 true，否则返回 false。

#### Defined in

[is.ts:160](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/is.ts#L160)

___

### isFunction

▸ **isFunction**(`value`): value is Function

检查一个值是否为 Function 类型。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `unknown` | 要检查的值。 |

#### Returns

value is Function

如果值为 Function 类型，则返回 true，否则返回 false。

#### Defined in

[is.ts:120](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/is.ts#L120)

___

### isHasArray

▸ **isHasArray**(`value`): value is any[]

检查一个值是否为非空数组。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `unknown` | 要检查的值。 |

#### Returns

value is any[]

如果值为非空数组，则返回 true，否则返回 false。

#### Defined in

[is.ts:300](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/is.ts#L300)

___

### isHasObject

▸ **isHasObject**(`value`): value is object

检查一个值是否为非空对象。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `unknown` | 要检查的值。 |

#### Returns

value is object

如果值有最少一个可枚举属性，则返回 true，否则返回 false。

#### Defined in

[is.ts:264](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/is.ts#L264)

___

### isHasString

▸ **isHasString**(`value`): value is string

检查一个值是否为非空字符串。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `unknown` | 要检查的值。 |

#### Returns

value is string

如果值为非空字符串，则返回 true，否则返回 false。

#### Defined in

[is.ts:244](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/is.ts#L244)

___

### isMap

▸ **isMap**(`value`): value is Map<any, any\>

检查一个值是否为 Map 类型。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `unknown` | 要检查的值。 |

#### Returns

value is Map<any, any\>

如果值为 Map 类型，则返回 true，否则返回 false。

#### Defined in

[is.ts:170](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/is.ts#L170)

___

### isNonNullable

▸ **isNonNullable**<`T`\>(`value`): value is NonNullable<T\>

检查一个值是否为 `undefined` 或 `null`。

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `unknown` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `T` | 要检查的值。 |

#### Returns

value is NonNullable<T\>

如果值为 `undefined` 或 `null`，则返回 `true`，否则返回 `false`。

#### Defined in

[is.ts:224](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/is.ts#L224)

___

### isNull

▸ **isNull**(`value`): value is null

检查一个值是否为 Null 类型。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `unknown` | 要检查的值。 |

#### Returns

value is null

如果值为 Null 类型，则返回 true，否则返回 false。

#### Defined in

[is.ts:40](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/is.ts#L40)

___

### isNullOrUndefined

▸ **isNullOrUndefined**(`value`): value is undefined \| null

检查一个值是否为 `undefined` 或 `null`。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `unknown` | 要检查的值。 |

#### Returns

value is undefined \| null

如果值为 `undefined` 或 `null`，则返回 `true`，否则返回 `false`。

#### Defined in

[is.ts:214](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/is.ts#L214)

___

### isNumber

▸ **isNumber**(`value`): value is number

检查一个值是否为 Number 类型。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `unknown` | 要检查的值。 |

#### Returns

value is number

如果值为 Number 类型，则返回 true，否则返回 false。

#### Defined in

[is.ts:60](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/is.ts#L60)

___

### isObject

▸ **isObject**(`value`): value is object

检查一个值是否为 Object 类型。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `unknown` | 要检查的值。 |

#### Returns

value is object

如果值为 Object 类型，则返回 true，否则返回 false。

#### Defined in

[is.ts:100](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/is.ts#L100)

___

### isPromise

▸ **isPromise**(`value`): value is Promise<any\>

检查一个值是否为 Promise 类型。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `unknown` | 要检查的值。 |

#### Returns

value is Promise<any\>

如果值为 Promise 类型，则返回 true，否则返回 false。

#### Defined in

[is.ts:190](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/is.ts#L190)

___

### isRegExp

▸ **isRegExp**(`value`): value is RegExp

检查一个值是否为 RegExp 类型。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `unknown` | 要检查的值。 |

#### Returns

value is RegExp

如果值为 RegExp 类型，则返回 true，否则返回 false。

#### Defined in

[is.ts:150](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/is.ts#L150)

___

### isSet

▸ **isSet**(`value`): value is Set<any\>

检查一个值是否为 Set 类型。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `unknown` | 要检查的值。 |

#### Returns

value is Set<any\>

如果值为 Set 类型，则返回 true，否则返回 false。

#### Defined in

[is.ts:180](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/is.ts#L180)

___

### isString

▸ **isString**(`value`): value is string

检查一个值是否为 String 类型。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `unknown` | 要检查的值。 |

#### Returns

value is string

如果值为 String 类型，则返回 true，否则返回 false。

#### Defined in

[is.ts:70](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/is.ts#L70)

___

### isSymbol

▸ **isSymbol**(`value`): value is symbol

检查一个值是否为 Symbol 类型。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `unknown` | 要检查的值。 |

#### Returns

value is symbol

如果值为 Symbol 类型，则返回 true，否则返回 false。

#### Defined in

[is.ts:90](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/is.ts#L90)

___

### isTargetInOptions

▸ **isTargetInOptions**<`T`\>(`target`, `...options`): `boolean`

检查指定目标是否在选项中（选项可以是单个对象或对象数组）。

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `T` | 目标项。 |
| `...options` | (`T` \| `T`[])[] | 选项，可以是单个对象或对象数组。 |

#### Returns

`boolean`

若目标项在选项中，则返回 true；否则返回 false。

#### Defined in

[is.ts:311](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/is.ts#L311)

___

### isUndefined

▸ **isUndefined**(`value`): value is undefined

检查一个值是否为 Undefined 类型。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `unknown` | 要检查的值。 |

#### Returns

value is undefined

如果值为 Undefined 类型，则返回 true，否则返回 false。

#### Defined in

[is.ts:30](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/is.ts#L30)

___

### isValueInRange

▸ **isValueInRange**(`value`, `range`): `boolean`

检测给定的值(数字)是否在指定范围内。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `number` | 要检测的值。 |
| `range` | [`number`, `number`] | 范围，包含最小值和最大值。 |

#### Returns

`boolean`

如果值在范围内，则返回 true，否则返回 false。

#### Defined in

[is.ts:327](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/is.ts#L327)

___

### isWindow

▸ **isWindow**(`value`): `boolean`

检查一个值是否为 Window 类型。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `any` | 要检查的值。 |

#### Returns

`boolean`

如果值为 Window 类型，则返回 true，否则返回 false。

#### Defined in

[is.ts:200](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/is.ts#L200)

___

### numberToChinese

▸ **numberToChinese**(`value`): `string`

将数字转换为中文数字。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `string` \| `number` | 要转换的数字。 |

#### Returns

`string`

转换后的中文数字。

#### Defined in

[string.ts:87](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/string.ts#L87)

___

### omit

▸ **omit**<`T`, `K`\>(`obj`, `keys`): `Omit`<`T`, `K`\>

从对象中排除指定的属性，返回一个新的对象。

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `T` | extends `Record`<`string`, `any`\> | 对象类型。 |
| `K` | extends `string` \| `number` \| `symbol` | 要排除的属性键名类型。 |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `obj` | `T` | 要处理的对象。 |
| `keys` | `K`[] | 要排除的属性键名数组。 |

#### Returns

`Omit`<`T`, `K`\>

排除指定属性后的新对象。

#### Defined in

[object.ts:11](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/object.ts#L11)

___

### once

▸ **once**(`fn`): (`this`: `unknown`) => `any`

确保传入的方法只能被执行一次

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | (...`args`: `any`) => `any` |

#### Returns

`fn`

返回一个新的方法，该方法只会执行一次

▸ (`this`): `any`

##### Parameters

| Name | Type |
| :------ | :------ |
| `this` | `unknown` |

##### Returns

`any`

#### Defined in

[function.ts:7](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/function.ts#L7)

___

### pick

▸ **pick**<`T`, `K`\>(`obj`, `keys`): `Pick`<`T`, `K`\>

从对象中选取指定的属性并返回新的对象。

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `T` | extends `Record`<`string`, `any`\> | 对象类型。 |
| `K` | extends `string` \| `number` \| `symbol` | 要选取的属性键名类型。 |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `obj` | `T` | 要选取属性的对象。 |
| `keys` | `K`[] | 要选取的属性键名数组。 |

#### Returns

`Pick`<`T`, `K`\>

选取指定属性后的新对象。

#### Defined in

[object.ts:30](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/object.ts#L30)

___

### snakeToCamel

▸ **snakeToCamel**(`snakeCase`): `string`

将蛇形变量名称转换为小驼峰命名。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `snakeCase` | `string` | 要转换的蛇形变量名称。 |

#### Returns

`string`

转换后的小驼峰命名。

#### Defined in

[string.ts:137](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/string.ts#L137)

___

### toArray

▸ **toArray**<`T`\>(`value`): `T`[]

将值或值数组转换为数组。

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `T` \| `T`[] | 要转换的值或值数组。 |

#### Returns

`T`[]

转换后的数组。

**`Example`**

```ts
const result = toArray("value"); // ['value']
const resultArray = toArray(["value1", "value2"]); // ['value1', 'value2']
```

#### Defined in

[array.ts:44](https://github.com/T-Tuan/utilslib/blob/6668147/packages/core/src/array.ts#L44)
