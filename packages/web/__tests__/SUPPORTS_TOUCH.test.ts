/**
 * @jest-environment jsdom
 */

import { SUPPORTS_TOUCH } from "../src/detect";

describe("SUPPORTS_TOUCH", () => {
  it("应该是一个布尔值", () => {
    expect(typeof SUPPORTS_TOUCH).toBe("boolean");
  });

  it("应该是 true 或 false", () => {
    expect([true, false]).toContain(SUPPORTS_TOUCH);
  });
});
