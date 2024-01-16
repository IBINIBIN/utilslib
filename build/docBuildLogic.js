import fetch from "node-fetch";

/**
 * 生成codesandbox iframe预览链接
 *
 * @param {object} body
 * @returns
 */
export const createSandboxLink = async (body) => {
  const fetchJson = await fetch(
    "https://codesandbox.io/api/v1/sandboxes/define?json=1",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const codesandBoxInfo = await fetchJson.json();
  const { sandbox_id } = codesandBoxInfo;
  const src = `https://codesandbox.io/embed/${sandbox_id}`;
  return src;
};

export const generateSandboxIframe = (src) => {
  return `
  <iframe 
    style="
      outline: '1px solid #252525';
      border: 0;
      width: 100%;
      height: 500px; 
      border-radius: 8px; 
      overflow:hidden;
    "
    src="${src}"
    allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
    sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
  ></iframe>
`;
};
