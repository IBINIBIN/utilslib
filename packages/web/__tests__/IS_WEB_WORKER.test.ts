/**
 * @jest-environment jsdom
 */

import { IS_WEB_WORKER } from "../src/detect";

describe("IS_WEB_WORKER", () => {
  it("should be a boolean", () => {
    expect(typeof IS_WEB_WORKER).toBe("boolean");
  });

  it("should be false in browser environment", () => {
    expect(IS_WEB_WORKER).toBe(false);
  });
});
