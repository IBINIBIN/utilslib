/**
 * 判断是否为 iOS
 */
export function isIOS() {
  const systemInfo = uni.getSystemInfoSync();
  return systemInfo.platform === "ios";
}

/**
 * 判断是否为 Android
 */
export function isAndroid() {
  const systemInfo = uni.getSystemInfoSync();
  return systemInfo.platform === "android";
}
