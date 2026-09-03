import { cosUrl, isCosMedia } from "@/lib/media";

/**
 * Static asset URL. Destination photos and hero videos load from Tencent COS;
 * brand / tours / literature stay on GitHub Pages until uploaded to the bucket.
 */
export function asset(path: string) {
  const p = path.replace(/^\//, "");
  if (isCosMedia(p)) return cosUrl(p);
  return `${import.meta.env?.BASE_URL ?? "/"}${p}`;
}
