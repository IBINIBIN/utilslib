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
