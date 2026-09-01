const CDN = "https://youxian-travel-1412422924.cos.ap-guangzhou.myqcloud.com";

/**
 * 图片走腾讯云 COS —— 国内访问比 GitHub Pages 快很多（实测约 125 倍）。
 * 其余资源（brand、字体等）仍走 Vite base，GitHub Pages 部署在 /karst-route/。
 */
export function asset(path: string) {
  const p = path.replace(/^\//, "");
  if (p.startsWith("destinations/")) {
    return `${CDN}/${p}`;
  }
  return `${import.meta.env.BASE_URL}${p}`;
}
