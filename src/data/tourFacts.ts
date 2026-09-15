import type { RouteId, Tx } from "@/types";

const L = (en: string, zh: string): Tx => ({ en, zh });

/**
 * 费用项标签 id。
 * 后台表格（或 CMS）只勾选这些 id、返回 id 数组，前端即按 INCL_LABELS / EXCL_LABELS
 * 自动渲染对应多语言文案 —— 无需改动组件。
 */
export type InclId =
  | "transport"
  | "lodging"
  | "tickets"
  | "meals"
  | "guide"
  | "visaAssist"
  | "insurance";

export type ExclId = "intlFlights" | "visaFee" | "personal" | "optional" | "tips";

export const INCL_LABELS: Record<InclId, Tx> = {
  transport: L("Private transport throughout", "全程专车交通"),
  lodging: L("Hand-picked stays", "精选住宿"),
  tickets: L("Entrance tickets as listed", "行程所列景点门票"),
  meals: L("Meals as listed", "行程所列餐食"),
  guide: L("Licensed local guide", "持证当地向导"),
  visaAssist: L("Visa paperwork assistance", "签证材料协助"),
  insurance: L("Travel accident insurance", "旅游人身意外险"),
};

export const EXCL_LABELS: Record<ExclId, Tx> = {
  intlFlights: L("International flights", "国际机票"),
  visaFee: L("Visa fees", "签证费"),
  personal: L("Personal expenses", "个人消费"),
  optional: L("Optional activities", "自选项目"),
  tips: L("Tips & gratuities", "小费"),
};

export type RouteFacts = {
  /** 无市场档时的参考预算（人民币） */
  priceCny: { from: number; to?: number };
  /** 后台勾选出来的包含项 id */
  included: InclId[];
  /** 后台勾选出来的不含项 id */
  excluded: ExclId[];
};

const ALL_INCLUDED: InclId[] = [
  "transport",
  "lodging",
  "tickets",
  "meals",
  "guide",
  "visaAssist",
];
const ALL_EXCLUDED: ExclId[] = [
  "intlFlights",
  "visaFee",
  "personal",
  "optional",
  "tips",
];

export const routeFacts: Record<RouteId, RouteFacts> = {
  r1: {
    priceCny: { from: 12800, to: 18600 },
    included: ALL_INCLUDED,
    excluded: ALL_EXCLUDED,
  },
  r2: {
    priceCny: { from: 9400, to: 13800 },
    included: ALL_INCLUDED,
    excluded: ALL_EXCLUDED,
  },
  r3: {
    priceCny: { from: 8480, to: 22000 },
    // 按报价单：含住宿、餐食、门票活动、当地用车及司机服务费、旅游意外险；
    // 不含往返机票、行程外费用、其他个人费用。此行程不跨境，故无签证材料协助。
    included: ["transport", "lodging", "tickets", "meals", "insurance"],
    excluded: ["intlFlights", "optional", "personal"],
  },
};
