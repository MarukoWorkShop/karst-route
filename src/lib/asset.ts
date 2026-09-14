import { cosUrl, isCosMedia } from "@/lib/media";

/**
 * Static asset URL. destinations / tours / reviews / videos / light load from Tencent COS;
 * brand / literature / fonts stay on GitHub Pages (`public/`).
 */
export function asset(path: string) {
  const p = path.replace(/^\//, "");
  if (isCosMedia(p)) return cosUrl(p);
  return `${import.meta.env?.BASE_URL ?? "/"}${p}`;
}
