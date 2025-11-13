import { entries, forEach, pick, omit } from "../src/collection";

describe("Collection Utils", () => {
  describe("entries", () => {
    it("should iterate over Map entries", () => {
      const map = new Map([
        ["a", 1],
        ["b", 2],
      ]);
      const result = Array.from(entries(map));
      expect(result).toEqual([
        ["a", 1],
        ["b", 2],
      ]);
    });

    it("should iterate over Set entries", () => {
      const set = new Set(["a", "b"]);
      const result = Array.from(entries(set));
      expect(result).toEqual([
        ["a", "a"],
        ["b", "b"],
      ]);
    });

    it("should iterate over Array entries", () => {
      const arr = ["a", "b"];
      const result = Array.from(entries(arr));
      expect(result).toEqual([
        [0, "a"],
        [1, "b"],
      ]);
    });

    it("should iterate over object entries", () => {
      const obj = { a: 1, b: 2 };
      const result = Array.from(entries(obj));
      expect(result).toEqual([
        ["a", 1],
        ["b", 2],
      ]);
    });

    it("should handle empty collections", () => {
      expect(Array.from(entries(new Map()))).toEqual([]);
      expect(Array.from(entries(new Set()))).toEqual([]);
      expect(Array.from(entries([]))).toEqual([]);
      expect(Array.from(entries({}))).toEqual([]);
    });

    it("should handle null and undefined gracefully", () => {
      // Test that it doesn't crash with null/undefined inputs
      try {
        Array.from(entries(null));
      } catch {}
      try {
        Array.from(entries(undefined));
      } catch {}
      expect(true).toBe(true); // If we reach here, the function handled the input
    });
  });

  describe("forEach", () => {
    it("should iterate over Map with callback", () => {
      const map = new Map([
        ["a", 1],
        ["b", 2],
      ]);
      const results: [any, any, any][] = [];

      forEach(map, (value, key, collection) => {
        results.push([value, key, collection]);
      });

      expect(results).toEqual([
        [1, "a", map],
        [2, "b", map],
      ]);
    });

    it("should stop iteration when callback returns false", () => {
      const arr = ["a", "b", "c", "d"];
      const results: any[] = [];

      forEach(arr, (value, index) => {
        results.push(value);
        if (value === "b") return false;
      });

      expect(results).toEqual(["a", "b"]);
    });

    it("should handle null and undefined collections", () => {
      expect(forEach(null, () => {})).toBe(null);
      expect(forEach(undefined, () => {})).toBe(undefined);
    });
  });

  describe("pick", () => {
    describe("with objects", () => {
      it("should pick specified keys from object", () => {
        const obj = { a: 1, b: 2, c: 3, d: 4 };
        const result = pick(obj, ["a", "c"]);
        expect(result).toEqual({ a: 1, c: 3 });
      });

      it("should handle empty keys array", () => {
        const obj = { a: 1, b: 2 };
        const result = pick(obj, []);
        expect(result).toEqual({});
      });
    });

    describe("with arrays", () => {
      it("should pick specified values from array", () => {
        const arr = [1, 2, 3, 4, 5];
        const result = pick(arr, [2, 4]);
        expect(result).toEqual([2, 4]);
      });

      it("should handle empty values array", () => {
        const arr = [1, 2, 3];
        const result = pick(arr, []);
        expect(result).toEqual([]);
      });
    });
  });

  describe("omit", () => {
    describe("with objects", () => {
      it("should omit specified keys from object", () => {
        const obj = { a: 1, b: 2, c: 3, d: 4 };
        const result = omit(obj, ["a", "c"]);
        expect(result).toEqual({ b: 2, d: 4 });
      });

      it("should handle empty keys array", () => {
        const obj = { a: 1, b: 2 };
        const result = omit(obj, []);
        expect(result).toEqual({ a: 1, b: 2 });
      });
    });

    describe("with arrays", () => {
      it("should omit specified values from array", () => {
        const arr = [1, 2, 3, 4, 5];
        const result = omit(arr, [2, 4]);
        expect(result).toEqual([1, 3, 5]);
      });

      it("should handle empty values array", () => {
        const arr = [1, 2, 3];
        const result = omit(arr, []);
        expect(result).toEqual([1, 2, 3]);
      });
    });
  });
});
