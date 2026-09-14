import { parse } from "yaml";
import type { LightId, Tx } from "@/types";
import { asset } from "@/lib/asset";

const L = (en: string, zh: string): Tx => ({ en, zh });

/**
 * 轻旅行体验 · 小产品栏目
 *
 * 与长线路分开：半日到一日、可单独预订、可挂在任意线路前后。
 * 页面不展示价格 —— 按人数与日期核算，走询单（见 copy.light.priceNote）。
 * duration / group / season 目前是建议值，等主理人确认后替换。
 */
/** 详情展开里的路线小产品（目前用于「村落人文考察」） */
export type LightRoute = {
  id: string;
  title: Tx;
  /** 2–3 句短文案 */
  blurb: Tx[];
  /** 2–3 张配图 */
  images: string[];
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
      L("Countryside walks above glass fields and karst viewpoints", "玻璃田与喀斯特观景台的田园徒步"),
      L("Guided creek tracing with swim pools and natural slides", "教练带领的山谷溯溪：碧潭与天然水滑"),
      L("Vintage scooters along the Yulong River promenade", "遇龙河网红步道复古机车骑行"),
      L("ATV off-road through streams and valley tracks", "全地形车山谷冲滩越野"),
    ],
    included: [
      L("Local guide / coach throughout", "全程在地向导 / 户外教练"),
      L("Activity gear as listed (helmet, life jacket, vehicle)", "活动所列装备（头盔、救生衣、车辆等）"),
      L("Drinking water and one main meal when stated", "饮用水；行程写明时含一顿正餐"),
    ],
    routesLabel: L("Activity options", "活动小产品"),
    routesSub: L(
      "Six Guilin–Yangshuo outings you can book alone or pair with a longer trip.",
      "六档桂林阳朔户外活动——可单独体验，也可挂在长线前后。",
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
        title: L("ATV Valley Off-Road", "全地形车 · 山谷越野"),
        blurb: [
          L(
            "Hop on an ATV with your host: ford streams, splash through caves and feel summer in Yangshuo’s valleys — two per vehicle, coach-taught before you roll.",
            "跨上 ATV 全地形车，跟随管家在阳朔山谷冲滩、溯溪、山洞戏水；两人一台，教练实操教学，学会再出发。",
          ),
          L(
            "A new skill and a wet, laughing afternoon — gear and briefing included.",
            "学会一种新技能，再带走一个湿透又痛快的午后；装备与行前说明都安排好。",
          ),
        ],
        images: [
          asset("/light/hike/atv-1.jpeg"),
          asset("/light/hike/atv-2.jpeg"),
          asset("/light/hike/atv-3.jpeg"),
        ],
      },
      {
        id: "raft",
        title: L("Yulong River Bamboo Raft", "遇龙河竹筏 · 古桥峰丛"),
        blurb: [
          L(
            "Pole-driven bamboo rafts on the clear Yulong — old bridges, karst peaks and rice paddies drawn into one quiet scroll.",
            "手撑竹筏游遇龙河：河水清澈见底，古桥、峰丛与水稻田共同画出诗意田园。",
          ),
          L(
            "Shoot the weir with your raftsman, splash in a water fight, or simply sit and watch the green hills pass.",
            "筏工师傅带你体验冲坝与打水仗，也可以安静坐着，看两岸连绵青山慢慢过去。",
          ),
        ],
        images: [
          asset("/light/hike/raft-1.jpeg"),
          asset("/light/hike/raft-2.jpeg"),
          asset("/light/hike/raft-3.jpeg"),
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
      asset("/light/village/oil-tea-2.jpeg"),
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
      "Five village encounters you can book on their own or pair with a longer trip.",
      "五档可单独加订的村落相遇——可单独体验，也可挂在长线前后。",
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
        title: L("Zhuang Oil Tea by the Hearth", "一杯苦来四杯香 · 打油茶"),
        blurb: [
          L(
            "Follow a Zhuang auntie through every step of hand-beaten oil tea — from frying the leaves to crisp oil fritters — the living taste of northern Guangxi.",
            "跟随壮族阿嫂手打油茶：从炒茶到油果，一道工序接着一道，把桂北传统饮食文化摊开在火塘边。",
          ),
          L(
            "First cup bitter, second astringent, third and fourth suddenly fragrant — then you understand why this bowl is everyday life, not a souvenir.",
            "一杯苦，二杯涩，三杯四杯才见好油茶。亲自喝过，才懂这碗茶为什么是生活，而不是纪念品。",
          ),
        ],
        images: [
          asset("/light/village/oil-tea-1.jpeg"),
          asset("/light/village/oil-tea-2.jpeg"),
          asset("/light/village/oil-tea-3.jpeg"),
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
      "Eat the scene, then watch the place on screen",
      "先吃到那个场景，再在银幕上看见它",
    ),
    duration: L("3–5 hours", "3–5 小时"),
    group: L("2–12 travellers", "2–12 人"),
    season: L("Year-round · evenings preferred", "全年可订 · 建议傍晚"),
    cover: asset("/destinations/hanoi.jpg"),
    gallery: [
      asset("/destinations/hanoi.jpg"),
      asset("/destinations/guilin-mifen.jpg"),
      asset("/destinations/kunming-dengdeng.jpg"),
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
      L("Morning market walk with a food writer or chef", "由food writer或主厨带队的早市"),
      L("Six-to-eight tastings, no tourist-menu versions", "6–8 处品鉴，不安排游客菜单"),
      L("Film screening tied to the location", "与取景地呼应的电影放映"),
      L("Evening option with drinks and open-air screen", "可选傍晚场：酒水 + 露天银幕"),
    ],
    included: [
      L("Food host for the whole session", "全程美食向导"),
      L("All tastings and one drink", "全部品鉴与一杯饮品"),
      L("Screening setup and subtitles", "放映设备与字幕"),
    ],
  },
  {
    id: "craft",
    badge: L("HANDICRAFT", "HANDICRAFT"),
    title: L("Handicraft Workshops", "手作与非遗工坊"),
    tagline: L(
      "Make one thing properly, with the person who teaches it",
      "跟真正做这行的人，好好做完一件东西",
    ),
    duration: L("2–4 hours", "2–4 小时"),
    group: L("1–8 travellers", "1–8 人"),
    season: L("Year-round", "全年可订"),
    cover: asset("/destinations/dongfengyun2.jpg"),
    gallery: [
      asset("/destinations/dongfengyun2.jpg"),
      asset("/destinations/mile.jpg"),
      asset("/destinations/jianshuioldtown1.jpg"),
    ],
    desc: [
      L(
        "Two to four hours at one bench: throwing clay, dyeing cloth, pressing tea, shaping paper. The instructor is the maker, and the pace is the pace the craft actually needs.",
        "两到四个小时，守在一张工作台前：拉坯、扎染、压茶、抄纸。教你的人是做这行的人，节奏也是这门手艺真正需要的节奏。",
      ),
      L(
        "You leave with the object you made — fired, dried or boxed for shipping. Nothing is a demo piece someone else finished for you.",
        "你带走的是自己做的那件：烧好、晾干或打包寄回。没有哪一件是别人替你收尾的样品。",
      ),
    ],
    highlights: [
      L("Pottery on the wheel at a working kiln", "在仍在烧窑的作坊里拉坯"),
      L("Indigo dyeing and natural pigment mixing", "蓝靛扎染与植物染料调制"),
      L("Tea pressing, roasting and tasting", "压茶、焙火与品鉴"),
      L("Take home what you made, shipping arranged", "作品带走，可安排寄送"),
    ],
    included: [
      L("Maker-led instruction", "手艺人全程教学"),
      L("All materials, firing and packing", "全部材料、烧制与包装"),
      L("Shipping to your home address", "成品寄送到家"),
    ],
  },
  {
    id: "wellness",
    badge: L("WELLNESS & SPA", "WELLNESS & SPA"),
    title: L("Healing & Unwinding", "疗愈与放松"),
    tagline: L(
      "Massage, meditation and slow hours — built into the day",
      "按摩、冥想与慢下来的几个小时，写进当天行程",
    ),
    duration: L("2–3 hours", "2–3 小时"),
    group: L("1–6 travellers", "1–6 人"),
    season: L("Year-round · best at dusk", "全年可订 · 傍晚最佳"),
    cover: asset("/destinations/hotel-c.jpg"),
    gallery: [
      asset("/destinations/hotel-c.jpg"),
      asset("/destinations/guantang3.jpg"),
      asset("/destinations/mingshi-2.jpg"),
    ],
    desc: [
      L(
        "Recovery is part of the journey, not a reward for finishing it. We book the therapists who still work with local herbs, and the rooms that are quiet at six in the evening — so a long drive or a steep trail ends with warm oil, not a queue.",
        "恢复体力是旅程的一部分，不是走完之后的奖励。我们只约仍用本地草药的理疗师，只订傍晚六点依旧安静的房间——一整天车程或山路之后，等着你的是热毛巾与精油，而不是排队取号。",
      ),
      L(
        "Sessions run at your pace: a foot soak after the morning market, a full-body herbal massage after a trek, or twenty quiet minutes of guided breathing before dinner. No upsell, no membership talk.",
        "节奏由你定：逛完早市泡个脚，徒步之后做一次全身草药按摩，或者晚餐前跟着引导做二十分钟呼吸。没有推销，也不办卡。",
      ),
    ],
    highlights: [
      L("Herbal compress and full-body massage by local therapists", "在地理疗师的草药热敷与全身按摩"),
      L("Guided meditation and breathwork, indoors or by the water", "冥想与呼吸引导，室内或临水"),
      L("Foot soak and hot-stone ritual after long walking days", "徒步日后的足浴与热石"),
      L("Sound bath or evening stretching as an optional add-on", "颂钵音疗或傍晚拉伸（可选加项）"),
    ],
    included: [
      L("Therapist or meditation guide for the session", "理疗师 / 冥想引导师全程"),
      L("Herbs, oils, towels and hot stones", "草药、精油、毛巾与热石"),
      L("Private quiet room and tea afterwards", "独立安静房间与事后茶饮"),
    ],
  },
];

// --- 读取 content/experiences.yaml（与 content/routes/*.yaml 同一套机制）---
const files = import.meta.glob("../../content/experiences.yaml", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

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
        // YAML 暂未建模 routes / meals；小产品与餐食先以代码为准
        ...(fb.routes?.length ? { routes: fb.routes } : {}),
        ...(fb.routesLabel ? { routesLabel: fb.routesLabel } : {}),
        ...(fb.routesSub ? { routesSub: fb.routesSub } : {}),
        ...(fb.meals?.length ? { meals: fb.meals } : {}),
      });
    }
    return out.length ? out : FALLBACK;
  } catch (err) {
    console.warn("[content] content/experiences.yaml 解析失败，已回退到代码默认值", err);
    return FALLBACK;
  }
}

export const lightExperiences: LightExperience[] = build();

export const lightById = (id: LightId): LightExperience | undefined =>
  lightExperiences.find((item) => item.id === id);
