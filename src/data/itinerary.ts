import type { DayStop, RouteId, Tx } from "@/types";
import { asset } from "@/lib/asset";
import { overlayItineraries } from "@/content/itineraries";

const L = (en: string, zh: string): Tx => ({ en, zh });

/**
 * 字段约定（避免与下方「交通 / 住宿 / 餐饮」表格重复）：
 * - transport：写清路段时间（长途必带车程），表格里显示为「交通」
 * - bullets：只放表格里没有的当日景点与活动，不重复交通与住宿
 */

const vietnamBlock: DayStop[] = [
  {
    day: 0,
    city: L("Cat Ba Island", "吉婆岛"),
    stay: L("Harbour night on the island", "岛上港边过夜"),
    stayKind: "hotel",
    placeId: "catba",
    drive: L("Full day transit", "全天交通"),
    transport: L(
      "Cross at Mong Cai, then ferry to Cat Ba — full day, ~8 h door to door",
      "芒街口岸通关，转轮渡赴吉婆岛；全程约 8 小时",
    ),
    lodging: L("Bay-facing island hotel", "看湾的小岛酒店"),
    dining: [
      L("Lunch: border-town noodles on the way", "午餐：途中口岸小城的一碗面"),
      L("Dinner: seafood on the harbour", "晚餐：港边海鲜"),
    ],
    bullets: [],
    themes: ["wild"],
  },
  {
    day: 0,
    city: L("Hanoi", "河内"),
    stay: L("Old Quarter, first night", "古城，第一夜"),
    stayKind: "hotel",
    placeId: "hanoi",
    transport: L("Road from Hai Phong / Cat Ba, ~2.5 h", "海防 / 吉婆岛公路进城，约 2.5 小时"),
    lodging: L("French-quarter hide near the lake", "湖边法租界小住"),
    dining: [
      L("Lunch: on the road into the city", "午餐：进城途中"),
      L("Dinner: Old Quarter street table", "晚餐：古城街头一桌"),
    ],
    bullets: [
      L("36 Streets + cyclo, Train Street", "三十六鼓街含三轮车，打卡火车街"),
      L("West Lake night bus", "观光巴士夜游西湖"),
    ],
    themes: ["flavors", "locals"],
  },
  {
    day: 0,
    city: L("Hanoi", "河内"),
    stay: L("Old Quarter, second night", "古城，第二夜"),
    stayKind: "hotel",
    placeId: "hanoi",
    transport: L("On foot and cyclo in the Old Quarter", "古城步行 + 三轮车"),
    lodging: L("Same restored house — no packing", "同一栋修好的老房子，不用收行李"),
    dining: [
      L("Lunch: lotus buffet", "午餐：莲花自助餐"),
      L("Dinner: egg coffee, then a stall you pick", "晚餐：蛋咖啡，再选一摊"),
    ],
    bullets: [
      L("Ho Chi Minh & Ba Dinh", "胡志明纪念堂、巴亭广场"),
      L("Free time or the market", "自由活动或逛河内菜市场"),
    ],
    themes: ["flavors"],
  },
  {
    day: 0,
    city: L("Sapa", "沙坝"),
    stay: L("Terraces above the town", "镇上看田"),
    stayKind: "hotel",
    placeId: "sapa",
    drive: L("Road · 5–6 h", "公路约 5–6 小时"),
    transport: L("Private car Hanoi → Sapa, 5–6 h", "专车河内至沙坝，约 5–6 小时"),
    lodging: L("Terrace-facing mountain lodge", "看田的山居"),
    dining: [
      L("Lunch: on the mountain road", "午餐：山路途中"),
      L("Dinner: highland hot pot", "晚餐：高地热锅"),
    ],
    bullets: [
      L("Rice terraces", "沙坝梯田"),
      L("Cat Cat village", "猫猫村"),
    ],
    themes: ["villages"],
  },
  {
    day: 0,
    city: L("Overnight train", "米轨过夜"),
    stay: L("Sleep on the metre-gauge", "住在米轨上"),
    stayKind: "train",
    placeId: "train",
    drive: L("Overnight metre-gauge", "米轨过夜列车"),
    transport: L(
      "Fansipan cable up, then evening metre-gauge departure",
      "上午番西邦缆车上山，晚上米轨发车过夜",
    ),
    lodging: L("Soft sleeper on the Yunnan–Vietnam line", "滇越米轨软卧"),
    dining: [
      L("Lunch: Sapa before the cable", "午餐：上山前在沙坝"),
      L("Dinner: simple meal before boarding", "晚餐：上车前简单一顿"),
    ],
    bullets: [],
    themes: ["wild"],
  },
];

function stamp(block: DayStop[], startDay: number): DayStop[] {
  return block.map((d, i) => ({ ...d, day: startDay + i }));
}

const fallbackRoutes: Record<RouteId, { id: RouteId; days: DayStop[] }> = {
  r1: {
    id: "r1",
    days: [
      {
        day: 1,
        city: L("Nanning", "南宁"),
        stay: L("Yong River, first Chinese night", "邕江边，第一夜"),
        stayKind: "hotel",
        placeId: "nanning",
        transport: L("Airport pickup, then a slow city night", "接机，然后一个慢的城市夜"),
        lodging: L("Riverside garden stay", "江景花园酒店"),
        dining: [
          L("Lunch: depending on arrival", "午餐：看抵达时间"),
          L("Dinner: snail noodles on Zhongshan Road", "晚餐：中山路螺蛳粉"),
        ],
        bullets: [
          L("City orientation", "城市适应"),
          L("Rest before the road", "上路前休息"),
        ],
        themes: ["locals"],
      },
      {
        day: 2,
        city: L("Chongzuo", "崇左"),
        stay: L("Karst road, after the falls", "看山，瀑布之后"),
        stayKind: "hotel",
        placeId: "chongzuo",
        drive: L("Nanning → Detian ~3.5 h · Detian → Mingshi ~1 h", "南宁→德天约 3.5 小时 · 德天→明仕约 1 小时"),
        transport: L(
          "Private car to Detian Falls (~3.5 h), then on to Mingshi Pastoral (~1 h)",
          "专车至德天瀑布（约 3.5 小时），再赴明仕田园（约 1 小时）",
        ),
        lodging: L("Karst-view lodge", "看山的小住"),
        dining: [
          L("Lunch: river fish near the falls", "午餐：瀑布附近的河鱼"),
          L("Dinner: Chongzuo sticky rice table", "晚餐：崇左糯米一桌"),
        ],
        bullets: [],
        themes: ["wild"],
      },
      {
        day: 3,
        city: L("Ha Long", "下龙"),
        stay: L("First night on the bay", "湾上第一夜"),
        stayKind: "hotel",
        placeId: "halong",
        drive: L("Chongzuo → Dongxing, then into Vietnam", "崇左赴东兴，过境后再赴下龙"),
        transport: L(
          "Chongzuo → Dongxing (~2.5 h), cross at Mong Cai, then on to Ha Long (~3 h)",
          "崇左赴东兴（约 2.5 小时），芒街口岸入境越南，再赴下龙（约 3 小时）",
        ),
        lodging: L("Bay-facing hotel in Ha Long", "下龙看湾的酒店"),
        dining: [
          L("Lunch: after the crossing", "午餐：过关之后"),
          L("Dinner: seafood on the harbour", "晚餐：港边海鲜"),
        ],
        bullets: [],
        themes: ["wild"],
      },
      {
        day: 4,
        city: L("Ha Long", "下龙"),
        stay: L("Second night on the bay", "湾上第二夜"),
        stayKind: "hotel",
        placeId: "halong",
        transport: L("Day cruise on Ha Long Bay", "下龙湾一日游轮出海"),
        blurb: L(
          "A full day on the water instead of a pass-through: the cruise eases into lagoons the big boats skip, and by evening the bay is yours again. Two nights is what lets you watch it leave and come back.",
          "今天不赶路，整日在水上：游轮钻进大船绕开的湖，傍晚整座湾又交还给你。连住两晚，才看得见它「离开又回来」。",
        ),
        lodging: L("Same bay hotel — no packing", "同一家看湾酒店，不用收行李"),
        dining: [
          L("Lunch: on the boat", "午餐：游轮上"),
          L("Dinner: back in Ha Long town", "晚餐：回到下龙镇上"),
        ],
        bullets: [L("Karst seascape among the limestone isles", "海上喀斯特风光")],
        themes: ["wild"],
      },
      {
        day: 5,
        city: L("Cat Ba Island", "吉婆岛"),
        stay: L("Harbour night on the island", "岛上港边过夜"),
        stayKind: "hotel",
        placeId: "catba",
        transport: L("Ferry from Ha Long to Cat Ba, ~1 h", "下龙轮渡登陆吉婆岛，约 1 小时"),
        blurb: L(
          "A short ferry from Ha Long, then an island still keeping its own hours — kayaking the lagoons in the morning, the national park in the afternoon, harbour seafood at night. The night here is water, not a highway hotel.",
          "从下龙坐一小段轮渡，便是一座还按自己节奏过的岛——上午划船进湖，下午走国家公园，夜里港边海鲜。这一夜是水，不是高速旁的酒店。",
        ),
        lodging: L("Bay-facing island hotel", "看湾的小岛酒店"),
        dining: [
          L("Lunch: on the island after landing", "午餐：登岛之后"),
          L("Dinner: harbour seafood", "晚餐：港边海鲜"),
        ],
        bullets: [L("An unhurried island afternoon", "海岛休闲")],
        themes: ["wild"],
      },
      {
        day: 6,
        city: L("Hanoi", "河内"),
        stay: L("Old Quarter, first night", "古城，第一夜"),
        stayKind: "hotel",
        placeId: "hanoi",
        drive: L("Cable to Hai Phong · metre-gauge 18:40 to Hanoi", "跨海缆车至海防 · 18:40 米轨赴河内"),
        transport: L(
          "Cat Ba cable to Hai Phong; 18:40 metre-gauge into Hanoi (~2 h)",
          "吉婆岛跨海缆车至海防；18:40 百年米轨前往河内（约 2 小时）",
        ),
        lodging: L("French-quarter hide near the lake", "湖边法租界小住"),
        dining: [
          L("Afternoon: Vietnamese drip coffee while you wait", "等候时赠送越南滴漏咖啡"),
          L("Dinner: after the train, Old Quarter", "晚餐：下车后在古城"),
        ],
        bullets: [
          L(
            "Hai Phong’s century-old station; drip coffee while you wait",
            "参观海防百年老火车站；等候赠送越南滴漏咖啡",
          ),
        ],
        themes: ["flavors", "locals"],
      },
      {
        day: 7,
        city: L("Hanoi", "河内"),
        stay: L("Old Quarter, second night", "古城，第二夜"),
        stayKind: "hotel",
        placeId: "hanoi",
        transport: L("On foot and cyclo in the Old Quarter", "古城步行 + 三轮车"),
        blurb: L(
          "The second day in the Old Quarter moves slower: a cyclo past the lake, Ba Dinh and St Joseph's, then Train Street as the light goes. Same restored house, no packing — the city is the itinerary.",
          "在老城的第二天慢下来：三轮车绕湖，巴亭广场与河内大教堂，天暗了去火车街。同一栋老房子，不用收行李——这座城本身就是行程。",
        ),
        lodging: L("Same restored house — no packing", "同一栋修好的老房子，不用收行李"),
        dining: [
          L("Lunch: a city table near the lake", "午餐：湖边一桌"),
          L("Dinner: Old Quarter street stall", "晚餐：古城街头一摊"),
        ],
        bullets: [
          L(
            "Ba Dinh Square, Ho Chi Minh’s residence, St Joseph’s Cathedral",
            "巴亭广场、胡志明故居、河内大教堂",
          ),
          L("Train Street", "火车街"),
        ],
        themes: ["flavors", "locals"],
      },
      {
        day: 8,
        city: L("Sapa", "沙坝"),
        stay: L("Terraces above the town", "镇上看田"),
        stayKind: "hotel",
        placeId: "sapa",
        drive: L("Private car · 5.5–6 h", "专车约 5.5–6 小时"),
        transport: L("Private car Hanoi → Sapa, 5.5–6 h", "河内包车前往沙坝，车程 5.5–6 小时"),
        lodging: L("Terrace-facing mountain lodge", "看田的山居"),
        dining: [
          L("Lunch: on the mountain road", "午餐：山路途中"),
          L("Afternoon tea among the terraces", "抵达后梯田下午茶"),
        ],
        bullets: [],
        themes: ["villages"],
      },
      {
        day: 9,
        city: L("Sapa", "沙坝"),
        stay: L("Same lodge, no suitcase", "同一山居，不拎箱子"),
        stayKind: "hotel",
        placeId: "sapa",
        transport: L(
          "Fansipan cable + Muong Hoa train, then Cat Cat on foot",
          "番西邦缆车 + 芒花小火车，下午步行猫猫村",
        ),
        blurb: L(
          "The second morning rides the cable up Fansipan, then comes down to Cat Cat on foot — terraces at shoulder height, a village that still farms them by hand. Two nights so the mist on the rice has somewhere to settle.",
          "第二天上午缆车上番西邦，下午步行下猫猫村——梯田在肩膀的高度，村里还用手种着。连住两晚，雾在稻子上才有了落脚处。",
        ),
        lodging: L("Terrace-facing mountain lodge — second night", "看田的山居 · 第二晚"),
        dining: [
          L("Lunch: after the cable, in the valley", "午餐：下山后在谷里"),
          L("Dinner: highland hot pot", "晚餐：高地热锅"),
        ],
        bullets: [
          L("Hmong market, if the morning allows", "黑苗族集市（看当天）"),
          L("Terrace-view evening from the balcony", "阳台上看梯田的傍晚"),
        ],
        themes: ["wild", "villages"],
      },
      {
        day: 10,
        city: L("Jianshui", "建水"),
        stay: L("Inside the old town wall", "古城墙里"),
        stayKind: "hotel",
        placeId: "jianshui",
        drive: L("Sapa → Lao Cai → Hekou, then to Jianshui", "沙坝—老街—河口，再乘车赴建水"),
        transport: L(
          "Sapa → Lao Cai (~1 h), exit at Hekou, then car to Jianshui (~3 h)",
          "沙坝至老街（约 1 小时），河口口岸出境，乘车赴建水（约 3 小时）",
        ),
        lodging: L("Courtyard inn inside the wall", "城墙里的院子客栈"),
        dining: [
          L("Lunch: after the crossing", "午餐：过关之后"),
          L("Dinner: grilled tofu in the courtyard", "晚餐：天井里的烤豆腐"),
        ],
        bullets: [],
        themes: ["villages"],
      },
      {
        day: 11,
        city: L("Puzhehei", "普者黑"),
        stay: L("Inside Puzhehei scenic area", "普者黑景区内"),
        stayKind: "park",
        placeId: "puzhehei",
        drive: L("Private car · ~4 h", "专车约 4 小时"),
        blurb: L(
          "Puzhehei is a lake that grew inside a karst forest. Lotus flowers between the peaks, bamboo raft threading between them — this is the kind of landscape that makes you question whether it's real.",
          "普者黑是长在喀斯特森林里的一湖水。峰丛之间开着荷花，竹筏从中间穿过去——这种风景会让人怀疑是不是真的。",
        ),
        photos: [
          asset("/destinations/jianshui.jpg"),
          asset("/destinations/chongzuo.jpg"),
          asset("/destinations/puzhehei.jpg"),
        ],
        transport: L(
          "Jianshui mini-train, then car to Puzhehei ~4 h",
          "建水小火车，下午专车赴普者黑约 4 小时",
        ),
        lodging: L("Yi minority lakeside guesthouse", "彝族湖畔民宿"),
        dining: [
          L("Lunch: in Jianshui before the road", "午餐：上路前在建水"),
          L("Dinner: innkeeper’s home-style cooking", "晚餐：房东家常菜"),
        ],
        bullets: [
          L(
            "Jianshui old town and the mini-train (Double Dragon, Xianghui, Tuanshan)",
            "建水古城、小火车（双龙桥、香会桥、团山民居）",
          ),
        ],
        themes: ["villages", "wild"],
      },
      {
        day: 12,
        city: L("Mile", "弥勒"),
        stay: L("Dongfengyun, then the spring", "东风韵，然后温泉"),
        stayKind: "hotel",
        placeId: "mile",
        drive: L("Private car · 3 h", "专车约 3 小时"),
        transport: L(
          "Willow-leaf boat, then car to Mile ~3 h",
          "柳叶舟游湖，专车至弥勒约 3 小时",
        ),
        lodging: L("Hot-spring room", "温泉房"),
        dining: [
          L("Lunch: lake fish before leaving Puzhehei", "午餐：离开普者黑前的湖鱼"),
          L("Dinner: Yunnan table, then the spring", "晚餐：云南菜，然后泡汤"),
        ],
        bullets: [L("Dongfengyun at dusk", "傍晚东风韵")],
        themes: ["wild", "flavors"],
      },
      {
        day: 13,
        city: L("Kunming", "昆明"),
        stay: L("Green Lake, last city night", "翠湖，最后一城"),
        stayKind: "hotel",
        placeId: "kunming",
        drive: L("Private car · 2 h", "专车约 2 小时"),
        transport: L("Private car Mile → Kunming ~2 h", "专车弥勒至昆明约 2 小时"),
        lodging: L("Green Lake or near the airport", "翠湖或机场附近"),
        dining: [
          L("Lunch: crossing-the-bridge noodles", "午餐：过桥米线"),
          L("Dinner: old street, if you still have legs", "晚餐：还有腿就去老街"),
        ],
        bullets: [
          L("Green Lake Park", "昆明翠湖公园"),
          L("Kunming old street", "昆明老街"),
        ],
        themes: ["flavors", "locals"],
      },
      {
        day: 14,
        city: L("Depart", "送机"),
        stay: L("Airport", "机场"),
        stayKind: "hotel",
        transport: L("Hotel to Kunming Changshui, ~1 h", "酒店送至长水机场，约 1 小时"),
        lodging: L("Morning checkout", "早晨退房"),
        dining: [L("Breakfast at the hotel, or Dounan if the flight is late", "酒店早餐；晚班机可加斗南")],
        bullets: [
          L(
            "Afternoon or evening flight? Dounan flower market",
            "若下午或晚上航班，可安排斗南花市",
          ),
        ],
        themes: ["flavors"],
      },
    ],
  },
  r2: {
    id: "r2",
    days: [
      {
        day: 1,
        city: L("Nanning", "南宁"),
        stay: L("Yong River, before the border", "邕江边，过关前夜"),
        stayKind: "hotel",
        placeId: "nanning",
        transport: L("Airport pickup, then a brief city night", "接机，然后一个短的城市夜"),
        lodging: L("Riverside garden stay", "江景花园酒店"),
        dining: [
          L("Lunch: depending on arrival", "午餐：看抵达时间"),
          L("Dinner: snail noodles on Zhongshan Road", "晚餐：中山路螺蛳粉"),
        ],
        bullets: [
          L("Brief city night", "南宁夜"),
          L("Early border next day", "次日过关"),
        ],
        themes: ["locals"],
      },
      ...stamp(vietnamBlock, 2),
      {
        day: 7,
        city: L("Guantang", "观堂"),
        stay: L("Two-night village base", "村里连住的第一晚"),
        stayKind: "base",
        placeId: "guantang",
        transport: L(
          "Lang Son → Friendship Pass crossing, then Longzhou (~1.5 h)",
          "谅山至友谊关出境，再赴龙州（约 1.5 小时）",
        ),
        lodging: L("Guantang courtyard", "观堂的院子"),
        dining: [
          L("Lunch: after the pass", "午餐：过关之后"),
          L("Dinner: Zhuang table at the courtyard", "晚餐：院子里的壮家饭"),
        ],
        bullets: [L("Lang Son & Dong Dang fair", "谅山、同登庙会")],
        themes: ["locals", "villages"],
      },
      {
        day: 8,
        city: L("Guantang", "观堂"),
        stay: L("Same courtyard, no suitcase", "同一院子，不拎箱子"),
        stayKind: "base",
        placeId: "guantang",
        transport: L("Bicycle in the cane, walk to Tianqin village", "蔗海骑行，步行去天琴寨"),
        blurb: L(
          "The second morning belongs to the cane sea — bicycles between the stalks, then a walk to Tianqin village where two strings carry a song older than the border line. No suitcase, no plan beyond the light.",
          "第二天早晨交给蔗海——蔗丛间骑车，再步行去天琴寨，两根弦挑着一支比国界更老的歌。不拎箱子，除了光，没别的计划。",
        ),
        lodging: L("Guantang courtyard — second night", "观堂的院子 · 第二晚"),
        dining: [
          L("Lunch: village kitchen", "午餐：村里的厨房"),
          L("Dinner: oil tea and whatever came from the field", "晚餐：油茶，和当天地里来的东西"),
        ],
        bullets: [L("Free walk", "自由散步")],
        themes: ["villages", "wild"],
      },
      {
        day: 9,
        city: L("Nanning", "南宁"),
        stay: L("Back in the garden city", "回到绿城"),
        stayKind: "hotel",
        placeId: "chongzuo",
        transport: L(
          "Detian by car (~2 h), then return to Nanning (~3.5 h)",
          "专车赴德天（约 2 小时），再返回南宁（约 3.5 小时）",
        ),
        lodging: L("Nanning riverside hotel", "南宁江景酒店"),
        dining: [
          L("Lunch: river fish at Detian", "午餐：德天河鱼"),
          L("Dinner: Nanning, whatever you still want", "晚餐：南宁，想吃什么吃什么"),
        ],
        bullets: [L("Mingshi Pastoral", "明仕田园")],
        themes: ["wild"],
      },
      {
        day: 10,
        city: L("Depart", "结束"),
        stay: L("Nanning", "南宁"),
        stayKind: "hotel",
        transport: L("Hotel to Nanning Wuxu Airport, ~1 h", "酒店送至吴圩机场，约 1 小时"),
        lodging: L("Morning checkout", "早晨退房"),
        dining: [L("Breakfast at the hotel", "酒店早餐")],
        bullets: [L("Ask us for extra night", "需要加住告诉我们")],
        themes: ["locals"],
      },
    ],
  },
  r3: {
    id: "r3",
    days: [
      {
        day: 1,
        city: L("Nanning", "南宁"),
        stay: L("Street food, first night", "夜市里的第一夜"),
        stayKind: "hotel",
        placeId: "nanning",
        transport: L("Airport or station pickup, transfer to the hotel", "专车接机／接站，送往酒店"),
        lodging: L("Shangri-La Nanning", "南宁香格里拉酒店"),
        dining: [
          L("Lunch: not included", "午餐：不含"),
          L("Dinner: Jianzheng night market, at your own pace", "晚餐：建政夜市，自行寻觅"),
        ],
        blurb: L(
          "Someone once called Guangxi the most complicated place to eat in China, and Nanning — its capital — is where that complexity becomes street food. The city's warmth hides in its lanes: the sour-savoury smell of pickled fruit, the heat of a wok firing old friend noodles, the sweet hush of a sugar-water stall at dusk.",
          "有人说过，广西是中国饮食最复杂的地方。而南宁作为首府，把这份复杂变成了街头滋味。这座城的热情藏在巷弄里：酸嘢的清爽、老友粉的热辣、卷筒粉的软糯、糖水的甜蜜，暮色渐浓时，建政夜市灯火通明、人声鼎沸。",
        ),
        bullets: [
          L("Three Streets & Two Lanes, Changyou Pavilion", "三街两巷 · 畅游阁"),
          L("Jianzheng night market", "建政夜市"),
        ],
        themes: ["locals", "flavors"],
      },
      {
        day: 2,
        city: L("Chongzuo", "崇左"),
        stay: L("By the Black Water River", "黑水河边"),
        stayKind: "hotel",
        placeId: "chongzuo",
        drive: L("Nanning → Chongzuo", "南宁赴崇左"),
        transport: L("Private car to Chongzuo, then the Black Water River boat", "专车赴崇左，黑水河游船"),
        lodging: L("LUX* Chongzuo", "崇左秘境丽世度假村"),
        dining: [
          L("Lunch: simple lunch on the island", "午餐：小岛简餐"),
          L("Dinner: not included", "晚餐：不含"),
        ],
        blurb: L(
          "The Black Water River is Chongzuo's karst at its most painterly — steep peaks and thick primaeval growth on both banks, water so clear the range lies doubled on the surface. Boating through it feels less like transport and more like drifting inside an ink painting.",
          "黑水河是崇左喀斯特最像画的一段：两岸峰林高耸、原始植被茂密，河水碧绿清澈，山的倒影静静铺在水面，船行其中，像驶进一幅水墨丹青。",
        ),
        photos: [
          asset("/destinations/chongzuo.jpg"),
          asset("/destinations/chongzuo-mijing.jpg"),
        ],
        bullets: [
          L("Black Water River boat trip", "黑水河游船"),
          L("Secret island, 3.6 km by kayak", "秘境小岛 · 3.6 公里皮划艇"),
          L("Funa: karst forest hike + kayak", "伏那秘境徒步 + 皮划艇"),
        ],
        themes: ["wild"],
      },
      {
        day: 3,
        city: L("Chongzuo", "崇左"),
        stay: L("Same resort, no suitcase", "同一度假村，不拎箱子"),
        stayKind: "hotel",
        placeId: "chongzuo",
        transport: L("Detian falls, then the Blue Cave café", "德天瀑布，之后蓝洞咖啡"),
        lodging: L("LUX* Chongzuo — second night", "崇左秘境丽世度假村 · 第二晚"),
        dining: [
          L("Lunch: light lunch at the Blue Cave", "午餐：蓝洞简餐"),
          L("Dinner: not included", "晚餐：不含"),
        ],
        blurb: L(
          "Detian shares the title of Asia's largest trans-national waterfall with Vietnam's Ban Gioc. The Guichun River breaks over a limestone fault and drops 70 metres in three tiers — on sunny days the spray throws a standing rainbow. Afterwards, coffee inside a natural karst cave right on the border line.",
          "德天瀑布与越南板约瀑布共享「亚洲第一大跨国瀑布」之名。归春河在这里冲破喀斯特断层，从 70 米高的崖壁分三级跌落，晴日里水雾中常常挂起一道彩虹。随后在边境线上的天然溶洞里喝一杯咖啡。",
        ),
        photos: [asset("/destinations/detian.jpg")],
        bullets: [
          L("Detian falls", "德天瀑布"),
          L("Blue Cave café", "蓝洞咖啡"),
          L("LUX* at leisure: fishing, library, walks", "丽世自由活动：垂钓、图书馆、散步"),
        ],
        themes: ["wild", "locals"],
      },
      {
        day: 4,
        city: L("Beihai", "北海"),
        stay: L("By Silver Beach", "银滩边"),
        stayKind: "hotel",
        drive: L("Mingshi → Beihai", "明仕赴北海"),
        transport: L("Mingshi Pastoral by buggy, then drive to Beihai", "观光车游览明仕田园，之后赴北海"),
        lodging: L("Beihai Marriott Resort", "北海万豪度假酒店"),
        dining: [
          L("Lunch: basket feast", "午餐：簸箕宴"),
          L("Dinner: Qiaogang food street, at your own pace", "晚餐：侨港美食街，自行寻觅"),
        ],
        blurb: L(
          "Mingshi is best taken sitting down: a buggy rides past turning peaks, flowing water and rice fields sliding by while farmhouse smoke drifts up. By evening the coast takes over — Silver Beach, and Qiaogang's night market where Vietnamese flavours meet Cantonese seafood.",
          "明仕田园最适合坐着看：观光车慢行，窗外山在转、水在流，成片稻田从身旁滑过，农舍炊烟慢慢升上天。傍晚交给海岸——银滩，还有侨港美食街，越南风味与广式海鲜在这里相遇。",
        ),
        photos: [asset("/destinations/chongzuo.jpg"), asset("/destinations/catba.jpg")],
        bullets: [
          L("Mingshi Pastoral by buggy", "观光车游览明仕田园"),
          L("Silver Beach", "自由逛银滩"),
          L("Qiaogang food street", "侨港美食街"),
        ],
        themes: ["locals", "flavors"],
      },
      {
        day: 5,
        city: L("Weizhou Island", "涠洲岛"),
        stay: L("Cliffside above the sea", "悬崖上的海景房"),
        stayKind: "hotel",
        transport: L("Ferry to Weizhou, then a circuit of the island", "乘船上岛，环岛游"),
        lodging: L("Whale Cliff resort", "巨鲸悬崖度假酒店"),
        dining: [
          L("Lunch: Bailing House", "午餐：百龄楼午餐"),
          L("Dinner: cliffside dinner", "晚餐：巨鲸悬崖晚餐"),
        ],
        blurb: L(
          "A century-old Catholic church built from the island's own coral stone; beside it, Bailing House, nearly two hundred years old, with wood-fired bread from the courtyard. Shiluokou bay is named for the spiral of its shoreline — snorkel and the tropical fish are right there.",
          "百年天主教堂，用岛上特有的珊瑚石垒砌而成；旁边的百龄楼有近两百年历史，院子里柴窑烤的面包松软可口。石螺口因海湾形似螺口得名，浮潜就能看见热带鱼群。",
        ),
        photos: [
          asset("/destinations/catba.jpg"),
          asset("/destinations/halong-natgeo.jpg"),
        ],
        bullets: [
          L("Coral-stone Catholic church", "珊瑚石天主堂"),
          L("Bailing House", "百龄楼"),
          L("Shiluokou bay", "石螺口"),
          L("Whale afternoon tea", "巨鲸下午茶"),
        ],
        themes: ["locals", "wild"],
      },
      {
        day: 6,
        city: L("Weizhou Island", "涠洲岛"),
        stay: L("Same cliffside room", "同一间悬崖房"),
        stayKind: "hotel",
        transport: L("Market, Nanwan, offshore fishing, Crocodile Mountain", "海鲜市场、南湾街、远海海钓、鳄鱼山"),
        lodging: L("Whale Cliff resort — second night", "巨鲸悬崖度假酒店 · 第二晚"),
        dining: [
          L("Lunch: coral-stone courtyard", "午餐：珊瑚石院子午餐"),
          L("Dinner: Chunxia Jingye seaview dinner", "晚餐：春夏静也晚餐"),
        ],
        blurb: L(
          "Crocodile Mountain is the island's volcanic geology at its purest — red-brown lava rock in every shape, white spray where the swell hits. There is a fishing harbour market to walk with the islanders, Nanwan's coast road, and the 2.3 km Blue Bridge reaching straight into a sea the colour of jelly.",
          "鳄鱼山是涠洲岛火山地质最纯粹的一段：红褐色火山岩千姿百态，海浪拍打溅起雪白浪花。跟着岛民逛对渔船码头的海鲜市场，走南湾街的海岸公路，还有那条 2.3 公里直通入海的蓝桥，海水蓝绿得像果冻。",
        ),
        photos: [
          asset("/destinations/catba.jpg"),
          asset("/destinations/catba-wanderlost.jpg"),
        ],
        bullets: [
          L("Fishing harbour market", "海鲜市场"),
          L("Nanwan coast road", "南湾街风光"),
          L("Offshore fishing off Xiyang Island", "斜阳岛远海海钓"),
          L("Crocodile Mountain", "鳄鱼山公园"),
          L("Blue Bridge beach", "蓝桥风光"),
          L("Wine by Nanwan bay", "南湾品酒"),
        ],
        themes: ["locals", "flavors", "wild"],
      },
      {
        day: 7,
        city: L("Depart", "返程"),
        stay: L("Beihai", "北海"),
        stayKind: "hotel",
        transport: L("Transfer to the station or airport one hour before departure", "专车按返程时间提前一小时送达动车站／机场"),
        lodging: L("Morning checkout", "早晨退房"),
        dining: [L("Breakfast at the hotel", "酒店早餐")],
        bullets: [L("Ferry back, then private transfer", "下岛后专车送站／送机")],
        themes: ["locals"],
      },
    ],
  },
};

export const routes = overlayItineraries(fallbackRoutes);
