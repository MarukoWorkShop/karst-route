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
    food: { en: "Food Tips", zh: "饮食提示" },
    time: { en: "Time", zh: "时间" },
    timeBeijing: { en: "Beijing (UTC+8)", zh: "北京（UTC+8）" },
    timeLocal: { en: "Your time", zh: "您的时区" },
    timeOnline: { en: "{brand} concierge online · ~5-min reply", zh: "{brand}专属顾问在线，平均 5 分钟内响应" },
    timeNight: { en: "Local night — send your request and we'll pick it up first at Beijing 9:00", zh: "当前为当地夜间，您可直接提交定制意向，我们将在北京时间早 9:00 优先处理" },
  },
  pwa: {
    kicker: { en: "QUICK ACCESS", zh: "快捷访问" },
    title: { en: "Keep {brand} close", zh: "把 {brand} 带在身边" },
    body: {
      en: "Add it to your Home Screen and return to your journeys like an app.",
      zh: "添加到主屏幕，下次像打开 App 一样快速查看旅行灵感与私人路书。",
    },
    add: { en: "Add to Home Screen", zh: "添加到主屏幕" },
    later: { en: "Not now", zh: "暂不" },
    gotIt: { en: "Got it", zh: "知道了" },
    openIcon: { en: "Open the app icon in a new tab", zh: "在新标签页打开 App 图标" },
    ios: {
      title: { en: "Add from Safari", zh: "从 Safari 添加" },
      steps: [
        {
          en: "Tap the Share button in Safari's toolbar.",
          zh: "点击 Safari 浏览器工具栏中的“分享”按钮。",
        },
        {
          en: 'Scroll down, choose "Add to Home Screen", then tap Add.',
          zh: "向下滑动，选择“添加到主屏幕”，再点击“添加”。",
        },
      ],
    },
    browser: {
      title: { en: "Add from your browser", zh: "从浏览器添加" },
      steps: [
        {
          en: "Open your browser menu.",
          zh: "打开浏览器菜单。",
        },
        {
          en: 'Choose "Install app" or "Add to Home Screen".',
          zh: "选择“安装应用”或“添加到主屏幕”。",
        },
      ],
    },
    inApp: {
      title: { en: "Open in your browser first", zh: "请先在浏览器中打开" },
      steps: [
        {
          en: 'Open the app menu and choose "Open in browser".',
          zh: "点击右上角菜单，选择“在浏览器中打开”。",
        },
        {
          en: 'Then use the browser menu to choose "Add to Home Screen".',
          zh: "再打开浏览器菜单，选择“添加到主屏幕”。",
        },
      ],
    },
  },
  hero: {
    ctaA: {
      en: "Our Boutique Routes",
      zh: "最受欢迎的精品线路",
    },
    ctaB: {
      en: "Craft Your Trip",
      zh: "设计定制私家线路",
    },
    ctaExperience: {
      en: "Featured local experiences",
      zh: "精选在地体验小产品",
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
    r2Regions: { en: "Nanning · Ha Long · Cat Ba · Hanoi · Sapa · Longzhou · Nanning", zh: "南宁 · 下龙 · 吉婆 · 河内 · 沙坝 · 龙州 · 南宁" },
    r2Feature: {
      en: "A closed loop from Nanning across 11 days: Dongxing into Ha Long and Cat Ba, Hanoi’s Old Quarter, the metre-gauge sleeper to Sapa, then Friendship Pass home to Longzhou for Tianqin music and sugarcane cycling — Detian and Mingshi before the city closes the circle.",
      zh: "一条以南宁为原点的十一日闭环：东兴出境进下龙与吉婆，河内老街与百年米轨上沙坝，再经友谊关回到龙州天琴壮寨与蔗海骑行，德天瀑布与明仕田园之后回到南宁。进出无缝，文化密度极高。",
    },
    duration: { en: "Duration", zh: "行程天数" },
    entry: { en: "Entry", zh: "入境" },
    exit: { en: "Exit", zh: "出境" },
    for: { en: "Best for", zh: "适合" },
    r1Days: { en: "14 days", zh: "14 日" },
    r1Entry: { en: "Nanning", zh: "南宁" },
    r1Exit: { en: "Kunming", zh: "昆明" },
    r1For: { en: "Adventure", zh: "探险" },
    r2Days: { en: "11 days", zh: "11 日" },
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
    r2Tab: { en: "Route 2 · 11 Days", zh: "路线二 · 11日" },
    r3Tab: { en: "Route 3 · 7 Days", zh: "路线三 · 7日" },
    collapseItinerary: { en: "Collapse itinerary", zh: "收起行程" },
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
    moduleTitle: {
      en: "All-inclusive Boutique Routes",
      zh: "经典全包路线",
    },
    moduleSub: {
      en: "Best for first-time visitors who want a zero-worry, seamless vacation.",
      zh: "最适合第一次来中国、或者想彻底省心度假的人。",
    },
    priceAdult: { en: "Adult", zh: "成人" },
    priceChild: { en: "Child", zh: "儿童" },
    fxNote: {
      en: "Approximate · final quote — enquire below",
      zh: "最终价格请在页面底部垂询",
    },
    priceFrom: { en: "from", zh: "起" },
    pricePerPerson: { en: "/ person", zh: "/人" },
    priceEach: { en: "each", zh: "/人" },
    /** 低价端人数档，如 7-10人团 */
    priceBandGroup: {
      en: "{min}-{max} people",
      zh: "{min}-{max}人团",
    },
    /** 高价端（通常 ≤3）：「3人以下」 */
    priceBandUpTo: {
      en: "up to {max} people",
      zh: "{max}人以下",
    },
    /** 两端价之间的连接：中文用 –，英文用 and（对齐示例 Sample Price） */
    priceBandJoin: { en: " and ", zh: "–" },
    priceBandHint: {
      en: "2–10 travellers · market tiers",
      zh: "2–10 人团 · 市场档",
    },
    included: { en: "What's included", zh: "费用包含" },
    excluded: { en: "Not included", zh: "费用不含" },
    quote: { en: "Get a quote", zh: "获取报价" },
    quoteBar: {
      en: "Like this route! View the itinerary and details",
      zh: "喜欢这条线路！查看路书与详情",
    },
    quoteBarLead: { en: "Like this route!", zh: "喜欢这条线路！" },
    quoteBarDetail: { en: "View the itinerary and details", zh: "查看路书与详情" },
    reviews: { en: "{n} reviews", zh: "{n} 条评价" },
    expandOpen: { en: "Expand route card", zh: "展开线路卡片" },
    exploreTrip: { en: "Explore trip", zh: "探索行程" },
    expandClose: { en: "Close", zh: "关闭" },
    featureMore: { en: "Show full description", zh: "展开全部介绍" },
    featureLess: { en: "Show less", zh: "收起介绍" },
    videoSoon: {
      en: "Drop intro.mp4 in this route folder to show the video",
      zh: "将 intro.mp4 放入本线路文件夹即可显示视频",
    },
  },
  experience: {
    h2: { en: "Profoundly Local Experiences", zh: "在地小体验" },
    moduleSub: {
      en: "Best for those traveling at a loose pace, or looking to add unique local experiences to their current journey.",
      zh: "最适合喜欢慢节奏、或者需要为原本行程增加新奇体验的旅人。",
    },
    moduleDesc: {
      en: "If you hate fixed itineraries and just want to stay in one charming place to experience real local life, start here. These are half-day or 1-day micro-activities that you can mix and match however you like. It’s the perfect way to gap your business trip, design your own slow living, and look forward to unexpected little surprises.",
      zh: "如果你讨厌被固定的路线牵着走，只想挑一个地方安安静静呆上几天，深度体验一把本地人的生活，从这里开始。这些都是半天或一天的碎片化活动，你可以像挑零食一样随意加进你的行程里。无论你是想深度体验本地人生，还是想跟自己原有的商务考察计划做无缝衔接，这里都非常轻松、随意，并且随时期待一些好玩的小惊喜。",
    },
    kicker: { en: "Life changing experience", zh: "Life changing experience" },
    highlights: { en: "Highlights", zh: "旅途亮点" },
    stories: { en: "Real travel stories", zh: "真实的旅行故事" },
  },
  light: {
    cta: { en: "VIEW ALL", zh: "查看全部在地体验小产品" },
    ctaSub: {
      en: "Half-day to one-day add-ons, bookable on their own or with any route",
      zh: "半日到一日的小产品，可单独预订，也可挂在任意线路前后",
    },
    kicker: { en: "Light travel experiences", zh: "轻旅行体验" },
    allTitle: { en: "Popular activities", zh: "热门活动小产品" },
    priceFrom: { en: "from", zh: "起" },
    pick: { en: "Choose an experience", zh: "选择体验" },
    duration: { en: "Duration", zh: "时长" },
    group: { en: "Group size", zh: "成团人数" },
    season: { en: "Best season", zh: "最佳季节" },
    highlights: { en: "What you'll do", zh: "体验内容" },
    included: { en: "What's included", zh: "费用包含" },
    reviewsTitle: { en: "Guest notes", zh: "客人评价" },
    reviewsEmpty: { en: "No guest notes for this experience yet.", zh: "这个体验还没有客人评价。" },
    priceNote: {
      en: "Priced by party size and date — send a brief and we'll quote it.",
      zh: "按人数与日期报价，提交需求后为您核算。",
    },
    quote: { en: "Enquire", zh: "咨询报价" },
    back: { en: "Popular list", zh: "热门列表" },
    routes: { en: "Route options", zh: "路线小产品" },
    routesSub: {
      en: "Bookable add-ons — alone or paired with a longer trip.",
      zh: "可单独加订的小产品——可单独体验，也可挂在长线前后。",
    },
    interestedToast: { en: "Interested", zh: "好玩" },
    interestedLink: {
      en: "Experiences I’m interested in ({n})",
      zh: "我感兴趣的小体验（{n}项）",
    },
    interestedEmpty: {
      en: "Tap the heart on any add-on to save it here.",
      zh: "点亮小产品卡片右上角的桃心，会出现在这里。",
    },
    interestedTitle: { en: "Saved experiences", zh: "我感兴趣的小体验" },
    likeAria: { en: "Mark as interested", zh: "标记感兴趣" },
    unlikeAria: { en: "Remove from interested", zh: "取消感兴趣" },
    interestedAdults: { en: "Adults", zh: "大人" },
    interestedChildren: { en: "Children", zh: "孩子" },
    interestedChildNote: {
      en: "Children count toward the headcount. Under 3 travel free — tell us ages in the enquiry.",
      zh: "儿童计入单价人数；3 岁以下免费，询价时请告知年龄。",
    },
    interestedShowTotal: { en: "Reference total", zh: "参考价格合计" },
    interestedHideTotal: { en: "Hide total", zh: "收起合计" },
    interestedTotalLabel: { en: "Reference total", zh: "参考合计" },
    interestedTotalNote: {
      en: "Rounded to the nearest ¥10 · reference only, not an offer.",
      zh: "金额已十位取整 · 仅供参考，不构成要约。",
    },
    interestedEnquire: { en: "Email this list to concierge", zh: "发邮件咨询客服" },
    interestedBackList: { en: "Back to list", zh: "返回清单" },
    interestedName: { en: "Your name", zh: "您的姓名" },
    interestedContact: { en: "Email / WhatsApp", zh: "邮箱 / WhatsApp" },
    interestedNotes: { en: "Notes (optional)", zh: "备注（可选）" },
    interestedNotesPh: {
      en: "Dates, under-3 ages, or anything we should know…",
      zh: "出行日期、3 岁以下儿童年龄，或其他说明…",
    },
    interestedSend: { en: "Send enquiry", zh: "发送询单" },
    interestedSending: { en: "Sending…", zh: "发送中…" },
    interestedSentTitle: { en: "List sent", zh: "清单已送出" },
    interestedSentBody: {
      en: "Our concierge will reply within 24 hours with a detailed quote.",
      zh: "旅游管家将在 24 小时内回复详细报价。",
    },
    interestedFormErr: {
      en: "Please enter your name and email / WhatsApp.",
      zh: "请填写姓名，以及邮箱或 WhatsApp。",
    },
    interestedRemove: { en: "Remove", zh: "移除" },
    interestedRemoveConfirm: {
      en: "Adults and children are both 0. Remove this experience from your list?",
      zh: "大人与孩子数量都为 0，是否移除此项？",
    },
    interestedLineEst: { en: "≈ {n}", zh: "约 {n}" },
    meals: { en: "Meals along the route", zh: "线路餐食" },
    mealsSub: {
      en: "Village tables you can pair with a study day — hearth, riverside, or hillside feast.",
      zh: "可与考察日搭配的村落餐桌——火塘、江边或半山家宴。",
    },
  },
  about: {
    website: { en: "Official website", zh: "前往官网" },
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
    ctaTitle: { en: "Start planning your trip", zh: "开始规划这趟旅程" },
    ctaSub: {
      en: "See boutique route prices, or design a deeper custom journey",
      zh: "查看精品线路价格或深度定制",
    },
    tabBook: {
      en: "Book a boutique route",
      zh: "直接预订精品路线",
    },
    tabDesign: {
      en: "Custom itinerary",
      zh: "深度定制方案",
    },
    bookLead: {
      en: "Travel one of our curated routes as designed — just tell us when, who and any special requests.",
      zh: "选择现有路线出发，不改行程顺序，只告诉我们时间、人数与特别需求。",
    },
    baseRouteLabel: { en: "Base route", zh: "感兴趣的基础路线" },
    notSure: { en: "Not sure yet", zh: "还不确定" },
    designSubmitLead: {
      en: "Leave your name and a way to reach you. Our travel concierge will reply in detail within 24 hours.",
      zh: "留下姓名和联系方式。我们的旅游管家会在 24 小时内给您详细回复。",
    },
    bookSteps: [
      { en: "Route & dates", zh: "选择路线与时间" },
      { en: "Who's coming", zh: "同行成员" },
      { en: "Light experiences", zh: "轻体验" },
      { en: "Other add-ons", zh: "其他增值服务" },
    ],
    designSteps: [
      { en: "Party & length", zh: "人数与天数" },
      { en: "Dates & connections", zh: "出发时间与行程衔接" },
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
    r2Title: { en: "The Southern Loop · 11 days", zh: "南疆回环 · 11 日" },
    r2Sub: {
      en: "Nanning → Ha Long / Cat Ba → Hanoi / Sapa → Longzhou → Detian → Nanning",
      zh: "南宁 → 下龙／吉婆 → 河内／沙坝 → 龙州 → 德天 → 南宁",
    },
    r2SubLong: {
      en: "Nanning → Dongxing → Ha Long → Cat Ba → Hanoi → Sapa → Friendship Gate → Longzhou → Detian → Nanning",
      zh: "南宁 → 东兴 → 下龙 → 吉婆 → 河内 → 沙坝 → 友谊关 → 龙州 → 德天 → 南宁",
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
      en: "No rush — we'll share the route details first. Note that pricing and itineraries are seasonal; not every departure window is available year-round.",
      zh: "没关系，我们先把路线信息发给您。报价与行程受季节影响，无法保证全年各时段均可出发。",
    },
    travelersN: { en: "Travellers: {n} people", zh: "出行人数：{n} 人" },
    groupHint: {
      en: "Select all that apply — helps us tailor the experience",
      zh: "可多选，帮助我们更好地安排体验",
    },
    lightHint: {
      en: "Optional. Arranged according to the actual itinerary. Not included in the group total for now.",
      zh: "可选。根据实际情况安排，暂不计团费总额。",
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
    rowPlaces: { en: "Places", zh: "途经" },
    rowDates: { en: "Dates", zh: "出发时间" },
    rowPeople: { en: "Travellers", zh: "人数" },
    rowGroup: { en: "Group type", zh: "成员类型" },
    rowLight: { en: "Light experiences", zh: "轻体验" },
    rowAddons: { en: "Other add-ons", zh: "其他增值服务" },
    rowNotes: { en: "Special requests", zh: "特别要求" },
    r1Short: { en: "Three Realms Traverse · 14d", zh: "三境溯游 · 14日" },
    r2Short: { en: "Southern Loop · 11d", zh: "南疆回环 · 11日" },
    r3Short: { en: "Chongzuo & Weizhou · 7d", zh: "崇左 · 涠洲 · 7日" },
    tbcBrowse: { en: "TBC — just browsing", zh: "待定，先看看" },
    tbc: { en: "TBC", zh: "待确认" },
    none: { en: "None", zh: "无" },
    dash: { en: "—", zh: "未选择" },
    peopleUnit: { en: "people", zh: "人" },
    adults: { en: "Adults", zh: "成人" },
    children: { en: "Children", zh: "儿童" },
    estBadge: { en: "Reference only", zh: "仅供参考" },
    estTitle: { en: "Reference quote", zh: "参考报价" },
    estForParty: {
      en: "{n} travellers · {a} adults + {c} children",
      zh: "出行 {n} 人（{a} 成人 + {c} 儿童）",
    },
    estPerAdult: { en: "Adult", zh: "成人" },
    estPerChild: { en: "Child", zh: "儿童" },
    estMarketAdult: { en: "Adult market rate", zh: "成人市场报价" },
    estMarketChild: { en: "Child market rate", zh: "儿童市场报价" },
    estPerUnit: { en: "/ person", zh: "/ 人" },
    estSubtotal: { en: "Reference total", zh: "参考小计" },
    estChildrenHint: {
      en: "Child rate in the quote is for ages 4–11; under 3 free; 12+ as adult (with bed). Email us the children’s details.",
      zh: "报价中的儿童价适用于 4–11 岁；3 岁以下免费；12 岁及以上按成人（占床）。请邮件告知儿童详细信息。",
    },
    estDisclaimer: {
      en: "This is a reference quote only and does not constitute an offer. Your final price will be confirmed by the travel concierge.",
      zh: "以上仅为参考报价，不构成要约；最终价格以旅游管家确认为准。",
    },
    estFxNote: {
      en: "Shown in USD/EUR via reference FX (updated about daily). Switch currency above; Chinese site shows CNY.",
      zh: "英文站按参考汇率显示美元/欧元；中文站显示人民币。",
    },
    estConciergeHint: {
      en: "Leave your email or WhatsApp in the next steps — a concierge will contact you with a detailed quote.",
      zh: "请在后续步骤留下邮箱或 WhatsApp，旅游管家将与您联系并出具详细报价。",
    },
    estUnavailable: {
      en: "This route is quoted per party — send the brief and we'll price it for your exact group.",
      zh: "该线路按团队单独报价：提交需求后，管家将按您的具体人数核算。",
    },
    estOversize: {
      en: "We couldn't build a reference quote for this party size — send the brief and the concierge will price it.",
      zh: "暂无法自动估算该人数组合——请直接提交需求，管家会按实际人数报价。",
    },
    estFleetHint: {
      en: "Party size exceeds one vehicle — this reference assumes a larger vehicle or an extra car; the concierge will confirm the fleet.",
      zh: "人数超过单车载客：参考价已按换更大车型或加车估算，最终车队以管家确认为准。",
    },
    /** 行程定制模块下方说明 */
    footNotesTitle: { en: "Booking Information & Quality Commitment", zh: "预订须知与品质承诺" },
    footNotes: [
      {
        title: { en: "Child Policy", zh: "儿童政策" },
        body: {
          en: "Children under 3 travel free. Children aged 4–11 qualify for child rates, while those aged 12 and above are charged at the standard adult rate (with bed included). To help us provide the best possible care, please email us the details of any accompanying children after confirming your booking.",
          zh: "3 岁以下儿童免费；4–11 岁享受儿童价；12 岁及以上按成人标准（占床）。为了提供更好的照顾，请在预订后通过邮件告知我们随行儿童的详细信息。",
        },
      },
      {
        title: { en: "100% Pure Travel (No Shopping Stops)", zh: "纯玩无购物" },
        body: {
          en: "We strictly adhere to our no-shopping commitment. We will never take you to commission-based shopping spots, ensuring your valuable holiday time is spent entirely on enjoying the scenery. Our guides and drivers are carefully selected, professionally trained, and paid a fair wage. More than just service providers, they are friendly, patient companions for your journey. While we may not be the cheapest option, we pride ourselves on being one of the most trusted.",
          zh: "我们坚守纯玩无购物的品质承诺，绝不带您去任何佣金购物点，把宝贵的旅行时间完全留给风景。我们的导游与司机均经过严格筛选与专业培训，享有合理的薪酬。他们不仅是服务者，更是您旅途中友好、耐心的陪伴者。我们或许不是价格最低的选择，但一定是您最值得信赖的旅行伙伴。",
        },
      },
      {
        title: { en: "Meals", zh: "关于餐食" },
        body: {
          en: "Aside from meals explicitly listed as included in the itinerary, your guide will recommend authentic local restaurants where you can order and pay according to your preferences. Your guide will also thoughtfully remind you the day before to prepare some snacks for between meals.",
          zh: "除行程中已包含的餐食外，导游会为您推荐地道的当地特色餐厅，您可以根据喜好自由点餐并自付费用。此外，导游也会在前一天贴心提醒您准备一些随身零食。",
        },
      },
      {
        title: { en: "Gratuities & Tipping", zh: "关于小费" },
        body: {
          en: "Gifts and tips for locals, guides, or drivers are entirely voluntary and never mandatory. If you are pleased with the exceptional service provided by your guide and driver, a tip at the end of the tour is a wonderful way to show your appreciation.",
          zh: "行程中的礼品与小费纯属自愿，绝非强制。如果您对导游和司机的贴心服务感到满意，可在行程结束时适当给予小费以示鼓励。",
        },
      },
      {
        title: { en: "Other Expenses", zh: "其他费用" },
        body: {
          en: "Personal expenses are not included in the tour price. If you require a private room to yourself, a single supplement will apply. Thank you for choosing us. We look forward to embarking on a wonderful journey with you!",
          zh: "团费不含个人消费。如您需要独享单间，请补足单房差。感谢您的信任，期待与您开启一段美好的旅程！",
        },
      },
    ],
    rowEstimate: { en: "Reference quote", zh: "参考报价" },
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
    rowDuration: { en: "Preferred total days", zh: "期望总天数" },
    durationNoteLabel: { en: "About the length", zh: "关于天数" },
    durationNote: {
      en: "The above is your preferred length — the final itinerary is designed by your concierge based on the cities visited and your specific requests.",
      zh: "以上是您的期望天数；实际安排会根据到访城市与您的具体要求，由旅行管家量身设计。",
    },
    rowHotel: { en: "Hotel tier", zh: "住宿偏好" },
    rowExtra: { en: "Extra destinations", zh: "额外目的地" },
    rowTransportPref: { en: "Transport", zh: "交通偏好" },
    rowSpecial: { en: "Experiences", zh: "特殊体验" },
    rowName: { en: "Name", zh: "姓名" },
    rowContact: { en: "Email / WhatsApp", zh: "邮箱 / WhatsApp" },
    daysUnit: { en: "days", zh: "天" },
    concierge: {
      en: "Have our concierge contact me",
      zh: "请管家联系我确认更多细节",
    },
    yourName: { en: "Your name", zh: "您的姓名" },
    title: { en: "Title", zh: "称谓" },
    titleSelect: { en: "Select", zh: "请选择" },
    titles: [
      { id: "mr", en: "Mr", zh: "先生" },
      { id: "mrs", en: "Mrs", zh: "夫人" },
      { id: "ms", en: "Ms", zh: "女士" },
      { id: "miss", en: "Miss", zh: "小姐" },
      { id: "dr", en: "Dr", zh: "博士" },
      { id: "mx", en: "Mx", zh: "其他" },
    ],
    firstName: { en: "First name", zh: "名" },
    lastName: { en: "Last name", zh: "姓" },
    yourContact: {
      en: "Email or WhatsApp",
      zh: "邮箱或 WhatsApp",
    },
    contactPh: {
      en: "Email or WhatsApp — for a detailed quote from the concierge",
      zh: "邮箱或 WhatsApp，方便管家发送详细报价",
    },
    sendTeam: { en: "Send to team", zh: "发送给团队" },
    sending: { en: "Sending…", zh: "发送中…" },
    sentNote: {
      en: "Submitted. Our travel concierge will send you a detailed reply within 24 hours.",
      zh: "已提交！我们的旅游管家会在 24 小时内给您详细回复。",
    },
    startOver: { en: "Start over", zh: "重新填写" },
    rewriteAll: { en: "Rewrite all", zh: "全部重写" },
    err: {
      en: "Please fill in title, first name, last name, and email or WhatsApp.",
      zh: "请填写称谓、名、姓，以及邮箱或 WhatsApp。",
    },
    sendFail: {
      en: "Couldn't send just now — please retry, or reach us on WeChat / WhatsApp.",
      zh: "暂时没发送成功，请稍后重试；也可以直接加管家微信或 WhatsApp 联系我们。",
    },
    failDialogTitle: {
      en: "The network isn't cooperating",
      zh: "网络好像不太顺畅",
    },
    failDialogBody: {
      en: "Your request didn't reach our concierge just now — almost always a network hiccup. You can simply try again in a moment, or use any of the ways below to reach us directly. Your plan won't be lost.",
      zh: "刚才的需求没能发送给管家，多数是网络原因。稍等片刻再试几次通常就好；也可以用下面的任何方式直接找到管家。您填写的计划不会丢失。",
    },
    failRetry: { en: "Try again", zh: "再试一次" },
    fallbackTitle: {
      en: "Or reach us directly",
      zh: "也可以这样联系我们",
    },
    fallbackWechat: { en: "WeChat ID（tap to copy）", zh: "微信号（点击复制）" },
    fallbackWhatsapp: { en: "Message us on WhatsApp →", zh: "WhatsApp 联系我们 →" },
    fallbackDownload: { en: "Download my request as PDF", zh: "下载我的需求单 PDF" },
    copyHint: { en: "tap to copy", zh: "点击复制" },
    copied: { en: "copied ✓", zh: "已复制 ✓" },
    totalDays: { en: "Preferred length: {n}", zh: "期望总天数：{n}" },
    daysMin: { en: "8 days or fewer", zh: "小于等于8天" },
    daysMax: { en: "18 days or more", zh: "大于等于18天" },
    entryCityLabel: {
      en: "Arrival city — where are you coming from?",
      zh: "入口城市 —— 您从哪里出发 / 抵达？",
    },
    entryCityPh: { en: "e.g. Guangzhou", zh: "例如：广州" },
    nextDestLabel: {
      en: "Where does your journey continue after this trip?",
      zh: "行程结束后，您的下一站是哪里？",
    },
    nextDestPh: { en: "e.g. back home, or on to Chengdu", zh: "例如：返回家中，或继续前往成都" },
    linkNeedsLabel: {
      en: "Connections with other journeys (optional, multi-select)",
      zh: "与其他旅程的衔接（可多选；不选即暂不需要）",
    },
    customDestLabel: { en: "Other destinations (free text)", zh: "其他目的地（自由填写）" },
    customDestPh: {
      en: "e.g. Weizhou Island, Huangyao Ancient Town… separate multiple places with commas.",
      zh: "例如：涠洲岛、黄姚古镇……多个地点用逗号隔开。",
    },
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
      en: "Every light experience is listed here. Ones you hearted are already selected — add or remove any. Prices are not shown.",
      zh: "这里列出全部轻体验小产品。红心标过的已经勾上，可以再增减。此处不显示价格。",
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
  cookie: {
    noteBefore: {
      en: "This website utilizes cookies to optimize performance and tailor an experience just for you. By continuing to use our site, you accept our ",
      zh: "本网站利用 Cookie 优化界面性能并量身定制您的专属体验。继续使用本网站即代表您接受我们的",
    },
    privacy: { en: "Privacy Policy", zh: "隐私条款" },
    noteAfter: {
      en: " and Cookie Practices.",
      zh: "与 Cookie 政策。",
    },
    accept: { en: "Accept", zh: "接受" },
  },
  privacy: {
    title: { en: "Privacy Policy", zh: "隐私政策" },
    back: { en: "Back to the site", zh: "返回首页" },
    sections: [
      {
        h: { en: "Data We Collect and Purposes", zh: "我们收集的数据与使用目的" },
        items: [
          {
            lead: { en: "Anonymous Click Analytics", zh: "匿名点击统计" },
            body: {
              en: "When you browse our website, we record your click actions, pages visited, and time spent. Please rest assured that this data is entirely anonymous and de-identified. We collect this information solely to statistically understand which travel routes are more popular and to optimize website user experience. We never link, and have no way to link, these click actions to your real identity.",
              zh: "当您浏览本站时，我们会记录您的点击动作、访问页面和停留时间。请您放心，这些数据是完全匿名且去中心化的。我们收集这些数据纯粹是为了统计哪些旅游路线更受欢迎，从而优化网站体验。我们绝不会、也无法将这些点击动作与您的真实身份进行关联。",
            },
          },
          {
            lead: { en: "Itinerary Consultation", zh: "行程咨询" },
            body: {
              en: "This website does not feature a member registration system, and we do not maintain a user database. Only when you actively submit an inquiry form or send us an email will we collect the contact details (e.g., name, email, phone number) and preferences you provide. This information is strictly used to deliver your customized travel services.",
              zh: "本站不设会员注册系统，我们不会在后台建立您的个人账户。只有当您主动填写表单或发送邮件向我们咨询行程时，我们才会收集您提供的联系方式（如姓名、邮箱、电话）及行程偏好。这些信息仅用于为您提供定制化的旅游咨询服务。",
            },
          },
        ],
      },
      {
        h: {
          en: "On-Device Privacy Mode: Your Data Stays on Your Device",
          zh: "独创的本地隐私模式：我的网站，您的设备",
        },
        items: [
          {
            lead: { en: "100% Localized", zh: "完全本地化" },
            body: {
              en: "We firmly believe in data minimization. Before you actively initiate an email consultation, all your private interactions on our site—including your favorited destinations and saved itineraries—are stored 100% locally within your current browser (LocalStorage).",
              zh: "我们坚持“非必要不收集”的原则。在您主动发邮件咨询之前，您在网站上的所有私密操作（如：收藏的景点、暂存的行程单、您的偏好设置）将100% 存储在您当前的浏览器和设备本地（LocalStorage）。",
            },
          },
          {
            lead: { en: "We Cannot Access It", zh: "我们读不到" },
            body: {
              en: "Our servers do not sync, store, or have access to any of this local data. You remain entirely untracked and anonymous on our platform until you choose to contact us.",
              zh: "我们的服务器不会同步、也无法读取这些本地数据。如果您不主动联系我们，您在互联网上就是完全隐形且自由的。",
            },
          },
          {
            lead: { en: "A Friendly Reminder", zh: "风险提示" },
            body: {
              en: "Because you are in absolute control of this data, clearing your browser cache, using incognito mode, or switching devices will permanently erase your saved itineraries.",
              zh: "由于数据完全由您掌控，一旦您清理了浏览器缓存、使用隐私模式或更换了设备，这些本地收藏和暂存的行程将会彻底消失。",
            },
          },
        ],
      },
      {
        h: { en: "Your Privacy Rights & Data Erasure", zh: "您的隐私权利与数据擦除" },
        p: {
          en: "No matter where you are (whether the EU GDPR, China's Personal Information Protection Law, or the California CCPA applies), we respect your control over your data in the same way. Because we do not keep a member database, the clicks and favorites left on your device can be wiped completely in one step at any time by clearing your browser cache. If you have sent us an inquiry email, you may reply to that email, or use the contact details at the bottom of the page, and ask us to permanently delete or anonymize your email inquiry records.",
          zh: "无论您身处何地（无论适用欧盟 GDPR、中国《个人信息保护法》还是美国加州 CCPA），我们都一视同仁地尊重您对数据的控制权。由于我们没有会员数据库，您留在本地的点击和收藏数据您可以随时通过清理浏览器缓存来实现“一键彻底擦除”。如果您曾向我们发送过咨询邮件，您可以随时回复该邮件或通过底部联系方式，要求我们永久删除或匿名化您的邮件咨询记录。",
        },
      },
    ],
  },
  terms: {
    title: { en: "Terms of Service", zh: "服务条款" },
    back: { en: "Back to the site", zh: "返回首页" },
    sections: [
      {
        h: { en: "Booking Confirmation Standards", zh: "预订生效标准" },
        p: {
          en: "Submitting an itinerary inquiry form or sending an email does not constitute a successful booking. A booking becomes legally binding only after you have confirmed the final itinerary with us, signed the formal agreement, paid the full amount (or agreed deposit), and received a \"Booking Confirmation\" email containing a unique booking ID from us.",
          zh: "在本站提交行程咨询表单或发送邮件并不视为预订成功。只有当您与我们确认最终行程、签署正式确认书并支付全额团款（或约定的定金），且收到我们发送的带有唯一编号的“预订确认邮件（Booking Confirmation）”后，您的旅游预订方正式具有法律效力。",
        },
      },
      {
        h: { en: "Information Required From You", zh: "需要您提供的信息" },
        p: {
          en: "To ensure seamless travel arrangements, hotel/flight bookings, and destination compliance, you must provide accurate and valid information for all travelers at the time of formal booking, including but not limited to: Full Passport Names, Passport Numbers, Date of Birth, Nationality, Contact Information, and any essential medical or dietary requirements.",
          zh: "为了能够为您顺利安排行程、预订机票/酒店以及满足目的地的合规要求，在正式预订时您必须提供所有出行人的真实有效信息，包括但不限于：护照姓名、护照号码、出生日期、国籍、联系电话以及任何必要的特殊健康或饮食需求。",
        },
      },
      {
        h: { en: "Inclusions and Child Policy", zh: "费用包含与儿童政策" },
        items: [
          {
            lead: { en: "Inclusions", zh: "费用包含" },
            body: {
              en: "Specific inclusions (e.g., accommodation, transport, guiding services, entry fees) are strictly limited to those explicitly itemized in your \"Booking Confirmation\" or the attached itinerary. Any expenses not itemized are the traveler's own responsibility.",
              zh: "每一笔订单的具体包含项目（如住宿、指定交通、导游、门票等）均以您的“预订确认邮件”或随附行程单中所列明的细则为准。任何未明确列出的费用均属于自理费用。",
            },
          },
          {
            lead: { en: "Child Policy", zh: "儿童政策" },
            body: {
              en: "Child rates are strictly subject to the child's actual age or height on the date of travel. Criteria vary by destination, hotels, and attractions; please refer to the specific itinerary details. Accurate age declaration at the time of booking is mandatory.",
              zh: "儿童团费的认定严格依据出行当日儿童的实际年龄或身高。由于不同目的地、酒店和景点的儿童判定标准各异，具体请参照单项行程说明。预订时请务必如实申报儿童年龄。",
            },
          },
        ],
      },
      {
        h: { en: "30-Day Free Cancellation & Amendment Policy", zh: "30天免费取消与改期政策" },
        items: [
          {
            lead: { en: "≥ 30 Days Before Departure", zh: "出发前 ≥ 30 天" },
            body: {
              en: "You are eligible for free cancellation or free rescheduling. Upon cancellation, a full refund will be processed, minus any non-refundable third-party costs already incurred (e.g., non-refundable flight tickets or specific hotel non-refundable deposits, if applicable).",
              zh: "您可以申请免费取消订单或免费改期。取消后，我们将在扣除无法退还的第三方实际损失（如已开票的不可退机票、特定酒店的不可退定金，如有）后，将余款全额退还。",
            },
          },
          {
            lead: { en: "< 30 Days Before Departure", zh: "出发前 < 30 天" },
            body: {
              en: "Cancellations or amendments will be subject to a cancellation fee based on a tiered schedule outlined in the specific itinerary's Cancellation & Refund Policy.",
              zh: "取消或改期将根据具体的时间节点收取相应比例的违约金，具体阶梯式比例请参照您所订行程的《退改说明细则》。",
            },
          },
        ],
      },
    ],
  },
  disclaimer: {
    title: { en: "Disclaimer", zh: "免责声明" },
    back: { en: "Back to the site", zh: "返回首页" },
    sections: [
      {
        h: { en: "Quotes and Information for Reference Only", zh: "报价与信息参考" },
        p: {
          en: "All prices, itineraries, images, and schedules displayed on this website are for reference purposes only. Actual prices may fluctuate due to seasonality, currency exchange rates, hotel availability, and real-time airfares. The final binding price and itinerary will be strictly stipulated in the formal booking confirmation issued by us.",
          zh: "本网站上显示的所有价格、行程安排、图片及时间表仅供参考。实际价格可能会因季节、汇率、酒店房态及实时机票价格而有所波动。最终确切的团款和行程以我司开具的正式预订确认书为准。",
        },
      },
      {
        h: { en: "Dynamic Itinerary Adjustments (Force Majeure)", zh: "行程动态调整（不可抗力）" },
        p: {
          en: "Due to the inherent nature of travel, in the event of Force Majeure (including but not limited to severe weather, natural disasters, strikes, government or visa policy changes, traffic controls, or flight cancellations), we and our local operators reserve the right to reasonably adjust the sequence of the itinerary, attractions visited, accommodations, or transport to ensure passenger safety as our top priority.",
          zh: "鉴于旅游行业的特殊性，如遇不可抗力因素（包括但不限于恶劣天气、自然灾害、罢工、政府政策或签证调整、交通管制、航空管制等），本站及当地接待方保留对行程顺序、游览景点、住宿酒店或交通工具进行合理调整的权利，以第一优先确保团队人身安全。",
        },
      },
      {
        h: { en: "Partner Venues and External Links", zh: "合作场所与外部链接" },
        items: [
          {
            lead: { en: "Third-Party Venues", zh: "第三方场所" },
            body: {
              en: "Accommodations, restaurants, attractions, and entertainment facilities involved in the itinerary are operated by independent third-party partners. While we select partners carefully, we are not directly liable for service fluctuations or temporary closures beyond our control.",
              zh: "行程中涉及的酒店、餐厅、景区、娱乐设施等均由独立的第三方合作商负责运营。若因第三方非我司可控之原因导致服务质量波动或临时关闭，我司将积极协助沟通协调，但不承担直接赔偿责任。",
            },
          },
          {
            lead: { en: "Maps, Videos, and External Links", zh: "地图、影片与外链" },
            body: {
              en: "Maps, promotional videos, and hyperlinks to external websites are provided solely for your visual and geographical reference. We do not assume any legal responsibility for the content, privacy practices, or availability of external sites.",
              zh: "本站引用的地图、宣传影片及跳转至外部网站的链接仅用于为您提供直观的地理及视觉参考。我们不对外部第三方网站的内容真实性、隐私政策或其稳定性承担任何法律责任。",
            },
          },
        ],
      },
      {
        h: { en: "Travel Accident Insurance Notice", zh: "旅游意外险说明" },
        p: {
          en: "For your safety, every qualified travel booking confirmed through our platform automatically includes a basic \"Travel Accident Insurance\" policy. The coverage, claims process, and deductibles are strictly governed by the official policy issued by the insurance company. We highly recommend that you purchase additional comprehensive international travel and medical insurance prior to departure based on your personal needs.",
          zh: "为了您的出行安全，本站出售的每一笔合格旅游订单均已包含一份基本的“旅游意外伤害保险”。保险的保额、理赔范围和免赔额度均以保险公司出具的电子保单及标准条款为准。我们强烈建议您根据个人需求及目的地特点，在出发前额外自行购买更高保额的国际医疗及旅行救援保险。",
        },
      },
    ],
  },
  dock: {
    tours: { en: "Tours", zh: "路线" },
    plan: { en: "Plan", zh: "定制" },
    expand: { en: "Show route shortcuts", zh: "展开路线与定制" },
    collapse: { en: "Hide route shortcuts", zh: "收起路线与定制" },
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
  footer: {
    connect: { en: "Connect with us", zh: "联系与关注" },
    rights: { en: "All rights reserved", zh: "版权所有" },
    privacy: { en: "Privacy Policy", zh: "隐私政策" },
    terms: { en: "Terms of Service", zh: "服务条款" },
    disclaimer: { en: "Disclaimer", zh: "免责声明" },
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

export type LegalPageId = "privacy" | "terms" | "disclaimer";
export type SitePage = "home" | LegalPageId;

const LEGAL_SLUGS: LegalPageId[] = ["privacy", "terms", "disclaimer"];

export function pageFromPath(pathname: string): SitePage {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const rest = base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  const p = (rest.startsWith("/") ? rest : `/${rest}`).replace(/\/+$/, "") || "/";
  for (const slug of LEGAL_SLUGS) {
    if (p === `/${slug}` || p === `/zh/${slug}`) return slug;
  }
  return "home";
}

export function pathFor(locale: Locale, page: SitePage = "home"): string {
  const base = import.meta.env.BASE_URL;
  if (page === "home") return locale === "zh" ? `${base}zh/` : base;
  return locale === "zh" ? `${base}zh/${page}` : `${base}${page}`;
}

export function localeFromPath(pathname: string): Locale {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const rest = base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  const p = rest.startsWith("/") ? rest : `/${rest}`;
  return p === "/zh" || p.startsWith("/zh/") ? "zh" : "en";
}
