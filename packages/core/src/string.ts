import { isString } from "./type";
import { isEmptyString } from "./validator";

/**
 * 生成指定长度的随机字符串。
 *
 * @param {number} length - 随机字符串的长度。默认值为 8。
 * @returns {string} 生成的随机字符串。
 * @example
 * ```ts
 * createRandomString(8) // => "aBcDeFgH"
 */
export function createRandomString(length: number = 8): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }

  return randomString;
}

/**
 * 将小驼峰命名转换为蛇形变量名称。
 *
 * @param {string} camelCase - 要转换的小驼峰命名字符串。
 * @returns {string} 转换后的蛇形变量名称。
 *
 * @example
 * ```js
 * camelToSnake('fooBar') // => 'foo_bar'
 * camelToSnake('fooBarBaz') // => 'foo_bar_baz'
 * camelToSnake('foo') // => 'foo'
 * ```
 */
export function camelToSnake(camelCase: string): string {
  return camelCase.replace(/[A-Z]/g, function (match) {
    return `_${match.toLowerCase()}`;
  });
}

/**
 * 将蛇形变量名称转换为小驼峰命名。
 *
 * @param {string} snakeCase - 要转换的蛇形变量名称。
 * @returns {string} 转换后的小驼峰命名。
 */
export function snakeToCamel(snakeCase: string): string {
  // 处理前导下划线的特殊情况
  if (snakeCase.startsWith("_")) {
    const withoutLeadingUnderscore = snakeCase.substring(1);
    return "_" + snakeToCamel(withoutLeadingUnderscore);
  }

  return snakeCase.replace(/_([a-z])/g, function (_, char) {
    return char.toUpperCase();
  });
}

/**
 * 将单词的首字母转为大写并返回，如果无法转为大写则返回原单词。
 *
 * @type {<T>(word: T) => T}
 * @param {T} word - 要处理的单词。
 * @returns {T} 首字母大写后的单词，如果无法转为大写或参数未提供则返回原单词。
 */
export function capitalize<T>(word: T): T {
  if (isString(word) && !isEmptyString(word)) {
    const firstChar = word.charAt(0).toUpperCase();
    return (firstChar + word.slice(1)) as T;
  }

  return word;
}

// /**
//  * 将字符串截断到指定长度，并添加省略号。
//  *
//  * @param {string} str - 要截断的字符串。
//  * @param {number} maxLength - 最大长度。
//  * @param {string} ellipsis - 省略号字符串，默认为 "..."。
//  * @returns {string} 截断后的字符串。
//  */
// export function truncate(str: string, maxLength: number, ellipsis: string = "..."): string {
//   if (!isString(str)) return "";
//   if (str.length <= maxLength) return str;
//   return str.slice(0, maxLength - ellipsis.length) + ellipsis;
// }

// /**
//  * 将字符串填充到指定长度。
//  *
//  * @param {string} str - 要填充的字符串。
//  * @param {number} length - 目标长度。
//  * @param {string} padChar - 填充字符，默认为空格。
//  * @param {boolean} padEnd - 是否在末尾填充，默认为 true。
//  * @returns {string} 填充后的字符串。
//  */
// export function pad(str: string, length: number, padChar: string = " ", padEnd: boolean = true): string {
//   if (!isString(str)) return "";
//   if (str.length >= length) return str;
//   const padString = padChar.repeat(length - str.length);
//   return padEnd ? str + padString : padString + str;
// }

// /**
//  * 检查字符串是否包含指定的子字符串（不区分大小写）。
//  *
//  * @param {string} str - 要检查的字符串。
//  * @param {string} substring - 要查找的子字符串。
//  * @returns {boolean} 如果包含子字符串，则返回 true，否则返回 false。
//  */
// export function containsIgnoreCase(str: string, substring: string): boolean {
//   if (!isString(str) || !isString(substring)) return false;
//   return str.toLowerCase().includes(substring.toLowerCase());
// }

// /**
//  * 将字符串转换为 kebab-case（短横线分隔）。
//  *
//  * @param {string} str - 要转换的字符串。
//  * @returns {string} 转换后的字符串。
//  */
// export function toKebabCase(str: string): string {
//   if (!isString(str)) return "";
//   return str
//     .replace(/([a-z])([A-Z])/g, "$1-$2")
//     .replace(/[\s_]+/g, "-")
//     .toLowerCase();
// }

// /**
//  * 将字符串转换为 PascalCase（帕斯卡命名）。
//  *
//  * @param {string} str - 要转换的字符串。
//  * @returns {string} 转换后的字符串。
//  */
// export function toPascalCase(str: string): string {
//   if (!isString(str)) return "";
//   return str.replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : "")).replace(/^(.)/, (c) => c.toUpperCase());
// }

// /**
//  * 将字符串转换为 camelCase（驼峰命名）。
//  *
//  * @param {string} str - 要转换的字符串。
//  * @returns {string} 转换后的字符串。
//  */
// export function toCamelCase(str: string): string {
//   if (!isString(str)) return "";
//   return str.replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : "")).replace(/^(.)/, (c) => c.toLowerCase());
// }

// /**
//  * 将字符串中的 HTML 特殊字符转义。
//  *
//  * @param {string} str - 要转义的字符串。
//  * @returns {string} 转义后的字符串。
//  */
// export function escapeHtml(str: string): string {
//   if (!isString(str)) return "";
//   return str
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;")
//     .replace(/'/g, "&#39;");
// }

// /**
//  * 将转义的 HTML 特殊字符还原。
//  *
//  * @param {string} str - 要还原的字符串。
//  * @returns {string} 还原后的字符串。
//  */
// export function unescapeHtml(str: string): string {
//   if (!isString(str)) return "";
//   return str
//     .replace(/&amp;/g, "&")
//     .replace(/&lt;/g, "<")
//     .replace(/&gt;/g, ">")
//     .replace(/&quot;/g, '"')
//     .replace(/&#39;/g, "'");
// }

// /**
//  * 移除字符串中的 HTML 标签。
//  *
//  * @param {string} str - 要处理的字符串。
//  * @returns {string} 处理后的字符串。
//  */
// export function stripHtml(str: string): string {
//   if (!isString(str)) return "";
//   return str.replace(/<[^>]*>/g, "");
// }

// /**
//  * 将字符串中的换行符转换为 HTML 的 <br> 标签。
//  *
//  * @param {string} str - 要转换的字符串。
//  * @returns {string} 转换后的字符串。
//  */
// export function nl2br(str: string): string {
//   if (!isString(str)) return "";
//   return str.replace(/\n/g, "<br>");
// }

// /**
//  * 生成指定长度的随机数字字符串。
//  *
//  * @param {number} length - 字符串长度。
//  * @returns {string} 生成的随机数字字符串。
//  */
// export function randomDigits(length: number): string {
//   if (length <= 0) return "";
//   let result = "";
//   for (let i = 0; i < length; i++) {
//     result += Math.floor(Math.random() * 10);
//   }
//   return result;
// }

// /**
//  * 检查字符串是否为有效的电子邮件地址。
//  *
//  * @param {string} email - 要检查的电子邮件地址。
//  * @returns {boolean} 如果是有效的电子邮件地址，则返回 true，否则返回 false。
//  */
// export function isValidEmail(email: string): boolean {
//   if (!isString(email)) return false;
//   // 基本的电子邮件验证正则表达式
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   return emailRegex.test(email);
// }
