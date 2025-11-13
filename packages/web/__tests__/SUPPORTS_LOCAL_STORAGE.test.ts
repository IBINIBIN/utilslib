/**
 * @jest-environment jsdom
 */

import { SUPPORTS_LOCAL_STORAGE } from "../src/detect";

describe("SUPPORTS_LOCAL_STORAGE", () => {
  it("应该是一个布尔值", () => {
    expect(typeof SUPPORTS_LOCAL_STORAGE).toBe("boolean");
  });

  it("应该是 true 或 false", () => {
    expect([true, false]).toContain(SUPPORTS_LOCAL_STORAGE);
  });
});
