/**
 * @jest-environment jsdom
 */

import { IS_DESKTOP } from "../src/detect";

describe("IS_DESKTOP", () => {
  it("应该是一个布尔值", () => {
    expect(typeof IS_DESKTOP).toBe("boolean");
  });

  it("应该是 true 或 false", () => {
    expect([true, false]).toContain(IS_DESKTOP);
  });
});
