import { getBasename, getFileName, getFileExtension } from "../src/file";

describe("File Utils", () => {
  describe("getBasename", () => {
    it("should extract filename from path", () => {
      expect(getBasename("/path/to/file.txt")).toBe("file.txt");
      expect(getBasename("C:\\Windows\\system32\\cmd.exe")).toBe("cmd.exe");
      expect(getBasename("/home/user/documents/report.pdf")).toBe("report.pdf");
    });

    it("should handle paths with multiple slashes", () => {
      expect(getBasename("/path/to//file.txt")).toBe("file.txt");
      expect(getBasename("///path///to///file.txt")).toBe("file.txt");
      expect(getBasename("C:\\\\Windows\\\\system32\\\\cmd.exe")).toBe("cmd.exe");
    });

    it("should handle paths with trailing slashes", () => {
      expect(getBasename("/path/to/")).toBe("to");
      expect(getBasename("/path/to////")).toBe("to");
      expect(getBasename("C:\\Windows\\")).toBe("Windows");
    });

    it("should remove extension when provided", () => {
      expect(getBasename("/path/to/file.txt", ".txt")).toBe("file");
      expect(getBasename("/path/to/document.pdf", ".pdf")).toBe("document");
      expect(getBasename("/path/to/archive.tar.gz", ".gz")).toBe("archive.tar");
    });

    it("should not remove extension when not matching", () => {
      expect(getBasename("/path/to/file.txt", ".pdf")).toBe("file.txt");
      expect(getBasename("/path/to/file.txt", ".TXT")).toBe("file.txt");
    });

    it("should handle relative paths", () => {
      expect(getBasename("relative/path/file.txt")).toBe("file.txt");
      expect(getBasename("./file.txt")).toBe("file.txt");
      expect(getBasename("../file.txt")).toBe("file.txt");
      expect(getBasename("file.txt")).toBe("file.txt");
    });

    it("should handle edge cases", () => {
      expect(getBasename("")).toBe("");
      expect(getBasename("/")).toBe("");
      expect(getBasename("/file.txt")).toBe("file.txt");
      expect(getBasename("file.txt")).toBe("file.txt");
      expect(getBasename("file")).toBe("file");
    });

    it("should handle mixed path separators", () => {
      expect(getBasename("/path\\to/file.txt")).toBe("file.txt");
      expect(getBasename("C:/path\\to/file.txt")).toBe("file.txt");
    });

    it("should handle filenames with dots", () => {
      expect(getBasename("/path/to/file.name.with.dots.txt", ".txt")).toBe("file.name.with.dots");
      expect(getBasename("/path/to/.gitignore")).toBe(".gitignore");
      expect(getBasename("/path/to/.env.local")).toBe(".env.local");
    });
  });

  describe("getFileName", () => {
    it("should extract filename without extension", () => {
      expect(getFileName("/path/to/file.txt")).toBe("file");
      expect(getFileName("C:\\Windows\\system32\\cmd.exe")).toBe("cmd");
      expect(getFileName("/home/user/documents/report.pdf")).toBe("report");
    });

    it("should handle files without extension", () => {
      expect(getFileName("/path/to/file")).toBe("file");
      expect(getFileName("README")).toBe("README");
      expect(getFileName("Dockerfile")).toBe("Dockerfile");
    });

    it("should handle files with multiple dots", () => {
      expect(getFileName("/path/to/file.name.with.dots.txt")).toBe("file.name.with.dots");
      expect(getFileName("archive.tar.gz")).toBe("archive.tar");
      expect(getFileName("config.json.bak")).toBe("config.json");
    });

    it("should handle dotfiles", () => {
      // For dotfiles starting with '.', if there's no extension, the function returns empty string
      expect(getFileName(".gitignore")).toBe("");
      expect(getFileName("/path/to/.env")).toBe("");
      expect(getFileName("/path/to/.config.json")).toBe(".config");
    });

    it("should handle edge cases", () => {
      expect(getFileName("")).toBe("");
      expect(getFileName(".")).toBe("");
      expect(getFileName("..")).toBe(".");
      expect(getFileName("file.")).toBe("file");
      expect(getFileName(".file")).toBe("");
    });

    it("should handle paths with directories", () => {
      expect(getFileName("/path/to/file.ext")).toBe("file");
      expect(getFileName("relative/path/document.pdf")).toBe("document");
      expect(getFileName("./file.txt")).toBe("file");
    });

    it("should handle hidden files starting with dots", () => {
      // Hidden files without extensions return empty string
      expect(getFileName("/path/to/.hidden")).toBe("");
      expect(getFileName(".profile")).toBe("");
    });
  });

  describe("getFileExtension", () => {
    it("should extract file extension", () => {
      expect(getFileExtension("file.txt")).toBe("txt");
      expect(getFileExtension("document.pdf")).toBe("pdf");
      expect(getFileExtension("image.jpg")).toBe("jpg");
      expect(getFileExtension("archive.tar.gz")).toBe("gz");
    });

    it("should handle files without extension", () => {
      expect(getFileExtension("file")).toBe("");
      expect(getFileExtension("README")).toBe("");
      expect(getFileExtension("Dockerfile")).toBe("");
    });

    it("should handle dotfiles", () => {
      expect(getFileExtension(".gitignore")).toBe("gitignore");
      expect(getFileExtension(".env")).toBe("env");
      expect(getFileExtension(".profile")).toBe("profile");
    });

    it("should handle files with leading dots and extensions", () => {
      expect(getFileExtension(".config.json")).toBe("json");
      expect(getFileExtension(".htaccess")).toBe("htaccess");
      expect(getFileExtension(".babelrc")).toBe("babelrc");
    });

    it("should handle edge cases", () => {
      expect(getFileExtension("")).toBe("");
      expect(getFileExtension(".")).toBe("");
      expect(getFileExtension("..")).toBe("");
      expect(getFileExtension("file.")).toBe("");
      expect(getFileExtension(".file")).toBe("file");
      expect(getFileExtension("..file")).toBe("file");
    });

    it("should handle paths", () => {
      expect(getFileExtension("/path/to/file.txt")).toBe("txt");
      expect(getFileExtension("C:\\Windows\\system32\\cmd.exe")).toBe("exe");
      expect(getFileExtension("./relative/path/file.ext")).toBe("ext");
    });

    it("should handle multiple dots correctly", () => {
      expect(getFileExtension("archive.tar.gz")).toBe("gz");
      expect(getFileExtension("config.json.backup")).toBe("backup");
      expect(getFileExtension("my.file.name.txt")).toBe("txt");
    });

    it("should handle special cases with multiple leading dots", () => {
      expect(getFileExtension("..gitignore")).toBe("gitignore");
      expect(getFileExtension("...test")).toBe("test");
    });
  });
});
