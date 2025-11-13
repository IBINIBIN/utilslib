/**
 * @jest-environment jsdom
 */

import { SUPPORTS_WEB_ASSEMBLY } from "../src/detect";

describe("SUPPORTS_WEB_ASSEMBLY", () => {
  it("应该是一个布尔值", () => {
    expect(typeof SUPPORTS_WEB_ASSEMBLY).toBe("boolean");
  });

  it("应该是 true 或 false", () => {
    expect([true, false]).toContain(SUPPORTS_WEB_ASSEMBLY);
  });
});
