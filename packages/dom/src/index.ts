/**
 * 获取给定内容插入到指定 DOM 节点后，该节点在父容器中占据的行数。
 *
 * @param parent - 父容器 DOM 节点。
 * @param content - 要插入的内容。
 * @param insertBefore - 要插入在哪个 DOM 节点之前，默认为 null，表示插入到末尾。
 * @returns 插入内容后节点在父容器中占据的行数。
 */
export function getLinesCountAfterInsertion(parent: HTMLElement, content: string | HTMLElement, insertBefore: HTMLElement | null = null): number {
  const clone = document.createElement('div');
  clone.style.cssText = 'visibility: hidden;';

  if (typeof content === 'string') {
    clone.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    clone.appendChild(content);
  }

  parent.insertBefore(clone, insertBefore);
  const lineHeight = parseFloat(getComputedStyle(clone).lineHeight);
  const clientHeight = clone.clientHeight;
  parent.removeChild(clone);

  return Math.ceil(clientHeight / lineHeight);
}


/**
 * 获取给定图片链接的宽度和高度。
 *
 * @param imageUrl - 图片链接。
 * @returns 返回一个 Promise，解析为包含宽度和高度的对象 { width, height }。
 */
export function getImageSize(imageUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.width, height: image.height });
    };
    image.onerror = () => {
      reject(new Error('Failed to load image.'));
    };
    image.src = imageUrl;
  });
}

/**
 * 监听鼠标点击事件，如果点击事件不包含指定的元素，则触发回调函数，并返回一个销毁监听事件的方法。
 *
 * @param target - 要监听的目标元素或元素数组。
 * @param callback - 鼠标点击事件不包含目标元素时触发的回调函数。
 * @returns 一个函数，用于销毁监听事件。
 */
export function listenClickOutside(target: Element | Element[], callback: () => void): () => void {
  const targets = Array.isArray(target) ? target : [target];

  const handleClickOutside = (event: MouseEvent) => {
    const isClickOutside = targets.every((target) => !target.contains(event.target as Node));
    if (isClickOutside) {
      callback();
    }
  };

  document.addEventListener('click', handleClickOutside);

  return () => {
    document.removeEventListener('click', handleClickOutside);
  };
}
