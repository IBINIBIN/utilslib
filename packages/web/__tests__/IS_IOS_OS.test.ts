/**
 * @jest-environment jsdom
 */

import { IS_IOS_OS } from "../src/detect";

describe("IS_IOS_OS", () => {
  it("should be a boolean", () => {
    expect(typeof IS_IOS_OS).toBe("boolean");
  });
});
