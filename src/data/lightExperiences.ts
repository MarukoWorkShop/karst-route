import { parse } from "yaml";
import type { LightId, Tx } from "@/types";
import { asset } from "@/lib/asset";
import { priceOf, type LightSkuPrice } from "@/lib/lightPrice";

const L = (en: string, zh: string): Tx => ({ en, zh });

/**
 * 轻旅行体验 · 小产品栏目
 *
 * 与长线路分开：半日到一日、可单独预订、可挂在任意线路前后。
 * 参考价见 src/lib/lightPrice.ts；询单走 Web3Forms。
 * duration / group / season 目前是建议值，等主理人确认后替换。
 */
/** 详情展开里的路线小产品（目前用于「村落人文考察」） */
export type LightRoute = {
  id: string;
  title: Tx;
  /** 2–3 句短文案 */
  blurb: Tx[];
  /** 1–3 张配图（可不凑满） */
  images: string[];
  /** 参考价（由 LIGHT_SKU_PRICE 挂载） */
  price?: LightSkuPrice;
};

export type LightExperience = {
  id: LightId;
  /** 英文小标签，如 HIKING & CYCLING */
  badge: Tx;
  title: Tx;
  tagline: Tx;
  duration: Tx;
  group: Tx;
  season: Tx;
  cover: string;
  /** 详情大卡里的图片（第一张为主图） */
  gallery: string[];
  desc: Tx[];
  highlights: Tx[];
  included: Tx[];
  /** 可选：详情展开中的路线小产品列表 */
  routes?: LightRoute[];
  /** 覆盖默认「路线小产品」标题 / 副标题 */
  routesLabel?: Tx;
  routesSub?: Tx;
  /** 可选：详情右侧的线路餐食 */
  meals?: LightRoute[];
};

/** 代码默认值：content/experiences.yaml 缺失或写错时的兜底 */
const FALLBACK: LightExperience[] = [
  {
    id: "hike",
    badge: L("HIKING & CYCLING", "HIKING & CYCLING"),
    title: L("Hiking & Cycling", "徒步 · 骑行活动"),
    tagline: L(
      "Half-day to full-day routes on foot or two wheels",
      "半日到一日的徒步与骑行线路",
    ),
    duration: L("Half day – full day", "半日 – 一日"),
    group: L("2–8 travellers", "2–8 人小团"),
    season: L("Year-round", "全年可订"),
    cover: asset("/light/hike/hike-1.jpeg"),
    gallery: [
      asset("/light/hike/hike-1.jpeg"),
      asset("/light/hike/scooter-1.jpeg"),
      asset("/light/hike/raft-1.jpeg"),
    ],
    desc: [
      L(
        "Karst valleys, bamboo shade and river paths — we match the outing to your legs and the weather, then go out with a guide who knows which bend is worth the climb and which stretch stays cool.",
        "喀斯特山谷、竹荫乡道、沿河小径——我们按体力和当天天气选线，再由熟悉路况的向导带路：哪段值得爬、哪段更凉快，他们心里有数。",
      ),
      L(
        "Every outing is paced, not punished. Safety briefing, gear and a proper meal are arranged in advance. You bring shoes you trust.",
        "每一次出行都讲究节奏，不比拼强度。安全说明、装备与正餐提前安排。你只需要带一双自己信得过的鞋。",
      ),
    ],
    highlights: [
      L("Countryside walks, creek tracing and vintage scooters", "田园徒步、山谷溯溪与复古机车"),
      L("ATV jungle track · climbing · paddleboard / kayak", "ATV 丛林越野 · 攀岩 · 浆板 / 皮划艇"),
      L("Yulong bamboo raft and countryside bike loops", "遇龙河竹筏与乡野骑行线路"),
      L("Xingping peak walks: Laosai & Xianggong", "兴坪登山：老寨山与相公山"),
    ],
    included: [
      L("Local guide / coach throughout", "全程在地向导 / 户外教练"),
      L("Activity gear as listed (helmet, life jacket, vehicle)", "活动所列装备（头盔、救生衣、车辆等）"),
      L("Drinking water and one main meal when stated", "饮用水；行程写明时含一顿正餐"),
    ],
    routesLabel: L("Activity options", "活动小产品"),
    routesSub: L(
      "Book alone or pair with a longer trip — pick the pace that fits the day.",
      "可单独体验，也可挂在长线前后——按当天体力与天气选一项。",
    ),
    routes: [
      {
        id: "wulong-hike",
        title: L("Wulongquan Countryside Walk", "乌龙泉山径 · 田园徒步"),
        blurb: [
          L(
            "Walk the paths around Wulongquan’s glass fields and karst viewpoints — the same countryside frames photographers chase at golden hour.",
            "沿乌龙泉玻璃田与喀斯特观景台的山径慢走，把摄影向导眼中的田园风光，一步一步走进展平线。",
          ),
          L(
            "No rush, no bus tour: soft trails, village roofs below, and peaks stacked to the horizon.",
            "不赶场、不跟大巴：缓坡小径、脚下村舍，远山一层层叠到天边。",
          ),
        ],
        images: [
          asset("/light/hike/hike-1.jpeg"),
          asset("/light/hike/hike-2.jpeg"),
          asset("/light/hike/hike-3.jpeg"),
        ],
      },
      {
        id: "creek",
        title: L("Valley Creek Tracing", "山谷溯溪 · 碧潭戏水"),
        blurb: [
          L(
            "With outdoor coaches, climb rock, ford shallows and follow the stream upstream to jelly-clear swimming pools in a green gorge.",
            "在专业户外教练带领下开启山谷溯溪：攀岩趟滩、逆流而上，找到泉水清凉的果冻碧潭。",
          ),
          L(
            "Jump, swim and ride natural water slides in the shade — playful and challenging, cool underfoot like early autumn.",
            "阴凉处跳潭游泳，还能玩天然水上滑梯：既好玩又有挑战，脚下凉意恍如初秋。",
          ),
        ],
        images: [
          asset("/light/hike/creek-1.jpeg"),
          asset("/light/hike/creek-2.jpeg"),
          asset("/light/hike/creek-3.jpeg"),
        ],
      },
      {
        id: "scooter",
        title: L("Vintage Scooter on the Yulong Path", "复古机车 · 遇龙河步道"),
        blurb: [
          L(
            "Ride sidecar and vintage scooters along the Yulong River promenade — rice fields on both sides, karst peaks all around.",
            "挎斗机车骑行遇龙河网红步道：水稻田边蜿蜒乡路，喀斯特峰丛环绕的广阔田园。",
          ),
          L(
            "Pause at Shuangliu ferry pavilion for a popsicle, splash at the weir, and take the photos the valley asks for.",
            "双流义渡亭歇凉吃根老冰棍，堤坝上玩水嬉戏，在山水之间拍美美照、释放活力。",
          ),
        ],
        images: [
          asset("/light/hike/scooter-1.jpeg"),
          asset("/light/hike/scooter-2.jpeg"),
          asset("/light/hike/scooter-3.jpeg"),
        ],
      },
      {
        id: "atv",
        title: L("ATV Jungle Off-Road", "ATV 丛林越野车"),
        blurb: [
          L(
            "Beside a Li River tributary on the Jinbao riverside track: undeveloped scenery, a winding 5 km course through peak forest — speed and karst views together.",
            "在漓江支流遇龙河 / 金宝河边：依山临水、景色零开发；5 公里赛道宽阔曲折，穿梭峰林之间，速度与山水美景同时拥有。",
          ),
          L(
            "Reference price: ¥200 / person · two per vehicle · about 50 minutes driving.",
            "参考报价：200 元/人（2 人一车）· 驾驶约 50 分钟。",
          ),
        ],
        images: [asset("/light/hike/atv-doc-1.jpeg")],
      },
      {
        id: "raft",
        title: L("Yulong River Bamboo Raft", "遇龙河人工竹筏漂流"),
        blurb: [
          L(
            "From Shiwai Taoyuan in Baisha to Gongnong Bridge by the big banyan — clear shallow water, green banks, bamboo and slow current. A quiet way to see village scenery.",
            "遇龙河自白沙世外桃源至大榕树工农桥段，水质清澈、水流缓缓，两岸山峰清秀、翠竹葱郁。乘竹筏随波逐流，是欣赏乡村风光很放松的方式。",
          ),
          L(
            "Trips run about 30–90 minutes from different put-ins. Reference: ¥300 per 2-person raft.",
            "出发点和行程约半小时至 1.5 小时不等。参考报价：2 人竹筏 300 元/筏。",
          ),
        ],
        images: [asset("/light/hike/raft-1.jpeg"), asset("/light/hike/raft-2.jpeg")],
      },
      {
        id: "bike",
        title: L("Countryside Bike Loops", "自行车休闲游"),
        blurb: [
          L(
            "Mountain-bike loops are a fast way into Yangshuo’s dramatic countryside. Three favourites: Moon Hill (half day), Yulong Bridge (full day, with swim stops), and Liugong Village (800-year riverside hamlet, three-colour ponds).",
            "山地自行车休闲游能在短时间内深入乡野。我们最喜欢的三条：月亮山路线（半天）、遇龙桥路线（全天，沿途可下水）、留公村路线（八百年江边古村，近旁有三色池塘）。",
          ),
          L(
            "We share up-to-date route notes so you can ride at your own pace.",
            "我们提供最新路线说明，让你按自己的节奏骑完。",
          ),
        ],
        images: [asset("/light/hike/bike-1.jpeg"), asset("/light/hike/bike-2.jpeg")],
      },
      {
        id: "climb",
        title: L("Rock Climbing", "攀岩"),
        blurb: [
          L(
            "Yangshuo is a climbing hub with peaks for every level — gradient sport routes A/B/C/D-Plus and harder natural walls. Beginners and specialists both have options.",
            "阳朔正迅速成为亚洲攀岩领域的圣地。山峰多样，不同水准都可锻炼；我们拥有 A/B/C/D-Plus 多条梯度线路，还有高难度自然岩壁可供选择。",
          ),
          L(
            "Reference: ¥350 / person (1–3) · ¥300 / person (4–10) · about 2 hours.",
            "参考报价：1–3 人 350 元/人 · 4–10 人 300 元/人 · 约 2 小时。",
          ),
        ],
        images: [
          asset("/light/hike/climb-1.jpeg"),
          asset("/light/hike/climb-2.jpeg"),
          asset("/light/hike/climb-3.jpeg"),
        ],
      },
      {
        id: "paddle",
        title: L("Paddleboard / Kayak", "浆板 / 皮划艇体验"),
        blurb: [
          L(
            "Downstream on the Li: quieter water, farm life on the banks — nets, buffalo, slow green shores. About 2–3 hours on the river.",
            "顺漓江而下：这一段不拥堵，有一种静态的美，也是观察河边农家生活的好机会——渔网、水牛、岸边闲景。行程约 2–3 小时。",
          ),
          L(
            "Reference: ¥200 · about 3 hours.",
            "参考报价：200 元 · 约 3 小时。",
          ),
        ],
        images: [
          asset("/light/hike/paddle-1.jpeg"),
          asset("/light/hike/paddle-2.jpeg"),
          asset("/light/hike/paddle-3.jpeg"),
        ],
      },
      {
        id: "xingping-peaks",
        title: L("Xingping Peak Walks", "兴坪登山 · 老寨山 / 相公山"),
        blurb: [
          L(
            "Laosai Hill by Xingping’s old street and Rongshu pool: ~200 m stone path, a classic photo overlook of the Li’s 180° bend.",
            "老寨山位于兴坪古镇老街头漓江榕树潭码头边，高约 200 余米，石径通顶，是观赏兴坪山水、尽览漓江大拐弯的经典摄影点。",
          ),
          L(
            "Xianggong Hill on the west bank between Yellow Cloth Shoal and Nine-Horse Fresco — cloud seas, sunrise and ordered peaks for photographers.",
            "相公山在漓江西岸、黄布滩与九马画山之间：登顶远眺群峰有序、江流蜿蜒，光影云海与日出彩霞常吸引摄影人。",
          ),
        ],
        images: [],
      },
    ],
  },
  {
    id: "photo",
    badge: L("PHOTO WALKS", "PHOTO WALKS"),
    title: L("Professional Photo Walks", "专业旅拍"),
    tagline: L(
      "A photographer-guide, not a photographer-tour",
      "跟着摄影师走，而不是被摄影师拍",
    ),
    duration: L("2–4 hours", "2–4 小时"),
    group: L("1–6 travellers", "1–6 人"),
    season: L("Year-round · best at golden hour", "全年可订 · 黄金光线最佳"),
    cover: asset("/destinations/chongzuo-rachel.jpg"),
    gallery: [
      asset("/destinations/chongzuo-rachel.jpg"),
      asset("/destinations/weizhoudao3.jpeg"),
      asset("/destinations/catba.jpg"),
    ],
    desc: [
      L(
        "Our photographer-guides shoot the region every week, so they know which lane catches the light at 5pm and which pier is empty before 7am. They take the pictures and they teach you to see the same frame.",
        "我们的摄影向导每周都在这一带拍摄，知道哪条巷子五点有光、哪个码头七点前没人。他们既替你拍，也教你怎么看这个画面。",
      ),
      L(
        "You get a same-day preview and a full edited set afterwards — no watermark, no upsell, yours to print.",
        "当天给预览，随后交付整套精修：无水印、无二次推销，版权归你，可直接打印。",
      ),
    ],
    highlights: [
      L("Golden-hour route planned around the day's light", "按当天光线规划的黄金时刻路线"),
      L("Portrait set for couples, families or solo travellers", "情侣 / 亲子 / 单人皆可的人像套系"),
      L("Edited photos delivered in a private gallery", "精修照片私密相册交付"),
      L("Light coaching on composition, usable on any phone", "构图指导，手机同样用得上"),
    ],
    included: [
      L("Photographer-guide for the session", "摄影师向导全程"),
      L("Edited digital photos, print-ready", "精修数字照片（可打印）"),
      L("Private online gallery", "私密线上相册"),
    ],
  },
  {
    id: "village",
    badge: L("VILLAGE STUDY", "VILLAGE STUDY"),
    title: L("Village & Heritage Study", "村落人文考察"),
    tagline: L(
      "Half-day field visits with people who live there",
      "半日田野走访，由住在村里的人带路",
    ),
    duration: L("Half day", "半日"),
    group: L("2–10 travellers", "2–10 人"),
    season: L("Year-round", "全年可订"),
    cover: asset("/light/village/yao-visit-1.jpeg"),
    gallery: [
      asset("/light/village/yao-visit-1.jpeg"),
      asset("/light/village/oil-tea-baba-1.jpeg"),
      asset("/light/village/dong-song-2.jpeg"),
    ],
    desc: [
      L(
        "Not a photo stop. A half day inside a working village — the well that still feeds it, the hall where decisions get made, the family that has fired the same kiln for four generations.",
        "不是拍照打卡点。是半个白天待在一个还在运转的村子里：仍在使用的水井、商量事情的祠堂、烧了四代人的那口窑。",
      ),
      L(
        "Visits are hosted by residents and sized small on purpose. We brief you on what to ask, what to photograph, and what to leave alone.",
        "走访由村民自己接待，刻意控制人数。出发前我们会说明：可以问什么、可以拍什么、什么应当回避。",
      ),
    ],
    highlights: [
      L("Old-town walk with a resident host", "由原住民带路的老城行走"),
      L("Handicraft household visit (pottery, weaving, paper)", "手作人家走访（制陶 / 织布 / 造纸）"),
      L("Village meal or tea with the host family", "与接待家庭共餐或饮茶"),
      L("Briefing notes on local customs and etiquette", "在地习俗与礼仪行前说明"),
    ],
    included: [
      L("Resident host and interpreter", "村民接待与随行翻译"),
      L("Visit fees shared with the households", "走访费用与村民共享"),
      L("Round-trip transfer from your hotel", "酒店往返接送"),
    ],
    routesLabel: L("Route options", "路线小产品"),
    routesSub: L(
      "Village visits, festivals and river life — book alone or pair with a longer trip.",
      "村落相遇与节庆渔事——可单独体验，也可挂在长线前后。",
    ),
    routes: [
      {
        id: "yao-visit",
        title: L("Hong Yao Homestay Visit", "红瑶人家 · 山歌唱进家门"),
        blurb: [
          L(
            "Stilt houses still cling to the valley sides, and farming ways that look ancient are simply how people live here. Yao hosts meet you with mountain songs and walk you into their story.",
            "依山而建的吊脚楼仍在，刀耕火种的农耕文明也并未变成展陈——瑶族阿嫂阿哥唱着山歌迎你进门，把红瑶人家的故事讲给你听。",
          ),
          L(
            "It is a rare, sincere exchange: not a staged show, but a living household in the gorge offering a memory you can only get by sitting down with them.",
            "这是遗落在峡谷里的真诚邀约：不是舞台表演，而是与当地人真正坐在一起，带走一份只能在这里发生的记忆。",
          ),
        ],
        images: [
          asset("/light/village/yao-visit-1.jpeg"),
          asset("/light/village/yao-visit-2.jpeg"),
          asset("/light/village/yao-visit-3.jpeg"),
        ],
      },
      {
        id: "oil-tea",
        title: L(
          "One Bitter, Four Fragrant · Oil Tea & Mugwort Ciba",
          "一杯苦来四杯香 · 打油茶+艾叶粑粑制作",
        ),
        blurb: [
          L(
            "Yao oil tea is passed down by village elders who keep the tea customs — often in the family, sometimes across the community.",
            "瑶族油茶是桂林村寨里了解和掌握瑶族茶规的长者、寨老会传授给年轻人的习俗相关知识。一般传承为家传，也有社会传承。",
          ),
          L(
            "Includes making minority oil tea on site, trying ethnic dress, and making mugwort ciba (aiye baba). Reference: ¥200 / person (1–3, min 2) · ¥150 / person (4–10).",
            "含现场体验制作少数民族油茶、少数民族服饰体验，以及制作艾叶粑粑。参考报价：1–3 人 200 元/人（2 人起订）· 4–10 人 150 元/人。",
          ),
        ],
        images: [
          asset("/light/village/oil-tea-baba-1.jpeg"),
          asset("/light/village/oil-tea-baba-2.jpeg"),
        ],
      },
      {
        id: "embroidered-ball",
        title: L("Make a Zhuang Embroidered Ball", "绣球里的山水心意"),
        blurb: [
          L(
            "Sit with a Zhuang auntie and stitch Guangxi’s iconic embroidered ball — a compact piece of intangible heritage held in the palm.",
            "跟着壮族阿嫂亲手制作广西的瑰宝——绣球，学习传统针法，感受少数民族非遗如何落在指尖。",
          ),
          L(
            "A small ball carries big wishes: courtship, blessing, and the warmth of wanting a good life for the people you love.",
            "小小绣球寓意很深：寄托情意与祝福，也装着人们对美好生活的热情。",
          ),
        ],
        images: [
          asset("/light/village/embroidered-ball-1.jpeg"),
          asset("/light/village/embroidered-ball-2.jpeg"),
          asset("/light/village/embroidered-ball-3.jpeg"),
        ],
      },
      {
        id: "dong-song",
        title: L("Dong Grand Song Gathering", "侗族大歌 · 无指挥的自然和声"),
        blurb: [
          L(
            "Meet a heritage Dong song troupe face to face: many voices, no conductor, no accompaniment, no score — birdsong and mountain water folded into harmony.",
            "与侗族大歌传承歌班面对面：多声部、无指挥、无伴奏、无曲谱，把鸟叫虫鸣、高山流水织进和声。",
          ),
          L(
            "Open that sonic world with them and feel how close Dong music sits to the natural soundscape of the hills.",
            "打开侗族大歌的奇幻魔盒，感受侗族人民对自然界的亲近，以及传统音乐如何在村寨里继续生长。",
          ),
        ],
        images: [
          asset("/light/village/dong-song-1.jpeg"),
          asset("/light/village/dong-song-2.jpeg"),
          asset("/light/village/dong-song-3.jpeg"),
        ],
      },
      {
        id: "stilt-tea",
        title: L("Tea in a Restored Stilt Granary", "吊脚楼粮仓 · 一席老茶"),
        blurb: [
          L(
            "A host walks you through a stilt-house granary’s second life — from ruin to loft garden, packed with carefully kept antiques.",
            "主理人带你走进一座吊脚楼粮仓的故事：从破旧不堪到阁楼花园，满屋精心收藏的老物件。",
          ),
          L(
            "Warmth and persistence, timber tradition meeting present-day living — then a quiet VIP tea table: pitched-pot games, whisked tea, unhurried talk.",
            "温情与坚守，传统木构与现代生活交错。再入一席 VIP 茶室：投壶、点茶，把时间放慢。",
          ),
        ],
        images: [
          asset("/light/village/stilt-tea-1.jpeg"),
          asset("/light/village/stilt-tea-2.jpeg"),
          asset("/light/village/stilt-tea-3.jpeg"),
        ],
      },

      {
        id: "home-visit",
        title: L("Local Family Homestay Visit", "探访当地家访"),
        blurb: [
          L(
            "A drive to a countryside home: by season you may plant or harvest rice, or pick fruit. An English-speaking local guide explains rural life around Yangshuo — rice, citrus, pomelo, sugarcane, vegetables, and water buffalo in the fields.",
            "您将乘车到达乡下的一个当地家庭；按季节可以看到或帮助种植、收割水稻，或进行水果采摘。会讲英语的当地导游会介绍阳朔周围的农村生活——人们种植水稻、柑橘、柚子、甘蔗、蔬菜，耕作中常使用水牛。",
          ),
          L(
            "Share a simple lunch with the family and learn local ciba, tofu or bamboo weaving. Timing is flexible. Reference: ¥250 / person (1–3, min 2) · ¥200 / person (4–10).",
            "与家庭成员共享简单午餐，学习制作当地糍粑、豆腐或竹编。时间灵活。参考报价：1–3 人 250 元/人（2 人起订）· 4–10 人 200 元/人。",
          ),
        ],
        images: [
          asset("/light/village/home-visit-1.jpeg"),
          asset("/light/village/home-visit-2.jpeg"),
          asset("/light/village/home-visit-3.jpeg"),
        ],
      },
      {
        id: "hermit",
        title: L("Visit Local Hermits", "拜访当地隐士"),
        blurb: [
          L(
            "A seek-the-hermit journey on this land — finding people who guard terroir with new eyes and craft, like modern Tao Yuanmings.",
            "是一段在地寻隐记旅行，寻找每一位隐藏的隐士。语言、作物、思考方式、空气、风、传统、历史，都有自己的风土；像现代陶渊明，以新的眼光和创造力守护所在土地的风土。",
          ),
        ],
        images: [
          asset("/light/village/hermit-1.jpeg"),
          asset("/light/village/hermit-2.jpeg"),
          asset("/light/village/hermit-3.jpeg"),
        ],
      },
      {
        id: "cormorant",
        title: L("Cormorant Fishing by Raft", "鱼鹰抓鱼"),
        blurb: [
          L(
            "Night bamboo-raft outing to watch the oldest fishing life on the Li — cormorants at work, up close, with a thousand-year fishing tradition.",
            "夜乘竹筏，近距离欣赏漓江最原始的渔民生活——鱼鹰抓鱼。这里有着千年捕鱼历史，比在别处远观候鸟更有趣味。",
          ),
          L(
            "Reference: ¥180 / person · about 1 hour.",
            "参考报价：180 元/人 · 约 1 小时。",
          ),
        ],
        images: [
          asset("/light/village/cormorant-1.jpeg"),
          asset("/light/village/cormorant-2.jpeg"),
          asset("/light/village/cormorant-3.jpeg"),
        ],
      },
      {
        id: "festivals",
        title: L("Ethnic Village Festivals", "少数民族节日"),
        blurb: [
          L(
            "For the most rooted village culture — opening-farm day, seedling-combing, clothes-drying, long-hair festival, Shigong dance and more.",
            "如果您只想体验最地道的乡村文化，了解村里的时光，不要错过这些节日：开耕节 / 梳秧节 / 晒衣节 / 长发节 / 师公舞等。",
          ),
          L(
            "Reference: ¥500 / person (min 2) · transport not included · seasonal.",
            "参考报价：500 元/人（2 人起订，不包含交通费）· 按节期安排。",
          ),
        ],
        images: [
          asset("/light/village/festival-1.jpeg"),
          asset("/light/village/festival-2.jpeg"),
          asset("/light/village/festival-3.jpeg"),
        ],
      },
      {
        id: "sanyuesan",
        title: L("March Third Song Fair", "三月三歌圩"),
        blurb: [
          L(
            "Zhuang song festival on the lunar March third — five-colour sticky rice, dyed eggs, song sheds on the village green. Gatherings last two or three days; large fairs draw thousands.",
            "农历三月三又称三月三歌节或三月歌圩，是壮族传统歌节。家家户户做五色糯饭、染彩蛋；歌棚搭在村旁空地，对歌以未婚青年为主，小圩一两千人，大圩可达数万。",
          ),
        ],
        images: [],
      },
    ],
    meals: [
      {
        id: "nianzhu",
        title: L("Winter Hog & Hearth Hotpot", "年味年猪 · 围炉泡汤"),
        blurb: [
          L(
            "Deep in the terraces in the coldest month, Zhuang villages kill a hog for the year — then gather by the fire for their traditional paotang feast.",
            "寒冬腊月，梯田深处的壮族古村落年味渐浓：家家杀猪庆祝，开启独特的刨汤生活。",
          ),
          L(
            "Sit by the hearth in a stilt-house inn: meat still warm, cured pork rich, and mountain rice wine poured soft — the New Year flavour you thought you'd lost.",
            "民宿火塘边围炉而坐，新鲜猪肉还温热，腊肉淳厚，再喝两杯温好的山里米酒——久违的年味就在这一桌。",
          ),
        ],
        images: [
          asset("/light/village/meals/nianzhu-1.jpeg"),
          asset("/light/village/meals/nianzhu-2.jpeg"),
          asset("/light/village/meals/nianzhu-3.jpeg"),
        ],
      },
      {
        id: "yanhua",
        title: L("Hillside Courtyard Firework Feast", "半山小院 · 烟花家宴"),
        blurb: [
          L(
            "At dusk in a hillside hideaway above the valley, a courtyard dinner faces open karst — elegant, quiet, and set for celebration.",
            "傍晚在大面山秘境的半山小院享用家宴：面对开豁山谷，环境优雅，美景与美食同桌。",
          ),
          L(
            "Then fireworks bloom over the peaks — the moment travel actually feels like travel.",
            "漫天烟花亮起时，这一顿就更像一场真正的旅行。",
          ),
        ],
        images: [
          asset("/light/village/meals/yanhua-1.jpeg"),
          asset("/light/village/meals/yanhua-2.jpeg"),
          asset("/light/village/meals/yanhua-3.jpeg"),
        ],
      },
      {
        id: "lijiang-table",
        title: L("A Li River Table from the Banks", "漓江餐桌 · 鱼虾与田园"),
        blurb: [
          L(
            "Local hosts cook a Li River table worth boasting about — fish and shrimp from the river you just watched, greens from the fields beside it.",
            "当地老乡土著做一顿值得吹嘘的漓江餐桌：鱼虾来自眼前的江，菜蔬来自身边的田园。",
          ),
          L(
            "Wild, seasonal, and tied to the water — not a restaurant menu, but a meal that belongs to this bend of the river.",
            "野趣、当季、贴着江水——不是餐馆菜单，而是属于这一湾漓江的一餐。",
          ),
        ],
        images: [
          asset("/light/village/meals/lijiang-1.jpeg"),
          asset("/light/village/meals/lijiang-2.jpeg"),
          asset("/light/village/meals/lijiang-3.jpeg"),
        ],
      },
      {
        id: "zhuang-feast",
        title: L("Zhuang Homestead Feast by Season", "壮族家宴 · 四时风物"),
        blurb: [
          L(
            "A Zhuang auntie brings the village kitchen to the table — wild greens in spring, creek fish in summer, osmanthus in autumn, hotpot in winter.",
            "壮族阿嫂把当地美食搬上家宴：春天野菜餐，夏天野生溪鱼，秋天桂花餐，冬天泡汤宴。",
          ),
          L(
            "Different season, different plate — one long table of living Zhuang foodways, including the famous raw fish.",
            "什么季节来，就吃什么——一桌活着的壮族饮食文化，也少不了那盘鱼生。",
          ),
        ],
        images: [
          asset("/light/village/meals/zhuang-1.jpeg"),
          asset("/light/village/meals/zhuang-2.jpeg"),
          asset("/light/village/meals/zhuang-3.jpeg"),
        ],
      },
      {
        id: "riverside",
        title: L("Private Riverside Garden Dinner", "遇龙河畔 · 私家晚宴"),
        blurb: [
          L(
            "A riverside private garden on the Yulong — the kind of house kitchen you only reach through introduction.",
            "在遇龙河私家花园享用河畔晚宴：非熟人预约不到的私房菜馆，美食美景，仪式感十足。",
          ),
          L(
            "The chef cooks what the season gives — river, Li River banks, and hillside fields — under starlight on the water.",
            "主厨选用当季风物：遇龙河、漓江与山间田野入菜，河畔星光下慢慢吃完这一顿。",
          ),
        ],
        images: [
          asset("/light/village/meals/riverside-1.jpeg"),
          asset("/light/village/meals/riverside-2.jpeg"),
          asset("/light/village/meals/riverside-3.jpeg"),
        ],
      },
    ],
  },
  {
    id: "foodfilm",
    badge: L("FOOD & FILM", "FOOD & FILM"),
    title: L("Food & Film", "美食与电影"),
    tagline: L(
      "Cook, taste, and see the place — from market to table",
      "从市场到餐桌：动手做、亲自尝，再认识这座城",
    ),
    duration: L("Half day", "半天"),
    group: L("1–10 travellers", "1–10 人"),
    season: L("Year-round", "全年可订"),
    cover: asset("/light/foodfilm/cooking-1.jpeg"),
    gallery: [
      asset("/light/foodfilm/cooking-1.jpeg"),
      asset("/light/foodfilm/cooking-2.jpeg"),
    ],
    desc: [
      L(
        "A market walk, the dishes that define a city, then a film shot in the streets you just walked — screened over dinner or in a small room with the windows open.",
        "先逛一趟菜市场，吃这座城市真正拿得出手的几道菜，再看一部就拍在你刚走过那些街上的电影——配着晚餐，或在一扇开着窗的小屋里放映。",
      ),
      L(
        "The pairing is the point: pho tastes different after you've seen the 5am broth run, and a karst skyline lands harder once you've stood under it that afternoon.",
        "搭配本身就是重点：看过凌晨五点熬汤的场面，河粉的味道不一样；下午亲自站在那片喀斯特天际线下，晚上银幕上的画面才落得下来。",
      ),
    ],
    highlights: [
      L("Yangshuo cooking school — market, cook, lunch", "阳朔厨艺学校：逛市场、做菜、吃午餐"),
      L("Bamboo grove chickens & bamboo-tube rice", "竹林捉鸡 · 竹筒饭"),
      L("Small class with an English-speaking local teacher", "小班 · 会讲英语的本地老师"),
    ],
    included: [
      L("Food host / village host for the session", "美食向导或村民接待全程"),
      L("Ingredients and cooking as listed", "所列食材与烹饪安排"),
      L("The meal you make or harvest", "亲手做或收获的一餐"),
    ],
    routesLabel: L("Food sessions", "美食小产品"),
    routesSub: L(
      "Cook in a farmhouse kitchen, or catch dinner in the bamboo — book alone or pair with a longer trip.",
      "农舍厨房做菜，或竹林里捉鸡做竹筒饭——可单独体验，也可挂在长线前后。",
    ),
    routes: [
      {
        id: "cooking-school",
        title: L("Yangshuo Cooking School", "阳朔厨艺学校"),
        blurb: [
          L(
            "Learn real Chinese dishes in a traditional farmhouse kitchen. Friendly teachers emphasise doing, not watching; they also take you to the local market for ingredients. Then you eat what you cooked for lunch.",
            "在阳朔传统中国农舍中学习烹调中国食物。友善的老师强调实际操作而不是看；还会带您去当地市场了解配料。制作菜肴之后，一起食用午餐。",
          ),
          L(
            "Small class · English-speaking local teacher · half day · 2–4 dishes · recipes to take home. Reference: ¥380 / person (1–3) · ¥280 / person (4–10).",
            "小班教学 · 会讲英语的本地老师 · 半天学 2–4 道菜 · 含食谱。参考报价：1–3 人 380 元/人 · 4–10 人 280 元/人。",
          ),
        ],
        images: [
          asset("/light/foodfilm/cooking-1.jpeg"),
          asset("/light/foodfilm/cooking-2.jpeg"),
        ],
      },
      {
        id: "chicken",
        title: L("Bamboo Grove Chickens & Bamboo Rice", "竹林捉鸡 · 竹筒饭香"),
        blurb: [
          L(
            "In a terraced village, hosts walk you into the bamboo to catch chickens and gather eggs — then cook the day’s catch.",
            "深入梯田环绕的自然村寨，民宿阿嫂阿哥带你漫步山谷，在竹林里捉鸡、捡鸡蛋。",
          ),
          L(
            "Evening turns the harvest into bamboo-tube chicken and sticky rice — labour you can taste.",
            "晚上，劳动收获变成竹筒鸡与竹筒饭——亲手忙过的一餐，特别香。",
          ),
        ],
        images: [
          asset("/light/hike/chicken-1.jpeg"),
          asset("/light/hike/chicken-2.jpeg"),
          asset("/light/hike/chicken-3.jpeg"),
        ],
      },
    ],
    // 中国茶 / 七仙峰茶园：归属待确认后再入库
  },
  {
    id: "craft",
    badge: L("HANDICRAFT", "HANDICRAFT"),
    title: L("Handicraft Workshops", "手作与非遗工坊"),
    tagline: L(
      "Paint a fan, try a heritage craft, or sit with brush and ink",
      "画扇、非遗手作，或一堂书法——好好做完一件",
    ),
    duration: L("2–4 hours", "2–4 小时"),
    group: L("1–10 travellers", "1–10 人"),
    season: L("Year-round", "全年可订"),
    cover: asset("/light/craft/fuli-fan-1.jpeg"),
    gallery: [
      asset("/light/craft/fuli-fan-1.jpeg"),
      asset("/light/craft/heritage-1.jpeg"),
      asset("/light/craft/calligraphy-1.jpeg"),
    ],
    desc: [
      L(
        "Fuli is known for Chinese fans — walk the old town, then paint one of your own. Or choose a heritage craft session: zongzi, tofu, straw shoes, weaving and more.",
        "福利古镇以制扇闻名：逛老城之后，画一把自己的扇。也可以选非遗工坊：包粽子、做豆腐、草鞋、编织等，一项一项亲手做。",
      ),
      L(
        "Calligraphy is available as a quieter session with brush and ink. You leave with what you made.",
        "也可以静下来写一堂中国书法。带走的是自己做的那一件。",
      ),
    ],
    highlights: [
      L("Fuli ancient town fan painting", "福利古镇画扇"),
      L("Heritage crafts: zongzi, tofu, straw shoes, weaving and more", "非遗：包粽子 / 做豆腐 / 草鞋 / 编织等"),
      L("Chinese calligraphy workshop", "中国书法体验"),
      L("Take home what you made", "作品带走"),
    ],
    included: [
      L("Maker-led instruction", "手艺人全程教学"),
      L("All materials as listed", "所列材料与工具"),
      L("Finished piece to take home", "成品带走"),
    ],
    routesLabel: L("Workshop options", "工坊小产品"),
    routesSub: L(
      "Make one thing properly — fan, heritage craft, or calligraphy.",
      "好好做完一件：画扇、非遗手作或书法。",
    ),
    routes: [
      {
        id: "fuli-fan",
        title: L("Fuli Fan Painting", "福利古镇画扇"),
        blurb: [
          L(
            "A guide and private car take you to Fuli — famous for Chinese fans of every size. After a short walk in the old town, paint a fan of your own (about 2 hours).",
            "当地导游与专车带您到福利古镇，逛老城区。福利以制扇闻名，大小皆可。短游之后，画一把属于自己的扇（约 2 小时）。",
          ),
          L(
            "Reference: ¥250 / person (1–3) · ¥200 / person (4–10).",
            "参考报价：1–3 人 250 元/人 · 4–10 人 200 元/人。",
          ),
        ],
        images: [
          asset("/light/craft/fuli-fan-1.jpeg"),
          asset("/light/craft/fuli-fan-2.jpeg"),
          asset("/light/craft/fuli-fan-3.jpeg"),
        ],
      },
      {
        id: "heritage-crafts",
        title: L("Intangible Heritage Workshop", "非遗传统文化"),
        blurb: [
          L(
            "Choose among: wrapping zongzi, making tofu, straw shoes, straw dragon, weaving, five-colour sticky rice, ciba, embroidered ball, cloth weaving.",
            "可选体验：包粽子 / 做豆腐 / 草鞋 / 草龙 / 编织 / 五色糯米饭 / 糍粑 / 绣球体验 / 织布。",
          ),
          L(
            "Reference: ¥200 / person.",
            "参考报价：200 元/人。",
          ),
        ],
        images: [
          asset("/light/craft/heritage-1.jpeg"),
          asset("/light/craft/heritage-2.jpeg"),
          asset("/light/craft/heritage-3.jpeg"),
        ],
      },
      {
        id: "calligraphy",
        title: L("Chinese Calligraphy", "中国书法"),
        blurb: [
          L(
            "A hands-on session with brush and ink — form, breath and the character of each stroke.",
            "毛笔与墨：一堂动手的书法体验，感受每一笔的形与气息。",
          ),
        ],
        images: [
          asset("/light/craft/calligraphy-1.jpeg"),
          asset("/light/craft/calligraphy-2.jpeg"),
          asset("/light/craft/calligraphy-3.jpeg"),
        ],
      },
    ],
    // 七仙峰茶园、孔子开笔：归属待确认后再入库
  },
  {
    id: "wellness",
    badge: L("WELLNESS & SPA", "WELLNESS & SPA"),
    title: L("Healing & Unwinding", "疗愈与放松"),
    tagline: L(
      "Tai chi, nature stillness, and traditional massage — slow hours in the karst",
      "太极、山水静心与传统按摩——在桂林慢下来的几个小时",
    ),
    duration: L("1–3 hours", "1–3 小时"),
    group: L("1–10 travellers", "1–10 人"),
    season: L("Year-round", "全年可订"),
    cover: asset("/light/wellness/taichi-2.jpeg"),
    gallery: [
      asset("/light/wellness/taichi-2.jpeg"),
      asset("/light/wellness/taichi-1.jpeg"),
    ],
    desc: [
      L(
        "From the opening form to cloud hands, each breath folds the landscape back into the body. We teach beginner-friendly tai chi outdoors — bilingual coaching, zero jargon — so travellers can feel soft power and stillness between the peaks.",
        "从起势到云手，再由发力至收势，在一呼一吸之间，将天地灵气融归丹田；每一式抬手落步，皆可成为旅途中最独特、不可复制的记忆。我们为零基础学员开设太极课，中英双语、耐心拆解，在山水里真正放松身心。",
      ),
      L(
        "Pair it with a quiet yoga or breath session above the river, or end a long countryside day with a traditional Chinese foot or full-body massage — herbal oils, no upsell, book a day ahead.",
        "也可以在我们安排的临水处做瑜伽与深呼吸，与桂林山水安静相处；或在乡间走完漫长一天后，预约传统足底 / 全身按摩——温热与穴位并用，提前一天预订即可。",
      ),
    ],
    highlights: [
      L(
        "Tai chi class · ¥300 / person (1–3) · ¥200 / person (4–10)",
        "太极拳体验 · 1–3 人 300 元/人 · 4–10 人 200 元/人",
      ),
      L("Nature yoga & breathwork among the karst peaks", "自然体验 · 瑜伽与深呼吸，与山水相处"),
      L(
        "Foot / full-body massage · oil 1.5h or dry 1h · foot bath & shoulders",
        "足底或全身按摩 · 精油 1.5 小时 / 无油 1 小时 · 足浴与肩部按摩",
      ),
      L(
        "Beginner-friendly · bilingual coaching · book massage one day ahead",
        "零基础友好 · 中英双语教学 · 按摩请至少提前一天预订",
      ),
    ],
    included: [
      L("Coach or therapist for the session", "教练或按摩师全程"),
      L("Outdoor venue or quiet treatment room as listed", "户外场地或安静理疗空间（按项目）"),
      L("Massage oils / towels when booked", "按摩精油、毛巾（预约按摩时）"),
    ],
    routesLabel: L("Session options", "体验小产品"),
    routesSub: L(
      "Three ways to slow down — book one, or stack two in a day.",
      "三种慢下来的方式——可单订，也可同一天搭配两项。",
    ),
    routes: [
      {
        id: "taichi",
        title: L("Tai Chi Experience", "太极拳体验"),
        blurb: [
          L(
            "Zero-basis friendly, bilingual coaching. From breath and morning forms to soft power and silk-reeling — feel heaven-and-earth in the karst air.",
            "零基础友好，中英双语教学。从呼吸、晨练开始，体验太极刚柔相济、缠丝发力，在山水里感受「以柔克刚、动静结合」。",
          ),
          L(
            "Reference price: ¥300 / person for 1–3 · ¥200 / person for 4–10.",
            "参考报价：1–3 人 300 元/人 · 4–10 人 200 元/人。",
          ),
        ],
        images: [
          asset("/light/wellness/taichi-1.jpeg"),
          asset("/light/wellness/taichi-2.jpeg"),
        ],
      },
      {
        id: "nature-still",
        title: L("Nature Stillness", "自然体验"),
        blurb: [
          L(
            "Yoga, deep breath, and quiet time with Guilin’s peaks and water — a private pocket of calm we arrange for you.",
            "在我们安排的地方享受属于自己的放松：瑜伽、深呼吸，与桂林山水安静相处。",
          ),
          L(
            "Priced by venue and length — enquire with your dates.",
            "按场地与时长核算，提交日期后报价。",
          ),
        ],
        images: [
          asset("/light/wellness/nature-1.jpeg"),
          asset("/light/wellness/nature-2.jpeg"),
        ],
      },
      {
        id: "massage",
        title: L("Foot or Full-Body Massage", "足底或全身按摩"),
        blurb: [
          L(
            "Traditional Chinese pressure work: foot massage, full-body oil (1.5h) or dry (1h), or a foot bath with shoulder massage after long walks.",
            "传统中式按摩：足底穴位、全身精油按摩（1.5 小时）或无油按摩（1 小时），也可选足浴与肩部按摩——乡间长走一天后尤其合适。",
          ),
          L(
            "Experienced local therapists · please book at least one day ahead.",
            "训练有素的当地按摩师 · 请至少提前一天预订。",
          ),
        ],
        images: [],
      },
    ],
  },
];

// --- 读取 content/experiences.yaml（与 content/routes/*.yaml 同一套机制）---
const files = import.meta.glob("../../content/experiences.yaml", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const skuFiles = import.meta.glob("../../content/light-skus.yaml", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

type SkuYamlItem = {
  id?: string;
  category?: string;
  kind?: string;
  status?: string;
  sort?: number;
  title?: { en?: string; zh?: string };
  blurb?: Array<{ en?: string; zh?: string }>;
  images?: string[];
};

function loadSkuYaml(): SkuYamlItem[] {
  try {
    const raw = Object.values(skuFiles)[0] ?? "";
    if (!raw) return [];
    const doc = (parse(raw) ?? {}) as { items?: unknown };
    return Array.isArray(doc.items) ? (doc.items as SkuYamlItem[]) : [];
  } catch (err) {
    console.warn("[content] content/light-skus.yaml 解析失败", err);
    return [];
  }
}

function skusForCategory(categoryId: string, kind: "route" | "meal"): LightRoute[] {
  const rows = loadSkuYaml()
    .filter(
      (it) =>
        it?.id &&
        it.category === categoryId &&
        (it.kind === kind || (!it.kind && kind === "route")) &&
        it.status !== "paused",
    )
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  return rows.map((it) => ({
    id: String(it.id),
    title: {
      en: it.title?.en ?? "",
      zh: it.title?.zh ?? "",
    },
    blurb: (it.blurb ?? [])
      .filter((b) => b?.en || b?.zh)
      .map((b) => ({ en: b.en ?? "", zh: b.zh ?? "" })),
    images: (it.images ?? []).map((p) => asset(`/${String(p).replace(/^\//, "")}`)),
  }));
}

const VALID_IDS: LightId[] = ["hike", "photo", "village", "foodfilm", "craft", "wellness"];

function isObj(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function txOf(v: unknown, fb: Tx): Tx {
  if (!isObj(v)) return fb;
  const zh = typeof v.zh === "string" ? v.zh : "";
  const en = typeof v.en === "string" ? v.en : "";
  if (!zh && !en) return fb;
  return { zh: zh || fb.zh, en: en || fb.en };
}

function txListOf(v: unknown, fb: Tx[]): Tx[] {
  if (!Array.isArray(v)) return fb;
  const out: Tx[] = [];
  v.filter(isObj).forEach((x, i) => {
    const item = txOf(x, fb[i] ?? { en: "", zh: "" });
    if (item.en || item.zh) out.push(item);
  });
  return out.length ? out : fb;
}

function pathOf(v: unknown, fb: string): string {
  if (typeof v !== "string" || !v.trim()) return fb;
  return asset(`/${v.trim().replace(/^\//, "")}`);
}

function pathsOf(v: unknown, fb: string[]): string[] {
  if (!Array.isArray(v)) return fb;
  const out = v
    .filter((x): x is string => typeof x === "string" && !!x.trim())
    .map((p) => asset(`/${p.trim().replace(/^\//, "")}`));
  return out.length ? out : fb;
}

function build(): LightExperience[] {
  try {
    const raw = Object.values(files)[0] ?? "";
    const doc = (parse(raw) ?? {}) as { items?: unknown };
    const items = Array.isArray(doc.items) ? doc.items.filter(isObj) : [];
    if (!items.length) return FALLBACK;

    const out: LightExperience[] = [];
    for (const it of items) {
      if (typeof it.id !== "string" || !VALID_IDS.includes(it.id as LightId)) continue;
      const fb = FALLBACK.find((f) => f.id === it.id);
      if (!fb) continue;
      const badge = typeof it.badge === "string" && it.badge.trim() ? it.badge.trim() : "";
      out.push({
        id: it.id as LightId,
        badge: badge ? { en: badge, zh: badge } : fb.badge,
        title: txOf(it.title, fb.title),
        tagline: txOf(it.tagline, fb.tagline),
        duration: txOf(it.duration, fb.duration),
        group: txOf(it.group, fb.group),
        season: txOf(it.season, fb.season),
        cover: pathOf(it.cover, fb.cover),
        gallery: pathsOf(it.gallery, fb.gallery),
        desc: txListOf(it.desc, fb.desc),
        highlights: txListOf(it.highlights, fb.highlights),
        included: txListOf(it.included, fb.included),
        ...(fb.routesLabel ? { routesLabel: fb.routesLabel } : {}),
        ...(fb.routesSub ? { routesSub: fb.routesSub } : {}),
        // routes / meals 由 attachSkuOverlay 统一挂载
      });
    }
    return out.length ? out : FALLBACK;
  } catch (err) {
    console.warn("[content] content/experiences.yaml 解析失败，已回退到代码默认值", err);
    return FALLBACK;
  }
}

function attachSkuOverlay(items: LightExperience[]): LightExperience[] {
  return items.map((cat) => {
    const routes = skusForCategory(cat.id, "route");
    const meals = skusForCategory(cat.id, "meal");
    return {
      ...cat,
      ...(routes.length
        ? { routes }
        : cat.routes?.length
          ? { routes: cat.routes }
          : {}),
      ...(meals.length
        ? { meals }
        : cat.meals?.length
          ? { meals: cat.meals }
          : {}),
    };
  });
}

function attachPrices(items: LightExperience[]): LightExperience[] {
  return items.map((cat) => ({
    ...cat,
    routes: cat.routes?.map((r) => {
      const price = priceOf(r.id);
      return price ? { ...r, price } : r;
    }),
    meals: cat.meals?.map((r) => {
      const price = priceOf(r.id);
      return price ? { ...r, price } : r;
    }),
  }));
}

export const lightExperiences: LightExperience[] = attachPrices(attachSkuOverlay(build()));

export const lightById = (id: LightId): LightExperience | undefined =>
  lightExperiences.find((item) => item.id === id);
