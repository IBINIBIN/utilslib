/**
 * @jest-environment jsdom
 */

import { OS_TYPE } from "../src/detect";

describe("OS_TYPE", () => {
  it("should be a string", () => {
    expect(typeof OS_TYPE).toBe("string");
  });

  it("should be a valid OS type", () => {
    expect(["ios", "android", "macos", "windows", "linux", "unknown"]).toContain(OS_TYPE);
  });
});
