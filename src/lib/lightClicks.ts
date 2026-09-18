/** 轻体验 SKU 累计点击（本机 localStorage；用于热门列表排序） */
const CLICKS_KEY = "light-sku-clicks-v1";

export function readSkuClicks(): Record<string, number> {
  try {
    const raw = localStorage.getItem(CLICKS_KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw) as unknown;
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return {};
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const n = Number(v);
      if (typeof k === "string" && k && Number.isFinite(n) && n > 0) out[k] = Math.floor(n);
    }
    return out;
  } catch {
    return {};
  }
}

export function writeSkuClicks(map: Record<string, number>) {
  localStorage.setItem(CLICKS_KEY, JSON.stringify(map));
}

/** 点一次详情 / 热门列表记一次 */
export function bumpSkuClick(skuId: string): Record<string, number> {
  const id = String(skuId ?? "").trim();
  if (!id) return readSkuClicks();
  const cur = readSkuClicks();
  const merged = { ...cur, [id]: (cur[id] ?? 0) + 1 };
  writeSkuClicks(merged);
  return merged;
}

/**
 * 冷启动种子：按编辑 sort 给出初始热度，避免全员 0 分时顺序乱跳。
 * 真实点击会叠在种子之上。
 */
export function seedPopularity(sort: number | undefined): number {
  const s = Number.isFinite(sort) ? Number(sort) : 50;
  return Math.max(1, 120 - Math.min(100, s));
}

export function popularityScore(skuId: string, sort: number | undefined, clicks: Record<string, number>) {
  return seedPopularity(sort) + (clicks[skuId] ?? 0);
}
