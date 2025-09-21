// 获取底部安全区
export function getBottomSafeAreaHeight() {
  const systemInfo = uni.getSystemInfoSync();
  const safeArea = systemInfo.safeArea || { bottom: 0 };
  const screenHeight = systemInfo.screenHeight;
  const bottomSafeHeight = screenHeight - safeArea.bottom;
  return bottomSafeHeight;
}
