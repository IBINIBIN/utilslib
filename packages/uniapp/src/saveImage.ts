/**
 * 图片保存工具类
 * @description 提供保存网络图片和本地图片到相册的功能，自动处理权限申请和错误提示
 */
export class ImageSaver {
  /**
   * 构造函数
   *
   * @param {Object} options - 配置选项
   * @param {string} [options.loadingText='下载中...'] - 下载时的提示文字
   * @param {string} [options.savingText='保存中...'] - 保存时的提示文字
   * @param {string} [options.successText='保存成功'] - 保存成功的提示文字
   * @param {string} [options.failText='保存失败'] - 保存失败的提示文字
   * @param {string} [options.downloadFailText='下载失败'] - 下载失败的提示文字
   * @param {string} [options.authModalTitle='提示'] - 权限弹窗标题
   * @param {string} [options.authModalContent='需要授权保存图片到相册'] - 权限弹窗内容
   * @param {string} [options.authModalConfirmText='去设置'] - 权限弹窗确认按钮文字
   */
  constructor(
    private options = {
      loadingText: "下载中...",
      savingText: "保存中...",
      successText: "保存成功",
      failText: "保存失败",
      downloadFailText: "下载失败",
      authModalTitle: "提示",
      authModalContent: "需要授权保存图片到相册",
      authModalConfirmText: "去设置",
    },
  ) {}

  /**
   * 保存图片（实例方法）
   *
   * @description 支持保存网络图片和本地图片到相册
   *
   * @param {string} imageUrl - 图片路径（支持网络图片 http/https 或本地图片路径）
   * @returns {Promise<void>}
   *
   * @example
   * const saver = new ImageSaver();
   * await saver.save('https://example.com/image.jpg');
   */
  public async save(imageUrl: string): Promise<void> {
    try {
      // 请求权限
      const hasAuth = await this.requestAlbumAuth();
      if (!hasAuth) return;

      // 判断是网络图片还是本地图片
      if (this.isNetworkImage(imageUrl)) {
        await this.saveNetworkImage(imageUrl);
      } else {
        await this.saveLocalImage(imageUrl);
      }
    } catch (error) {
      console.error("保存图片失败:", error);
      uni.hideLoading();
      uni.showToast({ title: this.options.failText, icon: "none" });
    }
  }

  /**
   * 静态保存方法（快捷调用）
   *
   * @description 使用默认配置保存图片，无需实例化
   *
   * @param {string} imageUrl - 图片路径
   * @returns {Promise<void>}
   *
   * @example
   * ImageSaver.save('https://example.com/image.jpg');
   */
  public static async save(imageUrl: string): Promise<void> {
    const instance = new ImageSaver();
    return instance.save(imageUrl);
  }

  /**
   * 请求相册权限
   *
   * @description 检查并请求相册写入权限，如果用户拒绝则引导用户前往设置页面
   *
   * @returns {Promise<boolean>} 返回是否获得授权
   * - `true`: 已授权或用户同意授权
   * - `false`: 用户拒绝授权
   *
   * @private
   */
  private requestAlbumAuth(): Promise<boolean> {
    return new Promise((resolve) => {
      uni.getSetting({
        success: (res) => {
          // 检查是否已有相册权限
          if (res.authSetting["scope.writePhotosAlbum"]) {
            resolve(true);
          } else {
            // 请求授权
            uni.authorize({
              scope: "scope.writePhotosAlbum",
              success: () => resolve(true),
              fail: () => {
                // 授权失败，提示用户手动开启
                this.showAuthModal();
                resolve(false);
              },
            });
          }
        },
        fail: () => resolve(false),
      });
    });
  }

  /**
   * 显示授权提示弹窗
   *
   * @description 当用户拒绝授权时，显示提示弹窗引导用户前往设置页面
   *
   * @returns {void}
   *
   * @private
   */
  private showAuthModal(): void {
    uni.showModal({
      title: this.options.authModalTitle,
      content: this.options.authModalContent,
      confirmText: this.options.authModalConfirmText,
      success: (modalRes) => {
        if (modalRes.confirm) {
          uni.openSetting();
        }
      },
    });
  }

  /**
   * 判断是否为网络图片
   *
   * @description 通过 URL 协议判断是否为网络图片
   *
   * @param {string} url - 图片地址
   * @returns {boolean} 是否为网络图片
   *
   * @private
   */
  private isNetworkImage(url: string): boolean {
    return url.startsWith("http://") || url.startsWith("https://");
  }

  /**
   * 保存图片到相册
   *
   * @description 调用系统 API 将图片保存到相册，并显示相应的提示信息
   *
   * @param {string} filePath - 本地临时文件路径或永久文件路径
   * @returns {Promise<void>}
   *
   * @private
   */
  private saveToAlbum(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      uni.saveImageToPhotosAlbum({
        filePath: filePath,
        success: () => {
          uni.hideLoading();
          uni.showToast({ title: this.options.successText, icon: "success" });
          resolve();
        },
        fail: (err) => {
          uni.hideLoading();
          console.error("保存失败", err);
          uni.showToast({ title: this.options.failText, icon: "none" });
          reject(err);
        },
      });
    });
  }

  /**
   * 保存网络图片
   *
   * @description 先下载网络图片到本地临时目录，然后保存到相册
   *
   * @param {string} url - 网络图片地址（http 或 https 协议）
   * @returns {Promise<void>}
   *
   * @private
   */
  private async saveNetworkImage(url: string): Promise<void> {
    uni.showLoading({ title: this.options.loadingText });

    return new Promise((resolve, reject) => {
      uni.downloadFile({
        url: url,
        success: async (res) => {
          if (res.statusCode === 200) {
            try {
              await this.saveToAlbum(res.tempFilePath);
              resolve();
            } catch (error) {
              reject(error);
            }
          } else {
            uni.hideLoading();
            uni.showToast({ title: this.options.downloadFailText, icon: "none" });
            reject(new Error(`下载失败: HTTP ${res.statusCode}`));
          }
        },
        fail: (err) => {
          uni.hideLoading();
          console.error("下载失败", err);
          uni.showToast({ title: this.options.downloadFailText, icon: "none" });
          reject(err);
        },
      });
    });
  }

  /**
   * 保存本地图片
   *
   * @description 直接保存本地图片到相册（无需下载）
   *
   * @param {string} filePath - 本地图片路径
   * @returns {Promise<void>}
   *
   * @private
   */
  private async saveLocalImage(filePath: string): Promise<void> {
    uni.showLoading({ title: this.options.savingText });
    return this.saveToAlbum(filePath);
  }
}
