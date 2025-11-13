import { createRandomString, camelToSnake, snakeToCamel, capitalize } from "../src/string";

describe("String Utils", () => {
  describe("createRandomString", () => {
    it("should generate random string with default length", () => {
      const str = createRandomString();
      expect(str).toHaveLength(8);
      expect(/^[A-Za-z0-9]+$/.test(str)).toBe(true);
    });

    it("should generate random string with specified length", () => {
      const str = createRandomString(16);
      expect(str).toHaveLength(16);
      expect(/^[A-Za-z0-9]+$/.test(str)).toBe(true);
    });

    it("should generate different strings on multiple calls", () => {
      const str1 = createRandomString();
      const str2 = createRandomString();
      expect(str1).not.toBe(str2);
    });

    it("should handle zero length", () => {
      expect(createRandomString(0)).toBe("");
    });
  });

  describe("camelToSnake", () => {
    it("should convert camelCase to snake_case", () => {
      expect(camelToSnake("fooBar")).toBe("foo_bar");
      expect(camelToSnake("fooBarBaz")).toBe("foo_bar_baz");
      expect(camelToSnake("testString")).toBe("test_string");
      expect(camelToSnake("aB")).toBe("a_b");
    });

    it("should handle single word", () => {
      expect(camelToSnake("foo")).toBe("foo");
      expect(camelToSnake("test")).toBe("test");
    });

    it("should handle consecutive uppercase letters", () => {
      expect(camelToSnake("getHTMLContent")).toBe("get_h_t_m_l_content");
      expect(camelToSnake("XMLHttpRequest")).toBe("_x_m_l_http_request");
    });

    it("should handle edge cases", () => {
      expect(camelToSnake("")).toBe("");
      expect(camelToSnake("A")).toBe("_a");
      expect(camelToSnake("already_snake_case")).toBe("already_snake_case");
    });
  });

  describe("snakeToCamel", () => {
    it("should convert snake_case to camelCase", () => {
      expect(snakeToCamel("foo_bar")).toBe("fooBar");
      expect(snakeToCamel("foo_bar_baz")).toBe("fooBarBaz");
      expect(snakeToCamel("test_string")).toBe("testString");
      expect(snakeToCamel("a_b")).toBe("aB");
    });

    it("should handle single word", () => {
      expect(snakeToCamel("foo")).toBe("foo");
      expect(snakeToCamel("test")).toBe("test");
    });

    it("should handle leading underscore", () => {
      expect(snakeToCamel("_private_method")).toBe("_privateMethod");
      expect(snakeToCamel("__init__")).toBe("__init__");
      expect(snakeToCamel("_a_b_c")).toBe("_aBC");
    });

    it("should handle multiple underscores", () => {
      expect(snakeToCamel("foo__bar")).toBe("foo_Bar");
      expect(snakeToCamel("foo___bar")).toBe("foo__Bar");
    });

    it("should handle edge cases", () => {
      expect(snakeToCamel("")).toBe("");
      expect(snakeToCamel("_")).toBe("_");
      expect(snakeToCamel("alreadyCamel")).toBe("alreadyCamel");
    });
  });

  describe("capitalize", () => {
    it("should capitalize first letter of string", () => {
      expect(capitalize("hello")).toBe("Hello");
      expect(capitalize("world")).toBe("World");
      expect(capitalize("test string")).toBe("Test string");
    });

    it("should handle already capitalized strings", () => {
      expect(capitalize("Hello")).toBe("Hello");
      expect(capitalize("WORLD")).toBe("WORLD");
    });

    it("should handle empty string", () => {
      expect(capitalize("")).toBe("");
    });

    it("should return original value for non-string types", () => {
      expect(capitalize(123)).toBe(123);
      expect(capitalize(null)).toBe(null);
      expect(capitalize(undefined)).toBe(undefined);

      const obj = {};
      expect(capitalize(obj)).toBe(obj);

      const arr = [];
      expect(capitalize(arr)).toBe(arr);
    });

    it("should handle single character strings", () => {
      expect(capitalize("a")).toBe("A");
      expect(capitalize("A")).toBe("A");
      expect(capitalize("1")).toBe("1");
    });
  });
});
