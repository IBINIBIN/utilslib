/**
 * @jest-environment jsdom
 */

import { IS_BROWSER } from "../src/detect";

describe("IS_BROWSER", () => {
  it("should be a boolean", () => {
    expect(typeof IS_BROWSER).toBe("boolean");
  });

  it("should be true in jsdom environment", () => {
    expect(IS_BROWSER).toBe(true);
  });
});
