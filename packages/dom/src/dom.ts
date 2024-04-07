/**
 * Thanks to https://spothero.com/static/main/uniform/docs-js/module-DOMUtils.html
 */
import raf from "raf";
import { easeInOutCubic, EasingFunction } from "./easing";
import { isFunction, isString, toArray } from "@utilslib/core";

type CSSSelector = string;

// 与滚动相关的容器类型，因为 document 上没有 scroll 相关属性, 因此排除 document
type ScrollContainerElement = Window | HTMLElement;
type ScrollContainer = (() => ScrollContainerElement) | CSSSelector;

/**
 * 检查代码是否在服务器端环境中运行。
 * @returns {boolean} 如果代码在服务器端运行，则返回true，否则返回false。
 */
export const isServer = typeof window === "undefined";

/**
 * 使用正则表达式去除字符串两端的空格和特殊空白字符。
 * @param {string} str - 需要去除空格的字符串
 * @returns {string} 返回去除空格后的字符串
 */
const trim = (str: string): string => (str || "").replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, "");

/**
 * 动态返回一个事件绑定函数，根据运行环境选择使用addEventListener或attachEvent。
 * @param {Node} element - 要绑定事件的节点
 * @param {string} event - 事件类型
 * @param {EventListenerOrEventListenerObject} handler - 事件处理函数
 * @param {boolean | AddEventListenerOptions} [options] - 可选的事件参数
 * @returns {any} 返回一个函数，用于绑定指定事件到指定节点
 */
export const on = ((): any => {
  if (!isServer && Boolean(document.addEventListener)) {
    return (
      element: Node,
      event: string,
      handler: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ): any => {
      if (element && event && handler) {
        element.addEventListener(event, handler, options);
      }
    };
  }
  return (element: Node, event: string, handler: EventListenerOrEventListenerObject): any => {
    if (element && event && handler) {
      (element as any).attachEvent(`on${event}`, handler);
    }
  };
})();

/**
 * 动态返回一个事件解绑函数，根据运行环境选择使用removeEventListener或detachEvent。
 * @param {Node} element - 要解绑事件的节点
 * @param {string} event - 事件类型
 * @param {EventListenerOrEventListenerObject} handler - 事件处理函数
 * @param {boolean | AddEventListenerOptions} [options] - 可选的事件参数
 * @returns {any} 返回一个函数，用于解绑指定事件从指定节点
 */
export const off = ((): any => {
  if (!isServer && Boolean(document.removeEventListener)) {
    return (
      element: Node,
      event: string,
      handler: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ): any => {
      if (element && event) {
        element.removeEventListener(event, handler, options);
      }
    };
  }
  return (element: Node, event: string, handler: EventListenerOrEventListenerObject): any => {
    if (element && event) {
      (element as any).detachEvent(`on${event}`, handler);
    }
  };
})();

/**
 * 为指定节点的指定事件绑定一个只执行一次的事件处理函数。
 * @param {Node} element - 要绑定事件的节点
 * @param {string} event - 事件类型
 * @param {EventListenerOrEventListenerObject} handler - 事件处理函数
 * @param {boolean | AddEventListenerOptions} [options] - 可选的事件参数
 */
export function once(
  element: Node,
  event: string,
  handler: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
) {
  const handlerFn = isFunction(handler) ? handler : handler.handleEvent;
  const callback = (evt: any) => {
    handlerFn(evt);
    off(element, event, callback, options);
  };

  on(element, event, callback, options);
}

/**
 * 创建一个用于管理事件监听器的工具函数
 * @param elm - 要添加事件监听器的元素引用
 * @returns 返回一个包含添加和清除事件监听器功能的对象
 */
export function attachListeners(elm: Element) {
  const offs: Array<() => void> = [];
  return {
    add<K extends keyof HTMLElementEventMap>(
      type: K,
      listener: (ev: HTMLElementEventMap[K]) => void
    ) {
      if (!type) return;
      on(elm, type, listener);
      offs.push(() => {
        off(elm, type, listener);
      });
    },
    clean() {
      offs.forEach((handler) => handler?.());
      offs.length = 0;
    },
  };
}

/**
 * 检查元素是否包含指定的类名。
 * @param {Element} el - 要检查的元素
 * @param {string} cls - 要检查的类名
 * @returns {any} 如果元素包含指定类名则返回true，否则返回false
 */
export function hasClass(el: Element, cls: string): any {
  if (!el || !cls) return false;
  if (cls.indexOf(" ") !== -1) throw new Error("className should not contain space.");
  if (el.classList) {
    return el.classList.contains(cls);
  }
  return ` ${el.className} `.indexOf(` ${cls} `) > -1;
}

/**
 * 向元素添加一个或多个类名。
 * @param {Element} el - 要添加类名的元素
 * @param {string} cls - 要添加的类名，可以是多个类名以空格分隔
 */
export function addClass(el: Element, cls: string): any {
  if (!el) return;
  let curClass = el.className;
  const classes = (cls || "").split(" ");

  for (let i = 0, j = classes.length; i < j; i++) {
    const clsName = classes[i];
    if (!clsName) continue;

    if (el.classList) {
      el.classList.add(clsName);
    } else if (!hasClass(el, clsName)) {
      curClass += ` ${clsName}`;
    }
  }
  if (!el.classList) {
    el.className = curClass;
  }
}

/**
 * 从元素中移除一个或多个类名。
 * @param {Element} el - 要移除类名的元素
 * @param {string} cls - 要移除的类名，可以是多个类名以空格分隔
 */
export function removeClass(el: Element, cls: string): any {
  if (!el || !cls) return;
  const classes = cls.split(" ");
  let curClass = ` ${el.className} `;

  for (let i = 0, j = classes.length; i < j; i++) {
    const clsName = classes[i];
    if (!clsName) continue;

    if (el.classList) {
      el.classList.remove(clsName);
    } else if (hasClass(el, clsName)) {
      curClass = curClass.replace(` ${clsName} `, " ");
    }
  }
  if (!el.classList) {
    el.className = trim(curClass);
  }
}

/**
 * 获取要附加到的节点元素。
 * @param {any} node - 要附加到的节点元素，可以是函数、选择器字符串或元素对象
 * @param {any} [triggerNode] - 触发节点元素，可选
 * @returns {HTMLElement | Element} 返回要附加到的节点元素
 */
export const getAttach = (node: any, triggerNode?: any): HTMLElement | Element => {
  const attachNode = isFunction(node) ? node(triggerNode) : node;
  if (!attachNode) {
    return document.body;
  }
  if (isString(attachNode)) {
    return document.querySelector(attachNode)!;
  }
  if (attachNode instanceof HTMLElement) {
    return attachNode;
  }
  return document.body;
};

/**
 * 获取滚动容器元素。
 * @param {ScrollContainer} [container="body"] - 滚动容器元素，可以是选择器字符串、函数或元素对象，默认为"body"
 * @returns {ScrollContainerElement} 返回滚动容器元素
 */
export const getScrollContainer = (container: ScrollContainer = "body"): ScrollContainerElement => {
  if (isString(container)) {
    return document.querySelector(container) as HTMLElement;
  }
  if (isFunction(container)) {
    return container();
  }
  return container;
};

/**
 * 检查对象是否为window对象。
 * @param {any} obj - 要检查的对象
 * @returns {boolean} 如果对象是window对象则返回true，否则返回false
 */
function isWindow(obj: any) {
  return obj && obj === obj.window;
}

type ScrollTarget = HTMLElement | Window | Document;

/**
 * 获取指定滚动目标的滚动距离。
 * @param {ScrollTarget} target - 滚动目标
 * @param {boolean} [isLeft] - 是否获取水平方向的滚动距离，默认为垂直方向
 * @returns {number} 返回滚动距离
 */
export function getScroll(target: ScrollTarget, isLeft?: boolean): number {
  // node环境或者target为空
  if (isServer || !target) {
    return 0;
  }
  const method = isLeft ? "scrollLeft" : "scrollTop";
  let result = 0;
  if (isWindow(target)) {
    result = (target as Window)[isLeft ? "pageXOffset" : "pageYOffset"];
  } else if (target instanceof Document) {
    result = target.documentElement[method];
  } else if (target) {
    result = (target as HTMLElement)[method];
  }
  return result;
}

interface ScrollTopOptions {
  container?: ScrollTarget;
  duration?: number;
  easing?: EasingFunction;
}

declare type ScrollToResult<T = any> = T | { default: T };

/**
 * 滚动到指定位置的异步函数。
 * @param {number} target - 目标滚动位置
 * @param {ScrollTopOptions} opt - 滚动选项，包括容器、持续时间和缓动函数
 * @returns {Promise<ScrollToResult>} 返回一个Promise，表示滚动操作的结果
 */
export function scrollTo(target: number, opt: ScrollTopOptions): Promise<ScrollToResult> {
  const { container = window, duration = 450, easing = easeInOutCubic } = opt;
  const scrollTop = getScroll(container);
  const startTime = Date.now();
  return new Promise((res) => {
    const fnc = () => {
      const timestamp = Date.now();
      const time = timestamp - startTime;
      const nextScrollTop = easing(Math.min(time, duration), scrollTop, target, duration);
      if (isWindow(container)) {
        (container as Window).scrollTo(window.pageXOffset, nextScrollTop);
      } else if (container instanceof Document || container.constructor.name === "HTMLDocument") {
        (container as Document).documentElement.scrollTop = nextScrollTop;
      } else {
        (container as HTMLElement).scrollTop = nextScrollTop;
      }
      if (time < duration) {
        raf(fnc);
      } else {
        // 由于上面步骤设置了scrollTop, 滚动事件可能未触发完毕
        // 此时应该在下一帧再执行res
        raf(res);
      }
    };
    raf(fnc);
  });
}

/**
 * 检查父元素是否包含子元素。
 * @param {Element | Iterable<any> | ArrayLike<any>} parent - 父元素
 * @param {any} child - 子元素
 * @returns {boolean} 如果父元素包含子元素则返回true，否则返回false
 */
function containerDom(parent: Element | Iterable<any> | ArrayLike<any>, child: any): boolean {
  if (parent && child) {
    let pNode = child;
    while (pNode) {
      if (parent === pNode) {
        return true;
      }
      const { parentNode } = pNode;
      pNode = parentNode;
    }
  }
  return false;
}

/**
 * 监听点击事件，当点击元素在指定元素之外时执行回调函数。
 * @param {Element | Iterable<any> | ArrayLike<any>} els - 指定的元素或元素集合
 * @param {() => void} cb - 点击元素在指定元素之外时执行的回调函数
 */
export const clickOut = (els: Element | Iterable<any> | ArrayLike<any>, cb: () => void): void => {
  on(document, "click", (event: { target: Element }) => {
    els = toArray(els);
    const isFlag = Array.from(els).every((item) => containerDom(item, event.target) === false);
    return isFlag && cb && cb();
  });
};

/**
 * 检查节点是否发生溢出。
 * @param {Element |  Element[]} ele - 要检查的节点或节点数组
 * @returns {boolean} 如果节点发生溢出则返回true，否则返回false
 */
export const isNodeOverflow = (ele: Element | Element[]): boolean => {
  const { clientWidth = 0, scrollWidth = 0 } = ele as Element & {
    clientWidth: number;
    scrollWidth: number;
  };
  return scrollWidth > clientWidth;
};

/**
 * 将选定的元素滚动到父元素的可视区域内。
 * @param {HTMLElement} parentEle - 父元素
 * @param {HTMLElement} selected - 要滚动到可视区域内的选定元素
 */
export const scrollSelectedIntoView = (parentEle: HTMLElement, selected: HTMLElement) => {
  // 服务端不处理
  if (isServer) return;
  // selected不存在或selected父元素不为parentEle则不处理
  if (!selected || selected.offsetParent !== parentEle) {
    parentEle.scrollTop = 0;
    return;
  }
  const selectedTop = selected.offsetTop;
  const selectedBottom = selectedTop + selected.offsetHeight;
  const parentScrollTop = parentEle.scrollTop;
  const parentViewBottom = parentScrollTop + parentEle.clientHeight;
  if (selectedTop < parentScrollTop) {
    // selected元素滚动过了，则将其向下滚动到可视范围顶部
    parentEle.scrollTop = selectedTop;
  } else if (selectedBottom > parentViewBottom) {
    // selected元素未滚动到，则将其向上滚动到可视范围底部
    parentEle.scrollTop = selectedBottom - parentEle.clientHeight;
  }
};

/**
 * 模拟提交表单操作。
 * @param {HTMLFormElement} target - 要提交的表单元素
 */
export const requestSubmit = (target: HTMLFormElement) => {
  if (!(target instanceof HTMLFormElement)) {
    throw new Error("target must be HTMLFormElement");
  }
  const submitter = document.createElement("input");
  submitter.type = "submit";
  submitter.hidden = true;
  target.appendChild(submitter);
  submitter.click();
  target.removeChild(submitter);
};

/**
 * 检查元素是否在视口内。
 * @see {@link http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport}
 * @param {HTMLElement} elm - 要检查的元素
 * @param {HTMLElement} [parent] - 可选的父级元素
 * @returns {boolean} 如果元素在视口内则返回true，否则返回false
 */
export function elementInViewport(elm: HTMLElement, parent?: HTMLElement): boolean {
  const rect = elm.getBoundingClientRect();
  if (parent) {
    const parentRect = parent.getBoundingClientRect();
    return (
      rect.top >= parentRect.top &&
      rect.left >= parentRect.left &&
      rect.bottom <= parentRect.bottom &&
      rect.right <= parentRect.right
    );
  }
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom + 80 <= window.innerHeight &&
    rect.right <= window.innerWidth
  );
}

/**
 * 获取元素的指定CSS属性值。
 * @param {HTMLElement} element - 要获取属性值的元素
 * @param {string} propName - CSS属性名
 * @returns {string} 返回指定CSS属性的值（小写形式）
 */
export function getElmCssPropValue(element: HTMLElement, propName: string): string {
  let propValue = "";

  if (document.defaultView && document.defaultView.getComputedStyle) {
    propValue = document.defaultView.getComputedStyle(element, null).getPropertyValue(propName);
  }

  if (propValue && propValue.toLowerCase) {
    return propValue.toLowerCase();
  }

  return propValue;
}

/**
 * 判断元素是否处在 position fixed 中
 * @param {HTMLElement} element - 要检查的元素
 * @returns {boolean} 如果元素具有固定定位则返回true，否则返回false
 */
export function isFixed(element: HTMLElement): boolean {
  const p = element.parentNode as HTMLElement;

  if (!p || p.nodeName === "HTML") {
    return false;
  }

  if (getElmCssPropValue(element, "position") === "fixed") {
    return true;
  }

  return isFixed(p);
}

/**
 * 获取当前视图滑动的距离
 * @returns {{ scrollTop: number; scrollLeft: number }} 返回窗口的滚动位置信息
 */
export function getWindowScroll(): { scrollTop: number; scrollLeft: number } {
  const { body } = document;
  const docElm = document.documentElement;
  const scrollTop = window.pageYOffset || docElm.scrollTop || body.scrollTop;
  const scrollLeft = window.pageXOffset || docElm.scrollLeft || body.scrollLeft;

  return { scrollTop, scrollLeft };
}

/**
 * 获取窗口的尺寸。
 * @returns {{ width: number; height: number }} 返回窗口的宽度和高度
 */
export function getWindowSize(): { width: number; height: number } {
  if (window.innerWidth !== undefined) {
    return { width: window.innerWidth, height: window.innerHeight };
  }
  const doc = document.documentElement;
  return { width: doc.clientWidth, height: doc.clientHeight };
}

/**
 * 获取浏览器滚动条的宽度。
 * @description 新建一个带有滚动条的 div 元素，通过该元素的 offsetWidth 和 clientWidth 的差值即可获得
 * @returns {number} 返回浏览器滚动条的宽度
 */
export function getScrollbarWidth() {
  const scrollDiv = document.createElement("div");
  scrollDiv.style.cssText =
    "width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;";
  document.body.appendChild(scrollDiv);
  const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
  document.body.removeChild(scrollDiv);
  return scrollbarWidth;
}
