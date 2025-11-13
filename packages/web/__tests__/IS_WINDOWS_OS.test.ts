/**
 * @jest-environment jsdom
 */

import { IS_WINDOWS_OS } from "../src/detect";

describe("IS_WINDOWS_OS", () => {
  it("should be a boolean", () => {
    expect(typeof IS_WINDOWS_OS).toBe("boolean");
  });
});
