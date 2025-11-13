/**
 * @jest-environment jsdom
 */

import { IS_TABLET } from "../src/detect";

describe("IS_TABLET", () => {
  it("应该是一个布尔值", () => {
    expect(typeof IS_TABLET).toBe("boolean");
  });

  it("应该是 true 或 false", () => {
    expect([true, false]).toContain(IS_TABLET);
  });
});
