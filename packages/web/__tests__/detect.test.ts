/**
 * @jest-environment jsdom
 */

import {
  IS_BROWSER,
  IS_WEB_WORKER,
  OS_TYPE,
  IS_IOS_OS,
  IS_ANDROID_OS,
  IS_MACOS_OS,
  IS_WINDOWS_OS,
  IS_LINUX_OS,
  BROWSER_TYPE,
  IS_CHROME_BROWSER,
  IS_SAFARI_BROWSER,
  IS_FIREFOX_BROWSER,
  IS_EDGE_BROWSER,
  IS_OPERA_BROWSER,
  IS_IE_BROWSER,
  IS_TABLET,
  IS_PHONE,
  IS_MOBILE,
  IS_DESKTOP,
  SUPPORTS_TOUCH,
  SUPPORTS_LOCAL_STORAGE,
  SUPPORTS_SESSION_STORAGE,
  SUPPORTS_WEBGL,
  SUPPORTS_WEB_ASSEMBLY,
  SUPPORTS_SERVICE_WORKER,
  IS_RETINA,
  LANGUAGE,
  isDarkMode,
  isOnline,
  getConnectionType,
  getScreenInfo,
  getViewportInfo,
} from "../src/detect";

describe("Environment Detection", () => {
  describe("Basic Environment", () => {
    it("should detect browser environment", () => {
      expect(typeof IS_BROWSER).toBe("boolean");
      expect(IS_BROWSER).toBe(true);
    });

    it("should detect web worker environment", () => {
      expect(typeof IS_WEB_WORKER).toBe("boolean");
    });
  });

  describe("Operating System Detection", () => {
    it("should detect OS type", () => {
      expect(typeof OS_TYPE).toBe("string");
      expect(["ios", "android", "macos", "windows", "linux", "unknown"]).toContain(OS_TYPE);
    });

    it("should have boolean OS flags", () => {
      expect(typeof IS_IOS_OS).toBe("boolean");
      expect(typeof IS_ANDROID_OS).toBe("boolean");
      expect(typeof IS_MACOS_OS).toBe("boolean");
      expect(typeof IS_WINDOWS_OS).toBe("boolean");
      expect(typeof IS_LINUX_OS).toBe("boolean");
    });

    it("should have consistent OS detection", () => {
      const osFlags = [IS_IOS_OS, IS_ANDROID_OS, IS_MACOS_OS, IS_WINDOWS_OS, IS_LINUX_OS];
      const trueFlags = osFlags.filter(Boolean);
      expect(trueFlags.length).toBeLessThanOrEqual(1);
    });
  });

  describe("Browser Detection", () => {
    it("should detect browser type", () => {
      expect(typeof BROWSER_TYPE).toBe("string");
      expect(["chrome", "safari", "firefox", "edge", "opera", "ie", "unknown"]).toContain(BROWSER_TYPE);
    });

    it("should have boolean browser flags", () => {
      expect(typeof IS_CHROME_BROWSER).toBe("boolean");
      expect(typeof IS_SAFARI_BROWSER).toBe("boolean");
      expect(typeof IS_FIREFOX_BROWSER).toBe("boolean");
      expect(typeof IS_EDGE_BROWSER).toBe("boolean");
      expect(typeof IS_OPERA_BROWSER).toBe("boolean");
      expect(typeof IS_IE_BROWSER).toBe("boolean");
    });

    it("should have consistent browser detection", () => {
      const browserFlags = [
        IS_CHROME_BROWSER,
        IS_SAFARI_BROWSER,
        IS_FIREFOX_BROWSER,
        IS_EDGE_BROWSER,
        IS_OPERA_BROWSER,
        IS_IE_BROWSER,
      ];
      const trueFlags = browserFlags.filter(Boolean);
      expect(trueFlags.length).toBeLessThanOrEqual(1);
    });
  });

  describe("Device Type Detection", () => {
    it("should detect device type", () => {
      expect(typeof IS_TABLET).toBe("boolean");
      expect(typeof IS_PHONE).toBe("boolean");
      expect(typeof IS_MOBILE).toBe("boolean");
      expect(typeof IS_DESKTOP).toBe("boolean");
    });

    it("should have consistent device detection", () => {
      if (IS_MOBILE) {
        expect(IS_PHONE || IS_TABLET).toBe(true);
        expect(IS_DESKTOP).toBe(false);
      } else {
        expect(IS_DESKTOP).toBe(true);
        expect(IS_PHONE).toBe(false);
        expect(IS_TABLET).toBe(false);
      }
    });
  });

  describe("Feature Support Detection", () => {
    it("should detect touch support", () => {
      expect(typeof SUPPORTS_TOUCH).toBe("boolean");
    });

    it("should detect local storage support", () => {
      expect(typeof SUPPORTS_LOCAL_STORAGE).toBe("boolean");
    });

    it("should detect session storage support", () => {
      expect(typeof SUPPORTS_SESSION_STORAGE).toBe("boolean");
    });

    it("should detect WebGL support", () => {
      expect(typeof SUPPORTS_WEBGL).toBe("boolean");
    });

    it("should detect WebAssembly support", () => {
      expect(typeof SUPPORTS_WEB_ASSEMBLY).toBe("boolean");
    });

    it("should detect Service Worker support", () => {
      expect(typeof SUPPORTS_SERVICE_WORKER).toBe("boolean");
    });
  });

  describe("Display Detection", () => {
    it("should detect retina display", () => {
      expect(typeof IS_RETINA).toBe("boolean");
    });
  });

  describe("Language Detection", () => {
    it("should detect browser language", () => {
      expect(typeof LANGUAGE).toBe("string");
      expect(LANGUAGE.length).toBeGreaterThan(0);
    });
  });

  describe("Dynamic Detection Methods", () => {
    let originalMatchMedia: typeof window.matchMedia;
    let originalNavigatorOnLine: boolean;

    beforeEach(() => {
      originalMatchMedia = window.matchMedia;
      originalNavigatorOnLine = navigator.onLine;
    });

    afterEach(() => {
      window.matchMedia = originalMatchMedia;
      Object.defineProperty(navigator, "onLine", {
        value: originalNavigatorOnLine,
        writable: true,
      });
    });

    it("should detect dark mode", () => {
      const mockMatchMedia = jest.fn().mockReturnValue({ matches: true });
      window.matchMedia = mockMatchMedia;
      expect(isDarkMode()).toBe(true);

      mockMatchMedia.mockReturnValue({ matches: false });
      expect(isDarkMode()).toBe(false);
    });

    it("should detect online status", () => {
      Object.defineProperty(navigator, "onLine", { value: true, writable: true });
      expect(isOnline()).toBe(true);

      Object.defineProperty(navigator, "onLine", { value: false, writable: true });
      expect(isOnline()).toBe(false);
    });

    it("should get connection type", () => {
      Object.defineProperty(navigator, "connection", {
        value: { effectiveType: "4g" },
        writable: true,
      });
      expect(getConnectionType()).toBe("4g");

      Object.defineProperty(navigator, "connection", {
        value: undefined,
        writable: true,
      });
      expect(getConnectionType()).toBe("unknown");
    });

    it("should get screen info", () => {
      Object.defineProperty(window.screen, "width", { value: 1920, writable: true });
      Object.defineProperty(window.screen, "height", { value: 1080, writable: true });
      Object.defineProperty(window.screen, "availWidth", { value: 1920, writable: true });
      Object.defineProperty(window.screen, "availHeight", { value: 1040, writable: true });
      Object.defineProperty(window.screen, "colorDepth", { value: 24, writable: true });
      Object.defineProperty(window.screen, "pixelDepth", { value: 24, writable: true });
      Object.defineProperty(window, "devicePixelRatio", { value: 1, writable: true });

      const screenInfo = getScreenInfo();
      expect(screenInfo).toEqual({
        width: 1920,
        height: 1080,
        availWidth: 1920,
        availHeight: 1040,
        colorDepth: 24,
        pixelDepth: 24,
        devicePixelRatio: 1,
      });
    });

    it("should get viewport info", () => {
      Object.defineProperty(window, "innerWidth", { value: 1200, writable: true });
      Object.defineProperty(window, "innerHeight", { value: 800, writable: true });
      Object.defineProperty(window, "scrollX", { value: 0, writable: true });
      Object.defineProperty(window, "scrollY", { value: 100, writable: true });

      const viewportInfo = getViewportInfo();
      expect(viewportInfo).toEqual({
        width: 1200,
        height: 800,
        scrollX: 0,
        scrollY: 100,
      });
    });
  });
});
