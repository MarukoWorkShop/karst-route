import type { DayStop, RouteId, Tx } from "@/types";
import { asset } from "@/lib/asset";

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

export const routes: Record<RouteId, { id: RouteId; days: DayStop[] }> = {
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
        lodging: L("Terrace-facing mountain lodge — second night", "看田的山居 · 第二晚"),
        dining: [
          L("Lunch: after the cable, in the valley", "午餐：下山后在谷里"),
          L("Dinner: highland hot pot", "晚餐：高地热锅"),
        ],
        bullets: [],
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
};
