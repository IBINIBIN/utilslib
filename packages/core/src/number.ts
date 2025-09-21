/**
 * 检测给定的值(数字)是否在指定范围内。
 *
 * @param {number} value - 要检测的值。
 * @param {[number, number]} range - 范围，包含最小值和最大值。
 * @returns {boolean} 如果值在范围内，则返回 true，否则返回 false。
 */
export function isNumberInRange(value: number, range: [number, number]): boolean {
  const [min, max] = range[0] <= range[1] ? range : [range[1], range[0]];
  return value >= min && value <= max;
}

/**
 * 确保给定数字在指定范围内。
 *
 * @param {number} n - 要限制的数字。
 * @param {[number, number]} range - 范围，表示为 [min, max] 数组。
 * @returns {number} 在指定范围内的值。
 */
export function clampNumberRange(n: number, range: [number, number]): number {
  const [min, max] = range[0] <= range[1] ? range : [range[1], range[0]];
  return Math.max(min, Math.min(n, max));
}

/**
 * 格式化价格，添加千位分隔符并保留指定的小数位数。
 *
 * @param {string | number} value - 要格式化的价格。
 * @param {number} decimalPlaces - 可选的小数位数，默认为不处理小数位数。
 * @returns {string} 格式化后的价格。
 */
export function formatPrice(value: string | number, decimalPlaces: number = -1): string {
  const numberValue = typeof value === "number" ? value : parseFloat(value);
  if (isNaN(numberValue)) value.toString();
  const options = {
    minimumFractionDigits: decimalPlaces >= 0 ? decimalPlaces : 0,
    maximumFractionDigits: decimalPlaces >= 0 ? decimalPlaces : 2,
  };

  return numberValue.toLocaleString(undefined, options);
}

/**
 * 将数字转换为中文数字。
 *
 * @param {string | number} value - 要转换的数字。
 * @returns {string} 转换后的中文数字。
 */
export function numberToChinese(value: string | number): string {
  const numberValue = typeof value === "number" ? value.toString() : value;
  const chineseDigits = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  const chineseUnits = ["", "十", "百", "千", "万", "亿"];

  const numArray = Array.from(numberValue).reverse();
  const chineseArray = numArray.map((num, index) => {
    const digit = parseInt(num);
    const digitChinese = chineseDigits[digit];

    if (digit === 0) {
      // 如果当前数字为零，则不处理
      return "";
    }

    const unit = index % 4;
    const unitChinese = chineseUnits[unit];
    const isUnitFirst = index === 0 || (index > 0 && digit !== 1 && unit === 0);

    return isUnitFirst ? digitChinese + unitChinese : digitChinese;
  });

  return chineseArray.reverse().join("");
}
