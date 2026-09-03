import type { FaqGroup } from "@/data/faqs";
import { globYaml, strOf, txOf } from "@/content/helpers";

const files = import.meta.glob("../../content/faqs.yaml", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

export function overlayFaqs(fallback: FaqGroup[]): FaqGroup[] {
  const doc = globYaml(files)[0];
  const src = doc?.data;
  const fileSrc = doc?.src ?? "zh";
  const groups = src && Array.isArray(src.groups) ? src.groups : null;
  if (!groups || groups.length === 0) return fallback;

  return groups.map((item, gi) => {
    const rec = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
    const fb = fallback[gi] ?? fallback[0];
    const itemsRaw = Array.isArray(rec.items) ? rec.items : [];
    const items = itemsRaw.map((raw, ii) => {
      const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
      const itemFb = fb.items[ii] ?? fb.items[0];
      return {
        id: strOf(o.id, itemFb.id),
        q: txOf(o.q, itemFb.q, fileSrc),
        a: txOf(o.a, itemFb.a, fileSrc),
      };
    });
    return {
      id: strOf(rec.id, fb.id),
      label: txOf(rec.label, fb.label, fileSrc),
      items: items.length > 0 ? items : fb.items,
    };
  });
}
