/**
 * @jest-environment jsdom
 */

import { IS_MOBILE } from "../src/detect";

describe("IS_MOBILE", () => {
  it("应该是一个布尔值", () => {
    expect(typeof IS_MOBILE).toBe("boolean");
  });

  it("应该是 true 或 false", () => {
    expect([true, false]).toContain(IS_MOBILE);
  });
});
