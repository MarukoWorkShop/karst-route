/**
 * Parse Chinese budget strings like "¥12,800–18,600 / 人" into CNY numbers.
 */
export type PriceCny = { from: number; to?: number };

export function parsePriceCny(text: string | undefined | null): PriceCny | null {
  if (!text || typeof text !== "string") return null;
  const nums = [...text.replace(/,/g, "").matchAll(/(\d{3,})/g)].map((m) => Number(m[1]));
  if (!nums.length) return null;
  if (nums.length === 1) return { from: nums[0] };
  const from = Math.min(nums[0], nums[1]);
  const to = Math.max(nums[0], nums[1]);
  return from === to ? { from } : { from, to };
}

export function priceCnyOf(value: unknown, fallback: PriceCny): PriceCny {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const o = value as Record<string, unknown>;
    const from = Number(o.from);
    const to = o.to == null || o.to === "" ? undefined : Number(o.to);
    if (Number.isFinite(from) && from > 0) {
      if (to != null && Number.isFinite(to) && to > 0) {
        return from === to ? { from } : { from: Math.min(from, to), to: Math.max(from, to) };
      }
      return { from };
    }
  }
  if (typeof value === "string") {
    return parsePriceCny(value) ?? fallback;
  }
  return fallback;
}
