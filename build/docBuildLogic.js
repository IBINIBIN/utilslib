import fetch from "node-fetch";

/**
 * 生成codesandbox iframe预览链接
 *
 * @param {object} body - 要发送到CodeSandbox API的请求体
 * @returns {Promise<string>} - 返回CodeSandbox的嵌入链接
 * @throws {Error} - 如果API请求失败
 */
export const createSandboxLink = async (body) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

    const fetchJson = await fetch("https://codesandbox.io/api/v1/sandboxes/define?json=1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!fetchJson.ok) {
      throw new Error(`CodeSandbox API responded with status: ${fetchJson.status}`);
    }

    const codesandBoxInfo = await fetchJson.json();
    const { sandbox_id } = codesandBoxInfo;

    if (!sandbox_id) {
      throw new Error("Failed to get sandbox_id from CodeSandbox API");
    }

    return `https://codesandbox.io/embed/${sandbox_id}`;
  } catch (error) {
    console.error("Error creating CodeSandbox link:", error);
    throw error;
  }
};

/**
 * 生成CodeSandbox iframe HTML代码
 *
 * @param {string} src - CodeSandbox嵌入链接
 * @returns {string} - 返回iframe HTML代码
 */
export const generateSandboxIframe = (src) => {
  // 确保src是安全的
  const safeSrc = src.replace(/"/g, "&quot;");

  return `<iframe 
    style="
      outline: 1px solid #252525;
      border: 0;
      width: 100%;
      height: 500px; 
      border-radius: 8px; 
      overflow: hidden;
      margin: 16px 0;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    "
    src="${safeSrc}"
    allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
    sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
    loading="lazy"
    title="CodeSandbox Example"
></iframe>`;
};
