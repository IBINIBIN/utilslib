/**
 * 系统检测工具函数集合
 * 包含所有操作系统和设备类型的检测函数
 */

/**
 * 获取User Agent字符串
 * @returns {string} User Agent字符串
 */
function getUserAgent() {
  return typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase() : "";
}

/**
 * 获取平台信息
 * @returns {string} 平台信息
 */
function getPlatform() {
  if (typeof navigator !== "undefined") {
    return navigator.platform.toLowerCase();
  }
  if (typeof process !== "undefined" && process.platform) {
    return process.platform;
  }
  return "";
}

/**
 * 获取系统架构
 * @returns {string} 系统架构
 */
export function getArchitecture() {
  // Node.js环境
  if (typeof process !== "undefined" && process.arch) {
    return process.arch;
  }

  // 浏览器环境
  const userAgent = getUserAgent();

  if (userAgent.includes("wow64") || userAgent.includes("x86_64") || userAgent.includes("x64")) {
    return "x64";
  } else if (userAgent.includes("arm") || userAgent.includes("aarch64")) {
    return "arm";
  } else if (userAgent.includes("x86")) {
    return "x86";
  }

  return "unknown";
}

/**
 * 检测是否为Windows系统
 * @returns {boolean}
 */
export function isWindows() {
  const userAgent = getUserAgent();
  const platform = getPlatform();

  if (typeof process !== "undefined" && process.platform) {
    return process.platform === "win32";
  }

  return userAgent.includes("windows") || platform.includes("win");
}

/**
 * 检测是否为macOS系统
 * @returns {boolean}
 */
export function isMacOS() {
  const userAgent = getUserAgent();
  const platform = getPlatform();

  if (typeof process !== "undefined" && process.platform) {
    return process.platform === "darwin";
  }

  return (
    (userAgent.includes("mac os x") || platform.includes("mac")) &&
    !userAgent.includes("iphone") &&
    !userAgent.includes("ipad")
  );
}

/**
 * 检测是否为Linux系统
 * @returns {boolean}
 */
export function isLinux() {
  const userAgent = getUserAgent();
  const platform = getPlatform();

  if (typeof process !== "undefined" && process.platform) {
    return process.platform === "linux";
  }

  return userAgent.includes("linux") || platform.includes("linux");
}

/**
 * 检测是否为Chrome OS系统
 * @returns {boolean}
 */
export function isChromeOS() {
  const userAgent = getUserAgent();

  return userAgent.includes("cros");
}

/**
 * 检测是否为iOS系统
 * @returns {boolean}
 */
export function isIOS() {
  const userAgent = getUserAgent();

  return userAgent.includes("iphone") || userAgent.includes("ipad") || userAgent.includes("ipod");
}

/**
 * 检测是否为Android系统
 * @returns {boolean}
 */
export function isAndroid() {
  const userAgent = getUserAgent();

  return userAgent.includes("android");
}

/**
 * 检测是否为FreeBSD系统
 * @returns {boolean}
 */
export function isFreeBSD() {
  const userAgent = getUserAgent();
  const platform = getPlatform();

  if (typeof process !== "undefined" && process.platform) {
    return process.platform === "freebsd";
  }

  return userAgent.includes("freebsd") || platform.includes("freebsd");
}

/**
 * 检测是否为OpenBSD系统
 * @returns {boolean}
 */
export function isOpenBSD() {
  const userAgent = getUserAgent();
  const platform = getPlatform();

  if (typeof process !== "undefined" && process.platform) {
    return process.platform === "openbsd";
  }

  return userAgent.includes("openbsd") || platform.includes("openbsd");
}

/**
 * 检测是否为NetBSD系统
 * @returns {boolean}
 */
export function isNetBSD() {
  const userAgent = getUserAgent();
  const platform = getPlatform();

  if (typeof process !== "undefined" && process.platform) {
    return process.platform === "netbsd";
  }

  return userAgent.includes("netbsd") || platform.includes("netbsd");
}

/**
 * 检测是否为AIX系统
 * @returns {boolean}
 */
export function isAIX() {
  const platform = getPlatform();

  if (typeof process !== "undefined" && process.platform) {
    return process.platform === "aix";
  }

  return platform.includes("aix");
}

/**
 * 检测是否为Solaris系统
 * @returns {boolean}
 */
export function isSolaris() {
  const userAgent = getUserAgent();
  const platform = getPlatform();

  if (typeof process !== "undefined" && process.platform) {
    return process.platform === "sunos";
  }

  return (
    userAgent.includes("sunos") ||
    platform.includes("sunos") ||
    userAgent.includes("solaris") ||
    platform.includes("solaris")
  );
}

/**
 * 检测是否为移动设备
 * @returns {boolean}
 */
export function isMobile() {
  const userAgent = getUserAgent();
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;

  return mobileRegex.test(userAgent);
}

/**
 * 检测是否为桌面设备
 * @returns {boolean}
 */
export function isDesktop() {
  return !isMobile();
}

/**
 * 检测是否为Unix系统（包括Linux、macOS、BSD等）
 * @returns {boolean}
 */
export function isUnix() {
  return isLinux() || isMacOS() || isFreeBSD() || isOpenBSD() || isNetBSD() || isAIX() || isSolaris();
}

/**
 * 检测是否为类Unix系统（包括Unix + Android + iOS）
 * @returns {boolean}
 */
export function isUnixLike() {
  return isUnix() || isAndroid() || isIOS();
}

/**
 * 检测是否为BSD系统
 * @returns {boolean}
 */
export function isBSD() {
  return isFreeBSD() || isOpenBSD() || isNetBSD();
}

/**
 * 获取操作系统类型
 * @returns {string} 操作系统类型
 */
export function getOSType() {
  if (isWindows()) return "windows";
  if (isMacOS()) return "macos";
  if (isLinux()) return "linux";
  if (isIOS()) return "ios";
  if (isAndroid()) return "android";
  if (isFreeBSD()) return "freebsd";
  if (isOpenBSD()) return "openbsd";
  if (isNetBSD()) return "netbsd";
  if (isChromeOS()) return "chromeos";
  if (isAIX()) return "aix";
  if (isSolaris()) return "solaris";

  return "unknown";
}

/**
 * 检测是否在浏览器环境
 * @returns {boolean}
 */
export function isBrowser() {
  return typeof window !== "undefined" && typeof navigator !== "undefined";
}

/**
 * 检测是否在Node.js环境
 * @returns {boolean}
 */
export function isNode() {
  return typeof process !== "undefined" && process.versions && process.versions.node;
}

/**
 * 获取iOS设备类型
 * @returns {string} iOS设备类型，非iOS设备返回空字符串
 */
export function getIOSDevice() {
  if (!isIOS()) return "";

  const userAgent = getUserAgent();

  if (userAgent.includes("ipad")) {
    return "ipad";
  } else if (userAgent.includes("iphone")) {
    return "iphone";
  } else if (userAgent.includes("ipod")) {
    return "ipod";
  }

  return "unknown";
}
