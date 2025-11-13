import {
  ONE_SECOND_IN_MS,
  ONE_MINUTE_IN_MS,
  ONE_HOUR_IN_MS,
  ONE_DAY_IN_MS,
  ONE_SECOND_IN_S,
  ONE_MINUTE_IN_S,
  ONE_HOUR_IN_S,
  ONE_DAY_IN_S,
} from "../src/constants";

describe("Constants", () => {
  describe("Time Constants in Milliseconds", () => {
    it("should have correct values for time constants", () => {
      expect(ONE_SECOND_IN_MS).toBe(1000);
      expect(ONE_MINUTE_IN_MS).toBe(60 * 1000);
      expect(ONE_HOUR_IN_MS).toBe(60 * 60 * 1000);
      expect(ONE_DAY_IN_MS).toBe(24 * 60 * 60 * 1000);
    });

    it("should have consistent relationships between time constants", () => {
      expect(ONE_MINUTE_IN_MS).toBe(ONE_SECOND_IN_MS * 60);
      expect(ONE_HOUR_IN_MS).toBe(ONE_MINUTE_IN_MS * 60);
      expect(ONE_DAY_IN_MS).toBe(ONE_HOUR_IN_MS * 24);
    });
  });

  describe("Time Constants in Seconds", () => {
    it("should have correct values for time constants", () => {
      expect(ONE_SECOND_IN_S).toBe(1);
      expect(ONE_MINUTE_IN_S).toBe(60);
      expect(ONE_HOUR_IN_S).toBe(60 * 60);
      expect(ONE_DAY_IN_S).toBe(24 * 60 * 60);
    });

    it("should have consistent relationships between time constants", () => {
      expect(ONE_MINUTE_IN_S).toBe(ONE_SECOND_IN_S * 60);
      expect(ONE_HOUR_IN_S).toBe(ONE_MINUTE_IN_S * 60);
      expect(ONE_DAY_IN_S).toBe(ONE_HOUR_IN_S * 24);
    });
  });

  describe("Cross-unit Consistency", () => {
    it("should maintain consistency between seconds and milliseconds", () => {
      expect(ONE_MINUTE_IN_MS).toBe(ONE_MINUTE_IN_S * ONE_SECOND_IN_MS);
      expect(ONE_HOUR_IN_MS).toBe(ONE_HOUR_IN_S * ONE_SECOND_IN_MS);
      expect(ONE_DAY_IN_MS).toBe(ONE_DAY_IN_S * ONE_SECOND_IN_MS);
    });
  });
});
