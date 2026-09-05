import { parse } from "yaml";
import type { RouteId } from "@/types";

/**
 * 模块化定价 —— 与仓库根目录 pricing-modules-template-v1.xlsx 的结构一一对应。
 *
 * 数据源：content/pricing.yaml（主理人在 Notion 或 GitHub 维护，时间戳新的那一边生效）。
 * 解析失败 / 字段缺失时逐字段回退到本文件里的代码默认值，页面不会白屏。
 *
 * 推导公式（Excel 使用指南中有完整说明）：
 *   n          = 成人数 + 儿童数（儿童占车位，参与车辆 / 领队分摊）
 *   成人人均(n) = [ 成人按人小计 + (车辆档费(n) + 团队固定 T) ÷ n ] × (1 + margin) → 取整
 *   儿童人均(n) = [ 儿童按人小计 + (车辆档费(n) + 团队固定 T) ÷ n ] × (1 + margin) → 取整
 *
 * status 含义：
 *   - none      : 主理人尚未给出成本结构 → 前端不显示估算，退回“按团队询价”
 *   - demo      : 成本已按现有发布价（2/4/6 人）校准、可精确复现；上线前需用真实成本复核
 *   - confirmed : 主理人已确认真实成本，可直接对外
 */

export type RoutePricingStatus = "none" | "demo" | "confirmed";

export type VehicleBand = { maxPax: number; price: number };

/** 成本模块：adult / child 是该模块折算后的**人均金额**，不是单价 */
export type CostModule = {
  id: string;
  name?: { zh: string; en: string };
  basis?: "per_person" | "per_room_night" | "per_group_per_head";
  adult: number;
  child: number;
};

export type PriceAnchor = { n: number; adult: number; child: number };

export type RoutePricing = {
  route: RouteId;
  status: RoutePricingStatus;
  source?: string;
  modules: CostModule[];
  /** ① 按人成本小计（由 modules 汇总） */
  moduleCost: { adultPerPerson: number; childPerPerson: number };
  /** ② 车辆档位整车包价（maxPax 为包含上限，按升序排列） */
  vehicleBands: VehicleBand[];
  /** ② 团队固定成本 T = 领队 + 运营税费 + 储备（一整团只发生一次） */
  teamFixed: number;
  teamFixedParts: { leader: number; ops: number; reserve: number };
  /** ③ 加成率（成本 → 对外报价），0.2 = +20% */
  margin: number;
  /** ③ 报价取整基数（¥） */
  roundBase: number;
  /** 校准锚点：{人数, 发布成人价, 发布儿童价} —— 供开发期回归校验模型是否精确复现发布价 */
  anchors: PriceAnchor[];
};

/** 代码默认值：线路暂无定价结构（主理人填表后由 YAML 覆盖） */
const UNSET: Omit<RoutePricing, "route"> = {
  status: "none",
  source: "",
  modules: [],
  moduleCost: { adultPerPerson: 0, childPerPerson: 0 },
  vehicleBands: [],
  teamFixed: 0,
  teamFixedParts: { leader: 0, ops: 0, reserve: 0 },
  margin: 0,
  roundBase: 10,
  anchors: [],
};

/** 代码默认（YAML 缺失时的兜底）：线路三演示值，已能复现 2/4/6 人发布价 */
const R3_FALLBACK: Omit<RoutePricing, "route"> = {
  status: "demo",
  source: "2026-09 主理人 2/4/6 人发布价校准；成本为演示值，上线前需真实成本复核",
  modules: [
    { id: "stay", name: { zh: "住宿（6 晚，双人一间均摊）", en: "Stay (6 nights, twin share)" }, basis: "per_room_night", adult: 3000, child: 0 },
    { id: "tickets", name: { zh: "门票与体验", en: "Tickets & experiences" }, basis: "per_person", adult: 3600, child: 1800 },
    { id: "dining", name: { zh: "餐食", en: "Dining" }, basis: "per_person", adult: 2400, child: 1100 },
    { id: "localTransport", name: { zh: "境内交通（接驳 / 船票 / 岛内用车）", en: "Local transport" }, basis: "per_person", adult: 2200, child: 800 },
    { id: "crossBorder", name: { zh: "跨境交通", en: "Cross-border transport" }, basis: "per_person", adult: 1300, child: 300 },
    { id: "insurance", name: { zh: "保险", en: "Insurance" }, basis: "per_person", adult: 150, child: 150 },
    { id: "welcome", name: { zh: "伴手礼与服务包", en: "Welcome kit & service pack" }, basis: "per_person", adult: 350, child: 100 },
  ],
  moduleCost: { adultPerPerson: 13000, childPerPerson: 4250 },
  vehicleBands: [
    { maxPax: 3, price: 5000 },
    { maxPax: 5, price: 9967 },
    { maxPax: 9, price: 13600 },
    { maxPax: 14, price: 18000 },
  ],
  teamFixed: 3300,
  teamFixedParts: { leader: 1800, ops: 800, reserve: 700 },
  margin: 0.2,
  roundBase: 10,
  anchors: [
    { n: 2, adult: 20580, child: 10080 },
    { n: 4, adult: 19580, child: 9080 },
    { n: 6, adult: 18980, child: 8480 },
  ],
};

const FALLBACKS: Record<RouteId, Omit<RoutePricing, "route">> = {
  r1: UNSET,
  r2: UNSET,
  r3: R3_FALLBACK,
};

// --- 读取 content/pricing.yaml（与 content/routes/*.yaml 同一套机制）---
const files = import.meta.glob("../../content/pricing.yaml", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

let yamlRoutes: Record<string, Record<string, unknown>> = {};

try {
  const raw = Object.values(files)[0] ?? "";
  const doc = (parse(raw) ?? {}) as { routes?: Record<string, Record<string, unknown>> };
  yamlRoutes = doc.routes && typeof doc.routes === "object" ? doc.routes : {};
} catch (err) {
  console.warn("[content] content/pricing.yaml 解析失败，已回退到代码默认值", err);
}

function isObj(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function num(v: unknown, fallback: number): number {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

function statusOf(v: unknown, fallback: RoutePricingStatus): RoutePricingStatus {
  return v === "none" || v === "demo" || v === "confirmed" ? v : fallback;
}

function modulesOf(v: unknown, fallback: CostModule[]): CostModule[] {
  if (!Array.isArray(v)) return fallback;
  const out: CostModule[] = [];
  for (const raw of v) {
    if (!isObj(raw) || typeof raw.id !== "string") continue;
    out.push({
      id: raw.id,
      ...(isObj(raw.name)
        ? {
            name: {
              zh: typeof raw.name.zh === "string" ? raw.name.zh : "",
              en: typeof raw.name.en === "string" ? raw.name.en : "",
            },
          }
        : {}),
      basis:
        raw.basis === "per_room_night" || raw.basis === "per_group_per_head" || raw.basis === "per_person"
          ? raw.basis
          : "per_person",
      adult: num(raw.adult, 0),
      child: num(raw.child, 0),
    });
  }
  return out;
}

function bandsOf(v: unknown, fallback: VehicleBand[]): VehicleBand[] {
  if (!Array.isArray(v)) return fallback;
  const out: VehicleBand[] = [];
  for (const raw of v) {
    if (!isObj(raw)) continue;
    const maxPax = num(raw.maxPax, 0);
    const price = num(raw.price, 0);
    if (maxPax > 0 && price >= 0) out.push({ maxPax, price });
  }
  return out.length ? out.sort((a, b) => a.maxPax - b.maxPax) : fallback;
}

function anchorsOf(v: unknown, fallback: PriceAnchor[]): PriceAnchor[] {
  if (!Array.isArray(v)) return fallback;
  const out: PriceAnchor[] = [];
  for (const raw of v) {
    if (!isObj(raw)) continue;
    const n = num(raw.n, 0);
    if (n <= 0) continue;
    out.push({ n, adult: num(raw.adult, 0), child: num(raw.child, 0) });
  }
  return out;
}

function build(id: RouteId): RoutePricing {
  const fb = FALLBACKS[id];
  const y = yamlRoutes[id];
  if (!isObj(y)) return { route: id, ...fb };

  const modules = modulesOf(y.modules, fb.modules);
  const adultPerPerson = modules.reduce((s, m) => s + m.adult, 0);
  const childPerPerson = modules.reduce((s, m) => s + m.child, 0);
  const parts = isObj(y.teamFixed)
    ? {
        leader: num(y.teamFixed.leader, fb.teamFixedParts.leader),
        ops: num(y.teamFixed.ops, fb.teamFixedParts.ops),
        reserve: num(y.teamFixed.reserve, fb.teamFixedParts.reserve),
      }
    : fb.teamFixedParts;
  const teamFixed = parts.leader + parts.ops + parts.reserve;

  return {
    route: id,
    status: statusOf(y.status, fb.status),
    source: typeof y.source === "string" ? y.source : fb.source,
    modules,
    moduleCost: { adultPerPerson, childPerPerson },
    vehicleBands: bandsOf(y.vehicleBands, fb.vehicleBands),
    teamFixed,
    teamFixedParts: parts,
    margin: num(y.margin, fb.margin),
    roundBase: num(y.roundBase, fb.roundBase) || 10,
    anchors: anchorsOf(y.anchors, fb.anchors),
  };
}

export const routePricing: Record<RouteId, RoutePricing> = {
  r1: build("r1"),
  r2: build("r2"),
  r3: build("r3"),
};

/** 该线路是否已具备可对外/演示的定价结构 */
export function pricingAvailable(id: RouteId): boolean {
  return routePricing[id].status !== "none";
}
