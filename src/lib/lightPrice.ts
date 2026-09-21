/** 轻体验 SKU 参考价：十位取整；儿童计入人数（3 岁以下免费仅文案说明）。 */

import { parse } from "yaml";

export type LightSkuPrice =
  | {
      unit: "person";
      /** 按计费人数落档：取第一个 max >= pax 的单价 */
      bands: { max: number; cny: number }[];
      minPax?: number;
    }
  | {
      unit: "raft";
      raftCny: number;
      seats: number;
    }
  | {
      unit: "flat";
      flatCny: number;
    };

export function round10(n: number): number {
  return Math.round(n / 10) * 10;
}

export function billablePax(adults: number, children: number): number {
  return Math.max(0, adults) + Math.max(0, children);
}

export function unitCny(price: LightSkuPrice, pax: number): number | null {
  if (price.unit !== "person") return null;
  if (pax <= 0) return null;
  const bands = [...price.bands].sort((a, b) => a.max - b.max);
  const hit = bands.find((b) => pax <= b.max) ?? bands[bands.length - 1];
  return hit ? round10(hit.cny) : null;
}

/** 单行参考小计（CNY，已十位取整） */
export function lineTotalCny(
  price: LightSkuPrice,
  adults: number,
  children: number,
): number {
  const pax = billablePax(adults, children);
  if (pax <= 0) return 0;

  if (price.unit === "person") {
    const unit = unitCny(price, pax);
    if (unit == null) return 0;
    return round10(unit * pax);
  }
  if (price.unit === "raft") {
    const rafts = Math.ceil(pax / Math.max(1, price.seats));
    return round10(rafts * price.raftCny);
  }
  return round10(price.flatCny);
}

function bands(a: number, b?: number): LightSkuPrice {
  if (b == null) {
    return { unit: "person", bands: [{ max: 99, cny: round10(a) }] };
  }
  return {
    unit: "person",
    bands: [
      { max: 3, cny: round10(a) },
      { max: 10, cny: round10(b) },
      { max: 99, cny: round10(b) },
    ],
  };
}

function raft(cny: number, seats = 2): LightSkuPrice {
  return { unit: "raft", raftCny: round10(cny), seats };
}

/**
 * 全部小产品参考价（按文案已有报价落档；无明示的按同类区间补齐，十位取整）。
 * key = route / meal id
 */
export const LIGHT_SKU_PRICE: Record<string, LightSkuPrice> = {
  // hike
  "wulong-hike": bands(180, 150),
  creek: bands(350, 300),
  scooter: bands(280, 250),
  atv: bands(200),
  raft: raft(300, 2),
  bike: bands(150, 120),
  climb: bands(350, 300),
  paddle: bands(200),
  "xingping-peaks": bands(180, 150),
  // village
  "yao-visit": bands(250, 200),
  "oil-tea": bands(200, 150),
  "embroidered-ball": bands(200),
  "dong-song": bands(280, 250),
  "stilt-tea": bands(320, 280),
  "home-visit": bands(250, 200),
  hermit: bands(280, 250),
  cormorant: bands(180),
  festivals: { unit: "person", bands: [{ max: 99, cny: 500 }], minPax: 2 },
  sanyuesan: bands(500),
  // meals
  nianzhu: bands(280, 250),
  yanhua: bands(380, 320),
  // foodfilm
  "cooking-school": bands(380, 280),
  chicken: bands(280, 250),
  "lijiang-table": bands(250, 220),
  "zhuang-feast": bands(250, 220),
  riverside: bands(450, 380),
  // craft
  "fuli-fan": bands(250, 200),
  "heritage-crafts": bands(200),
  calligraphy: bands(200),
  // wellness
  taichi: bands(300, 200),
  "nature-still": bands(200, 180),
  massage: bands(280),
};

/** 报价后的补足信息（时长、2 人一车、不含交通等）——不写进单价数字里 */
export const LIGHT_SKU_PRICE_NOTE: Record<string, { en: string; zh: string }> = {
  atv: {
    en: " (two per vehicle) · about 50 minutes driving.",
    zh: "（2 人一车）· 驾驶约 50 分钟。",
  },
  climb: {
    en: " · about 2 hours.",
    zh: " · 约 2 小时。",
  },
  paddle: {
    en: " · about 3 hours.",
    zh: " · 约 3 小时。",
  },
  cormorant: {
    en: " · about 1 hour.",
    zh: " · 约 1 小时。",
  },
  festivals: {
    en: " · transport not included · seasonal.",
    zh: " · 不包含交通费 · 按节期安排。",
  },
};

type SkuYamlDoc = {
  items?: Array<{
    id?: string;
    status?: string;
    price?: LightSkuPrice;
    priceNote?: { en?: string; zh?: string };
  }>;
};

const skuFiles = import.meta.glob("../../content/light-skus.yaml", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

function yamlOverlay(): {
  prices: Record<string, LightSkuPrice>;
  notes: Record<string, { en: string; zh: string }>;
} {
  const prices: Record<string, LightSkuPrice> = {};
  const notes: Record<string, { en: string; zh: string }> = {};
  try {
    const raw = Object.values(skuFiles)[0] ?? "";
    if (!raw) return { prices, notes };
    const doc = (parse(raw) ?? {}) as SkuYamlDoc;
    for (const it of doc.items ?? []) {
      if (!it?.id) continue;
      if (it.price) prices[it.id] = it.price;
      if (it.priceNote?.en || it.priceNote?.zh) {
        notes[it.id] = {
          en: it.priceNote.en ?? "",
          zh: it.priceNote.zh ?? "",
        };
      }
    }
  } catch (err) {
    console.warn("[content] content/light-skus.yaml 价格解析失败，已用代码默认价", err);
  }
  return { prices, notes };
}

const YAML = yamlOverlay();

export function priceOf(skuId: string): LightSkuPrice | undefined {
  return YAML.prices[skuId] ?? LIGHT_SKU_PRICE[skuId];
}

export function priceNoteOf(skuId: string, locale: "en" | "zh"): string {
  const n = YAML.notes[skuId] ?? LIGHT_SKU_PRICE_NOTE[skuId];
  return n ? n[locale] : "";
}

export type SkuPriceParts = {
  lead: string;
  core: string;
  note: string;
};

/** 详情卡：引导语 + 突出单价 + 补足信息（避免与正文报价句重复） */
export function formatSkuPriceParts(
  price: LightSkuPrice,
  locale: "en" | "zh",
  fmt: (n: number) => string,
  note = "",
): SkuPriceParts {
  const lead = locale === "zh" ? "参考报价：" : "Reference: ";
  let core = "";

  if (price.unit === "raft") {
    const money = fmt(round10(price.raftCny));
    core =
      locale === "zh"
        ? `${money}/筏（${price.seats} 人）`
        : `${money} / raft (${price.seats} seats)`;
  } else if (price.unit === "flat") {
    core = fmt(round10(price.flatCny));
  } else {
    const sorted = [...price.bands].sort((a, b) => a.max - b.max);
    const parts: string[] = [];
    let i = 0;
    while (i < sorted.length) {
      const startMax = i === 0 ? 1 : sorted[i - 1]!.max + 1;
      const cny = round10(sorted[i]!.cny);
      let end = sorted[i]!.max;
      while (i + 1 < sorted.length && round10(sorted[i + 1]!.cny) === cny) {
        i += 1;
        end = sorted[i]!.max;
      }
      const money = fmt(cny);
      if (end >= 99 && startMax === 1) {
        parts.push(locale === "zh" ? `${money}/人` : `${money} / person`);
      } else if (end >= 99) {
        parts.push(
          locale === "zh"
            ? `${startMax} 人起 ${money}/人`
            : `${startMax}+ · ${money} / person`,
        );
      } else {
        parts.push(
          locale === "zh"
            ? `${startMax}–${end} 人 ${money}/人`
            : `${startMax}–${end} · ${money} / person`,
        );
      }
      i += 1;
    }
    const min =
      price.minPax && price.minPax > 1
        ? locale === "zh"
          ? `（${price.minPax} 人起订）`
          : ` (min ${price.minPax})`
        : "";
    core = `${parts.join(" · ")}${min}`;
  }

  return { lead, core, note };
}

/** @deprecated 用 formatSkuPriceParts */
export function formatSkuPriceLabel(
  price: LightSkuPrice,
  locale: "en" | "zh",
  fmt: (n: number) => string,
  note = "",
): string {
  const p = formatSkuPriceParts(price, locale, fmt, note);
  return `${p.lead}${p.core}${p.note}`;
}

/** 从正文去掉「参考报价 / Reference」句段，保留其余描述 */
export function stripPriceFromBlurb(text: string): string | null {
  let cleaned = text
    .replace(/参考报价[：:][^。；\n]*/g, "")
    .replace(/Reference(?:\s+price)?\s*[:：][^.；;\n]*/gi, "")
    .replace(/[ \t]*[·•]\s*$/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^[。．.\s]+/, "")
    .replace(/[.\s]+$/g, "")
    .trim();
  if (!cleaned) return null;
  if (/^[·•、,，\s]+$/.test(cleaned)) return null;
  // 中文句末若被剥掉句号，补回
  if (/[\u4e00-\u9fff]$/.test(cleaned)) cleaned += "。";
  return cleaned;
}
