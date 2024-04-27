[@utilslib](../README.md) / [Modules](../modules.md) / @utilslib/dom

# Module: @utilslib/dom

## Table of contents

### Interfaces

- [EasingFunction](../interfaces/utilslib_dom.EasingFunction.md)

### Variables

- [isServer](utilslib_dom.md#isserver)
- [off](utilslib_dom.md#off)
- [on](utilslib_dom.md#on)

### Functions

- [addClass](utilslib_dom.md#addclass)
- [attachListeners](utilslib_dom.md#attachlisteners)
- [clickOut](utilslib_dom.md#clickout)
- [copyText](utilslib_dom.md#copytext)
- [downloadFile](utilslib_dom.md#downloadfile)
- [downloadFileByBlob](utilslib_dom.md#downloadfilebyblob)
- [downloadFileByUrl](utilslib_dom.md#downloadfilebyurl)
- [easeInOutCubic](utilslib_dom.md#easeinoutcubic)
- [elementInViewport](utilslib_dom.md#elementinviewport)
- [getAttach](utilslib_dom.md#getattach)
- [getElmCssPropValue](utilslib_dom.md#getelmcsspropvalue)
- [getImageSize](utilslib_dom.md#getimagesize)
- [getLinesCountAfterInsertion](utilslib_dom.md#getlinescountafterinsertion)
- [getScroll](utilslib_dom.md#getscroll)
- [getScrollContainer](utilslib_dom.md#getscrollcontainer)
- [getScrollbarWidth](utilslib_dom.md#getscrollbarwidth)
- [getWindowScroll](utilslib_dom.md#getwindowscroll)
- [getWindowSize](utilslib_dom.md#getwindowsize)
- [hasClass](utilslib_dom.md#hasclass)
- [isFixed](utilslib_dom.md#isfixed)
- [isNodeOverflow](utilslib_dom.md#isnodeoverflow)
- [linear](utilslib_dom.md#linear)
- [listenClickOutside](utilslib_dom.md#listenclickoutside)
- [loadJS](utilslib_dom.md#loadjs)
- [once](utilslib_dom.md#once)
- [removeClass](utilslib_dom.md#removeclass)
- [requestSubmit](utilslib_dom.md#requestsubmit)
- [scrollSelectedIntoView](utilslib_dom.md#scrollselectedintoview)
- [scrollTo](utilslib_dom.md#scrollto)

## Variables

### isServer

• `Const` **isServer**: `boolean`

检查代码是否在服务器端环境中运行。

#### Defined in

[dom.ts:18](https://github.com/T-Tuan/utilslib/blob/6668147/packages/dom/src/dom.ts#L18)

___

### off

• `Const` **off**: `any`

动态返回一个事件解绑函数，根据运行环境选择使用removeEventListener或detachEvent。

**`Param`**

要解绑事件的节点

**`Param`**

事件类型

**`Param`**

事件处理函数

**`Param`**

可选的事件参数

#### Defined in

[dom.ts:63](https://github.com/T-Tuan/utilslib/blob/6668147/packages/dom/src/dom.ts#L63)

___

### on

• `Const` **on**: `any`

动态返回一个事件绑定函数，根据运行环境选择使用addEventListener或attachEvent。

**`Param`**

要绑定事件的节点

**`Param`**

事件类型

**`Param`**

事件处理函数

**`Param`**

可选的事件参数

#### Defined in

[dom.ts:35](https://github.com/T-Tuan/utilslib/blob/6668147/packages/dom/src/dom.ts#L35)

## Functions

### addClass

▸ **addClass**(`el`, `cls`): `any`

向元素添加一个或多个类名。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `el` | `Element` | 要添加类名的元素 |
| `cls` | `string` | 要添加的类名，可以是多个类名以空格分隔 |

#### Returns

`any`

#### Defined in

[dom.ts:150](https://github.com/T-Tuan/utilslib/blob/6668147/packages/dom/src/dom.ts#L150)

___

### attachListeners

▸ **attachListeners**(`elm`): `Object`

创建一个用于管理事件监听器的工具函数

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `elm` | `Element` | 要添加事件监听器的元素引用 |

#### Returns

`Object`

返回一个包含添加和清除事件监听器功能的对象

| Name | Type |
| :------ | :------ |
| `add` | <K\>(`type`: `K`, `listener`: (`ev`: `HTMLElementEventMap`[`K`]) => `void`) => `void` |
| `clean` | () => `void` |

#### Defined in

[dom.ts:110](https://github.com/T-Tuan/utilslib/blob/6668147/packages/dom/src/dom.ts#L110)

___

### clickOut

▸ **clickOut**(`els`, `cb`): `void`

监听点击事件，当点击元素在指定元素之外时执行回调函数。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `els` | `Element` \| `Iterable`<`any`\> \| `ArrayLike`<`any`\> | 指定的元素或元素集合 |
| `cb` | () => `void` | 点击元素在指定元素之外时执行的回调函数 |

#### Returns

`void`

#### Defined in

[dom.ts:331](https://github.com/T-Tuan/utilslib/blob/6668147/packages/dom/src/dom.ts#L331)

___

### copyText

▸ **copyText**(`text`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `text` | `string` |

#### Returns

`void`

#### Defined in

[clipboard.ts:3](https://github.com/T-Tuan/utilslib/blob/6668147/packages/dom/src/clipboard.ts#L3)

___

### downloadFile

▸ **downloadFile**(`src`, `fileName?`): `void`

下载文件。

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `src` | `string` \| `Blob` | `undefined` | 要下载的资源（可以是字符串或 Blob 对象） |
| `fileName?` | `string` | `""` | 要保存的文件名。 |

#### Returns

`void`

#### Defined in

[index.ts:124](https://github.com/T-Tuan/utilslib/blob/6668147/packages/dom/src/index.ts#L124)

___

### downloadFileByBlob

▸ **downloadFileByBlob**(`blob`, `fileName?`): `void`

下载一个 Blob 对象作为指定文件名的文件。

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `blob` | `Blob` | `undefined` | 要下载的 Blob 对象。 |
| `fileName?` | `string` | `""` | 要保存的文件名。 |

#### Returns

`void`

#### Defined in

[index.ts:112](https://github.com/T-Tuan/utilslib/blob/6668147/packages/dom/src/index.ts#L112)

___

### downloadFileByUrl

▸ **downloadFileByUrl**(`url`, `fileName?`): `void`

下载一个 Blob 对象作为指定文件名的文件。

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `url` | `string` | `undefined` | 要下载的文件链接 |
| `fileName?` | `string` | `""` | 要保存的文件名。 |

#### Returns

`void`

#### Defined in

[index.ts:98](https://github.com/T-Tuan/utilslib/blob/6668147/packages/dom/src/index.ts#L98)

___

### easeInOutCubic

▸ **easeInOutCubic**(`current`, `start`, `end`, `duration`): `number`

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `current` | `number` | 当前时间 |
| `start` | `number` | 开始值 |
| `end` | `number` | 结束值 |
| `duration` | `number` | 持续时间 |

#### Returns

`number`

**`Export`**

#### Defined in

[easing.ts:8](https://github.com/T-Tuan/utilslib/blob/6668147/packages/dom/src/easing.ts#L8)

___

### elementInViewport

▸ **elementInViewport**(`elm`, `parent?`): `boolean`

检查元素是否在视口内。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `elm` | `HTMLElement` | 要检查的元素 |
| `parent?` | `HTMLElement` | 可选的父级元素 |

#### Returns

`boolean`

如果元素在视口内则返回true，否则返回false

**`See`**

[http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport](http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport)

#### Defined in

[dom.ts:401](https://github.com/T-Tuan/utilslib/blob/6668147/packages/dom/src/dom.ts#L401)

___

### getAttach

▸ **getAttach**(`node`, `triggerNode?`): `HTMLElement` \| `Element`

获取要附加到的节点元素。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `node` | `any` | 要附加到的节点元素，可以是函数、选择器字符串或元素对象 |
| `triggerNode?` | `any` | 触发节点元素，可选 |

#### Returns

`HTMLElement` \| `Element`

返回要附加到的节点元素

#### Defined in

[dom.ts:201](https://github.com/T-Tuan/utilslib/blob/6668147/packages/dom/src/dom.ts#L201)

___

### getElmCssPropValue

▸ **getElmCssPropValue**(`element`, `propName`): `string`

获取元素的指定CSS属性值。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `element` | `HTMLElement` | 要获取属性值的元素 |
| `propName` | `string` | CSS属性名 |

#### Returns

`string`

返回指定CSS属性的值（小写形式）

#### Defined in

[dom.ts:426](https://github.com/T-Tuan/utilslib/blob/6668147/packages/dom/src/dom.ts#L426)

___

### getImageSize

▸ **getImageSize**(`imageUrl`): `Promise`<{ `height`: `number` ; `width`: `number`  }\>

获取给定图片链接的宽度和高度。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `imageUrl` | `string` | 图片链接。 |

#### Returns

`Promise`<{ `height`: `number` ; `width`: `number`  }\>

返回一个 Promise，解析为包含宽度和高度的对象 { width, height }。

#### Defined in

[index.ts:41](https://github.com/T-Tuan/utilslib/blob/6668147/packages/dom/src/index.ts#L41)

___

### getLinesCountAfterInsertion

▸ **getLinesCountAfterInsertion**<`C`\>(`parent`, `content`, `insertBefore?`): `number`

获取给定内容插入到指定 DOM 节点后，该节点在父容器中占据的行数。

#### Type parameters

| Name | Type |
| :------ | :------ |
| `C` | `string` \| `HTMLElement` |

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `parent` | `HTMLElement` | `undefined` | 父容器 DOM 节点。 |
| `content` | `C` | `undefined` | 要插入的内容。 |
| `insertBefore?` | ``null`` \| `HTMLElement` | `null` | 要插入在哪个 DOM 节点之前，默认为 null，表示插入到末尾。 |

#### Returns

`number`

插入内容后节点在父容器中占据的行数。

#### Defined in

[index.ts:14](https://github.com/T-Tuan/utilslib/blob/6668147/packages/dom/src/index.ts#L14)

___

### getScroll

▸ **getScroll**(`target`, `isLeft?`): `number`

获取指定滚动目标的滚动距离。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `ScrollTarget` | 滚动目标 |
| `isLeft?` | `boolean` | 是否获取水平方向的滚动距离，默认为垂直方向 |

#### Returns

`number`

返回滚动距离

#### Defined in

[dom.ts:247](https://github.com/T-Tuan/utilslib/blob/6668147/packages/dom/src/dom.ts#L247)

___

### getScrollContainer

▸ **getScrollContainer**(`container?`): `ScrollContainerElement`

获取滚动容器元素。

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `container?` | `ScrollContainer` | `"body"` | 滚动容器元素，可以是选择器字符串、函数或元素对象，默认为"body" |

#### Returns

`ScrollContainerElement`

返回滚动容器元素

#### Defined in

[dom.ts:220](https://github.com/T-Tuan/utilslib/blob/6668147/packages/dom/src/dom.ts#L220)

___

### getScrollbarWidth

▸ **getScrollbarWidth**(): `number`

获取浏览器滚动条的宽度。

#### Returns

`number`

返回浏览器滚动条的宽度

**`Description`**

新建一个带有滚动条的 div 元素，通过该元素的 offsetWidth 和 clientWidth 的差值即可获得

#### Defined in

[dom.ts:489](https://github.com/T-Tuan/utilslib/blob/6668147/packages/dom/src/dom.ts#L489)

___

### getWindowScroll

▸ **getWindowScroll**(): `Object`

获取当前视图滑动的距离

#### Returns

`Object`

返回窗口的滚动位置信息

| Name | Type |
| :------ | :------ |
| `scrollLeft` | `number` |
| `scrollTop` | `number` |

#### Defined in

[dom.ts:463](https://github.com/T-Tuan/utilslib/blob/6668147/packages/dom/src/dom.ts#L463)

___

### getWindowSize

▸ **getWindowSize**(): `Object`

获取窗口的尺寸。

#### Returns

`Object`

返回窗口的宽度和高度

| Name | Type |
| :------ | :------ |
| `height` | `number` |
| `width` | `number` |

#### Defined in

[dom.ts:476](https://github.com/T-Tuan/utilslib/blob/6668147/packages/dom/src/dom.ts#L476)

___

### hasClass

▸ **hasClass**(`el`, `cls`): `any`

检查元素是否包含指定的类名。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `el` | `Element` | 要检查的元素 |
| `cls` | `string` | 要检查的类名 |

#### Returns

`any`

如果元素包含指定类名则返回true，否则返回false

#### Defined in

[dom.ts:136](https://github.com/T-Tuan/utilslib/blob/6668147/packages/dom/src/dom.ts#L136)

___

### isFixed

▸ **isFixed**(`element`): `boolean`

判断元素是否处在 position fixed 中

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `element` | `HTMLElement` | 要检查的元素 |

#### Returns

`boolean`

如果元素具有固定定位则返回true，否则返回false

#### Defined in

[dom.ts:445](https://github.com/T-Tuan/utilslib/blob/6668147/packages/dom/src/dom.ts#L445)

___

### isNodeOverflow

▸ **isNodeOverflow**(`ele`): `boolean`

检查节点是否发生溢出。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `ele` | `Element` \| `Element`[] | 要检查的节点或节点数组 |

#### Returns

`boolean`

如果节点发生溢出则返回true，否则返回false

#### Defined in

[dom.ts:344](https://github.com/T-Tuan/utilslib/blob/6668147/packages/dom/src/dom.ts#L344)

___

### linear

▸ **linear**(`current`, `start`, `end`, `duration`): `number`

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `current` | `number` | 当前时间 |
| `start` | `number` | 开始值 |
| `end` | `number` | 结束值 |
| `duration` | `number` | 持续时间 |

#### Returns

`number`

**`Export`**

#### Defined in

[easing.ts:8](https://github.com/T-Tuan/utilslib/blob/6668147/packages/dom/src/easing.ts#L8)

___

### listenClickOutside

▸ **listenClickOutside**<`T`\>(`target`, `callback`): () => `void`

监听鼠标点击事件，如果点击事件不包含指定的元素，则触发回调函数，并返回一个销毁监听事件的方法。

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `undefined` \| `string` \| `Element` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `T` \| `T`[] | 要监听的目标元素或元素数组。 |
| `callback` | () => `void` | 鼠标点击事件不包含目标元素时触发的回调函数。 |

#### Returns

`fn`

一个函数，用于销毁监听事件。

▸ (): `void`

##### Returns

`void`

#### Defined in

[index.ts:61](https://github.com/T-Tuan/utilslib/blob/6668147/packages/dom/src/index.ts#L61)

___

### loadJS

▸ **loadJS**(`files`, `config?`): `Promise`<`void`[]\>

动态加载一组 JavaScript 文件。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `files` | `string` \| `string`[] | 要加载的 JavaScript 文件数组。 |
| `config?` | `Pick`<`Partial`<`HTMLScriptElement`\>, ``"type"`` \| ``"async"``\> | 配置选项，可选。 |

#### Returns

`Promise`<`void`[]\>

返回一个 Promise，在所有文件加载完成后解析。

#### Defined in

[index.ts:148](https://github.com/T-Tuan/utilslib/blob/6668147/packages/dom/src/index.ts#L148)

___

### once

▸ **once**(`element`, `event`, `handler`, `options?`): `void`

为指定节点的指定事件绑定一个只执行一次的事件处理函数。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `element` | `Node` | 要绑定事件的节点 |
| `event` | `string` | 事件类型 |
| `handler` | `EventListenerOrEventListenerObject` | 事件处理函数 |
| `options?` | `boolean` \| `AddEventListenerOptions` | 可选的事件参数 |

#### Returns

`void`

#### Defined in

[dom.ts:90](https://github.com/T-Tuan/utilslib/blob/6668147/packages/dom/src/dom.ts#L90)

___

### removeClass

▸ **removeClass**(`el`, `cls`): `any`

从元素中移除一个或多个类名。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `el` | `Element` | 要移除类名的元素 |
| `cls` | `string` | 要移除的类名，可以是多个类名以空格分隔 |

#### Returns

`any`

#### Defined in

[dom.ts:175](https://github.com/T-Tuan/utilslib/blob/6668147/packages/dom/src/dom.ts#L175)

___

### requestSubmit

▸ **requestSubmit**(`target`): `void`

模拟提交表单操作。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `HTMLFormElement` | 要提交的表单元素 |

#### Returns

`void`

#### Defined in

[dom.ts:382](https://github.com/T-Tuan/utilslib/blob/6668147/packages/dom/src/dom.ts#L382)

___

### scrollSelectedIntoView

▸ **scrollSelectedIntoView**(`parentEle`, `selected`): `void`

将选定的元素滚动到父元素的可视区域内。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `parentEle` | `HTMLElement` | 父元素 |
| `selected` | `HTMLElement` | 要滚动到可视区域内的选定元素 |

#### Returns

`void`

#### Defined in

[dom.ts:357](https://github.com/T-Tuan/utilslib/blob/6668147/packages/dom/src/dom.ts#L357)

___

### scrollTo

▸ **scrollTo**(`target`, `opt`): `Promise`<`ScrollToResult`\>

滚动到指定位置的异步函数。

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `number` | 目标滚动位置 |
| `opt` | `ScrollTopOptions` | 滚动选项，包括容器、持续时间和缓动函数 |

#### Returns

`Promise`<`ScrollToResult`\>

返回一个Promise，表示滚动操作的结果

#### Defined in

[dom.ts:278](https://github.com/T-Tuan/utilslib/blob/6668147/packages/dom/src/dom.ts#L278)
