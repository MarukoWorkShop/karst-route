import { cosUrl, isCosMedia } from "@/lib/media";

/**
 * Static asset URL. Hero videos load from Tencent COS;
 * destinations / brand / tours / literature / reviews stay on GitHub Pages
 * (local `public/`) until you intentionally move them to the bucket.
 */
export function asset(path: string) {
  const p = path.replace(/^\//, "");
  if (isCosMedia(p)) return cosUrl(p);
  return `${import.meta.env?.BASE_URL ?? "/"}${p}`;
}
