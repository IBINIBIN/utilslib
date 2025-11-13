/**
 * @jest-environment jsdom
 */

import { IS_RETINA } from "../src/detect";

describe("IS_RETINA", () => {
  it("应该是一个布尔值", () => {
    expect(typeof IS_RETINA).toBe("boolean");
  });

  it("应该是 true 或 false", () => {
    expect([true, false]).toContain(IS_RETINA);
  });
});
