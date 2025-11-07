// ============ 环境检测 ============
/** 浏览器环境 */
export const IS_BROWSER = isBrowser();

/** Web Worker 环境 */
export const IS_WEB_WORKER = isWebWorker();

// ============ 操作系统检测 ============
/** 操作系统类型 */
export const OS_TYPE = getOSType();

/** iOS 操作系统 */
export const IS_IOS_OS = OS_TYPE === "ios";

/** Android 操作系统 */
export const IS_ANDROID_OS = OS_TYPE === "android";

/** macOS 操作系统 */
export const IS_MACOS_OS = OS_TYPE === "macos";

/** Windows 操作系统 */
export const IS_WINDOWS_OS = OS_TYPE === "windows";

/** Linux 操作系统 */
export const IS_LINUX_OS = OS_TYPE === "linux";

// ============ 浏览器检测 ============
/** 浏览器类型 */
export const BROWSER_TYPE = getBrowserType();

/** Chrome 浏览器 */
export const IS_CHROME_BROWSER = BROWSER_TYPE === "chrome";

/** Safari 浏览器 */
export const IS_SAFARI_BROWSER = BROWSER_TYPE === "safari";

/** Firefox 浏览器 */
export const IS_FIREFOX_BROWSER = BROWSER_TYPE === "firefox";

/** Edge 浏览器 */
export const IS_EDGE_BROWSER = BROWSER_TYPE === "edge";

/** Opera 浏览器 */
export const IS_OPERA_BROWSER = BROWSER_TYPE === "opera";

/** IE 浏览器 */
export const IS_IE_BROWSER = BROWSER_TYPE === "ie";

// ============ 设备类型检测 ============
/** 平板设备 */
export const IS_TABLET = isTablet();

/** 手机设备 */
export const IS_PHONE = isPhone();

/** 移动设备 */
export const IS_MOBILE = IS_PHONE || IS_TABLET;

/** 桌面设备 */
export const IS_DESKTOP = !IS_MOBILE;

// ============ 触摸支持检测 ============
/** 支持触摸事件 */
export const SUPPORTS_TOUCH = supportsTouch();

// ============ 浏览器特性检测 ============
/** 支持 LocalStorage */
export const SUPPORTS_LOCAL_STORAGE = supportsLocalStorage();

/** 支持 SessionStorage */
export const SUPPORTS_SESSION_STORAGE = supportsSessionStorage();

/** 支持 WebGL */
export const SUPPORTS_WEBGL = supportsWebGL();

/** 支持 WebAssembly */
export const SUPPORTS_WEB_ASSEMBLY = typeof WebAssembly !== "undefined";

/** 支持 Service Worker */
export const SUPPORTS_SERVICE_WORKER = "serviceWorker" in navigator;

// ============ 屏幕信息 ============
/** Retina 高清屏 */
export const IS_RETINA = window.devicePixelRatio > 1;

// ============ 语言检测 ============
/** 浏览器语言 */
export const LANGUAGE = navigator.language || (navigator as any).userLanguage || "en";

// ============ 动态检测方法 ============

/**
 * 检测是否为暗黑模式（动态）
 * 用户可能在运行时切换系统主题
 */
export function isDarkMode(): boolean {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * 检测是否在线（动态）
 * 网络状态会实时变化
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * 获取连接类型（动态）
 * 连接类型会随网络环境变化
 */
export function getConnectionType(): string {
  if (!("connection" in navigator)) return "unknown";

  const connection =
    (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  return connection?.effectiveType || "unknown";
}

/**
 * 获取屏幕信息（动态）
 * 窗口大小可能会变化
 */
export function getScreenInfo() {
  return {
    width: window.screen.width,
    height: window.screen.height,
    availWidth: window.screen.availWidth,
    availHeight: window.screen.availHeight,
    colorDepth: window.screen.colorDepth,
    pixelDepth: window.screen.pixelDepth,
    devicePixelRatio: window.devicePixelRatio || 1,
  };
}

/**
 * 获取视口信息（动态）
 * 视口大小会随窗口调整而变化
 */
export function getViewportInfo() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    scrollX: window.scrollX || window.pageXOffset,
    scrollY: window.scrollY || window.pageYOffset,
  };
}

// ============ 内部函数 ============

/**
 * 检测浏览器环境
 * @returns 浏览器环境判断结果
 */
function isBrowser() {
  return typeof window !== "undefined" && typeof navigator !== "undefined";
}

/**
 * 检测 Web Worker 环境
 * @returns Web Worker 环境判断结果
 */
function isWebWorker() {
  return typeof self === "object" && self.constructor && self.constructor.name === "DedicatedWorkerGlobalScope";
}

/**
 * 获取操作系统类型
 * @returns 操作系统类型: ios | android | macos | windows | linux | unknown
 */
function getOSType() {
  const userAgent = navigator.userAgent.toLowerCase();
  const platform = (navigator.platform || "").toLowerCase();

  if (/iphone|ipad|ipod/.test(userAgent)) return "ios";
  if (/android/.test(userAgent)) return "android";
  if (/mac/.test(platform)) return "macos";
  if (/win/.test(platform)) return "windows";
  if (/linux/.test(platform)) return "linux";

  return "unknown";
}

/**
 * 获取浏览器类型
 * @returns 浏览器类型: chrome | safari | firefox | edge | opera | ie | unknown
 */
function getBrowserType() {
  const userAgent = navigator.userAgent.toLowerCase();

  if (/edg/.test(userAgent)) return "edge";
  if (/chrome/.test(userAgent) && !/edg/.test(userAgent)) return "chrome";
  if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) return "safari";
  if (/firefox/.test(userAgent)) return "firefox";
  if (/opera|opr/.test(userAgent)) return "opera";
  if (/trident|msie/.test(userAgent)) return "ie";

  return "unknown";
}

/**
 * 检测平板设备
 * @returns 平板设备判断结果
 */
function isTablet() {
  const userAgent = navigator.userAgent.toLowerCase();
  return /ipad|android(?!.*mobile)|tablet/.test(userAgent);
}

/**
 * 检测手机设备
 * @returns 手机设备判断结果
 */
function isPhone() {
  const userAgent = navigator.userAgent.toLowerCase();
  return /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/.test(userAgent) && !IS_TABLET;
}

/**
 * 检测触摸事件支持
 * @returns 触摸事件支持判断结果
 */
function supportsTouch() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

/**
 * 检测 LocalStorage 支持
 * @returns LocalStorage 支持判断结果
 */
function supportsLocalStorage() {
  try {
    const test = "__localStorage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 检测 SessionStorage 支持
 * @returns SessionStorage 支持判断结果
 */
function supportsSessionStorage() {
  try {
    const test = "__sessionStorage_test__";
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 检测 WebGL 支持
 * @returns WebGL 支持判断结果
 */
function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch (e) {
    return false;
  }
}
