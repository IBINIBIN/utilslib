/**
 * @jest-environment jsdom
 */

import { SUPPORTS_WEBGL } from "../src/detect";

describe("SUPPORTS_WEBGL", () => {
  it("应该是一个布尔值", () => {
    expect(typeof SUPPORTS_WEBGL).toBe("boolean");
  });

  it("应该是 true 或 false", () => {
    expect([true, false]).toContain(SUPPORTS_WEBGL);
  });
});
