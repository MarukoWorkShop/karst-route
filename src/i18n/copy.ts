export type Locale = "en" | "zh";

export type Tx = { en: string; zh: string };

export const copy = {
  nav: {
    tours: { en: "Boutique Tours", zh: "精品路线" },
    plan: { en: "Plan Your Route", zh: "行程定制" },
    explore: { en: "Explore", zh: "探索" },
    faq: { en: "Q&A", zh: "问答" },
    films: { en: "Destination Films", zh: "目的地影像" },
    literature: { en: "Arts & Literature", zh: "文艺推荐" },
    visa: { en: "Vietnam visa", zh: "越南签证" },
    season: { en: "Best season", zh: "最佳季节" },
    transit: { en: "Transport", zh: "旅途交通" },
    lang: { en: "Language", zh: "语言" },
    close: { en: "Close", zh: "关闭" },
  },
  toolbox: {
    title: { en: "TRAVEL TOOLS", zh: "旅行工具箱" },
    open: { en: "Open tools", zh: "打开工具箱" },
    currency: { en: "💱 Currency", zh: "💱 汇率换算" },
    currencySub: { en: "CNY → VND / USD", zh: "人民币 → 越南盾 / 美元" },
    rateNote: { en: "Reference rate · estimate only", zh: "参考汇率 · 仅供估算" },
    map: { en: "🗺️ Map", zh: "🗺️ 区域地图" },
    mapSub: { en: "Guangxi · Yunnan · North Vietnam", zh: "广西 · 云南 · 越南北部" },
    openMaps: { en: "Open in Google Maps", zh: "在 Google 地图中打开" },
    weather: { en: "🌤️ Weather", zh: "🌤️ 本地天气" },
    weatherNote: { en: "Best time: Nov–Mar (cool & dry)", zh: "最佳出行：11月–3月（凉季干燥）" },
    food: { en: "🍜 Food Tips", zh: "🍜 饮食提示" },
  },
  hero: {
    ctaA: {
      en: "Award-winning deep cultural boutique routes",
      zh: "备受赞誉的深度人文精品路线",
    },
    ctaB: {
      en: "Design your own themes and routes",
      zh: "自己设计游玩主题和线路",
    },
    themesAria: {
      en: "Journey themes",
      zh: "旅途主题",
    },
  },
  tours: {
    r1Badge: { en: "ROUTE 01", zh: "路线一" },
    r1Name: { en: "The Three Realms Traverse", zh: "三境溯游" },
    r1Tagline: {
      en: "A 12-day overland journey from the Gulf to the Plateau",
      zh: "从北部湾到云贵高原的 12 日跨国纪实",
    },
    r1Regions: { en: "Nanning · Vietnam · Yunnan", zh: "南宁 · 越南 · 云南建水 / 弥勒 / 昆明" },
    r1Feature: {
      en: "An epic traverse. From the islands of the Gulf of Tonkin to the French-flavoured streets of Hanoi, up through Sapa's rice terraces, then inland by century-old metre-gauge rail to the timeless Yunnan towns of Jianshui and Puzhehei. The emotional arc rises gradually — humid and vivid at the coast, cooling into highland stillness by the end.",
      zh: "这是一条史诗级的「穿越」线。从北部湾的海岛（吉婆岛），到法式风情的河内市井，再爬升到沙坝梯田，最后沿着百年米轨进入底蕴深厚的云南建水和普者黑。它的情绪体验是递进的，像是一篇起承转合极其细腻的当代纪实散文，从湿热喧嚣慢慢走向高远宁静。",
    },
    r2Badge: { en: "ROUTE 02", zh: "路线二" },
    r2Name: { en: "The Southern Loop", zh: "南疆回环" },
    r2Tagline: {
      en: "A slow cultural circuit through sugarcane fields, rice terraces and French-era streets",
      zh: "穿行于蔗海、梯田与法式老街的慢节奏人文巡游",
    },
    r2Regions: { en: "Nanning · Chongzuo · Vietnam · Longzhou · Nanning", zh: "南宁 · 崇左 · 越南 · 龙州 · 南宁" },
    r2Feature: {
      en: "A closed loop from Nanning, built for travellers with limited time and zero compromise on depth. Detian Falls, Cat Ba's sea air, Hanoi's old-quarter energy, then back through Longzhou for Zhuang music and sugarcane-field cycling. Ten days, one seamless re-entry, maximum cultural density.",
      zh: "一条以南宁为原点的闭环路线，专为时间紧凑而深度不妥协的旅人设计。德天瀑布的震撼、吉婆岛的海风、河内老街的烟火气，再折返至龙州天琴壮寨，听一曲古琴、骑行蔗海。10 天内完成一次文化密度极高的边境漫游，进出无缝，行程自洽。",
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
    inquire: { en: "Enquire about this route", zh: "咨询这条路线" },
    days: { en: "ITINERARY", zh: "行程" },
    r1Tab: { en: "Route 1 · 12 Days", zh: "路线一 · 12日" },
    r2Tab: { en: "Route 2 · 10 Days", zh: "路线二 · 10日" },
    filtered: { en: "Filtered by", zh: "按主题筛选" },
    book: {
      readReviews: { en: "Read real traveller reviews", zh: "查看客户的真实评价" },
      readFull: { en: "Read full review →", zh: "阅读完整评价 →" },
      moreReviews: { en: "More reviews", zh: "换一批" },
      tripPhotos: { en: "Trip Photos", zh: "旅途照片" },
      viewMap: { en: "View the complete route on map", zh: "点击在地图上查看完整路线" },
      mapStops: { en: "stops", zh: "个目的地" },
      transport: { en: "Transport", zh: "交通" },
      stay: { en: "Stay", zh: "住宿" },
      dining: { en: "Dining", zh: "餐饮" },
      playBtn: { en: "Play route animation", zh: "播放路线动画" },
      playing: { en: "Playing…", zh: "播放中…" },
      replay: { en: "Replay", zh: "再播一次" },
      nowAt: { en: "Now at", zh: "正在经过" },
    },
    themeNames: {
      wild: { en: "Wild Fun", zh: "纵情山野" },
      flavors: { en: "Great Flavors", zh: "地道风味" },
      villages: { en: "Green Villages", zh: "村落生态" },
      locals: { en: "Friendly Locals", zh: "够朋友" },
    },
  },
  experience: {
    h2: { en: "Journeys that leave a mark", zh: "让旅途真正改变你" },
    kicker: { en: "Life changing experience", zh: "Life changing experience" },
    highlights: { en: "Highlights", zh: "旅途亮点" },
    stories: { en: "Real travel stories", zh: "真实的旅行故事" },
  },
  explore: {
    h2: { en: "Feel the land before you arrive", zh: "在出发前，先感受这片土地" },
    films: { en: "Destination Films", zh: "目的地影像" },
    literature: { en: "Arts & Literature", zh: "文艺推荐" },
    viewAll: { en: "View all", zh: "查看全部" },
    allFilms: { en: "All Destination Films", zh: "目的地影像 · 全部" },
    allLit: { en: "All Arts & Literature", zh: "文艺推荐 · 全部" },
    searchGoogle: { en: "Search on Google", zh: "在 Google 搜索" },
    book: { en: "BOOK", zh: "书" },
    film: { en: "FILM", zh: "电影" },
  },
  plan: {
    name: { en: "Full name", zh: "姓名" },
    whatsapp: { en: "WhatsApp", zh: "WhatsApp" },
    email: { en: "Email", zh: "邮箱" },
    travelers: { en: "Travelers", zh: "出行人数" },
    dates: { en: "Preferred dates", zh: "期望日期" },
    optR1: {
      en: "A boutique route — 12-Day Kunming Exit",
      zh: "精品路线 — 12日昆明出境",
    },
    optR2: {
      en: "A boutique route — 10-Day Nanning Loop",
      zh: "精品路线 — 10日南宁闭环",
    },
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
    pathB: { en: "AI trip planner", zh: "AI 智能规划" },
    pathA: { en: "Boutique route enquiry", zh: "咨询精品路线" },
    bookTitle: { en: "Book a route", zh: "咨询精品路线" },
    next: { en: "Next", zh: "下一步" },
    back: { en: "Back", zh: "上一步" },
    qRoute: { en: "Which route interests you?", zh: "您对哪条路线感兴趣？" },
    qWhen: { en: "When, and how many travellers?", zh: "计划出发时间与人数？" },
    qContact: { en: "How can we reach you?", zh: "如何联系您？" },
    qNotes: { en: "Anything else to share? (optional)", zh: "还有什么想告诉我们？（选填）" },
    optUnsure: { en: "Not sure yet", zh: "暂不确定" },
    peopleUnit: { en: "people", zh: "人" },
    datePh: { en: "e.g. Oct 2025, or flexible", zh: "如：2025年10月 或 日期灵活" },
    contactPh: { en: "WhatsApp / Email", zh: "WhatsApp / 邮箱" },
    notesPh: {
      en: "Must-see stops, dietary needs, mobility notes…",
      zh: "特别关注的目的地、饮食禁忌、行动不便等……",
    },
    contact: { en: "Contact", zh: "联系方式" },
  },
  craft: {
    back: { en: "Back", zh: "上一步" },
    next: { en: "Next", zh: "下一步" },
    generate: { en: "Compose my route", zh: "生成我的路线" },
    s1: { en: "Dates & party", zh: "出发日期与人数" },
    start: { en: "Start date", zh: "出发日期" },
    duration: { en: "Duration", zh: "天数" },
    nightsUnit: { en: "nights", zh: "晚" },
    travelers: { en: "Travelers", zh: "人数" },
    peopleUnit: { en: "people", zh: "人" },
    datePh: { en: "e.g. Oct 2025, or flexible", zh: "如：2025年10月 或 日期灵活" },
    s2: { en: "Pace", zh: "旅行节奏" },
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
    prefNeed: { en: "Pick at least one.", zh: "至少选一项。" },
    culture: { en: "Culture", zh: "文化" },
    nature: { en: "Nature", zh: "自然" },
    food: { en: "Food", zh: "美食" },
    photo: { en: "Photography", zh: "摄影" },
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
  dock: {
    tours: { en: "Tours", zh: "路线" },
    plan: { en: "Plan", zh: "定制" },
  },
  faq: {
    h2: { en: "Things you might want to know", zh: "出行前，您可能想知道" },
    more: {
      en: "Have a question we didn't cover? Just ask.",
      zh: "还有其他疑问？直接告诉我们。",
    },
    cta: { en: "Get in touch", zh: "联系我们" },
  },
  partners: {
    h2: { en: "Local partners we trust", zh: "我们信任的当地合作商家" },
    sub: {
      en: "Each partner below has been visited in person and vetted through ongoing collaboration. Click to find them on the map or visit their site.",
      zh: "以下商家经过我们实地考察与长期合作，纳入路线推荐体系。点击可查看地图位置或访问其官网。",
    },
    ctaTitle: { en: "Are you a local business on these routes?", zh: "您是沿线商家？" },
    ctaSub: { en: "Get in touch to explore partnership", zh: "欢迎联系我们了解合作方式" },
    contact: { en: "Contact us", zh: "联系我们" },
  },
  footer: {
    brand: { en: "南境拾遗", zh: "南境拾遗" },
    brandEn: { en: "The Southern Curations", zh: "The Southern Curations" },
    tagline: {
      en: "Private Journeys. Authentic Connections. The Irreplaceable Human Heritage.",
      zh: "私密同行。真实联结。无可替代的人文原乡。",
    },
    connect: { en: "Connect with us", zh: "联系与关注" },
    rights: { en: "All rights reserved", zh: "版权所有" },
    privacy: { en: "Privacy Policy", zh: "隐私政策" },
    terms: { en: "Terms of Service", zh: "服务条款" },
    disclaimer: { en: "Disclaimer", zh: "免责声明" },
  },
  meta: {
    title: {
      en: "The Southern Curations — South China & Northern Vietnam",
      zh: "南境拾遗 — 南中国与越南北部的人文深度体验",
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
