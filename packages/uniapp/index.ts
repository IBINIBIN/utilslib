export function getBottomSafeAreaHeight() {
  const systemInfo = uni.getSystemInfoSync();
  // 获取安全区域信息
  const safeArea = systemInfo.safeArea;
  const screenHeight = systemInfo.screenHeight;

  // 底部安全区域高度 = 屏幕高度 - 安全区域底部位置
  const bottomSafeHeight = screenHeight - safeArea.bottom;

  return bottomSafeHeight;
}
