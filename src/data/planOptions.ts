import type { Tx } from "@/types";

const L = (en: string, zh: string): Tx => ({ en, zh });

export const GROUP_TYPES = [
  { id: "family", label: L("Family", "家庭出游") },
  { id: "couple", label: L("Couple / Honeymoon", "情侣蜜月") },
  { id: "friends", label: L("Friends", "好友同行") },
  { id: "corporate", label: L("Corporate / Colleagues", "同事/商务") },
  { id: "parent-child", label: L("Parent & Child", "亲子研学") },
  { id: "senior", label: L("Senior Travellers", "银发出游") },
  { id: "students", label: L("Student Group", "学生团队") },
  { id: "photo", label: L("Photography Enthusiasts", "摄影爱好者") },
] as const;

export const ADD_ONS = [
  { id: "pickup", label: L("Airport Pickup", "接站服务") },
  { id: "dropoff", label: L("Airport Drop-off", "送站服务") },
  { id: "food", label: L("Local Food Experiences", "当地美食安排") },
  { id: "shopping", label: L("Shopping Itinerary", "购物行程") },
  { id: "photographer", label: L("Professional Photographer", "专业摄影师") },
  { id: "upgrade", label: L("Room Upgrade", "住宿升级") },
  { id: "kids", label: L("Kids Activities", "儿童活动") },
  { id: "meals", label: L("Veg / Halal Meals", "素食/清真餐") },
  { id: "sunrise", label: L("Sunrise Special", "日出特别安排") },
  { id: "access", label: L("Accessibility Needs", "无障碍设施") },
  { id: "teambuild", label: L("Team Building", "团建活动") },
  { id: "spa", label: L("Spa & Wellness", "SPA/养生体验") },
  { id: "business", label: L("Business Inspection", "商务考察") },
  { id: "study", label: L("Study Tour", "游学安排") },
] as const;

export const EXTRA_DESTS = [
  { id: "longji", label: L("Longji Terraces (Guangxi)", "龙脊梯田（广西）") },
  { id: "friendship-gate", label: L("Friendship Gate historic site", "友谊关历史景区") },
  { id: "halong", label: L("Ha Long Bay day trip (Vietnam)", "下龙湾一日（越南）") },
  { id: "ninhbinh", label: L("Ninh Binh (Vietnam)", "宁平（越南）") },
  { id: "hekou", label: L("Hekou–Lao Cai border town", "河口老街（云南入境）") },
  { id: "shilin", label: L("Stone Forest (Yunnan)", "石林（云南）") },
  { id: "xishuangbanna", label: L("Xishuangbanna (extension)", "西双版纳（延伸）") },
  { id: "dali", label: L("Dali Old Town (extension)", "大理古城（延伸）") },
] as const;

export const HOTEL_TIERS = [
  {
    id: "standard" as const,
    label: L("Comfort Select", "精选舒适"),
    sub: L("Clean, well-located, great value", "干净、位置好，性价比高"),
  },
  {
    id: "boutique" as const,
    label: L("Boutique Stay", "精品民宿"),
    sub: L("Character-driven, locally owned", "有故事的小住所，本地风情"),
  },
  {
    id: "luxury" as const,
    label: L("Luxury", "高端度假"),
    sub: L("Top-tier hotels or premium lodges", "顶级酒店或高端山地营地"),
  },
];

export const TRANSPORT_PREFS = [
  { id: "coach", label: L("Coach bus preferred", "偏好大巴出行") },
  { id: "hsr", label: L("Try high-speed rail", "想尝试高铁") },
  { id: "private", label: L("Private car only", "纯包车出行") },
  { id: "cycle", label: L("Cycling segments", "安排骑行体验") },
  { id: "water", label: L("Waterway sections", "水路游览优先") },
  { id: "short-drives", label: L("Fewer long daytime drives", "减少日间长途") },
  { id: "sleeper", label: L("Metre-gauge sleeper", "米轨卧铺体验") },
  { id: "flights", label: L("Include flight legs", "飞段衔接") },
] as const;

export const SPECIAL_EXPS = [
  { id: "craft", label: L("Craft workshops", "手工艺体验") },
  { id: "village", label: L("Village deep-dives", "深度探访村落") },
  { id: "shop", label: L("Free shopping time", "自由购物时间") },
  { id: "cook", label: L("Cooking class", "烹饪课体验") },
  { id: "photo-day", label: L("Photography focus day", "摄影主题日") },
  { id: "farm", label: L("Farm life experience", "农耕生活体验") },
  { id: "music", label: L("Folk music performance", "民族音乐表演") },
  { id: "hike", label: L("Nature hiking", "自然徒步") },
  { id: "pottery", label: L("Pottery workshop", "陶瓷工艺") },
  { id: "folk", label: L("Folk performance", "民俗表演观赏") },
  { id: "slow", label: L("Slow travel, no rush", "慢游不赶路") },
  { id: "homemeal", label: L("Meal with local family", "与当地家庭共餐") },
] as const;

export type HotelTierId = (typeof HOTEL_TIERS)[number]["id"];
export type DateMode = "picker" | "text" | "undecided";
