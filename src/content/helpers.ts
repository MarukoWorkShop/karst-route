import { parse } from "yaml";
import { LOCALES, type Locale, type Tx } from "@/i18n/copy";

export type YamlDoc = {
  id: string;
  path: string;
  data: Record<string, unknown>;
  /** File-level native language (`src:` at the top of the YAML). */
  src: string;
};

export function readLang(value: unknown): Locale | undefined {
  if (typeof value === "string" && (LOCALES as readonly string[]).includes(value.trim())) {
    return value.trim() as Locale;
  }
  return undefined;
}

function textOf(o: Record<string, unknown>, key: string): string {
  const v = o[key];
  return typeof v === "string" ? v : "";
}

/** Field `src` wins; else only-zh → zh, only-en → en; else file default. */
export function inferSrc(o: Record<string, unknown>, fallback: string): string {
  const explicit = typeof o.src === "string" && o.src.trim() ? o.src.trim() : "";
  if (explicit) return explicit;
  const en = textOf(o, "en").trim();
  const zh = textOf(o, "zh").trim();
  if (zh && !en) return "zh";
  if (en && !zh) return "en";
  return fallback;
}

export function globYaml(files: Record<string, string>): YamlDoc[] {
  const out: YamlDoc[] = [];
  for (const [path, raw] of Object.entries(files)) {
    const id = path.split("/").pop()?.replace(/\.ya?ml$/, "") ?? "";
    if (!id) continue;
    try {
      const data = (parse(raw) ?? {}) as Record<string, unknown>;
      out.push({ id, path, data, src: inferSrc(data, "zh") });
    } catch (err) {
      console.warn(`[content] ${path} 解析失败，已跳过`, err);
    }
  }
  return out;
}

/**
 * YAML 优先。只填了原文时，不要用代码里的旧译文顶上 —— 缺的语言保持空字符串，
 * 页面通过 t() 回退显示原文。
 */
export function txOf(value: unknown, fallback: Tx, defaultSrc = "zh"): Tx {
  if (!value || typeof value !== "object") {
    return { src: fallback.src ?? defaultSrc, en: fallback.en, zh: fallback.zh };
  }
  const o = value as Record<string, unknown>;
  const src = inferSrc(o, fallback.src ?? defaultSrc);
  const en = textOf(o, "en");
  const zh = textOf(o, "zh");
  if (!en.trim() && !zh.trim()) {
    return { src: fallback.src ?? src, en: fallback.en, zh: fallback.zh };
  }
  return { src, en, zh };
}

export function txOrEmpty(value: unknown, defaultSrc = "zh"): Tx | undefined {
  if (!value || typeof value !== "object") return undefined;
  const o = value as Record<string, unknown>;
  const en = textOf(o, "en");
  const zh = textOf(o, "zh");
  if (!en.trim() && !zh.trim()) return undefined;
  return { src: inferSrc(o, defaultSrc), en, zh };
}

export function strOf(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function numOf(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function txList(value: unknown, fallback: Tx[], defaultSrc = "zh"): Tx[] {
  if (!Array.isArray(value)) return fallback;
  const list = value
    .map((item) => txOrEmpty(item, defaultSrc))
    .filter((item): item is Tx => Boolean(item));
  return list.length > 0 ? list : fallback;
}

export function strList(value: unknown, fallback: string[] = []): string[] {
  if (!Array.isArray(value)) return fallback;
  const list = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  return list.length > 0 ? list : fallback;
}
