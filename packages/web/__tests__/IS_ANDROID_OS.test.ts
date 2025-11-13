/**
 * @jest-environment jsdom
 */

import { IS_ANDROID_OS } from "../src/detect";

describe("IS_ANDROID_OS", () => {
  it("should be a boolean", () => {
    expect(typeof IS_ANDROID_OS).toBe("boolean");
  });
});
