/**
 * 创建一个延迟执行的 Promise，用于在异步函数中暂停执行
 *
 * @param ms - 延迟的毫秒数，必须为非负整数
 * @returns 返回一个在指定时间后 resolve 的 Promise<void>
 */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
