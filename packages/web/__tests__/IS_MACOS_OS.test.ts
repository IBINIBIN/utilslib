/**
 * @jest-environment jsdom
 */

import { IS_MACOS_OS } from "../src/detect";

describe("IS_MACOS_OS", () => {
  it("should be a boolean", () => {
    expect(typeof IS_MACOS_OS).toBe("boolean");
  });
});
