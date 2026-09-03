/** Tencent COS bucket (Guangzhou). Dev uses Vite `/hero-media` proxy with Referer. */
export const COS_BASE = "https://youxian-travel-1412422924.cos.ap-guangzhou.myqcloud.com";

/** Paths confirmed on COS. Add `tours/` etc. after upload. */
const COS_PREFIXES = ["destinations/", "videos/"] as const;

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
