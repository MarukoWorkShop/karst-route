import { parse } from "yaml";
import type { LightId, Tx } from "@/types";
import { asset } from "@/lib/asset";
import { strList, strOf, txOrEmpty } from "@/content/helpers";

const MAX_BODY = 999;
const MAX_PHOTOS = 5;

const files = import.meta.glob("../../content/light-feedback.yaml", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const CATS = new Set<LightId>(["hike", "photo", "village", "foodfilm", "craft", "wellness"]);

/** photo：照片 + 一句话；note：客人留言（可附照片）。 */
export type LightFeedbackKind = "photo" | "note";

export type LightReview = {
  id: string;
  category: LightId;
  kind: LightFeedbackKind;
  flag: string;
  name: string;
  country: string;
  rating: number;
  date: string;
  body: Tx;
  photos: string[];
};

function clip(text: string) {
  const chars = Array.from(text);
  if (chars.length <= MAX_BODY) return text;
  return chars.slice(0, MAX_BODY).join("");
}

function load(): LightReview[] {
  try {
    const raw = Object.values(files)[0] ?? "";
    if (!raw) return [];
    const doc = (parse(raw) ?? {}) as { src?: string; items?: unknown };
    const src = doc.src === "en" ? "en" : "zh";
    if (!Array.isArray(doc.items)) return [];
    const out: LightReview[] = [];
    for (const rawItem of doc.items) {
      if (!rawItem || typeof rawItem !== "object") continue;
      const it = rawItem as Record<string, unknown>;
      const id = strOf(it.id);
      const category = strOf(it.category) as LightId;
      const body = txOrEmpty(it.body, src);
      if (!id || !CATS.has(category) || !body) continue;
      const kind: LightFeedbackKind = strOf(it.kind) === "photo" ? "photo" : "note";
      out.push({
        id,
        category,
        kind,
        flag: strOf(it.flag, "✦"),
        name: strOf(it.name, id),
        country: strOf(it.country),
        rating: Math.min(5, Math.max(1, Number(it.rating) || 5)),
        date: strOf(it.date),
        body: { ...body, zh: clip(body.zh), en: clip(body.en) },
        photos: strList(it.photos, [])
          .slice(0, MAX_PHOTOS)
          .map((p) => {
            const wide = p.endsWith("#wide");
            const clean = (wide ? p.slice(0, -"#wide".length) : p).replace(/^\//, "");
            const url = asset(`/${clean}`);
            return wide ? `${url}#wide` : url;
          }),
      });
    }
    return out;
  } catch (err) {
    console.warn("[content] content/light-feedback.yaml 解析失败", err);
    return [];
  }
}

const ALL = load();

export function lightReviewsFor(category: LightId): LightReview[] {
  return ALL.filter((r) => r.category === category);
}
