/**
 * @jest-environment jsdom
 */

import { IS_SAFARI_BROWSER } from "../src/detect";

describe("IS_SAFARI_BROWSER", () => {
  it("应该是一个布尔值", () => {
    expect(typeof IS_SAFARI_BROWSER).toBe("boolean");
  });

  it("应该是 true 或 false", () => {
    expect([true, false]).toContain(IS_SAFARI_BROWSER);
  });
});
