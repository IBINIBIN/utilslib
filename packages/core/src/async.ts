/**
 * 创建一个延迟执行的 Promise，用于在异步函数中暂停执行
 *
 * @param ms - 延迟的毫秒数，必须为非负整数
 * @returns 返回一个在指定时间后 resolve 的 Promise<void>
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 批量执行异步函数，限制并发数
 *
 * @template T - 任务函数返回值类型
 * @param {(() => Promise<T>)[]} tasks - 异步任务函数数组
 * @param {number} concurrency - 最大并发数
 * @returns {Promise<T[]>} 所有任务的结果数组，顺序与任务数组一致
 */
export async function batchAsync<T>(tasks: (() => Promise<T>)[], concurrency: number = 5): Promise<T[]> {
  if (!tasks.length) return [];

  const results: T[] = new Array(tasks.length);
  const executing: Promise<void>[] = [];
  let index = 0;

  const enqueue = async (): Promise<void> => {
    if (index >= tasks.length) return;

    const currentIndex = index++;
    const task = tasks[currentIndex];

    try {
      results[currentIndex] = await task();
    } catch (error) {
      results[currentIndex] = error as any;
    }

    // 从执行队列中移除已完成的任务
    const executingIndex = executing.indexOf(executingPromise);
    if (executingIndex !== -1) {
      executing.splice(executingIndex, 1);
    }

    // 继续执行下一个任务
    return enqueue();
  };

  const executingPromise = enqueue();
  executing.push(executingPromise);

  // 启动初始的并发任务
  for (let i = 1; i < concurrency && i < tasks.length; i++) {
    const executingPromise = enqueue();
    executing.push(executingPromise);
  }

  // 等待所有任务完成
  await Promise.all(executing);

  return results;
}

/**
 * 重试执行异步函数
 *
 * @template T - 函数返回值类型
 * @param {() => Promise<T>} fn - 要重试的异步函数
 * @param {number} retries - 最大重试次数
 * @param {number} delay - 重试间隔（毫秒）
 * @param {(error: any, attempt: number) => boolean} [shouldRetry] - 判断是否应该重试的函数
 * @returns {Promise<T>} 函数执行结果
 */
export async function retry<T>(
  fn: () => Promise<T>,
  retries: number,
  delay: number,
  shouldRetry?: (error: any, attempt: number) => boolean,
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < retries && (shouldRetry ? shouldRetry(error, attempt) : true)) {
        await sleep(delay);
        continue;
      }

      break;
    }
  }

  throw lastError;
}
