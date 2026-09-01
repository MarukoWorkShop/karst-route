import type { BriefDay } from "@/lib/briefPdf";

export type BookCraftRequest = {
  locale: "en" | "zh";
  routeId: "r1" | "r2";
  routeTitle: string;
  dates: string;
  travelers: number;
  groupTypes: string[];
  addOns: string[];
  notes: string;
  catalog: BriefDay[];
  tweak?: string;
  previous?: BriefDay[];
};

export type BookDraft = {
  note: string;
  days: BriefDay[];
  source: "ai" | "fallback";
};

function asStr(v: unknown, max = 400) {
  return typeof v === "string" ? v.slice(0, max).trim() : "";
}

function asStrList(v: unknown, maxItems = 8, maxLen = 240): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => asStr(x, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);
}

export function catalogFallback(catalog: BriefDay[], locale: "en" | "zh"): BookDraft {
  return {
    source: "fallback",
    note:
      locale === "zh"
        ? "未能连上规划模型，先给出原精品线路。你仍可写下微调意见再试。"
        : "The planner model was unreachable, so this is the original boutique route. You can still tweak and retry.",
    days: catalog.map((d) => ({ ...d, bullets: [...d.bullets], dining: d.dining ? [...d.dining] : [] })),
  };
}

export function compactCatalog(days: BriefDay[]) {
  return days.map((d) => ({
    num: d.num,
    city: d.city,
    stay: d.stay,
    date: d.date || "",
    bullets: d.bullets.slice(0, 4),
    lodging: d.lodging || "",
  }));
}

export function parseBookDraft(raw: unknown, catalog: BriefDay[], locale: "en" | "zh"): BookDraft {
  if (!raw || typeof raw !== "object") return catalogFallback(catalog, locale);
  const o = raw as Record<string, unknown>;
  const daysRaw = Array.isArray(o.days) ? o.days : [];
  const patches: (Partial<BriefDay> | null)[] = daysRaw.map((item) => {
    if (!item || typeof item !== "object") return null;
    const d = item as Record<string, unknown>;
    const bullets = asStrList(d.bullets, 5, 160);
    const dining = asStrList(d.dining, 3, 120);
    return {
      stay: asStr(d.stay, 80),
      bullets,
      transport: asStr(d.transport, 140),
      lodging: asStr(d.lodging, 140),
      dining,
      drive: asStr(d.drive, 100),
      blurb: asStr(d.blurb, 220),
    };
  });

  const used = patches.filter((p) => {
    if (!p) return false;
    return Boolean(
      p.stay ||
        p.transport ||
        p.lodging ||
        p.drive ||
        p.blurb ||
        (p.bullets && p.bullets.length) ||
        (p.dining && p.dining.length),
    );
  }).length;
  if (!used) return catalogFallback(catalog, locale);

  const days = catalog.map((base, i) => {
    const p = patches[i];
    return {
      num: base.num,
      city: base.city,
      stay: p?.stay || base.stay,
      date: base.date,
      bullets: p?.bullets?.length ? p.bullets : [...base.bullets],
      transport: p?.transport || base.transport || "",
      lodging: p?.lodging || base.lodging || "",
      dining: p?.dining?.length ? p.dining : [...(base.dining ?? [])],
      drive: p?.drive || base.drive || "",
      blurb: p?.blurb || base.blurb || "",
    };
  });

  return {
    source: "ai",
    note: asStr(o.note, 400),
    days,
  };
}
