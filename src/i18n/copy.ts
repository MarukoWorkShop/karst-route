/** Site locales currently served. Keep in sync with content/langs.yaml. */
export const LOCALES = ["en", "zh"] as const;
export type Locale = (typeof LOCALES)[number];

export type Tx = {
  /** Language the author wrote. Other keys are translations and may be filled later. */
  src?: string;
  en: string;
  zh: string;
};

export const copy = {
  nav: {
    tours: { en: "Boutique Tours", zh: "精品路线" },
    plan: { en: "Plan Your Route", zh: "行程定制" },
    explore: { en: "Explore", zh: "探索" },
    about: { en: "About Us", zh: "关于我们" },
    faq: { en: "FAQ", zh: "FAQ" },
    films: { en: "What's the scenery like, and what can you do?", zh: "这里风景如何，能玩些什么？" },
    literature: { en: "Arts & Literature", zh: "文艺推荐" },
    visa: { en: "Visa & transit", zh: "签证与过境" },
    season: { en: "Best season", zh: "最佳季节" },
    transit: { en: "Getting around", zh: "交通出行" },
    lang: { en: "Language", zh: "语言" },
    close: { en: "Close", zh: "关闭" },
  },
  toolbox: {
    title: { en: "TRAVEL TOOLS", zh: "旅行工具箱" },
    open: { en: "Open tools", zh: "打开工具箱" },
    currency: { en: "Currency", zh: "汇率换算" },
    currencySub: { en: "CNY → VND / USD", zh: "人民币 → 越南盾 / 美元" },
    rateNote: { en: "Reference rate · estimate only", zh: "参考汇率 · 仅供估算" },
    map: { en: "Map", zh: "区域地图" },
    mapSub: { en: "Guangxi · Yunnan · North Vietnam", zh: "广西 · 云南 · 越南北部" },
    openMaps: { en: "Open in Google Maps", zh: "在 Google 地图中打开" },
    weather: { en: "Weather", zh: "本地天气" },
    weatherNote: { en: "Best time: Nov–Mar (cool & dry)", zh: "最佳出行：11月–3月（凉季干燥）" },
    food: { en: "Food Tips", zh: "饮食提示" },
    time: { en: "Time", zh: "时间" },
    timeBeijing: { en: "Beijing (UTC+8)", zh: "北京（UTC+8）" },
    timeLocal: { en: "Your time", zh: "您的时区" },
    timeOnline: { en: "Youxian concierge online · ~5-min reply", zh: "有闲旅游专属顾问在线，平均 5 分钟内响应" },
    timeNight: { en: "Local night — send your request and we'll pick it up first at Beijing 9:00", zh: "当前为当地夜间，您可直接提交定制意向，我们将在北京时间早 9:00 优先处理" },
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
    prev: { en: "Previous slide", zh: "上一张" },
    next: { en: "Next slide", zh: "下一张" },
    benefits: {
      en: "China–Vietnam overland · Private group · Licensed guide · Unhurried",
      zh: "中越跨境 · 私人小团 · 持证向导 · 不赶路",
    },
    season: { en: "Departures Nov–Mar", zh: "11月–3月可出发" },
  },
  tours: {
    r1Badge: { en: "ROUTE 01", zh: "路线一" },
    r1Name: { en: "The Three Realms Traverse", zh: "三境溯游" },
    r1Tagline: {
      en: "A 14-day overland journey from the Gulf to the Plateau",
      zh: "从北部湾到云贵高原的 14 日跨国纪实",
    },
    r1Regions: { en: "Nanning · Ha Long · Yunnan", zh: "南宁 · 下龙 · 云南建水 / 弥勒 / 昆明" },
    r1Feature: {
      en: "An epic traverse. Two nights on Ha Long Bay, a slow ferry to Cat Ba, then the century-old metre-gauge from Hai Phong into Hanoi. Sapa’s terraces get a full day — Fansipan in the morning, Cat Cat in the afternoon — before the Hekou crossing into Yunnan’s old towns. The arc is coastal and vivid first, then highland and still.",
      zh: "这是一条史诗级的「穿越」线。下龙湾连住两晚正经出海，再轮渡吉婆岛；海防百年米轨傍晚驶入河内。沙坝给足一整天：上午番西邦，下午猫猫村，再经河口进入云南建水、普者黑。情绪从湿热的海慢慢走到高远的高原。",
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
    r1Days: { en: "14 days", zh: "14 日" },
    r1Entry: { en: "Nanning", zh: "南宁" },
    r1Exit: { en: "Kunming", zh: "昆明" },
    r1For: { en: "Adventure", zh: "探险" },
    r2Days: { en: "10 days", zh: "10 日" },
    r2Entry: { en: "Nanning", zh: "南宁" },
    r2Exit: { en: "Nanning", zh: "南宁" },
    r2For: { en: "Families · All", zh: "家庭 · 全部" },
    r3Badge: { en: "ROUTE 03", zh: "路线三" },
    r3Name: { en: "Chongzuo Karst · Weizhou Isle", zh: "崇左栖山 · 涠洲枕海" },
    r3Tagline: {
      en: "Seven days from karst peaks to a volcanic island",
      zh: "从喀斯特峰林到火山岛的七日",
    },
    r3Regions: {
      en: "Nanning · Chongzuo · Beihai · Weizhou",
      zh: "南宁 · 崇左 · 北海 · 涠洲岛",
    },
    r3Feature: {
      en: "A week that holds two very different Guangxis: the karst river country around Chongzuo — black-water boat rides, the Detian falls and the Mingshi paddies — then south to the coast for Weizhou Island, where a volcanic shoreline, coral-stone chapels and a working fishing harbour set the pace. No border crossing, no long hauls.",
      zh: "一周装下两个截然不同的广西：先走进崇左的喀斯特水乡——黑水河游船、德天瀑布与明仕田园；再南下海边，登涠洲岛，看火山岩海岸、珊瑚石教堂与归航的渔港。不跨境，不长途奔波。",
    },
    r3Days: { en: "7 days · 6 nights", zh: "7 天 6 晚" },
    r3Entry: { en: "Nanning", zh: "南宁" },
    r3Exit: { en: "Beihai", zh: "北海" },
    r3For: { en: "Mountains + sea · Short break", zh: "山海双景 · 短假期" },
    playVideoIntro: {
      en: "Play the full-route video introduction",
      zh: "播放整条路线的视频介绍",
    },
    days: { en: "ITINERARY", zh: "行程" },
    r1Tab: { en: "Route 1 · 14 Days", zh: "路线一 · 14日" },
    r2Tab: { en: "Route 2 · 10 Days", zh: "路线二 · 10日" },
    r3Tab: { en: "Route 3 · 7 Days", zh: "路线三 · 7日" },
    book: {
      readReviews: { en: "Read real traveller reviews", zh: "查看客户的真实评价" },
      downloadRoutePdf: { en: "Download itinerary PDF", zh: "下载路书 PDF" },
      downloadingPdf: { en: "Preparing PDF…", zh: "正在生成 PDF…" },
      routeReviews: { en: "Read reviews for this route", zh: "查看本线路的客户实际评价" },
      customizeQuote: { en: "Customize my plan & get a quote", zh: "定制我的方案并询价" },
      noRouteReviews: { en: "No reviews for this route yet.", zh: "本线路暂无客户评价。" },
      readFull: { en: "Read full review →", zh: "阅读完整评价 →" },
      moreReviews: { en: "More reviews", zh: "换一批" },
      tripPhotos: { en: "Trip Photos", zh: "旅途照片" },
      viewMap: { en: "View the complete route on map", zh: "点击在地图上查看完整路线" },
      mapStops: { en: "stops", zh: "个目的地" },
      experience: { en: "Experience", zh: "体验" },
      transport: { en: "Transport", zh: "交通" },
      stay: { en: "Stay", zh: "住宿" },
      dining: { en: "Dining", zh: "餐饮" },
      playBtn: { en: "Play route animation", zh: "播放路线动画" },
      playing: { en: "Playing…", zh: "播放中…" },
      replay: { en: "Replay", zh: "再播一次" },
      nowAt: { en: "Now at", zh: "正在经过" },
      mapCredit: { en: "© OpenStreetMap contributors · Natural Earth", zh: "© OpenStreetMap contributors · Natural Earth" },
    },
    priceLabel: { en: "Reference budget", zh: "参考预算" },
    included: { en: "What's included", zh: "费用包含" },
    excluded: { en: "Not included", zh: "费用不含" },
    quote: { en: "Get a quote", zh: "获取报价" },
    quoteBar: {
      en: "Like this route? View the day-by-day itinerary",
      zh: "喜欢这条线路，点击查看路书",
    },
    reviews: { en: "{n} reviews", zh: "{n} 条评价" },
  },
  experience: {
    h2: { en: "Journeys that leave a mark", zh: "让旅途真正改变你" },
    kicker: { en: "Life changing experience", zh: "Life changing experience" },
    highlights: { en: "Highlights", zh: "旅途亮点" },
    stories: { en: "Real travel stories", zh: "真实的旅行故事" },
  },
  about: {
    kicker: { en: "About Us", zh: "关于我们" },
    name: { en: "Leisure Time International Travel Service", zh: "有闲旅行" },
    website: { en: "Official website", zh: "前往官网" },
    role: {
      en: "Bespoke Luxury Travel Across China",
      zh: "中国全域高端定制旅行服务商",
    },
    body1: {
      en: "We specialize in curated private journeys, immersive themed expeditions, and premium corporate incentive travel. Our signature approach seamlessly weaves iconic landmarks with ultra-exclusive, off-the-beaten-path experiences.",
      zh: "我们专注于高端私人定制、主题深度探索及企业奖励旅游，致力于将经典地标与隐秘奢华的小众体验完美融合。",
    },
    body2Lead: {
      en: "Trust Built on Firsthand Perfection",
      zh: "因为严苛，所以信任",
    },
    body2: {
      en: "We strictly adhere to our ethos—never design a journey we haven't personally experienced. Our specialists scout the field year-round, meticulously vetting every detail. This dedication has allowed us to amass an elite portfolio of China's finest luxury resources. By continuously pioneering innovative itineraries and leveraging rare, insider access, we craft unrivaled, bespoke journeys for the discerning traveler.",
      zh: "我们坚持“不踩线，不设计”的原则，所有行程均由资深定制师常年亲赴一线实地考察。凭借匠心打磨的极致细节，我们建立起庞大的顶级奢华资源库。通过不断创新创意行程，我们用最稀缺、最顶尖的本土资源，为您编织独一无二的中国传奇之旅。",
    },
    points: [
      {
        en: "Private journeys · themed expeditions · incentive travel",
        zh: "高端私人定制·主题深度·企业奖励",
      },
      {
        en: "Never design a journey we haven't experienced",
        zh: "不踩线，不设计",
      },
      {
        en: "Elite luxury and rare resources",
        zh: "顶级奢华与稀缺资源",
      },
    ],
    credsTitle: { en: "Licensed, insured, accountable", zh: "资质与保障" },
    credsSub: {
      en: "Every booking runs through our licensed agency — documented, insured, and with a cancellation policy you can read before you pay.",
      zh: "每一单都由持证旅行社承接：资质可查、含保险、退改政策在付款前就能看清。",
    },
    creds: [
      {
        icon: "",
        en: "Licensed travel agency · business registration on file",
        zh: "旅行社业务经营许可证 · 营业执照",
      },
      {
        icon: "",
        en: "Nationally licensed guides on every departure",
        zh: "全员持证向导",
      },
      {
        icon: "",
        en: "Travel accident insurance on every booking",
        zh: "每单含旅游意外险",
      },
      {
        icon: "",
        en: "Free cancellation or date change up to 30 days out",
        zh: "出发前 30 天免费取消 / 改期",
      },
      {
        icon: "",
        en: "8 years operating · 500+ travellers served",
        zh: "8 年运营 · 服务 500+ 位旅行者",
      },
      {
        icon: "",
        en: "Covered by independent travel media",
        zh: "独立旅行媒体报道",
      },
    ],
  },
  explore: {
    h2: { en: "Feel the land before you arrive", zh: "在出发前，先感受这片土地" },
    films: { en: "What's the scenery like, and what can you do?", zh: "这里风景如何，能玩些什么？" },
    literature: { en: "Arts & Literature", zh: "文艺推荐" },
    viewAll: { en: "View all", zh: "查看全部" },
    allFilms: {
      en: "What's the scenery like, and what can you do? · All",
      zh: "这里风景如何，能玩些什么？ · 全部",
    },
    allLit: { en: "All Arts & Literature", zh: "文艺推荐 · 全部" },
    searchGoogle: { en: "Search on Google", zh: "在 Google 搜索" },
    source: {
      en: "Video source: YouTube @{channel}. Click to watch on the original channel.",
      zh: "视频来源：YouTube @{channel}，点击可跳转原频道观看",
    },
    sourceVideo: {
      en: "Video source: YouTube. Click to watch the original video.",
      zh: "视频来源：YouTube，点击可跳转原片观看",
    },
    book: { en: "BOOK", zh: "书" },
    film: { en: "FILM", zh: "电影" },
  },
  plan: {
    kicker: { en: "Plan your journey", zh: "行程定制" },
    h2: { en: "Book a route or design your own", zh: "预订精品线路，或定制专属方案" },
    h2Sub: {
      en: "Choose a curated itinerary as-is, or build on it with our travel concierge — we reply within 24 hours.",
      zh: "直接按现有路线出发，或在基础上深度调整；旅游管家 24 小时内回复。",
    },
    tabBook: {
      en: "Book our boutique routes directly",
      zh: "直接预订我们的精品线路",
    },
    tabDesign: {
      en: "Enquire about a deeper custom itinerary",
      zh: "我想咨询更深度的定制方案",
    },
    bookLead: {
      en: "Travel one of our curated routes as designed — just tell us when, who and any special requests.",
      zh: "选择现有路线出发，不改行程顺序，只告诉我们时间、人数与特别需求。",
    },
    designLead: {
      en: "Build on an existing route: add or drop destinations, or combine it with your other travel. Please tell us what this journey means to you — a wedding anniversary, a return to a familiar place, a short stay, a business study trip, rest and recovery, and so on. Our travel concierge will reply within 24 hours, marshall our best resources, and tailor an experience you will remember for life.",
      zh: "以现有路线为基础，增减目的地，或与您的其他行程结合，支持深度定制。请务必告诉我们这趟旅程对您的特殊意义（结婚纪念，故地重游，短期旅居，商务考察，疗愈与放松，等等）。旅游管家会在 24 小时内给您回复，调度我们的精华资源，为您定制终身难忘的体验。",
    },
    designSubmitLead: {
      en: "Leave your name and a way to reach you. Our travel concierge will reply in detail within 24 hours.",
      zh: "留下姓名和联系方式。我们的旅游管家会在 24 小时内给您详细回复。",
    },
    bookSteps: [
      { en: "Route & dates", zh: "选择路线与时间" },
      { en: "Who's coming", zh: "同行成员" },
      { en: "Add-ons", zh: "增值服务" },
    ],
    designSteps: [
      { en: "Base route", zh: "选择基础路线" },
      { en: "Destinations", zh: "调整目的地" },
      { en: "Hotel tier", zh: "住宿偏好" },
      { en: "Transport", zh: "交通偏好" },
      { en: "Experiences", zh: "特殊体验" },
    ],
    chooseRoute: { en: "Choose a route", zh: "选择路线" },
    r1Title: { en: "Three Realms Traverse · 14 days", zh: "三境溯游 · 14 日" },
    r1Sub: { en: "Guangxi → Vietnam → Yunnan", zh: "广西 → 越南 → 云南" },
    r1SubLong: {
      en: "Guangxi → Ha Long / Cat Ba / Hanoi / Sapa → Yunnan",
      zh: "广西 → 越南（下龙/吉婆/河内/沙坝）→ 云南",
    },
    r2Title: { en: "The Southern Loop · 10 days", zh: "南疆回环 · 10 日" },
    r2Sub: {
      en: "Nanning → Vietnam → Longzhou → Detian → Nanning",
      zh: "南宁 → 越南 → 龙州 → 德天 → 南宁",
    },
    r2SubLong: {
      en: "Nanning → Vietnam → Friendship Gate → Longzhou → Detian → Nanning",
      zh: "南宁 → 越南 → 友谊关 → 龙州 → 德天 → 南宁",
    },
    r3Title: { en: "Chongzuo Karst · Weizhou Isle · 7 days", zh: "崇左栖山 · 涠洲枕海 · 7 日" },
    r3Sub: {
      en: "Nanning → Chongzuo → Detian → Beihai → Weizhou",
      zh: "南宁 → 崇左 → 德天 → 北海 → 涠洲岛",
    },
    r3SubLong: {
      en: "Nanning → Chongzuo (Black Water River) → Detian → Beihai → Weizhou Island",
      zh: "南宁 → 崇左（黑水河）→ 德天 → 北海 → 涠洲岛",
    },
    travelDates: { en: "Travel dates", zh: "出发时间" },
    datePicker: { en: "Pick dates", zh: "选具体日期" },
    dateText: { en: "Rough dates", zh: "大致时间" },
    dateBrowse: { en: "Just browsing", zh: "先看看" },
    startDate: { en: "Start date", zh: "开始日期" },
    endDateAuto: { en: "End date (auto)", zh: "结束日期（自动）" },
    dateTextPh: {
      en: "e.g. late Nov 2025, or after Chinese New Year…",
      zh: "如：2025年11月下旬，或春节后……",
    },
    dateBrowseNote: {
      en: "No problem — we'll send you the route info and you can reach us when you're ready.",
      zh: "没关系，我们先把路线信息发给您，您确定时间后再联系我们。",
    },
    travelersN: { en: "Travellers: {n} people", zh: "出行人数：{n} 人" },
    groupHint: {
      en: "Select all that apply — helps us tailor the experience",
      zh: "可多选，帮助我们更好地安排体验",
    },
    addOnHint: {
      en: "Multi-select — tick anything you would like us to arrange",
      zh: "可复选，告诉我们您希望额外安排哪些服务",
    },
    specialReq: {
      en: "Any other special requests (optional)",
      zh: "其他特殊需求（选填）",
    },
    specialReqPh: {
      en: "Dietary restrictions, mobility needs, anniversary to celebrate…",
      zh: "饮食禁忌、行动不便、特别纪念日……",
    },
    genBook: { en: "Review booking brief", zh: "查看行程确认单" },
    compiling: { en: "Compiling your booking brief…", zh: "正在整理您的行程确认单…" },
    aiTailoring: {
      en: "Tailoring this boutique route to your party. About a minute…",
      zh: "正在按你的同行与需求微调这条精品线，大约一分钟…",
    },
    aiTweaking: {
      en: "Rebuilding the days from your notes. About a minute…",
      zh: "正在按你的意见重排行程，大约一分钟…",
    },
    bookAiBadge: { en: "AI tailored", zh: "AI 已微调" },
    bookCatalogBadge: { en: "Original route", zh: "原路线" },
    aiFallback: {
      en: "The planner model was unreachable, so this is the original route. You can still add a tweak and retry.",
      zh: "未能连上规划模型，先给出原路线。你仍可写下微调意见再试。",
    },
    tweakLabel: {
      en: "Days stay as designed. Leave any day-by-day notes — fewer walks, no early starts, a sunrise — and our concierge will handle them.",
      zh: "天数保持原路线。如需调整某一天（少走路、不想早起、想看日出等），请留给管家处理。",
    },
    tweakPh: {
      en: "e.g. fewer walks, no early starts, catch a sunrise…",
      zh: "如：少走路、不想早起、想看日出…",
    },
    tweakHint: {
      en: "These notes are sent to our travel concierge with your booking. We do not regenerate a new route here.",
      zh: "这些意见会随预定一起发给旅游管家，不会在站内重新生成路线。",
    },
    rowTweak: { en: "Route notes", zh: "行程调整意见" },
    pdfAgain: { en: "Download updated PDF", zh: "下载更新后的 PDF" },
    summary: { en: "BOOKING SUMMARY", zh: "预定摘要" },
    rowRoute: { en: "Route", zh: "选择路线" },
    rowDates: { en: "Dates", zh: "出发时间" },
    rowPeople: { en: "Travellers", zh: "人数" },
    rowGroup: { en: "Group type", zh: "成员类型" },
    rowAddons: { en: "Add-ons", zh: "附加服务" },
    rowNotes: { en: "Special requests", zh: "特别要求" },
    r1Short: { en: "Three Realms Traverse · 14d", zh: "三境溯游 · 14日" },
    r2Short: { en: "Southern Loop · 10d", zh: "南疆回环 · 10日" },
    r3Short: { en: "Chongzuo & Weizhou · 7d", zh: "崇左 · 涠洲 · 7日" },
    tbcBrowse: { en: "TBC — just browsing", zh: "待定，先看看" },
    tbc: { en: "TBC", zh: "待确认" },
    none: { en: "None", zh: "无" },
    dash: { en: "—", zh: "未选择" },
    peopleUnit: { en: "people", zh: "人" },
    downloadPdf: { en: "Download PDF", zh: "下载 PDF" },
    downloadItin: { en: "Download itinerary PDF", zh: "下载定制行程 PDF" },
    pdfPreparing: { en: "Preparing PDF…", zh: "正在生成 PDF…" },
    pdfFailed: { en: "Could not create the PDF. Try again.", zh: "PDF 生成失败，请再试一次。" },
    pdfRequest: { en: "YOUR REQUEST", zh: "您的填写" },
    pdfItinerary: { en: "ITINERARY", zh: "行程明细" },
    pdfHighlights: { en: "Highlights", zh: "当日安排" },
    pdfDrive: { en: "Drive", zh: "车程" },
    pdfBlurb: { en: "Notes", zh: "导读" },
    pdfGenerated: { en: "Generated {d}", zh: "生成于 {d}" },
    pdfDisclaimer: {
      en: "This is a request brief, not a confirmed booking. A concierge will lock hotels, crossings and timing with you.",
      zh: "此文件为行程确认单草稿，最终酒店、通关与时间以管家确认为准。",
    },
    rowDateMode: { en: "Date preference", zh: "时间方式" },
    rowDuration: { en: "Duration", zh: "总天数" },
    rowHotel: { en: "Hotel tier", zh: "住宿偏好" },
    rowExtra: { en: "Extra destinations", zh: "额外目的地" },
    rowTransportPref: { en: "Transport", zh: "交通偏好" },
    rowSpecial: { en: "Experiences", zh: "特殊体验" },
    rowName: { en: "Name", zh: "姓名" },
    rowContact: { en: "Contact", zh: "联系方式" },
    daysUnit: { en: "days", zh: "天" },
    concierge: {
      en: "Have our concierge contact me",
      zh: "请管家联系我确认更多细节",
    },
    yourName: { en: "Your name", zh: "您的姓名" },
    yourContact: {
      en: "WeChat / WhatsApp / Email",
      zh: "联系方式（微信 / WhatsApp / Email）",
    },
    contactPh: { en: "Your preferred contact", zh: "请填写方便联系的方式" },
    sendTeam: { en: "Send to team", zh: "发送给团队" },
    sending: { en: "Sending…", zh: "发送中…" },
    sentNote: {
      en: "Submitted. Our travel concierge will send you a detailed reply within 24 hours.",
      zh: "已提交！我们的旅游管家会在 24 小时内给您详细回复。",
    },
    startOver: { en: "Start over", zh: "重新填写" },
    err: {
      en: "Check name and WeChat / WhatsApp / email.",
      zh: "请填写姓名，以及微信、WhatsApp 或邮箱。",
    },
    totalDays: { en: "Total days: {n}", zh: "调整总天数：{n} 天" },
    daysMin: { en: "8 days", zh: "8天（精简）" },
    daysMax: { en: "18 days", zh: "18天（深度）" },
    extraHint: {
      en: "Extra stops to add on top of the base route (each ~1–2 days)",
      zh: "在基础路线上额外增加的目的地（可复选，每增加一处约需 1-2 天）",
    },
    extraPicked: {
      en: "{n} stops added — consider ~{days} days total",
      zh: "已选 {n} 处，建议总天数约 {days} 天",
    },
    extraPickedOne: {
      en: "1 stop added — consider ~{days} days total",
      zh: "已选 1 处，建议总天数约 {days} 天",
    },
    transportHint: {
      en: "Multi-select — we will adjust the transport arrangement to match your preferences",
      zh: "可复选，我们会根据您的偏好调整行程中的交通安排",
    },
    expHint: {
      en: "Tell us what experiences matter most — we will weave them into your itinerary",
      zh: "告诉我们您特别想体验的内容，我们会将它们融入行程",
    },
    moreIdeas: { en: "Anything else (optional)", zh: "其他想法（选填）" },
    moreIdeasPh: {
      en: "e.g. extra night in Sapa, no overnight train, elderly traveller…",
      zh: "如：第3天想多留一天，不想坐夜车，有老人同行……",
    },
    genDesign: { en: "Submit request", zh: "提交需求" },
    aiPlanning: { en: "AI planning", zh: "AI 行程规划中" },
    rebuilding: {
      en: "Rebuilding your itinerary based on your preferences…",
      zh: "正在根据您的偏好重新规划行程……",
    },
    sk1: { en: "Day 1 · Nanning", zh: "第 1 天 · 南宁" },
    sk2: { en: "Day 2–4 · Detian / Ha Long", zh: "第 2–4 天 · 德天 / 下龙" },
    sk3: { en: "Day 5–7 · Cat Ba / Hanoi", zh: "第 5–7 天 · 吉婆 / 河内" },
    sk4: { en: "Day 8–9 · Sapa Terraces", zh: "第 8–9 天 · 沙坝梯田" },
    sk5: { en: "Day 10–14 · Yunnan", zh: "第 10–14 天 · 云南" },
    aiReady: { en: "AI Generated", zh: "AI 已生成" },
    customR1: { en: "Three Realms Traverse · Custom", zh: "三境溯游 · 定制版" },
    customR2: { en: "The Southern Loop · Custom", zh: "南疆回环 · 定制版" },
    customLead: {
      en: "{n} days, tailored to your preferences. Tap each day to expand, then confirm when ready.",
      zh: "共 {n} 天，已融入您的偏好。点击每天查看详情，满意后点击「确认行程」。",
    },
    keepAdjust: { en: "Keep adjusting", zh: "继续调整" },
    confirmItin: { en: "Confirm itinerary", zh: "确认行程" },
    itinConfirmed: { en: "Itinerary confirmed", zh: "行程已确认" },
    confirmLead: {
      en: "Download the PDF or fill in your contact details to have our concierge reach out.",
      zh: "请选择下载 PDF，或填写联系方式请管家联系您确认细节。",
    },
    next: { en: "Next", zh: "下一步" },
    back: { en: "Back", zh: "上一步" },
  },
  contact: {
    kicker: { en: "Contact", zh: "联系我们" },
    title: { en: "Send us a message", zh: "给我们留言" },
    nameLabel: { en: "Your name (optional)", zh: "您的称呼（可选）" },
    emailLabel: { en: "Your email", zh: "您的邮箱" },
    emailPh: { en: "name@example.com", zh: "name@example.com" },
    messageLabel: { en: "Your message", zh: "留言内容" },
    messagePh: { en: "e.g. We are a family of 12 — I'd like 1:1 conversations to fully customise my trip…", zh: "我们有12个人的一大家子，我希望一对一沟通，完全定制我想要的旅行……" },
    submit: { en: "Submit request", zh: "提交留言" },
    sending: { en: "Sending…", zh: "发送中…" },
    sentTitle: { en: "Thank you", zh: "感谢留言" },
    sentBody: { en: "We'll get back to you within 24 hours.", zh: "我们会在 24 小时内回复您。" },
    close: { en: "Close", zh: "关闭" },
    err: { en: "Please fill in your email and message.", zh: "请填写邮箱与留言内容。" },
  },
  trust: {
    rating: { en: "{avg} · {n} verified reviews", zh: "{avg} · {n} 条真实评价" },
    years: { en: "8 years operating", zh: "8 年运营" },
    travellers: { en: "500+ travellers served", zh: "服务 500+ 位旅行者" },
    guide: { en: "Licensed local guides", zh: "全程持证向导" },
    insurance: { en: "Travel insurance included", zh: "含旅游意外险" },
    cancel: { en: "Free cancellation 30 days out", zh: "出发前 30 天免费取消" },
  },
  dock: {
    tours: { en: "Tours", zh: "路线" },
    plan: { en: "Plan", zh: "定制" },
  },
  faq: {
    h2: { en: "Things you might want to know", zh: "出行前，您可能想知道" },
    filterAll: { en: "All topics", zh: "全部分类" },
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
    brand: { en: "有闲旅行", zh: "有闲旅行" },
    brandEn: {
      en: "Leisure Time International Travel Service",
      zh: "Leisure Time International Travel Service",
    },
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
  const direct = tx[locale];
  if (typeof direct === "string" && direct.trim()) return direct;
  if (tx.src && tx.src !== locale) {
    const native = tx[tx.src as Locale];
    if (typeof native === "string" && native.trim()) return native;
  }
  if (tx.en.trim()) return tx.en;
  if (tx.zh.trim()) return tx.zh;
  return "";
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
