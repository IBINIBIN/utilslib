/**
 * 从文件路径中提取文件名，可选择去除扩展名。
 *
 * @param {string} path - 包含文件名的路径。
 * @param {string} [ext] - 可选的扩展名，如果提供且文件名以该扩展名结尾，则会从结果中移除。
 * @returns {string} 提取出的文件名。
 * @example
 * ```ts
 * basename('/path/to/file.txt') // => "file.txt"
 * basename('/path/to/file.txt', '.txt') // => "file"
 * ```
 */
export function getBasename(path: string, ext?: string): string {
  if (!path || typeof path !== "string") return "";
  const filename =
    path
      .replace(/[\/\\]+$/, "")
      .split(/[\/\\]/)
      .pop() || "";
  return ext && filename.endsWith(ext) ? filename.slice(0, -ext.length) : filename;
}

/**
 * 获取文件名（不包含扩展名）。
 *
 * @param {string} fileName - 文件名。
 * @returns {string | ""} 提取的文件名。
 */
export function getFileName(fileName: string): string | "" {
  const name = getBasename(fileName);
  const lastDotIndex = name.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return name;
  }
  return name.slice(0, lastDotIndex);
}

/**
 * 获取文件名的后缀。
 *
 * @param {string} filename - 文件名。
 * @returns {string | ""} 文件名的后缀。
 */
export function getFileExtension(filename: string): string | "" {
  // 处理以点开头的特殊文件名（如.gitignore）
  if (filename.startsWith(".") && filename.indexOf(".", 1) === -1) {
    return filename.substring(1);
  }
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
}
