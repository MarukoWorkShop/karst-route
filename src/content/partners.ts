import type { Partner, PartnerLink } from "@/data/partners";
import { globYaml, strOf, txOf } from "@/content/helpers";

const files = import.meta.glob("../../content/partners.yaml", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

export function overlayPartners(fallback: Partner[]): Partner[] {
  const doc = globYaml(files)[0];
  const src = doc?.data;
  const fileSrc = doc?.src ?? "zh";
  const list = src && Array.isArray(src.list) ? src.list : null;
  if (!list || list.length === 0) return fallback;

  return list.map((item, i) => {
    const rec = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
    const fb = fallback[i] ?? fallback[0];
    const linksRaw = Array.isArray(rec.links) ? rec.links : [];
    const links: PartnerLink[] =
      linksRaw.length > 0
        ? linksRaw.map((raw, li) => {
            const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
            const lfb = fb.links[li] ?? fb.links[0];
            const type = o.type === "web" || o.type === "google" ? o.type : lfb.type;
            return {
              label: txOf(o.label, lfb.label, fileSrc),
              url: strOf(o.url, lfb.url),
              type,
            };
          })
        : fb.links;
    return {
      name: txOf(rec.name, fb.name, fileSrc),
      category: txOf(rec.category, fb.category, fileSrc),
      location: txOf(rec.location, fb.location, fileSrc),
      desc: txOf(rec.desc, fb.desc, fileSrc),
      emoji: strOf(rec.emoji, fb.emoji),
      color: strOf(rec.color, fb.color),
      links,
    };
  });
}
