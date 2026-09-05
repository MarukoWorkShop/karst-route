import type { RouteId } from "@/types";
import { pricingAvailable, routePricing, type VehicleBand } from "@/data/routePricing";

/**
 * 模块化报价的纯函数核心（与 Excel 公式保持一致，无 React 依赖）。
 * 输入任意 成人/儿童 组合 → 输出该组合的人均与总价；不支持的组合返回 null。
 */

export type EstimateResult = {
  route: RouteId;
  adults: number;
  children: number;
  /** 总人数 n = 成人 + 儿童（儿童占车位，参与分摊） */
  n: number;
  /** 当前人数档自动取用的整车包价 */
  vehiclePrice: number;
  /** 成人人均报价（按当前总人数 n） */
  adultPerPerson: number;
  /** 儿童人均报价（按当前总人数 n） */
  childPerPerson: number;
  /** 估算小计 = 成人数 × 成人人均 + 儿童数 × 儿童人均 */
  subtotal: number;
};

/** 按总人数 n 取车辆档位包价；超过最大档位返回 null */
export function bandPriceOf(bands: VehicleBand[], n: number): number | null {
  for (const band of bands) {
    if (n <= band.maxPax) return band.price;
  }
  return null;
}

/** 与 Excel MROUND(x, base) 对齐（正数场景，四舍五入到 base 的倍数） */
export function mround(x: number, base: number): number {
  if (!(base > 0)) return Math.round(x);
  return Math.round(x / base) * base;
}

/** 估算任意组合；数据未就绪或人数超出档位范围时返回 null */
export function estimateParty(
  route: RouteId,
  adults: number,
  children: number,
): EstimateResult | null {
  const pricing = routePricing[route];
  if (!pricing || !pricingAvailable(route)) return null;

  const n = adults + children;
  if (n <= 0) return null;
  const vehiclePrice = bandPriceOf(pricing.vehicleBands, n);
  if (vehiclePrice === null) return null;

  const m = 1 + pricing.margin;
  const share = (vehiclePrice + pricing.teamFixed) / n;
  const adultPerPerson = mround(
    (pricing.moduleCost.adultPerPerson + share) * m,
    pricing.roundBase,
  );
  const childPerPerson = mround(
    (pricing.moduleCost.childPerPerson + share) * m,
    pricing.roundBase,
  );
  const subtotal = adults * adultPerPerson + children * childPerPerson;

  return { route, adults, children, n, vehiclePrice, adultPerPerson, childPerPerson, subtotal };
}

/** 人民币金额格式化 */
export function fmtCny(v: number): string {
  return `¥${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

/**
 * 一行文本摘要，用于摘要 / PDF / 邮件，例如：
 *  zh: 【参考】成人 ¥19,580×2 ＋ 儿童 ¥9,080×1 ≈ ¥48,240
 *  en: [Reference] Adults ¥19,580×2 + Child ¥9,080×1 ≈ ¥48,240
 */
export function estSummaryLine(
  est: EstimateResult,
  t: (s: { en: string; zh: string }) => string,
  locale: "en" | "zh",
): string {
  const tag = locale === "zh" ? "【参考】" : "[Reference] ";
  const and = locale === "zh" ? "＋" : " + ";
  const eq = locale === "zh" ? "≈" : "≈";
  const a = `${t({ en: "Adults", zh: "成人" })} ${fmtCny(est.adultPerPerson)}×${est.adults}`;
  const c = `${t({ en: "Child", zh: "儿童" })} ${fmtCny(est.childPerPerson)}×${est.children}`;
  return `${tag}${a}${and}${c} ${eq} ${fmtCny(est.subtotal)}`;
}
