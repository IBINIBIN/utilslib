/// <reference types="jest" />

import {
  ONE_SECOND_IN_MS,
  ONE_MINUTE_IN_MS,
  ONE_HOUR_IN_MS,
  ONE_DAY_IN_MS,
  ONE_SECOND_IN_S,
  ONE_MINUTE_IN_S,
  ONE_HOUR_IN_S,
  ONE_DAY_IN_S,
} from "../src/constants.js";

describe("constants.ts 测试", () => {
  describe("毫秒常量", () => {
    test("ONE_SECOND_IN_MS 应该等于 1000", () => {
      expect(ONE_SECOND_IN_MS).toBe(1000);
    });

    test("ONE_MINUTE_IN_MS 应该等于 60 * 1000", () => {
      expect(ONE_MINUTE_IN_MS).toBe(60 * 1000);
    });

    test("ONE_HOUR_IN_MS 应该等于 60 * 60 * 1000", () => {
      expect(ONE_HOUR_IN_MS).toBe(60 * 60 * 1000);
    });

    test("ONE_DAY_IN_MS 应该等于 24 * 60 * 60 * 1000", () => {
      expect(ONE_DAY_IN_MS).toBe(24 * 60 * 60 * 1000);
    });
  });

  describe("秒常量", () => {
    test("ONE_SECOND_IN_S 应该等于 1", () => {
      expect(ONE_SECOND_IN_S).toBe(1);
    });

    test("ONE_MINUTE_IN_S 应该等于 60", () => {
      expect(ONE_MINUTE_IN_S).toBe(60);
    });

    test("ONE_HOUR_IN_S 应该等于 60 * 60", () => {
      expect(ONE_HOUR_IN_S).toBe(60 * 60);
    });

    test("ONE_DAY_IN_S 应该等于 24 * 60 * 60", () => {
      expect(ONE_DAY_IN_S).toBe(24 * 60 * 60);
    });
  });

  describe("常量关系验证", () => {
    test("ONE_MINUTE_IN_MS 应该等于 ONE_SECOND_IN_MS * 60", () => {
      expect(ONE_MINUTE_IN_MS).toBe(ONE_SECOND_IN_MS * 60);
    });

    test("ONE_HOUR_IN_MS 应该等于 ONE_MINUTE_IN_MS * 60", () => {
      expect(ONE_HOUR_IN_MS).toBe(ONE_MINUTE_IN_MS * 60);
    });

    test("ONE_DAY_IN_MS 应该等于 ONE_HOUR_IN_MS * 24", () => {
      expect(ONE_DAY_IN_MS).toBe(ONE_HOUR_IN_MS * 24);
    });

    test("ONE_MINUTE_IN_S 应该等于 ONE_SECOND_IN_S * 60", () => {
      expect(ONE_MINUTE_IN_S).toBe(ONE_SECOND_IN_S * 60);
    });

    test("ONE_HOUR_IN_S 应该等于 ONE_MINUTE_IN_S * 60", () => {
      expect(ONE_HOUR_IN_S).toBe(ONE_MINUTE_IN_S * 60);
    });

    test("ONE_DAY_IN_S 应该等于 ONE_HOUR_IN_S * 24", () => {
      expect(ONE_DAY_IN_S).toBe(ONE_HOUR_IN_S * 24);
    });

    test("ONE_SECOND_IN_MS 应该等于 ONE_SECOND_IN_S * 1000", () => {
      expect(ONE_SECOND_IN_MS).toBe(ONE_SECOND_IN_S * 1000);
    });
  });
});
