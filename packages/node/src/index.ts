// @utilslib/node 入口
export function isNode() {
  return Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) === "[object process]";
}
