import { isNumberInRange, clampNumberRange, formatPrice, numberToChinese } from "../src/number";

describe("Number Utils", () => {
  describe("isNumberInRange", () => {
    it("should return true for numbers within range", () => {
      expect(isNumberInRange(5, [1, 10])).toBe(true);
      expect(isNumberInRange(1, [1, 10])).toBe(true);
      expect(isNumberInRange(10, [1, 10])).toBe(true);
      expect(isNumberInRange(0, [-5, 5])).toBe(true);
      expect(isNumberInRange(-1, [-5, 5])).toBe(true);
    });

    it("should return false for numbers outside range", () => {
      expect(isNumberInRange(0, [1, 10])).toBe(false);
      expect(isNumberInRange(11, [1, 10])).toBe(false);
      expect(isNumberInRange(-6, [-5, 5])).toBe(false);
      expect(isNumberInRange(6, [-5, 5])).toBe(false);
    });

    it("should handle reversed range order", () => {
      expect(isNumberInRange(5, [10, 1])).toBe(true);
      expect(isNumberInRange(1, [10, 1])).toBe(true);
      expect(isNumberInRange(10, [10, 1])).toBe(true);
      expect(isNumberInRange(0, [10, 1])).toBe(false);
      expect(isNumberInRange(11, [10, 1])).toBe(false);
    });

    it("should handle same range values", () => {
      expect(isNumberInRange(5, [5, 5])).toBe(true);
      expect(isNumberInRange(4, [5, 5])).toBe(false);
      expect(isNumberInRange(6, [5, 5])).toBe(false);
    });

    it("should handle negative ranges", () => {
      expect(isNumberInRange(-3, [-10, -1])).toBe(true);
      expect(isNumberInRange(-1, [-10, -1])).toBe(true);
      expect(isNumberInRange(-10, [-10, -1])).toBe(true);
      expect(isNumberInRange(0, [-10, -1])).toBe(false);
      expect(isNumberInRange(-11, [-10, -1])).toBe(false);
    });

    it("should handle decimal numbers", () => {
      expect(isNumberInRange(5.5, [5.0, 6.0])).toBe(true);
      expect(isNumberInRange(5.49, [5.5, 6.0])).toBe(false);
      expect(isNumberInRange(Math.PI, [3.14, 3.15])).toBe(true);
    });
  });

  describe("clampNumberRange", () => {
    it("should return numbers within range unchanged", () => {
      expect(clampNumberRange(5, [1, 10])).toBe(5);
      expect(clampNumberRange(1, [1, 10])).toBe(1);
      expect(clampNumberRange(10, [1, 10])).toBe(10);
    });

    it("should clamp numbers below minimum", () => {
      expect(clampNumberRange(0, [1, 10])).toBe(1);
      expect(clampNumberRange(-5, [1, 10])).toBe(1);
      expect(clampNumberRange(-100, [1, 10])).toBe(1);
    });

    it("should clamp numbers above maximum", () => {
      expect(clampNumberRange(11, [1, 10])).toBe(10);
      expect(clampNumberRange(15, [1, 10])).toBe(10);
      expect(clampNumberRange(100, [1, 10])).toBe(10);
    });

    it("should handle reversed range order", () => {
      expect(clampNumberRange(5, [10, 1])).toBe(5);
      expect(clampNumberRange(0, [10, 1])).toBe(1);
      expect(clampNumberRange(15, [10, 1])).toBe(10);
    });

    it("should handle same range values", () => {
      expect(clampNumberRange(5, [5, 5])).toBe(5);
      expect(clampNumberRange(4, [5, 5])).toBe(5);
      expect(clampNumberRange(6, [5, 5])).toBe(5);
    });

    it("should handle negative numbers", () => {
      expect(clampNumberRange(-3, [-10, -1])).toBe(-3);
      expect(clampNumberRange(-11, [-10, -1])).toBe(-10);
      expect(clampNumberRange(0, [-10, -1])).toBe(-1);
    });

    it("should handle decimal numbers", () => {
      expect(clampNumberRange(5.5, [5.0, 6.0])).toBe(5.5);
      expect(clampNumberRange(4.9, [5.0, 6.0])).toBe(5.0);
      expect(clampNumberRange(6.1, [5.0, 6.0])).toBe(6.0);
    });
  });

  describe("formatPrice", () => {
    it("should format integer prices", () => {
      expect(formatPrice(1234)).toBe("1,234");
      expect(formatPrice("1234567")).toBe("1,234,567");
      expect(formatPrice(0)).toBe("0");
    });

    it("should format decimal prices", () => {
      expect(formatPrice(1234.56)).toBe("1,234.56");
      expect(formatPrice("1234567.89")).toBe("1,234,567.89");
    });

    it("should format with specified decimal places", () => {
      expect(formatPrice(1234, 2)).toBe("1,234.00");
      expect(formatPrice(1234.5, 2)).toBe("1,234.50");
      expect(formatPrice(1234.567, 2)).toBe("1,234.57");
      expect(formatPrice(1234.5678, 3)).toBe("1,234.568");
    });

    it("should handle zero decimal places", () => {
      expect(formatPrice(1234.56, 0)).toBe("1,235");
      expect(formatPrice(1234.99, 0)).toBe("1,235");
      expect(formatPrice(1234.1, 0)).toBe("1,234");
    });

    it("should handle negative prices", () => {
      expect(formatPrice(-1234)).toBe("-1,234");
      expect(formatPrice(-1234.56, 2)).toBe("-1,234.56");
    });

    it("should handle invalid input", () => {
      expect(formatPrice("invalid")).toBe("NaN");
      expect(formatPrice("")).toBe("NaN");
      expect(formatPrice("abc123")).toBe("NaN");
    });

    it("should handle very large numbers", () => {
      expect(formatPrice(1234567890123)).toBe("1,234,567,890,123");
    });

    it("should handle very small numbers", () => {
      expect(formatPrice(0.001, 3)).toBe("0.001");
      expect(formatPrice(0.0001, 4)).toBe("0.0001");
    });
  });

  describe("numberToChinese", () => {
    it("should convert single digits", () => {
      expect(numberToChinese("0")).toBe("");
      expect(numberToChinese("1")).toBe("一");
      expect(numberToChinese("5")).toBe("五");
      expect(numberToChinese("9")).toBe("九");
    });

    it("should convert multi-digit numbers", () => {
      expect(numberToChinese("10")).toBe("一十");
      expect(numberToChinese("15")).toBe("一十五");
      expect(numberToChinese("20")).toBe("二十");
      expect(numberToChinese("25")).toBe("二十五");
      expect(numberToChinese("100")).toBe("一百");
      expect(numberToChinese("123")).toBe("一百二十三");
    });

    it("should handle larger numbers", () => {
      expect(numberToChinese("1234")).toBe("一千二百三十四");
      expect(numberToChinese("12345")).toBe("一万千三百四十五");
      expect(numberToChinese("123456789")).toBe("一亿二千三百四十五万六千七百八十九");
    });

    it("should handle zero in different positions", () => {
      expect(numberToChinese("101")).toBe("一百零一");
      expect(numberToChinese("1001")).toBe("一千零一");
      expect(numberToChinese("1010")).toBe("一千零一十");
      expect(numberToChinese("10001")).toBe("一万零一");
    });

    it("should handle string and number input", () => {
      expect(numberToChinese("123")).toBe("一百二十三");
      expect(numberToChinese(123)).toBe("一百二十三");
    });

    it("should handle empty and invalid input", () => {
      expect(numberToChinese("")).toBe("");
      expect(numberToChinese("0")).toBe("零");
    });

    it("should handle consecutive zeros", () => {
      expect(numberToChinese("10001")).toBe("一万零一");
      expect(numberToChinese("100001")).toBe("一十万零一");
      expect(numberToChinese("1000001")).toBe("一百万零一");
    });

    it("should handle numbers with trailing zeros", () => {
      expect(numberToChinese("100")).toBe("一百");
      expect(numberToChinese("1000")).toBe("一千");
      expect(numberToChinese("10000")).toBe("一万");
    });
  });
});
