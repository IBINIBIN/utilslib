/**
 * @jest-environment jsdom
 */

import { IS_PHONE } from "../src/detect";

describe("IS_PHONE", () => {
  it("应该是一个布尔值", () => {
    expect(typeof IS_PHONE).toBe("boolean");
  });

  it("应该是 true 或 false", () => {
    expect([true, false]).toContain(IS_PHONE);
  });
});
