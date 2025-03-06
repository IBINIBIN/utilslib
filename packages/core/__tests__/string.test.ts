/// <reference types="jest" />

import {
  createRandomString,
  getBasename,
  getFileName,
  getFileExtension,
  formatPrice,
  numberToChinese,
  camelToSnake,
  snakeToCamel,
  formatNumber,
  capitalize,
} from "../src/string.js";

describe("string.ts 测试", () => {
  describe("createRandomString", () => {
    test("生成指定长度的随机字符串", () => {
      const str1 = createRandomString();
      const str2 = createRandomString(10);

      expect(str1.length).toBe(8); // 默认长度为8
      expect(str2.length).toBe(10);
      expect(str1).not.toBe(str2); // 随机性测试
    });

    test("生成的字符串只包含合法字符", () => {
      const randomString = createRandomString(100);
      expect(randomString).toMatch(/^[A-Za-z0-9]+$/);
    });
  });

  describe("getBasename", () => {
    test("从路径中提取文件名", () => {
      expect(getBasename("/path/to/file.txt")).toBe("file.txt");
      expect(getBasename("/path/to/folder/")).toBe("folder");
      expect(getBasename("file.txt")).toBe("file.txt");
    });

    test("处理带扩展名的情况", () => {
      expect(getBasename("/path/to/file.txt", ".txt")).toBe("file");
      expect(getBasename("file.txt", ".txt")).toBe("file");
      expect(getBasename("file.txt.bak", ".bak")).toBe("file.txt");
    });

    test("处理空路径或非字符串", () => {
      expect(getBasename("")).toBe("");
      expect(getBasename(null as any)).toBe("");
      expect(getBasename(undefined as any)).toBe("");
    });

    test("处理只有路径分隔符的情况", () => {
      expect(getBasename("/")).toBe("");
    });

    test("处理多个路径分隔符的情况", () => {
      expect(getBasename("/path//to///file.txt")).toBe("file.txt");
    });
  });

  describe("getFileName", () => {
    test("提取不带扩展名的文件名", () => {
      expect(getFileName("/path/to/file.txt")).toBe("file");
      expect(getFileName("file.txt")).toBe("file");
      expect(getFileName("file")).toBe("file");
    });

    test("处理多个点的文件名", () => {
      expect(getFileName("file.tar.gz")).toBe("file.tar");
      expect(getFileName(".hidden")).toBe("");
    });

    test("处理边缘情况", () => {
      expect(getFileName("")).toBe("");
      expect(getFileName(".")).toBe("");
    });
  });

  describe("getFileExtension", () => {
    test("提取文件扩展名", () => {
      expect(getFileExtension("file.txt")).toBe("txt");
      expect(getFileExtension("file.tar.gz")).toBe("gz");
      expect(getFileExtension("file")).toBe("");
    });

    test("处理以点开头的文件名", () => {
      expect(getFileExtension(".gitignore")).toBe("gitignore");
    });
  });

  describe("formatPrice", () => {
    test("格式化价格添加千位分隔符", () => {
      expect(formatPrice(1234.56)).toBe("1,234.56");
      expect(formatPrice("1234.56")).toBe("1,234.56");
      expect(formatPrice(1000000)).toBe("1,000,000");
    });

    test("格式化价格并指定小数位数", () => {
      expect(formatPrice(1234.56, 0)).toBe("1,235");
      expect(formatPrice(1234.56, 1)).toBe("1,234.6");
      expect(formatPrice(1234.56, 3)).toBe("1,234.560");
    });

    test("处理非数字字符串", () => {
      expect(formatPrice("abc")).toBe("abc");
    });
  });

  describe("numberToChinese", () => {
    test("将数字转换为中文数字", () => {
      expect(numberToChinese(0)).toBe("");
      expect(numberToChinese(1)).toBe("一");
      expect(numberToChinese(10)).toBe("一");
      expect(numberToChinese(11)).toBe("一一");
      expect(numberToChinese(21)).toBe("二一");
      expect(numberToChinese(100)).toBe("一");
    });

    test("处理字符串数字", () => {
      expect(numberToChinese("123")).toBe("一二三");
      expect(numberToChinese("1001")).toBe("一一");
    });

    test("处理大数字", () => {
      expect(numberToChinese(10000)).toBe("一");
      expect(numberToChinese(10001)).toBe("一一");
      expect(numberToChinese(12345)).toBe("一二三四五");
      expect(numberToChinese(100000000)).toBe("一");
    });

    test("处理带零的数字", () => {
      expect(numberToChinese(1001)).toBe("一一");
      expect(numberToChinese(1010)).toBe("一一");
      expect(numberToChinese(1100)).toBe("一一");
    });
  });

  describe("camelToSnake", () => {
    test("将小驼峰转换为蛇形命名", () => {
      expect(camelToSnake("fooBar")).toBe("foo_bar");
      expect(camelToSnake("fooBarBaz")).toBe("foo_bar_baz");
      expect(camelToSnake("foo")).toBe("foo");
    });

    test("处理大写字母开头的情况", () => {
      expect(camelToSnake("FooBar")).toBe("_foo_bar");
      expect(camelToSnake("FOOBar")).toBe("_f_o_o_bar");
    });
  });

  describe("snakeToCamel", () => {
    test("将蛇形命名转换为小驼峰", () => {
      expect(snakeToCamel("foo_bar")).toBe("fooBar");
      expect(snakeToCamel("foo_bar_baz")).toBe("fooBarBaz");
      expect(snakeToCamel("foo")).toBe("foo");
    });

    test("处理连续下划线的情况", () => {
      expect(snakeToCamel("foo__bar")).toBe("foo_Bar");
    });

    test("处理下划线开头的情况", () => {
      expect(snakeToCamel("_foo_bar")).toBe("_fooBar");
    });

    test("处理下划线结尾的情况", () => {
      expect(snakeToCamel("foo_bar_")).toBe("fooBar_");
    });

    test("处理空字符串", () => {
      expect(snakeToCamel("")).toBe("");
    });
  });

  describe("formatNumber", () => {
    test("格式化数字", () => {
      expect(formatNumber(5)).toBe("5");
      expect(formatNumber("10")).toBe("10");
      expect(formatNumber(99)).toBe("99");
    });

    test("超过阈值显示阈值+", () => {
      expect(formatNumber(100)).toBe("99+");
      expect(formatNumber(999)).toBe("99+");
    });

    test("自定义阈值", () => {
      expect(formatNumber(50, 50)).toBe("50");
      expect(formatNumber(51, 50)).toBe("50+");
    });

    test("处理非数字", () => {
      expect(formatNumber("abc")).toBe("");
      expect(formatNumber(NaN)).toBe("");
    });
  });

  describe("capitalize", () => {
    test("首字母大写", () => {
      expect(capitalize("hello")).toBe("Hello");
      expect(capitalize("world")).toBe("World");
      expect(capitalize("a")).toBe("A");
    });

    test("处理已经大写的情况", () => {
      expect(capitalize("Hello")).toBe("Hello");
      expect(capitalize("WORLD")).toBe("WORLD");
    });

    test("处理空字符串和非字符串", () => {
      expect(capitalize("")).toBe("");
      expect(capitalize(null)).toBe(null);
      expect(capitalize(undefined)).toBe(undefined);
      expect(capitalize(123 as any)).toBe(123);
    });
  });
});
