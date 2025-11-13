/**
 * 下载文件。
 *
 * @param {Blob | string} src - 要下载的资源（可以是字符串或 Blob 对象）
 * @param {string} [fileName=""] - 要保存的文件名。
 */
export function downloadFile(src: Blob | string, fileName: string = ""): void {
  const url = typeof src === "string" ? src : URL.createObjectURL(src);
  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = fileName;
  downloadLink.click();
  downloadLink.remove();
  URL.revokeObjectURL(url);
}

/**
 * 安全移除元素
 * @param element - 要移除的元素
 */
export function removeElement(element: Element): void {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

/**
 * 添加一个或多个CSS类
 * @param element - 目标元素
 * @param classNames - 要添加的类名
 */
export function addClass(element: Element, ...classNames: string[]): void {
  if (element && classNames.length > 0) {
    element.classList.add(...classNames);
  }
}

/**
 * 移除一个或多个CSS类
 * @param element - 目标元素
 * @param classNames - 要移除的类名
 */
export function removeClass(element: Element, ...classNames: string[]): void {
  if (element && classNames.length > 0) {
    element.classList.remove(...classNames);
  }
}

/**
 * 检查是否包含某个CSS类
 * @param element - 目标元素
 * @param className - 要检查的类名
 * @returns 是否包含指定类名
 */
export function hasClass(element: Element, className: string): boolean {
  return element ? element.classList.contains(className) : false;
}

/**
 * 安全获取属性值
 * @param element - 目标元素
 * @param attributeName - 属性名
 * @returns 属性值，如果不存在返回 null
 */
export function getAttribute(element: Element, attributeName: string): string | null {
  return element ? element.getAttribute(attributeName) : null;
}

/**
 * 设置属性
 * @param element - 目标元素
 * @param attributeName - 属性名
 * @param value - 属性值
 */
export function setAttribute(element: Element, attributeName: string, value: string): void {
  if (element) {
    element.setAttribute(attributeName, value);
  }
}

/**
 * 移除属性
 * @param element - 目标元素
 * @param attributeName - 属性名
 */
export function removeAttribute(element: Element, attributeName: string): void {
  if (element) {
    element.removeAttribute(attributeName);
  }
}

/**
 * 检查是否为DOM元素
 * @param value - 要检查的值
 * @returns 是否为DOM元素
 */
export function isElement(value: any): value is Element {
  return value && typeof value === "object" && value.nodeType === Node.ELEMENT_NODE;
}

/**
 * 检查元素是否可见
 * @param element - 要检查的元素
 * @returns 元素是否可见
 */
export function isVisible(element: HTMLElement): boolean {
  if (!element) return false;

  const style = getComputedStyle(element);
  return (
    style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0" && element.offsetParent !== null
  );
}

/**
 * 等待元素出现
 * @param selector - CSS选择器
 * @param timeout - 超时时间（毫秒），默认5000
 * @returns Promise<Element> - 找到的元素
 */
export function waitForElement(selector: string, timeout: number = 5000): Promise<Element> {
  return new Promise((resolve, reject) => {
    // 立即检查元素是否已存在
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    // 使用 MutationObserver 监听DOM变化
    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        clearTimeout(timeoutId);
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // 设置超时
    const timeoutId = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element with selector "${selector}" not found within ${timeout}ms`));
    }, timeout);
  });
}

/**
 * 复制文本到剪贴板
 * @param text - 要复制的文本
 * @returns Promise<boolean> - 是否复制成功
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // 优先使用现代 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // 降级方案：使用 document.execCommand
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand("copy");
    textArea.remove();

    return successful;
  } catch (error) {
    console.error("Failed to copy text:", error);
    return false;
  }
}

/**
 * 检测元素中的文字是否超出指定行数
 * @param element - 要检测的元素
 * @param maxLines - 最大行数，默认为1
 * @returns 文字是否超出了指定行数
 */
export function isTextOverflowing(element: HTMLElement, maxLines: number = 1): boolean {
  if (!element) return false;

  // 克隆元素以测量实际内容
  const clone = element.cloneNode(true) as HTMLElement;

  // 重置克隆元素的样式，让它完全展开
  const cloneStyle = clone.style;
  const originalStyle = getComputedStyle(element);

  cloneStyle.position = "absolute";
  cloneStyle.visibility = "hidden";
  cloneStyle.top = "-9999px";
  cloneStyle.left = "-9999px";
  cloneStyle.width = originalStyle.width;
  cloneStyle.height = "auto";
  cloneStyle.maxHeight = "none";
  cloneStyle.overflow = "visible";
  cloneStyle.textOverflow = "clip";
  cloneStyle.whiteSpace = originalStyle.whiteSpace === "nowrap" ? "nowrap" : "normal";
  cloneStyle.webkitLineClamp = "unset";

  // 临时添加到DOM中测量
  document.body.appendChild(clone);

  // 获取完全展开后的高度
  const fullHeight = clone.scrollHeight;

  // 移除克隆元素
  clone.remove();

  // 获取原始元素的单行高度
  const style = getComputedStyle(element);
  const lineHeight = style.lineHeight === "normal" ? parseFloat(style.fontSize) * 1.2 : parseFloat(style.lineHeight);

  // 计算允许的最大高度
  const maxHeight = lineHeight * maxLines;

  // 比较完全展开的高度和允许的最大高度
  return fullHeight > maxHeight;
}

/**
 * 检测单行文字是否超出容器宽度
 * @param element - 要检测的元素
 * @returns 文字是否超出容器宽度
 */
export function isTextOverflowingWidth(element: HTMLElement): boolean {
  if (!element) return false;

  // 创建临时span来测量文字实际宽度
  const span = document.createElement("span");
  span.style.position = "absolute";
  span.style.visibility = "hidden";
  span.style.whiteSpace = "nowrap";
  span.textContent = element.textContent || element.innerText;

  // 继承原元素的字体相关样式
  const style = getComputedStyle(element);
  span.style.fontSize = style.fontSize;
  span.style.fontFamily = style.fontFamily;
  span.style.fontWeight = style.fontWeight;
  span.style.letterSpacing = style.letterSpacing;
  span.style.textTransform = style.textTransform;

  document.body.appendChild(span);
  const textWidth = span.offsetWidth;
  span.remove();

  // 获取容器的可用宽度（减去padding）
  const paddingLeft = parseFloat(style.paddingLeft);
  const paddingRight = parseFloat(style.paddingRight);
  const availableWidth = element.clientWidth - paddingLeft - paddingRight;

  return textWidth > availableWidth;
}

/**
 * 获取元素中文字的完整内容（包括可能被隐藏的部分）
 * @param element - 目标元素
 * @returns 完整的文本内容
 */
export function getFullTextContent(element: HTMLElement): string {
  return element?.textContent || element?.innerText || "";
}

/**
 * 检测元素是否应用了文本截断样式（text-overflow: ellipsis）
 * @param element - 要检测的元素
 * @returns 是否应用了文本截断样式
 */
export function hasTextTruncation(element: HTMLElement): boolean {
  if (!element) return false;

  const style = getComputedStyle(element);
  return style.textOverflow === "ellipsis" || style.textOverflow === "clip" || style.overflow === "hidden";
}
