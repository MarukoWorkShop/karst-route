/** Tencent COS bucket (Guangzhou). Dev uses Vite `/hero-media` proxy with Referer. */
export const COS_BASE = "https://youxian-travel-1412422924.cos.ap-guangzhou.myqcloud.com";

/**
 * Only these prefixes load from COS.
 * `destinations/` stays on GitHub Pages / local `public/` so newly added jpgs
 * work as soon as they are in the repo — no separate COS upload required.
 * Hero videos remain on COS (large; gitignored).
 */
const COS_PREFIXES = ["videos/"] as const;

export const heroVideoOff = import.meta.env?.VITE_HERO_VIDEO_OFF === "1";

export function mediaBase(): string {
  const env = import.meta.env?.VITE_MEDIA_BASE?.replace(/\/$/, "");
  if (env) return env;
  return import.meta.env?.DEV ? "/hero-media" : COS_BASE;
}

export function isCosMedia(path: string): boolean {
  const p = path.replace(/^\//, "");
  return COS_PREFIXES.some((prefix) => p.startsWith(prefix));
}

export function cosUrl(file: string): string {
  if (!file) return "";
  if (/^https?:\/\//i.test(file)) return file;
  return `${mediaBase()}/${file.replace(/^\//, "")}`;
}

export function heroVideoUrl(file: string): string {
  if (!file || heroVideoOff) return "";
  return cosUrl(file);
}
