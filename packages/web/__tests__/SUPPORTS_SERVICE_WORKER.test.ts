/**
 * @jest-environment jsdom
 */

import { SUPPORTS_SERVICE_WORKER } from "../src/detect";

describe("SUPPORTS_SERVICE_WORKER", () => {
  it("应该是一个布尔值", () => {
    expect(typeof SUPPORTS_SERVICE_WORKER).toBe("boolean");
  });

  it("应该是 true 或 false", () => {
    expect([true, false]).toContain(SUPPORTS_SERVICE_WORKER);
  });
});
