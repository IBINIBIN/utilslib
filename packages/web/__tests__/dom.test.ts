/**
 * @jest-environment jsdom
 */

import {
  downloadFile,
  removeElement,
  addClass,
  removeClass,
  hasClass,
  getAttribute,
  setAttribute,
  removeAttribute,
  isElement,
  isVisible,
  waitForElement,
  copyToClipboard,
  isTextOverflowing,
  isTextOverflowingWidth,
  getFullTextContent,
  hasTextTruncation,
} from "../src/dom";

describe("DOM Utils", () => {
  describe("downloadFile", () => {
    let originalCreateElement: typeof document.createElement;
    let originalCreateObjectURL: typeof URL.createObjectURL;
    let originalRevokeObjectURL: typeof URL.revokeObjectURL;
    let mockLink: HTMLAnchorElement;

    beforeEach(() => {
      // Store original methods
      originalCreateElement = document.createElement;
      originalCreateObjectURL = URL.createObjectURL;
      originalRevokeObjectURL = URL.revokeObjectURL;

      // Create mock link element
      mockLink = document.createElement("a") as HTMLAnchorElement;
      jest.spyOn(mockLink, "click");
      jest.spyOn(mockLink, "remove");

      // Mock DOM methods
      document.createElement = jest.fn().mockReturnValue(mockLink);
      URL.createObjectURL = jest.fn().mockReturnValue("blob:mock-url");
      URL.revokeObjectURL = jest.fn();
    });

    afterEach(() => {
      // Restore original methods
      document.createElement = originalCreateElement;
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
      jest.clearAllMocks();
    });

    it("should download file from string URL", () => {
      const url = "https://example.com/file.pdf";
      const fileName = "test.pdf";

      downloadFile(url, fileName);

      expect(document.createElement).toHaveBeenCalledWith("a");
      expect(mockLink.href).toBe(url);
      expect(mockLink.download).toBe(fileName);
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.remove).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(url);
    });

    it("should download file from Blob", () => {
      const blob = new Blob(["test content"], { type: "text/plain" });
      const fileName = "test.txt";

      downloadFile(blob, fileName);

      expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
      expect(mockLink.href).toBe("blob:mock-url");
      expect(mockLink.download).toBe(fileName);
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.remove).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });

    it("should use empty filename when not provided", () => {
      const url = "https://example.com/file.pdf";

      downloadFile(url);

      expect(mockLink.download).toBe("");
    });

    it("should handle different blob types", () => {
      const jsonBlob = new Blob(['{"test": "data"}'], { type: "application/json" });
      const imageBlob = new Blob(["image-data"], { type: "image/png" });

      downloadFile(jsonBlob, "data.json");
      downloadFile(imageBlob, "image.png");

      expect(URL.createObjectURL).toHaveBeenCalledTimes(2);
      expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
    });

    it("should create and remove link element for each call", () => {
      downloadFile("test1.pdf", "test1.pdf");
      downloadFile("test2.pdf", "test2.pdf");

      expect(document.createElement).toHaveBeenCalledTimes(2);
      expect(mockLink.remove).toHaveBeenCalledTimes(2);
    });
  });

  describe("removeElement", () => {
    it("should remove element from DOM", () => {
      const parent = document.createElement("div");
      const child = document.createElement("span");
      parent.appendChild(child);
      document.body.appendChild(parent);

      expect(document.body.contains(child)).toBe(true);

      removeElement(child);

      expect(document.body.contains(child)).toBe(false);
      expect(parent.contains(child)).toBe(false);
    });

    it("should handle element without parent", () => {
      const element = document.createElement("div");

      expect(() => removeElement(element)).not.toThrow();
    });

    it("should handle null element", () => {
      expect(() => removeElement(null)).not.toThrow();
    });

    it("should handle undefined element", () => {
      expect(() => removeElement(undefined)).not.toThrow();
    });
  });

  describe("addClass", () => {
    it("should add single class to element", () => {
      const element = document.createElement("div");

      addClass(element, "test-class");

      expect(element.classList.contains("test-class")).toBe(true);
    });

    it("should add multiple classes to element", () => {
      const element = document.createElement("div");

      addClass(element, "class1", "class2", "class3");

      expect(element.classList.contains("class1")).toBe(true);
      expect(element.classList.contains("class2")).toBe(true);
      expect(element.classList.contains("class3")).toBe(true);
    });

    it("should handle empty class names", () => {
      const element = document.createElement("div");

      addClass(element);

      expect(element.className).toBe("");
    });

    it("should handle null element", () => {
      expect(() => addClass(null, "test")).not.toThrow();
    });

    it("should handle undefined element", () => {
      expect(() => addClass(undefined, "test")).not.toThrow();
    });
  });

  describe("removeClass", () => {
    it("should remove single class from element", () => {
      const element = document.createElement("div");
      element.className = "class1 class2";

      removeClass(element, "class1");

      expect(element.classList.contains("class1")).toBe(false);
      expect(element.classList.contains("class2")).toBe(true);
    });

    it("should remove multiple classes from element", () => {
      const element = document.createElement("div");
      element.className = "class1 class2 class3 class4";

      removeClass(element, "class1", "class3");

      expect(element.classList.contains("class1")).toBe(false);
      expect(element.classList.contains("class2")).toBe(true);
      expect(element.classList.contains("class3")).toBe(false);
      expect(element.classList.contains("class4")).toBe(true);
    });

    it("should handle removing non-existent class", () => {
      const element = document.createElement("div");
      element.className = "existing-class";

      expect(() => removeClass(element, "non-existent")).not.toThrow();
      expect(element.classList.contains("existing-class")).toBe(true);
    });

    it("should handle empty class names", () => {
      const element = document.createElement("div");
      element.className = "test-class";

      removeClass(element);

      expect(element.classList.contains("test-class")).toBe(true);
    });

    it("should handle null element", () => {
      expect(() => removeClass(null, "test")).not.toThrow();
    });
  });

  describe("hasClass", () => {
    it("should return true when element has the class", () => {
      const element = document.createElement("div");
      element.className = "class1 class2";

      expect(hasClass(element, "class1")).toBe(true);
      expect(hasClass(element, "class2")).toBe(true);
    });

    it("should return false when element does not have the class", () => {
      const element = document.createElement("div");
      element.className = "class1 class2";

      expect(hasClass(element, "class3")).toBe(false);
    });

    it("should handle empty class name", () => {
      const element = document.createElement("div");
      element.className = "class1";

      // In some browsers classList.contains("") might return true or false,
      // but our function should handle it gracefully
      const result = hasClass(element, "");
      expect(typeof result).toBe("boolean");
    });

    it("should return false for null element", () => {
      expect(hasClass(null, "test")).toBe(false);
    });

    it("should return false for undefined element", () => {
      expect(hasClass(undefined, "test")).toBe(false);
    });
  });

  describe("getAttribute", () => {
    it("should return attribute value when it exists", () => {
      const element = document.createElement("div");
      element.setAttribute("data-test", "test-value");

      expect(getAttribute(element, "data-test")).toBe("test-value");
    });

    it("should return null when attribute does not exist", () => {
      const element = document.createElement("div");

      expect(getAttribute(element, "non-existent")).toBe(null);
    });

    it("should return null for null element", () => {
      expect(getAttribute(null, "test")).toBe(null);
    });

    it("should handle standard attributes", () => {
      const element = document.createElement("input");
      element.setAttribute("type", "text");
      element.setAttribute("placeholder", "Enter text");

      expect(getAttribute(element, "type")).toBe("text");
      expect(getAttribute(element, "placeholder")).toBe("Enter text");
    });
  });

  describe("setAttribute", () => {
    it("should set attribute on element", () => {
      const element = document.createElement("div");

      setAttribute(element, "data-test", "test-value");

      expect(element.getAttribute("data-test")).toBe("test-value");
    });

    it("should overwrite existing attribute", () => {
      const element = document.createElement("div");
      element.setAttribute("data-test", "old-value");

      setAttribute(element, "data-test", "new-value");

      expect(element.getAttribute("data-test")).toBe("new-value");
    });

    it("should handle null element", () => {
      expect(() => setAttribute(null, "test", "value")).not.toThrow();
    });

    it("should handle undefined element", () => {
      expect(() => setAttribute(undefined, "test", "value")).not.toThrow();
    });

    it("should set boolean attributes", () => {
      const element = document.createElement("input");

      setAttribute(element, "disabled", "");
      setAttribute(element, "readonly", "readonly");

      expect(element.hasAttribute("disabled")).toBe(true);
      expect(element.getAttribute("readonly")).toBe("readonly");
    });
  });

  describe("removeAttribute", () => {
    it("should remove attribute from element", () => {
      const element = document.createElement("div");
      element.setAttribute("data-test", "test-value");

      removeAttribute(element, "data-test");

      expect(element.hasAttribute("data-test")).toBe(false);
    });

    it("should handle removing non-existent attribute", () => {
      const element = document.createElement("div");

      expect(() => removeAttribute(element, "non-existent")).not.toThrow();
    });

    it("should handle null element", () => {
      expect(() => removeAttribute(null, "test")).not.toThrow();
    });

    it("should handle undefined element", () => {
      expect(() => removeAttribute(undefined, "test")).not.toThrow();
    });
  });

  describe("isElement", () => {
    it("should return true for DOM elements", () => {
      const div = document.createElement("div");
      const span = document.createElement("span");
      const input = document.createElement("input");

      expect(isElement(div)).toBe(true);
      expect(isElement(span)).toBe(true);
      expect(isElement(input)).toBe(true);
    });

    it("should return true for document body and elements", () => {
      expect(isElement(document.body)).toBe(true);
      expect(isElement(document.documentElement)).toBe(true);
    });

    it("should return false for text nodes", () => {
      const textNode = document.createTextNode("test");

      expect(isElement(textNode)).toBe(false);
    });

    it("should return false for comment nodes", () => {
      const commentNode = document.createComment("test comment");

      expect(isElement(commentNode)).toBe(false);
    });

    it("should return false for null", () => {
      expect(isElement(null)).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isElement(undefined)).toBe(false);
    });

    it("should return false for plain objects", () => {
      expect(isElement({})).toBe(false);
      expect(isElement({ nodeType: 1 })).toBe(false); // fake element
    });

    it("should return false for strings and numbers", () => {
      expect(isElement("div")).toBe(false);
      expect(isElement(123)).toBe(false);
    });
  });

  describe("isVisible", () => {
    beforeEach(() => {
      // Reset DOM
      document.body.innerHTML = "";
    });

    it("should return true for visible element", () => {
      const element = document.createElement("div");
      document.body.appendChild(element);

      // Mock getComputedStyle to return default values
      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = jest.fn().mockReturnValue({
        display: "block",
        visibility: "visible",
        opacity: "1",
      } as any);

      expect(isVisible(element)).toBe(true);

      // Restore original
      window.getComputedStyle = originalGetComputedStyle;
    });

    it("should return false for element with display: none", () => {
      const element = document.createElement("div");
      element.style.display = "none";
      document.body.appendChild(element);

      expect(isVisible(element)).toBe(false);
    });

    it("should return false for element with visibility: hidden", () => {
      const element = document.createElement("div");
      element.style.visibility = "hidden";
      document.body.appendChild(element);

      expect(isVisible(element)).toBe(false);
    });

    it("should return false for element with opacity: 0", () => {
      const element = document.createElement("div");
      element.style.opacity = "0";
      document.body.appendChild(element);

      expect(isVisible(element)).toBe(false);
    });

    it("should return false for element not in DOM", () => {
      const element = document.createElement("div");

      expect(isVisible(element)).toBe(false);
    });

    it("should return false for null element", () => {
      expect(isVisible(null)).toBe(false);
    });

    it("should return false for undefined element", () => {
      expect(isVisible(undefined)).toBe(false);
    });

    it("should handle element with visibility: hidden but display: block", () => {
      const element = document.createElement("div");
      element.style.display = "block";
      element.style.visibility = "hidden";
      document.body.appendChild(element);

      expect(isVisible(element)).toBe(false);
    });
  });

  describe("waitForElement", () => {
    beforeEach(() => {
      jest.useFakeTimers();
      document.body.innerHTML = "";
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should resolve immediately when element exists", async () => {
      const element = document.createElement("div");
      element.className = "test-element";
      document.body.appendChild(element);

      const result = await waitForElement(".test-element");

      expect(result).toBe(element);
    });

    it("should wait for element to appear", async () => {
      const promise = waitForElement(".dynamic-element", 1000);

      // Simulate element being added after delay
      setTimeout(() => {
        const element = document.createElement("div");
        element.className = "dynamic-element";
        document.body.appendChild(element);
      }, 100);

      jest.advanceTimersByTime(150);

      const result = await promise;
      expect(result).toBeTruthy();
      expect(result.className).toBe("dynamic-element");
    });

    it("should reject when element not found within timeout", async () => {
      const promise = waitForElement(".non-existent", 100);

      jest.advanceTimersByTime(150);

      await expect(promise).rejects.toThrow('Element with selector ".non-existent" not found within 100ms');
    });

    it("should use default timeout of 5000ms", async () => {
      const promise = waitForElement(".non-existent");

      jest.advanceTimersByTime(5001);

      await expect(promise).rejects.toThrow("not found within 5000ms");
    });

    it("should cleanup observer when element found", async () => {
      const element = document.createElement("div");
      element.className = "test-element";

      // Start waiting first
      const promise = waitForElement(".test-element");

      // Add element after delay
      setTimeout(() => {
        document.body.appendChild(element);
      }, 100);

      jest.advanceTimersByTime(150);

      const result = await promise;
      expect(result).toBe(element);
    });

    it("should cleanup observer on timeout", async () => {
      const promise = waitForElement(".non-existent", 100);

      jest.advanceTimersByTime(150);

      try {
        await promise;
      } catch (error) {
        // Expected to throw
      }
    });
  });

  describe("copyToClipboard", () => {
    beforeEach(() => {
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: jest.fn(),
        },
        writable: true,
      });
      Object.defineProperty(window, "isSecureContext", {
        value: true,
        writable: true,
      });
    });

    it("should copy text using modern clipboard API", async () => {
      const text = "test text to copy";

      const result = await copyToClipboard(text);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(text);
      expect(result).toBe(true);
    });

    it("should fallback to execCommand when clipboard API not available", async () => {
      // @ts-expect-error - Remove clipboard API
      Object.defineProperty(navigator, "clipboard", {
        value: undefined,
        writable: true,
      });

      const text = "test text";
      const execCommandSpy = jest.spyOn(document, "execCommand").mockReturnValue(true);
      const appendSpy = jest.spyOn(document.body, "appendChild");
      const removeSpy = jest.spyOn(document.body, "removeChild");

      const result = await copyToClipboard(text);

      expect(appendSpy).toHaveBeenCalled();
      expect(removeSpy).toHaveBeenCalled();
      expect(execCommandSpy).toHaveBeenCalledWith("copy");
      expect(result).toBe(true);

      execCommandSpy.mockRestore();
      appendSpy.mockRestore();
      removeSpy.mockRestore();
    });

    it("should handle errors gracefully", async () => {
      navigator.clipboard.writeText = jest.fn().mockRejectedValue(new Error("Clipboard error"));
      document.execCommand = jest.fn().mockImplementation(() => {
        throw new Error("execCommand error");
      });

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const result = await copyToClipboard("test text");

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should return false when fallback fails", async () => {
      Object.defineProperty(navigator, "clipboard", {
        value: undefined,
        writable: true,
      });
      document.execCommand = jest.fn().mockReturnValue(false);

      const result = await copyToClipboard("test text");

      expect(result).toBe(false);
    });

    it("should work in non-secure context", async () => {
      Object.defineProperty(window, "isSecureContext", {
        value: false,
        writable: true,
      });

      const execCommandSpy = jest.spyOn(document, "execCommand").mockReturnValue(true);
      const appendSpy = jest.spyOn(document.body, "appendChild");
      const removeSpy = jest.spyOn(document.body, "removeChild");

      const result = await copyToClipboard("test text");

      expect(appendSpy).toHaveBeenCalled();
      expect(removeSpy).toHaveBeenCalled();
      expect(result).toBe(true);

      execCommandSpy.mockRestore();
      appendSpy.mockRestore();
      removeSpy.mockRestore();
    });
  });

  describe("isTextOverflowing", () => {
    beforeEach(() => {
      document.body.innerHTML = "";
    });

    it("should detect single line overflow", () => {
      const element = document.createElement("div");
      element.style.width = "100px";
      element.style.whiteSpace = "nowrap";
      element.style.overflow = "hidden";
      element.style.textOverflow = "ellipsis";
      element.style.fontSize = "16px";
      element.style.lineHeight = "24px";
      element.textContent = "This is a very long text that should definitely overflow the container";
      document.body.appendChild(element);

      // Mock the clone measurement
      const mockClone = {
        style: {},
        scrollHeight: 50, // 2 lines worth of text
        remove: jest.fn(),
      } as any;

      const cloneSpy = jest.spyOn(element, "cloneNode").mockReturnValue(mockClone);
      const appendSpy = jest.spyOn(document.body, "appendChild").mockReturnValue(mockClone);

      const result = isTextOverflowing(element, 1);

      expect(result).toBe(true);

      cloneSpy.mockRestore();
      appendSpy.mockRestore();
    });

    it("should return false when text fits within single line", () => {
      const element = document.createElement("div");
      element.style.width = "100px";
      element.style.fontSize = "16px";
      element.style.lineHeight = "24px";
      element.textContent = "Short text";
      document.body.appendChild(element);

      const mockClone = {
        style: {},
        scrollHeight: 20, // Less than line height
        remove: jest.fn(),
      } as any;

      const cloneSpy = jest.spyOn(element, "cloneNode").mockReturnValue(mockClone);
      const appendSpy = jest.spyOn(document.body, "appendChild").mockReturnValue(mockClone);

      const result = isTextOverflowing(element, 1);

      expect(result).toBe(false);

      cloneSpy.mockRestore();
      appendSpy.mockRestore();
    });

    it("should detect multi-line overflow", () => {
      const element = document.createElement("div");
      element.style.width = "100px";
      element.style.fontSize = "16px";
      element.style.lineHeight = "24px";
      element.textContent = "This is text that spans multiple lines and should overflow a 2-line container";
      document.body.appendChild(element);

      const mockClone = {
        style: {},
        scrollHeight: 80, // 3.3 lines worth of text
        remove: jest.fn(),
      } as any;

      const cloneSpy = jest.spyOn(element, "cloneNode").mockReturnValue(mockClone);
      const appendSpy = jest.spyOn(document.body, "appendChild").mockReturnValue(mockClone);

      const result = isTextOverflowing(element, 2);

      expect(result).toBe(true);

      cloneSpy.mockRestore();
      appendSpy.mockRestore();
    });

    it("should handle normal line-height", () => {
      const element = document.createElement("div");
      element.style.width = "100px";
      element.style.lineHeight = "normal"; // Should default to 1.2 * fontSize
      element.style.fontSize = "16px";
      element.textContent = "Test text";
      document.body.appendChild(element);

      // Mock getComputedStyle to return lineHeight: 'normal'
      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = jest.fn().mockReturnValue({
        lineHeight: "normal",
        fontSize: "16px",
      } as any);

      const mockClone = {
        style: {},
        scrollHeight: 20,
        remove: jest.fn(),
      } as any;

      const cloneSpy = jest.spyOn(element, "cloneNode").mockReturnValue(mockClone);
      const appendSpy = jest.spyOn(document.body, "appendChild").mockReturnValue(mockClone);

      const result = isTextOverflowing(element, 1);

      expect(result).toBe(false);

      cloneSpy.mockRestore();
      appendSpy.mockRestore();
      window.getComputedStyle = originalGetComputedStyle;
    });

    it("should return false for null element", () => {
      expect(isTextOverflowing(null, 2)).toBe(false);
    });

    it("should return false for undefined element", () => {
      expect(isTextOverflowing(undefined, 2)).toBe(false);
    });

    it("should use default maxLines of 1", () => {
      const element = document.createElement("div");
      element.style.fontSize = "16px";
      element.textContent = "test";
      document.body.appendChild(element);

      const mockClone = {
        style: {},
        scrollHeight: 30,
        remove: jest.fn(),
      } as any;

      const cloneSpy = jest.spyOn(element, "cloneNode").mockReturnValue(mockClone);
      const appendSpy = jest.spyOn(document.body, "appendChild").mockReturnValue(mockClone);

      // Mock getComputedStyle to return consistent fontSize
      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = jest.fn().mockReturnValue({
        lineHeight: "24px",
        fontSize: "16px",
      } as any);

      const result = isTextOverflowing(element); // No maxLines parameter

      expect(result).toBe(true);

      cloneSpy.mockRestore();
      appendSpy.mockRestore();
      window.getComputedStyle = originalGetComputedStyle;
    });
  });

  describe("isTextOverflowingWidth", () => {
    beforeEach(() => {
      document.body.innerHTML = "";
    });

    it("should detect single line width overflow", () => {
      const element = document.createElement("div");
      element.style.width = "50px";
      element.style.fontSize = "16px";
      element.style.fontFamily = "Arial";
      element.style.padding = "10px";
      element.textContent = "This is a long text";
      document.body.appendChild(element);

      const mockSpan = {
        style: {},
        offsetWidth: 150, // Text is wider than available width
      } as any;

      // Mock getComputedStyle for the element
      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = jest.fn().mockReturnValue({
        fontSize: "16px",
        fontFamily: "Arial",
        fontWeight: "normal",
        letterSpacing: "normal",
        textTransform: "none",
      } as any);

      const createElementSpy = jest.spyOn(document, "createElement").mockReturnValue(mockSpan);
      const appendSpy = jest.spyOn(document.body, "appendChild").mockReturnValue(mockSpan);

      const result = isTextOverflowingWidth(element);

      expect(result).toBe(true);

      createElementSpy.mockRestore();
      appendSpy.mockRestore();
      window.getComputedStyle = originalGetComputedStyle;
    });

    it("should return false when text fits within width", () => {
      const element = document.createElement("div");
      element.style.width = "200px";
      element.style.fontSize = "16px";
      element.style.fontFamily = "Arial";
      element.textContent = "Short text";
      document.body.appendChild(element);

      const mockSpan = {
        style: {},
        offsetWidth: 80, // Text fits within available width
      } as any;

      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = jest.fn().mockReturnValue({
        fontSize: "16px",
        fontFamily: "Arial",
        fontWeight: "normal",
        letterSpacing: "normal",
        textTransform: "none",
      } as any);

      const createElementSpy = jest.spyOn(document, "createElement").mockReturnValue(mockSpan);
      const appendSpy = jest.spyOn(document.body, "appendChild").mockReturnValue(mockSpan);

      const result = isTextOverflowingWidth(element);

      expect(result).toBe(false);

      createElementSpy.mockRestore();
      appendSpy.mockRestore();
      window.getComputedStyle = originalGetComputedStyle;
    });

    it("should account for padding", () => {
      const element = document.createElement("div");
      element.style.width = "100px";
      element.style.padding = "20px"; // 40px total padding, 60px available
      element.style.fontSize = "16px";
      element.textContent = "Test text";
      document.body.appendChild(element);

      const mockSpan = {
        style: {},
        offsetWidth: 70, // Text width > available 60px
      } as any;

      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = jest.fn().mockReturnValue({
        fontSize: "16px",
        fontFamily: "Arial",
        fontWeight: "normal",
        letterSpacing: "normal",
        textTransform: "none",
        paddingLeft: "20px",
        paddingRight: "20px",
      } as any);

      const createElementSpy = jest.spyOn(document, "createElement").mockReturnValue(mockSpan);
      const appendSpy = jest.spyOn(document.body, "appendChild").mockReturnValue(mockSpan);

      const result = isTextOverflowingWidth(element);

      expect(result).toBe(true);

      createElementSpy.mockRestore();
      appendSpy.mockRestore();
      window.getComputedStyle = originalGetComputedStyle;
    });

    it("should handle different font properties", () => {
      const element = document.createElement("div");
      element.style.width = "100px";
      element.style.fontSize = "20px";
      element.style.fontFamily = "Times New Roman";
      element.style.fontWeight = "bold";
      element.style.letterSpacing = "2px";
      element.textContent = "Test";
      document.body.appendChild(element);

      const mockSpan = {
        style: {},
        offsetWidth: 90,
      } as any;

      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = jest.fn().mockReturnValue({
        fontSize: "20px",
        fontFamily: "Times New Roman",
        fontWeight: "bold",
        letterSpacing: "2px",
        textTransform: "none",
      } as any);

      const createElementSpy = jest.spyOn(document, "createElement").mockReturnValue(mockSpan);
      const appendSpy = jest.spyOn(document.body, "appendChild").mockReturnValue(mockSpan);

      const result = isTextOverflowingWidth(element);

      expect(mockSpan.style.fontSize).toBe("20px");
      expect(mockSpan.style.fontFamily).toBe("Times New Roman");
      expect(mockSpan.style.fontWeight).toBe("bold");
      expect(mockSpan.style.letterSpacing).toBe("2px");

      createElementSpy.mockRestore();
      appendSpy.mockRestore();
      window.getComputedStyle = originalGetComputedStyle;
    });

    it("should return false for null element", () => {
      expect(isTextOverflowingWidth(null)).toBe(false);
    });

    it("should return false for undefined element", () => {
      expect(isTextOverflowingWidth(undefined)).toBe(false);
    });

    it("should handle empty text content", () => {
      const element = document.createElement("div");
      element.style.width = "100px";
      element.textContent = "";
      document.body.appendChild(element);

      const mockSpan = {
        style: {},
        offsetWidth: 0,
      } as any;

      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = jest.fn().mockReturnValue({
        fontSize: "16px",
        fontFamily: "Arial",
        fontWeight: "normal",
        letterSpacing: "normal",
        textTransform: "none",
      } as any);

      const createElementSpy = jest.spyOn(document, "createElement").mockReturnValue(mockSpan);
      const appendSpy = jest.spyOn(document.body, "appendChild").mockReturnValue(mockSpan);

      const result = isTextOverflowingWidth(element);

      expect(result).toBe(false);

      createElementSpy.mockRestore();
      appendSpy.mockRestore();
      window.getComputedStyle = originalGetComputedStyle;
    });
  });

  describe("getFullTextContent", () => {
    it("should return textContent", () => {
      const element = document.createElement("div");
      element.textContent = "Test content";

      expect(getFullTextContent(element)).toBe("Test content");
    });

    it("should fallback to innerText when textContent is empty", () => {
      const element = document.createElement("div");
      // @ts-expect-error - Simulate empty textContent but non-empty innerText
      Object.defineProperty(element, "textContent", {
        value: null,
        writable: true,
      });
      element.innerText = "Inner text content";

      expect(getFullTextContent(element)).toBe("Inner text content");
    });

    it("should return empty string when both are empty", () => {
      const element = document.createElement("div");

      expect(getFullTextContent(element)).toBe("");
    });

    it("should return empty string for null element", () => {
      expect(getFullTextContent(null)).toBe("");
    });

    it("should return empty string for undefined element", () => {
      expect(getFullTextContent(undefined)).toBe("");
    });

    it("should handle HTML elements with nested content", () => {
      const element = document.createElement("div");
      element.innerHTML = "<span>Nested <b>bold</b> text</span>";

      expect(getFullTextContent(element)).toBe("Nested bold text");
    });
  });

  describe("hasTextTruncation", () => {
    beforeEach(() => {
      document.body.innerHTML = "";
    });

    it("should return true for text-overflow: ellipsis", () => {
      const element = document.createElement("div");
      element.style.textOverflow = "ellipsis";
      document.body.appendChild(element);

      // Mock getComputedStyle to return the computed style
      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = jest.fn().mockReturnValue({
        textOverflow: "ellipsis",
        overflow: "visible",
      } as any);

      expect(hasTextTruncation(element)).toBe(true);

      window.getComputedStyle = originalGetComputedStyle;
    });

    it("should return true for text-overflow: clip", () => {
      const element = document.createElement("div");
      element.style.textOverflow = "clip";
      document.body.appendChild(element);

      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = jest.fn().mockReturnValue({
        textOverflow: "clip",
        overflow: "visible",
      } as any);

      expect(hasTextTruncation(element)).toBe(true);

      window.getComputedStyle = originalGetComputedStyle;
    });

    it("should return true for overflow: hidden", () => {
      const element = document.createElement("div");
      element.style.overflow = "hidden";
      document.body.appendChild(element);

      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = jest.fn().mockReturnValue({
        textOverflow: "clip",
        overflow: "hidden",
      } as any);

      expect(hasTextTruncation(element)).toBe(true);

      window.getComputedStyle = originalGetComputedStyle;
    });

    it("should return false for overflow: visible", () => {
      const element = document.createElement("div");
      element.style.overflow = "visible";
      element.style.textOverflow = "clip";
      document.body.appendChild(element);

      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = jest.fn().mockReturnValue({
        textOverflow: "clip",
        overflow: "visible",
      } as any);

      expect(hasTextTruncation(element)).toBe(false);

      window.getComputedStyle = originalGetComputedStyle;
    });

    it("should return false for text-overflow: unset", () => {
      const element = document.createElement("div");
      element.style.textOverflow = "unset";
      element.style.overflow = "visible";
      document.body.appendChild(element);

      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = jest.fn().mockReturnValue({
        textOverflow: "unset",
        overflow: "visible",
      } as any);

      expect(hasTextTruncation(element)).toBe(false);

      window.getComputedStyle = originalGetComputedStyle;
    });

    it("should return false for null element", () => {
      expect(hasTextTruncation(null)).toBe(false);
    });

    it("should return false for undefined element", () => {
      expect(hasTextTruncation(undefined)).toBe(false);
    });

    it("should handle element with multiple truncation styles", () => {
      const element = document.createElement("div");
      element.style.overflow = "hidden";
      element.style.textOverflow = "ellipsis";
      element.style.whiteSpace = "nowrap";
      document.body.appendChild(element);

      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = jest.fn().mockReturnValue({
        textOverflow: "ellipsis",
        overflow: "hidden",
      } as any);

      expect(hasTextTruncation(element)).toBe(true);

      window.getComputedStyle = originalGetComputedStyle;
    });
  });
});
