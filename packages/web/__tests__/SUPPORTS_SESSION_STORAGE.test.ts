/**
 * @jest-environment jsdom
 */

import { SUPPORTS_SESSION_STORAGE } from "../src/detect";

describe("SUPPORTS_SESSION_STORAGE", () => {
  it("应该是一个布尔值", () => {
    expect(typeof SUPPORTS_SESSION_STORAGE).toBe("boolean");
  });

  it("应该是 true 或 false", () => {
    expect([true, false]).toContain(SUPPORTS_SESSION_STORAGE);
  });
});
