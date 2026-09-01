import type { Tx } from "@/types";

const L = (en: string, zh: string): Tx => ({ en, zh });

export const faqs: { id: string; q: Tx; a: Tx }[] = [
  {
    id: "tool-visa",
    q: L(
      "Do I need to arrange a visa for Vietnam in advance?",
      "去越南需要提前办理签证吗？",
    ),
    a: L(
      "Most passport holders can apply for a Vietnamese 45-day e-visa online — it covers all entry points including Mong Cai and Lao Cai, and typically processes within 3 business days. Chinese passport holders enjoy visa-free entry for up to 30–45 days. We verify current requirements for every traveller before departure.",
      "大多数护照持有人可申请越南 45 天电子签证（e-visa），可在线自助办理，覆盖芒街、老街口岸等全部入境点，一般 3 个工作日内下签。中国护照持有人免签入境越南，停留期为 30 天（部分护照可至 45 天）。我们会在出发前为每位成员核实最新签证政策。",
    ),
  },
  {
    id: "tool-china-visa",
    q: L("Is a Chinese visa required on these routes?", "路线中需要办理中国签证吗？"),
    a: L(
      "Route 1 includes re-entering China via Yunnan, which requires a valid Chinese tourist visa (L-type) for most non-Chinese passports. We recommend applying 4–8 weeks ahead at your nearest Chinese consulate — we'll provide a full document checklist and support.",
      "路线一包含从越南重新入境中国（云南）的环节，非中国护照持有人需持有有效的中国签证（旅游签 L 类）。建议出发前 4–8 周在所在地中国领事馆办理，我们会提供详细的材料清单与协助。",
    ),
  },
  {
    id: "tool-season",
    q: L("What is the best time of year to travel?", "什么季节最适合出行？"),
    a: L(
      "November to March (cool-dry season) is ideal: pleasant temperatures, minimal rain, and perfect conditions for trekking and border crossings. April and October offer lush scenery with fewer crowds. May to September is rainy season — Detian Falls peaks dramatically, though some mountain roads may be affected.",
      "最佳出行窗口为 11 月至次年 3 月（凉季）：气温宜人，降水少，是徒步梯田、过境通关的黄金时期。4 月与 10 月属肩季，植被葱郁、人流较少。5 月至 9 月为雨季，德天瀑布最为壮观，但需注意部分山路可能受影响，行程需提前规划。",
    ),
  },
  {
    id: "faq-group",
    q: L("How large are the groups? What does \"private\" mean?", "团队规模是多少？私团是什么意思？"),
    a: L(
      "These are fully private tours — you'll never be merged with strangers. Group size is typically 2–8 people travelling together. A dedicated guide and private vehicle are yours throughout. Your pace, preferences, and decisions are entirely your own.",
      "我们的路线为纯私家团，不与陌生人拼团。一行人数通常为 2–8 人，全程配专属向导与专车。您的节奏、偏好与决策不受任何干扰——这正是「精品」的核心所在。",
    ),
  },
  {
    id: "faq-border",
    q: L("How does crossing the China-Vietnam border work?", "跨越中越边境的流程是怎样的？"),
    a: L(
      "Route 1 enters Vietnam at Dongxing–Mong Cai and returns to China at Lao Cai–Hekou. Our guide accompanies you through customs on both sides — handling declarations, luggage through the scanner, and passport checks. A single crossing typically takes 30–60 minutes. Local transport picks up seamlessly on the other side.",
      "路线一在东兴↔芒街入境越南，回程在老街↔河口入境中国。我们的向导全程陪同，协助完成两国海关申报、行李过机、护照核验等所有手续，通常单次过境耗时 30–60 分钟。边境通关后直接与当地司机衔接，无缝续程。",
    ),
  },
  {
    id: "tool-transit",
    q: L("What transport is used throughout?", "整段旅途的交通方式是什么？"),
    a: L(
      "Comfortable private minivans are used for all road legs, including Hanoi to Sapa (5.5–6 h). Route 1 adds a Ha Long Bay day cruise, the ferry to Cat Ba, and a vintage metre-gauge run from Hai Phong at 18:40 into Hanoi. Route 2 still uses the overnight metre-gauge toward the Friendship Pass.",
      "全程以舒适型商务车为主，含跨省长途（如河内→沙坝约 5.5–6 小时）。路线一另有下龙湾一日游轮、轮渡吉婆岛，以及海防 18:40 百年米轨驶入河内。路线二仍保留米轨过夜，再经友谊关回国。",
    ),
  },
  {
    id: "faq-language",
    q: L("Will language be a barrier?", "语言沟通有障碍吗？"),
    a: L(
      "Not at all. Our guides are fluent Mandarin speakers, with local Vietnamese-speaking guides joining for the Vietnam segments. Restaurants, guesthouses, drivers, and shopkeepers — all communication is handled. You travel; we translate.",
      "全程无需担忧语言问题。我们的向导中文流利（普通话/粤语），在越南段配有越南语翻译向导。食宿、交通、商家沟通均由我们代劳——您只需享受旅程。",
    ),
  },
  {
    id: "faq-cost",
    q: L("What does the trip cost and what's included?", "费用大概是多少？包含哪些内容？"),
    a: L(
      "Pricing varies by group size, route, and dates — please enquire for an accurate quote. Typical inclusions: private vehicle throughout, double-occupancy accommodation (upgrades available), guiding services, listed meals, and activity entrance fees. International flights and visa fees are not included.",
      "价格因人数、路线和出发日期而有所不同，建议通过询盘获取准确报价。通常费用包含：全程专车、双人标准间住宿（可升级）、向导服务、已列明的餐食，以及活动门票。国际机票与签证费用不含在内。",
    ),
  },
  {
    id: "faq-family",
    q: L("Can elderly travellers or children join?", "路线适合携带老人或小孩吗？"),
    a: L(
      "Route 2 (The Southern Loop) moves at a gentle pace and suits families and all fitness levels. Route 1 includes light trekking in Sapa — no technical ability required, but comfortable mobility is helpful. Let us know any specific needs at enquiry stage and we'll tailor the rhythm accordingly.",
      "路线二（南疆回环）整体节奏偏慢，适合家庭与各年龄层出行。路线一含少量轻度徒步（沙坝梯田），对行动能力有基本要求，但无需专业体能。如有特殊需求，请在询盘时说明，我们会为您量身调整行程节奏。",
    ),
  },
  {
    id: "faq-change",
    q: L("What if we want to change the itinerary mid-trip?", "如果临时需要改变行程怎么办？"),
    a: L(
      "The whole point of a private tour is flexibility. Weather shifts, a slower morning, a spontaneous detour — just talk to your guide. We're not running a script. Your experience matters more than the plan.",
      "私家团的最大优势在于灵活性。旅途中如遇天气变化、个人需求调整，可随时与向导沟通，在合理范围内灵活应变。我们不是按脚本执行的观光团——您的真实体验比既定计划更重要。",
    ),
  },
];
