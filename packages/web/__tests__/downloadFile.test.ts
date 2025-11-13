/**
 * @jest-environment jsdom
 */

import { downloadFile } from "../src/dom";

describe("downloadFile", () => {
  let mockLink: HTMLAnchorElement;

  beforeEach(() => {
    // Mock document.createElement
    mockLink = {
      href: "",
      download: "",
      click: jest.fn(),
      remove: jest.fn(),
    } as any;

    jest.spyOn(document, "createElement").mockReturnValue(mockLink);

    // Create a mock URL object
    const mockURL = {
      createObjectURL: jest.fn().mockReturnValue("mock-url"),
      revokeObjectURL: jest.fn(),
    };

    // Replace the global URL object
    Object.defineProperty(global, "URL", {
      value: mockURL,
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("应该是一个函数", () => {
    expect(typeof downloadFile).toBe("function");
  });

  it("应该使用字符串 URL 下载文件", () => {
    const url = "https://example.com/file.txt";
    const fileName = "test-file.txt";

    downloadFile(url, fileName);

    expect(document.createElement).toHaveBeenCalledWith("a");
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(mockLink.href).toBe(url);
    expect(mockLink.download).toBe(fileName);
    expect(mockLink.click).toHaveBeenCalled();
    expect(mockLink.remove).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(url);
  });

  it("应该使用 Blob 对象下载文件", () => {
    const blob = new Blob(["test content"], { type: "text/plain" });
    const fileName = "test-blob.txt";

    downloadFile(blob, fileName);

    expect(document.createElement).toHaveBeenCalledWith("a");
    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
    expect(mockLink.href).toBe("mock-url");
    expect(mockLink.download).toBe(fileName);
    expect(mockLink.click).toHaveBeenCalled();
    expect(mockLink.remove).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("mock-url");
  });

  it("应该使用空文件名作为默认值", () => {
    const url = "https://example.com/file.txt";

    downloadFile(url);

    expect(mockLink.download).toBe("");
  });

  it("应该正确处理不同类型的 Blob", () => {
    const jsonBlob = new Blob(['{"key": "value"}'], { type: "application/json" });
    const fileName = "data.json";

    downloadFile(jsonBlob, fileName);

    expect(URL.createObjectURL).toHaveBeenCalledWith(jsonBlob);
    expect(mockLink.href).toBe("mock-url");
    expect(mockLink.download).toBe(fileName);
    expect(mockLink.click).toHaveBeenCalled();
    expect(mockLink.remove).toHaveBeenCalled();
  });

  it("应该清理创建的 URL", () => {
    const blob = new Blob(["test"], { type: "text/plain" });
    const fileName = "cleanup.txt";

    downloadFile(blob, fileName);

    // 验证 revokeObjectURL 被调用
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("mock-url");
  });
});
