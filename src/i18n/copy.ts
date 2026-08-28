export type Locale = "en" | "zh";

export type Tx = { en: string; zh: string };

export const copy = {
  nav: {
    tours: { en: "Boutique Tours", zh: "精品路线" },
    plan: { en: "Plan Your Route", zh: "行程定制" },
    explore: { en: "Explore", zh: "内容" },
    tools: { en: "Tools", zh: "工具" },
    more: { en: "More", zh: "更多" },
    also: { en: "ALSO ON THIS PAGE", zh: "本页还有" },
    culture: { en: "Culture notes", zh: "文化志" },
    voices: { en: "Local voices", zh: "当地人" },
    guide: { en: "Inspiration", zh: "灵感指南" },
    visa: { en: "Visa snapshot", zh: "签证速查" },
    season: { en: "When to go", zh: "最佳季节" },
    transit: { en: "Drive times", zh: "车程计算" },
    lang: { en: "Language", zh: "语言" },
    close: { en: "Close", zh: "关闭" },
  },
  hero: {
    kicker: { en: "INBOUND · GUANGXI & NORTH VIETNAM", zh: "入境游 · 广西与越南北部" },
    h1a: { en: "Two ways in.", zh: "两种走法。" },
    h1b: { en: "One landscape.", zh: "同一片山河。" },
    sub: {
      en: "Join a tightly edited boutique itinerary — or brief us, and we draw the border crossing around you.",
      zh: "跟我们的精品成团走，或把你的想法交给我们，边境与路书由我们落地。",
    },
    ctaA: {
      en: "Discover our award-winning boutique routes",
      zh: "查看我们的精品路线",
    },
    ctaAHint: {
      en: "Two private itineraries. Border, bed and boat already solved.",
      zh: "两条私团成线。通关、住宿、水路都已排好。",
    },
    ctaB: {
      en: "Plan Your Route",
      zh: "自主规划",
    },
    ctaBHint: {
      en: "AI brief. Four questions, then a draft in English.",
      zh: "AI 定制。四个问题，英文路书草稿。",
    },
    mapCaption: {
      en: "Guangxi · North Vietnam · Yunnan",
      zh: "广西 · 越南北部 · 云南",
    },
    mapAria: {
      en: "Minimal map of southern China and northern Vietnam, highlighting Guangxi, Yunnan and the north of Vietnam",
      zh: "中国南方与越南北部示意图，高亮广西、云南与越南北部",
    },
  },
  tours: {
    kicker: { en: "BOUTIQUE ROUTES", zh: "精品路线" },
    h2: { en: "Award-winning, on purpose.", zh: "刻意做少，所以够精。" },
    sub: {
      en: "Not a catalogue. Two private signatures we actually run — Yunnan exit, or a loop that starts and ends in Nanning.",
      zh: "不是产品册。我们真正在跑的两条私团：云南出境，或南宁进出闭环。",
    },
    r1Eye: { en: "12 DAYS · KUNMING EXIT", zh: "12日 · 昆明出境" },
    r1Title: {
      en: "Karst, Cat Ba, Sapa — out through Yunnan.",
      zh: "喀斯特、吉婆岛、沙坝 — 从云南出境。",
    },
    r1Body: {
      en: "Detian and Mingshi, the overnight train, Jianshui and Puzhehei. Fly home from Kunming.",
      zh: "德天与名仕田园、米轨过夜、建水与普者黑。昆明送机。",
    },
    r2Eye: { en: "10 DAYS · NANNING LOOP", zh: "10日 · 南宁闭环" },
    r2Title: {
      en: "The same wild north — home via Friendship Pass.",
      zh: "同样野的北境，友谊关回家。",
    },
    r2Body: {
      en: "Skip Yunnan. Add Longzhou, Tianqin, cane fields. End where you landed.",
      zh: "不去云南。加上龙州、天琴、蔗海。在南宁结束。",
    },
    duration: { en: "Duration", zh: "行程天数" },
    entry: { en: "Entry", zh: "入境" },
    exit: { en: "Exit", zh: "出境" },
    for: { en: "Best for", zh: "适合" },
    r1Days: { en: "12 days", zh: "12 日" },
    r1Entry: { en: "Nanning", zh: "南宁" },
    r1Exit: { en: "Kunming", zh: "昆明" },
    r1For: { en: "Adventure", zh: "探险" },
    r2Days: { en: "10 days", zh: "10 日" },
    r2Entry: { en: "Nanning", zh: "南宁" },
    r2Exit: { en: "Nanning", zh: "南宁" },
    r2For: { en: "Families · All", zh: "家庭 · 全部" },
    view: { en: "View this route", zh: "查看这条路线" },
    quote: { en: "Get a quote for a boutique route", zh: "咨询精品路线报价" },
    days: { en: "THE DAYS", zh: "每日行程" },
    r1Tab: { en: "12-DAY", zh: "12日" },
    r2Tab: { en: "10-DAY", zh: "10日" },
    filtered: { en: "Filtered by", zh: "按主题筛选" },
    stayHotel: { en: "hotel", zh: "酒店" },
    stayTrain: { en: "overnight train", zh: "米轨过夜" },
    stayPark: { en: "inside park", zh: "景区内住宿" },
    stayBase: { en: "two-night base", zh: "连住两晚" },
    drive: { en: "drive", zh: "车程" },
    book: {
      overview: { en: "ROUTE OVERVIEW", zh: "路线说明" },
      why: { en: "Why this route", zh: "为什么这么走" },
      see: { en: "What you’ll see", zh: "看点" },
      play: { en: "Highlighted activities", zh: "好玩之处" },
      reviews: { en: "TRAVELER REVIEWS", zh: "旅行者评论" },
      experience: { en: "Unique experience", zh: "独特体验" },
      cuisine: { en: "Local cuisine", zh: "特色美食" },
      hotel: { en: "Featured hotel", zh: "特色酒店" },
      playBtn: { en: "Play route animation", zh: "播放路线动画" },
      playSub: { en: "Explore the path with a map animation.", zh: "用地图把这条线走一遍。" },
      playing: { en: "Playing…", zh: "播放中…" },
      replay: { en: "Replay", zh: "再播一次" },
      nowAt: { en: "Now at", zh: "正在经过" },
      culture: { en: "Culture note", zh: "文化导读" },
      playHow: { en: "How we play it", zh: "特色玩法" },
      tweaks: { en: "Tune this stop", zh: "微调这一站" },
      extraNight: { en: "Add nights", zh: "增加停留" },
      extraNightHint: {
        en: "On top of the written stay. A planner will confirm beds.",
        zh: "在现有住宿之上加晚。规划师会确认床位。",
      },
      night0: { en: "As written", zh: "按路书" },
      night1: { en: "+1 night", zh: "+1 晚" },
      night2: { en: "+2 nights", zh: "+2 晚" },
      hotelTier: { en: "Hotel level", zh: "酒店级别" },
      tierSimple: { en: "Simple lodge", zh: "简朴客栈" },
      tierComfort: { en: "Comfortable", zh: "舒适" },
      tierGenerous: { en: "Generous", zh: "更优" },
      openStop: { en: "Open this stop", zh: "打开这一站" },
      of: { en: "of", zh: "/" },
      prev: { en: "Previous photo", zh: "上一张" },
      next: { en: "Next photo", zh: "下一张" },
    },
    themes: { en: "THEMES", zh: "性格" },
    trustBorder: { en: "Border", zh: "通关" },
    trustCar: { en: "Car", zh: "专车" },
    trustWa: { en: "WhatsApp", zh: "WhatsApp" },
    themeNames: {
      wild: { en: "Wild Fun", zh: "纵情山野" },
      flavors: { en: "Great Flavors", zh: "地道风味" },
      villages: { en: "Green Villages", zh: "村落生态" },
      locals: { en: "Friendly Locals", zh: "够朋友" },
    },
  },
  explore: {
    kicker: { en: "EXPLORE CONTEXT", zh: "你可能感兴趣" },
    h2: { en: "Stories, not sales decks.", zh: "故事，不是销售页。" },
    sub: {
      en: "Read a little, then go back to the route. Or don’t — the itinerary is still above.",
      zh: "看一点再回到路线。不看也行，行程还在上面。",
    },
    c1k: { en: "Culture note", zh: "文化志" },
    c1t: { en: "The border is a mood, not a line.", zh: "边境是一种气质，不是一条线。" },
    c1c: { en: "Read the note", zh: "阅读" },
    c2k: { en: "Local voice", zh: "当地人" },
    c2t: { en: "A night with the Tianqin, told by the player.", zh: "天琴的一夜，由弹奏的人来讲。" },
    c2c: { en: "Listen in", zh: "去听" },
    c3k: { en: "Inspiration", zh: "灵感" },
    c3t: { en: "What “enough wild” looks like on Day 3.", zh: "第三天，什么叫「够野」。" },
    c3c: { en: "Open the guide", zh: "打开指南" },
  },
  plan: {
    kicker: { en: "PLAN YOUR ROUTE", zh: "行程定制" },
    h2: { en: "You sketch. We make it runnable.", zh: "你来勾画。我们让它可走。" },
    sub: {
      en: "Dates, pace, no-go hotels, must-see villages. We handle the crossing, the car, and the parts you cannot Google.",
      zh: "日期、节奏、不想住的酒店、必去的村子。通关、专车、搜不到的细节交给我们。",
    },
    name: { en: "Full name", zh: "姓名" },
    whatsapp: { en: "WhatsApp", zh: "WhatsApp" },
    email: { en: "Email", zh: "邮箱" },
    travelers: { en: "Travelers", zh: "出行人数" },
    dates: { en: "Preferred dates", zh: "期望日期" },
    flexible: { en: "flexible", zh: "日期灵活" },
    want: { en: "I want", zh: "我想定" },
    optR1: {
      en: "A boutique route — 12-Day Kunming Exit",
      zh: "精品路线 — 12日昆明出境",
    },
    optR2: {
      en: "A boutique route — 10-Day Nanning Loop",
      zh: "精品路线 — 10日南宁闭环",
    },
    optCustom: {
      en: "Fully custom — I’ll brief you",
      zh: "完全定制 — 我来说明",
    },
    notes: { en: "Notes", zh: "备注" },
    err: {
      en: "Check name and WhatsApp or email.",
      zh: "请填写姓名，以及 WhatsApp 或邮箱。",
    },
    send: { en: "Send my brief", zh: "提交意向" },
    sending: { en: "Sending…", zh: "提交中…" },
    thanks: {
      en: "Thank you. A planner will write you shortly.",
      zh: "已收到。规划师会尽快联系你。",
    },
  },
  craft: {
    badge: { en: "WANDERFUL AI", zh: "WANDERFUL AI" },
    kicker: { en: "PLAN YOUR ROUTE", zh: "自主规划" },
    h2: { en: "Tell us how you travel.", zh: "说说你想怎么走。" },
    sub: {
      en: "Four questions. We draft an English route from real border days — not a blank form.",
      zh: "四个问题。我们用真实边境日程起草英文路书，不是一张空白表。",
    },
    stepOf: { en: "of", zh: "/" },
    back: { en: "Back", zh: "上一步" },
    next: { en: "Continue", zh: "继续" },
    generate: { en: "Compose my route", zh: "生成我的路线" },
    s1: { en: "When, and who", zh: "何时，几人" },
    s1sub: {
      en: "A start date if you have one. How many seats in the car.",
      zh: "有日期就填。车上几个人。",
    },
    start: { en: "Start date", zh: "出发日期" },
    flexible: { en: "Dates are flexible", zh: "日期灵活" },
    duration: { en: "Length", zh: "天数" },
    daysUnit: { en: "days", zh: "天" },
    travelers: { en: "Travelers", zh: "出行人数" },
    s2: { en: "Pace", zh: "旅行节奏" },
    s2sub: {
      en: "How hard you want the days to work.",
      zh: "你希望每天排多满。",
    },
    packed: { en: "Special-ops pace", zh: "特种兵" },
    packedSub: {
      en: "Early starts. More miles. More in the frame.",
      zh: "起得早，跑得远，一天装得下更多。",
    },
    slow: { en: "Slow travel", zh: "慢游" },
    slowSub: {
      en: "Two-night bases. Time to sit, not just pass through.",
      zh: "连住两晚。有时间坐下来，不只是路过。",
    },
    s3: { en: "What matters", zh: "核心偏好" },
    s3sub: {
      en: "Select, then drag to rank. First is the spine of the draft.",
      zh: "先多选，再拖拽排序。排第一的会成为路书主轴。",
    },
    rankHint: { en: "Drag to rank", zh: "拖拽排序" },
    prefNeed: { en: "Pick at least one.", zh: "至少选一项。" },
    culture: { en: "Culture", zh: "文化" },
    cultureSub: { en: "Old towns, Tianqin, villages", zh: "古城、天琴、村落" },
    nature: { en: "Nature", zh: "自然" },
    natureSub: { en: "Karst, waterfall, terraces", zh: "喀斯特、瀑布、梯田" },
    food: { en: "Food", zh: "美食" },
    foodSub: { en: "Lotus table, coffee, night markets", zh: "莲花餐、咖啡、夜市" },
    photo: { en: "Photography", zh: "摄影" },
    photoSub: { en: "Detian light, Sapa, boats", zh: "德天光线、沙坝、游船" },
    up: { en: "Move up", zh: "上移" },
    down: { en: "Move down", zh: "下移" },
    s4: { en: "Budget", zh: "预算范围" },
    s4sub: {
      en: "USD per person, private car already in. Rooms scale with the slider.",
      zh: "人均美元，专车已含。房间档次随滑杆走。",
    },
    perPerson: { en: "per person", zh: "每人" },
    lean: { en: "Lean", zh: "精简" },
    comfort: { en: "Comfortable", zh: "舒适" },
    generous: { en: "Generous", zh: "充裕" },
    magic1: {
      en: "Matching you with Wanderful’s local guides…",
      zh: "正在为您匹配 Wanderful 专属当地向导资源…",
    },
    magic2: {
      en: "Cutting the border route to your pace…",
      zh: "正在按你的节奏裁剪边境路书…",
    },
    magic3: {
      en: "Composing Detian, Cat Ba and Sapa…",
      zh: "正在组合德天、吉婆与沙坝…",
    },
    resultKicker: { en: "YOUR DRAFT", zh: "你的路书草稿" },
    englishNote: {
      en: "Draft in English — our planners work this way first.",
      zh: "路书先出英文。规划师也按英文稿推进。",
    },
    stay: { en: "Stay", zh: "住宿" },
    why: { en: "Why this mix", zh: "为什么这样排" },
    keep: { en: "Keep this draft", zh: "留下这份草稿" },
    keepSub: {
      en: "Name plus WhatsApp or email. A planner writes you with hotels and crossing times.",
      zh: "姓名，以及 WhatsApp 或邮箱。规划师会按酒店与通关时间回复你。",
    },
    again: { en: "Start over", zh: "重新规划" },
    sending: { en: "Sending…", zh: "提交中…" },
    send: { en: "Send this draft", zh: "发送这份草稿" },
  },
  tools: {
    kicker: { en: "TRAVEL TOOLS", zh: "你可能觉得有用" },
    h2: { en: "Useful, then get out of the way.", zh: "有用就好，不抢戏。" },
    visaH: { en: "Can I cross this month?", zh: "这个月过得了关吗？" },
    vn: { en: "Vietnam", zh: "越南" },
    cn: { en: "China", zh: "中国" },
    visaVn: {
      en: "Most visitors need a Vietnam e-visa or exemption. We confirm before you fly.",
      zh: "多数客人需要越南电子签或免签资格。出发前我们会再确认。",
    },
    visaCn: {
      en: "China entry depends on your passport. We flag the visa window in your brief.",
      zh: "入境中国视护照而定。我们会在方案里标出签证窗口。",
    },
    visaDis: {
      en: "Not legal advice. We confirm with you before the trip.",
      zh: "非正式法律意见。出行前会与你再确认。",
    },
    seasonH: {
      en: "The quiet months vs the photogenic ones.",
      zh: "人少的月份，和最好看的月份。",
    },
    cool: { en: "Nov–Mar", zh: "11–3月" },
    coolN: {
      en: "Clear karst, cooler nights, best for Sapa.",
      zh: "喀斯特干净、夜晚凉，沙坝最好走。",
    },
    shoulder: { en: "Apr–May", zh: "4–5月" },
    shoulderN: {
      en: "Green, fewer crowds, some rain.",
      zh: "更绿、人较少，会有雨。",
    },
    wet: { en: "Jun–Aug", zh: "6–8月" },
    wetN: {
      en: "Lush and hot. Waterfalls loud. Pack patience.",
      zh: "又绿又热。瀑布更响。请带上耐心。",
    },
    transitH: {
      en: "How long is that transfer, really?",
      zh: "那段路，到底要多久？",
    },
    leg: { en: "Leg", zh: "路段" },
    legs: {
      "hanoi-sapa": { en: "Hanoi → Sapa", zh: "河内 → 沙坝" },
      "hekou-jianshui": { en: "Hekou → Jianshui", zh: "河口 → 建水" },
      "mile-kunming": { en: "Mile → Kunming", zh: "弥勒 → 昆明" },
      "nanning-detian": { en: "Nanning → Detian", zh: "南宁 → 德天" },
      "catba-haiphong": { en: "Cat Ba → Hai Phong", zh: "吉婆岛 → 海防" },
    },
    hours: {
      "hanoi-sapa": {
        en: "About 5–6 h by road, or overnight train.",
        zh: "公路约 5–6 小时，或坐过夜火车。",
      },
      "hekou-jianshui": { en: "About 3 h private car.", zh: "专车约 3 小时。" },
      "mile-kunming": { en: "About 2 h private car.", zh: "专车约 2 小时。" },
      "nanning-detian": { en: "About 3 h private car.", zh: "专车约 3 小时。" },
      "catba-haiphong": {
        en: "Cable car + transfer, half a morning.",
        zh: "缆车加接驳，大约一上午。",
      },
    },
  },
  dock: {
    tours: { en: "Tours", zh: "路线" },
    plan: { en: "Plan", zh: "定制" },
  },
  footer: {
    line: {
      en: "Guangxi × northern Vietnam. Private, not packaged.",
      zh: "广西 × 越南北部。私团，不是大包团。",
    },
    contact: { en: "Placeholder contact · WhatsApp TBA", zh: "联系方式占位 · WhatsApp 待补" },
  },
  meta: {
    title: {
      en: "Karst Route — Two ways in",
      zh: "喀斯特之路 — 两种走法",
    },
  },
} as const;

export function t(tx: Tx, locale: Locale): string {
  return tx[locale];
}

export function pathFor(locale: Locale): string {
  const base = import.meta.env.BASE_URL;
  return locale === "zh" ? `${base}zh/` : base;
}

export function localeFromPath(pathname: string): Locale {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const rest = base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  const p = rest.startsWith("/") ? rest : `/${rest}`;
  return p === "/zh" || p.startsWith("/zh/") ? "zh" : "en";
}
