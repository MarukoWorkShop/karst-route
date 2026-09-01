import type { PlaceId, RouteId, Tx } from "@/types";
import { asset } from "@/lib/asset";

const L = (en: string, zh: string): Tx => ({ en, zh });

export type PlaceDetail = {
  title: Tx;
  body: Tx;
};

export type Place = {
  id: PlaceId;
  tagline: Tx;
  photo: string;
  experience: PlaceDetail;
  cuisine: PlaceDetail;
  hotel: PlaceDetail & { photo: string };
};

export const places: Record<PlaceId, Place> = {
  nanning: {
    id: "nanning",
    tagline: L("Garden city, before the border", "绿城，过关前夜"),
    photo: asset("/destinations/nanning.jpg"),
    experience: {
      title: L("Night market wander", "夜市慢走"),
      body: L(
        "Zhongshan Road after dark: snail noodles steam, fruit stalls, and a city that is not performing for visitors yet. We walk, we don’t bus-tour it.",
        "中山路入夜：螺蛳粉热气、水果摊，一座还没为游客表演的城。走路，不坐观光车。",
      ),
    },
    cuisine: {
      title: L("Luosifen, the honest bowl", "螺蛳粉，正经一碗"),
      body: L(
        "Rice noodles in a sour-sour broth you either love in three minutes or never forget. We pick a local shop, not a mall chain.",
        "酸香米线，三分钟爱上或记一辈子。找本地店，不进商场连锁。",
      ),
    },
    hotel: {
      title: L("Riverside garden stay", "江景花园酒店"),
      body: L(
        "A quiet room by the Yong River so the next day’s road to Detian is a drive, not a scramble.",
        "邕江边安静的房间，第二天去德天是出车，不是赶路。",
      ),
      photo: asset("/destinations/hotel-a.jpg"),
    },
  },
  chongzuo: {
    id: "chongzuo",
    tagline: L("Waterfall wonder", "瀑布边的田园"),
    photo: asset("/destinations/chongzuo.jpg"),
    experience: {
      title: L("Detian boat, both banks", "德天游船，两岸"),
      body: L(
        "The falls sit on the line. We take the boat close enough to feel the spray, then Mingshi’s karst road while the light is still kind.",
        "瀑布就在国境线上。船开到能沾水花，再赶名仕的喀斯特路，趁光线还在。",
      ),
    },
    cuisine: {
      title: L("River fish, sticky rice", "河鱼与糯米"),
      body: L(
        "Chongzuo’s table is river fish, sour pickles, and sticky rice — Guangxi, not a hotel buffet pretending.",
        "崇左的桌子是河鱼、酸菜、糯米。广西味，不是酒店自助装出来的。",
      ),
    },
    hotel: {
      title: L("Karst-view lodge", "看山的小住"),
      body: L(
        "A simple lodge facing the peaks. We don’t sleep in the tourist strip; we sleep where the road goes quiet.",
        "对着山的简单住宿。不住游客街，住路静下来的地方。",
      ),
      photo: asset("/destinations/hotel-b.jpg"),
    },
  },
  halong: {
    id: "halong",
    tagline: L("Limestone sea, two nights on the bay", "海上峰林，湾上连住"),
    photo: asset("/destinations/catba.jpg"),
    experience: {
      title: L("A day among the isles", "在岛群里过一天"),
      body: L(
        "Ha Long is the karst that went to sea. We take a proper day cruise — not a two-hour loop off the pier — then sleep in town so dawn is still water.",
        "下龙是走到海里的喀斯特。正经一日游轮，不是码头边两小时绕圈，晚上住镇上，黎明还是水。",
      ),
    },
    cuisine: {
      title: L("Squid, lime, the harbour", "鱿鱼、青柠、港口"),
      body: L(
        "Eat facing the bay. The boat lunch is simple; dinner in town is the one you remember.",
        "对着湾吃。船上午饭简单，镇上的晚饭才记得住。",
      ),
    },
    hotel: {
      title: L("Bay-facing room in Ha Long", "下龙看湾的房间"),
      body: L(
        "Two nights so the cruise is a day, not a transfer. Morning is limestone, not a lobby.",
        "连住两晚，游轮才是一天，不是中转。早晨是石灰岩，不是大堂。",
      ),
      photo: asset("/destinations/hotel-c.jpg"),
    },
  },
  catba: {
    id: "catba",
    tagline: L("Limestone, ferry, night on the island", "石灰岩、轮渡、岛上过夜"),
    photo: asset("/destinations/catba.jpg"),
    experience: {
      title: L("The island after the bay", "湾之后的岛"),
      body: L(
        "Cat Ba still fishes. We land by ferry and keep the afternoon slow — limestone, harbour, no cruise pier.",
        "吉婆还在打渔。轮渡登岛，下午放慢：石灰岩、渔港，不是邮轮码头。",
      ),
    },
    cuisine: {
      title: L("Squid on the coals", "炭火鱿鱼"),
      body: L(
        "Harbour squid, lime, cold beer. Eat facing the water. Tomorrow’s cable can wait.",
        "港边鱿鱼、青柠、凉啤酒。对着水吃。明天的缆车可以等。",
      ),
    },
    hotel: {
      title: L("Bay-facing room", "看湾的房间"),
      body: L(
        "A small hotel above the bay, not a mega-resort. Morning is limestone, not a lobby.",
        "湾上的小酒店，不是大体量度假村。早晨是石灰岩，不是大堂。",
      ),
      photo: asset("/destinations/hotel-c.jpg"),
    },
  },
  hanoi: {
    id: "hanoi",
    tagline: L("Old Quarter, two nights", "古城，连住两晚"),
    photo: asset("/destinations/hanoi.jpg"),
    experience: {
      title: L("Cyclo, Train Street, West Lake after dark", "三轮车、火车街、夜西湖"),
      body: L(
        "36 Streets by cyclo, a careful pass at Train Street, then the night bus around West Lake. We don’t stack temples until you can’t taste the city.",
        "三十六鼓街坐三轮，火车街小心路过，晚上绕西湖。不把寺庙叠到你尝不出这座城。",
      ),
    },
    cuisine: {
      title: L("Lotus buffet and egg coffee", "莲花餐与蛋咖啡"),
      body: L(
        "A proper lotus table at lunch, egg coffee when you want to sit. Markets if you still have legs.",
        "午餐正经莲花餐，想坐下来就蛋咖啡。还有腿就去菜市场。",
      ),
    },
    hotel: {
      title: L("French-quarter hide", "法租界小住"),
      body: L(
        "A restored house near the lake. Two nights so you are not packing every morning.",
        "湖边一栋修好的老房子。连住两晚，不是天天收行李。",
      ),
      photo: asset("/destinations/hotel-a.jpg"),
    },
  },
  sapa: {
    id: "sapa",
    tagline: L("Terraces and Cat Cat", "梯田与猫猫村"),
    photo: asset("/destinations/sapa.jpg"),
    experience: {
      title: L("Walk the terraces, not just the viewpoint", "走进梯田，不只是观景台"),
      body: L(
        "Cat Cat with a local walk, not a parking-lot photo. If the cloud lifts, the terraces do the talking.",
        "猫猫村跟当地人走，不是停车场打卡。云散了，梯田自己说话。",
      ),
    },
    cuisine: {
      title: L("Mountain herbs, hot pot", "山间热锅"),
      body: L(
        "A highland table: herbs, pork, a hot pot against the cold. Simple, and enough.",
        "高地的桌子：香草、猪肉、驱寒的热锅。简单，够。",
      ),
    },
    hotel: {
      title: L("Terrace-facing lodge", "看田的山居"),
      body: L(
        "Wood, mist, a window on the paddies. We leave the town-centre karaoke behind.",
        "木头、雾、一扇对着田的窗。把镇中心的卡拉OK留在后面。",
      ),
      photo: asset("/destinations/hotel-b.jpg"),
    },
  },
  train: {
    id: "train",
    tagline: L("Fansipan, then the rails", "番西邦，然后上轨"),
    photo: asset("/destinations/train.jpg"),
    experience: {
      title: L("Cable, Muong Hoa, sleep on the meter-gauge", "缆车、芒花、米轨过夜"),
      body: L(
        "Fansipan if weather allows, the Muong Hoa train in the valley, then a berth on the meter-gauge toward China. The night is the point.",
        "天气允许就上番西邦，谷里坐芒花小火车，再睡米轨往中国。夜才是重点。",
      ),
    },
    cuisine: {
      title: L("Station supper, tea in a flask", "站上晚饭，瓶里的茶"),
      body: L(
        "Eat before you board. On the train: tea, fruit, whatever the attendant still has. It is not a dining car fantasy.",
        "上车前吃饱。车上是茶、水果、乘务员还剩的东西。不是餐车幻想。",
      ),
    },
    hotel: {
      title: L("Soft sleeper berth", "软卧铺"),
      body: L(
        "A four-berth cabin we book as a private. Sheets, a bottle of water, the border in the morning.",
        "四人软卧我们包下。床单、一瓶水，早晨就是边境。",
      ),
      photo: asset("/destinations/hotel-c.jpg"),
    },
  },
  jianshui: {
    id: "jianshui",
    tagline: L("Hekou in, old town dust", "河口入境，古城的土"),
    photo: asset("/destinations/jianshui.jpg"),
    experience: {
      title: L("Mini-train and Tuanshan", "小火车与团山"),
      body: L(
        "After the stamp at Hekou, Jianshui’s lanes and the mini-train to Tuanshan. Yunnan starts as a town, not a highway.",
        "河口盖章后，建水的巷子，小火车去团山。云南先是一座城，不是一条高速。",
      ),
    },
    cuisine: {
      title: L("Steam-pot chicken", "汽锅鸡"),
      body: L(
        "Jianshui’s steam-pot chicken and grilled tofu. Eat in the old town, then sleep.",
        "建水汽锅鸡和烤豆腐。在古城吃，然后睡。",
      ),
    },
    hotel: {
      title: L("Courtyard inn", "院子里的客栈"),
      body: L(
        "A courtyard inn inside the old town wall. You hear the street, not a ring road.",
        "古城墙里的院子客栈。听见的是街，不是环路。",
      ),
      photo: asset("/destinations/hotel-d.jpg"),
    },
  },
  puzhehei: {
    id: "puzhehei",
    tagline: L("Karst lakes, sleep inside the park", "喀斯特湖，住在园里"),
    photo: asset("/destinations/puzhehei.jpg"),
    experience: {
      title: L("Willow-leaf boat at first light", "晨光里的柳叶舟"),
      body: L(
        "A boat through the peaks before the day-trip buses. The park is the hotel garden.",
        "日游大巴到来前，船从峰间过。园区就是酒店的花园。",
      ),
    },
    cuisine: {
      title: L("Lake fish, sour greens", "湖鱼与酸菜"),
      body: L(
        "Fish from the lakes, sour greens, rice. We eat where the boats tie up.",
        "湖里的鱼、酸菜、米饭。在泊船的地方吃。",
      ),
    },
    hotel: {
      title: L("Park lodge on the water", "水边的园区住宿"),
      body: L(
        "Stay inside the scenic area so dawn is a walk, not a ticket line.",
        "住在景区里，黎明是散步，不是检票。",
      ),
      photo: asset("/destinations/hotel-a.jpg"),
    },
  },
  mile: {
    id: "mile",
    tagline: L("Dongfengyun, then the spring", "东风韵，然后温泉"),
    photo: asset("/destinations/mile.jpg"),
    experience: {
      title: L("Colour-block town at dusk", "黄昏的色块小镇"),
      body: L(
        "Dongfengyun is theatre. We go when the buses leave and the paint still holds the last light.",
        "东风韵是布景。等大巴走了，趁颜料还留着最后的光。",
      ),
    },
    cuisine: {
      title: L("Yunnan rice, a cold beer", "云南米饭，凉啤酒"),
      body: L(
        "After the boat, a simple Yunnan table and an early soak. No tasting menu required.",
        "下船后一桌简单的云南菜，早点泡汤。不需要品尝菜单。",
      ),
    },
    hotel: {
      title: L("Hot-spring room", "温泉房"),
      body: L(
        "A room with a private spring if the budget allows; otherwise the communal pool still does the work.",
        "预算够就私人汤屋；不够，公共池也够用。",
      ),
      photo: asset("/destinations/hotel-b.jpg"),
    },
  },
  kunming: {
    id: "kunming",
    tagline: L("Green Lake, then the airport", "翠湖，然后机场"),
    photo: asset("/destinations/kunming.jpg"),
    experience: {
      title: L("Green Lake and the old street", "翠湖与老街"),
      body: L(
        "A last walk under the willows, the old street for tea. Dounan flowers only if the flight is late.",
        "柳树下最后一走，老街喝茶。航班晚才加斗南花市。",
      ),
    },
    cuisine: {
      title: L("Across-the-bridge noodles", "过桥米线"),
      body: L(
        "One bowl of crossing-the-bridge noodles before you fly. Kunming’s goodbye is lunch.",
        "起飞前一碗过桥米线。昆明的告别是午饭。",
      ),
    },
    hotel: {
      title: L("Lake or airport, your call", "湖边或机场，你定"),
      body: L(
        "Green Lake if you want a last evening; near the airport if the flight is cruel. We book either.",
        "想把晚上留下就翠湖；航班狠就住机场附近。两种我们都能订。",
      ),
      photo: asset("/destinations/hotel-c.jpg"),
    },
  },
  guantang: {
    id: "guantang",
    tagline: L("Two nights, Tianqin, cane sea", "连住，天琴，蔗海"),
    photo: asset("/destinations/guantang.jpg"),
    experience: {
      title: L("Tianqin village and a bicycle in the cane", "天琴寨，蔗海里骑行"),
      body: L(
        "Friendship Pass behind you. Two nights so Longzhou is a place, not a transfer. Tianqin in the evening, cane fields in the morning.",
        "友谊关甩在后面。连住两晚，龙州是地方，不是中转。晚上天琴，早晨蔗海。",
      ),
    },
    cuisine: {
      title: L("Zhuang table, home rice", "壮家的饭"),
      body: L(
        "A village kitchen: oil tea, sticky rice, whatever came from the field that morning.",
        "村里的厨房：油茶、糯米、当天地里来的东西。",
      ),
    },
    hotel: {
      title: L("Guantang courtyard", "观堂的院子"),
      body: L(
        "A two-night base. Same bed, same cook, no suitcase between the village and the cane.",
        "两晚的基地。同一张床、同一个灶，村子和蔗海之间不用拎箱子。",
      ),
      photo: asset("/destinations/hotel-d.jpg"),
    },
  },
};

export const placeStories: Record<PlaceId, { culture: Tx; slides: string[] }> = {
  nanning: {
    culture: L(
      "Nanning is a garden city on the Yong — Zhuang and Cantonese kitchens side by side. The river walk is for locals, not a show.",
      "南宁是邕江边的绿城。壮味和粤厨并排，江边是当地人在走，不是表演。",
    ),
    slides: [asset("/destinations/nanning.jpg"), asset("/destinations/hotel-a.jpg"), asset("/destinations/kunming.jpg")],
  },
  chongzuo: {
    culture: L(
      "Detian sits on the line itself — the spray is Chinese and Vietnamese at once. Mingshi’s karst road is the quieter twin: fields, peaks, almost no coaches if you time it.",
      "德天就在国境线上，水花同时属于两边。名仕是更安静的孪生：田、峰、只要赶对时间就几乎没有大巴。",
    ),
    slides: [asset("/destinations/chongzuo.jpg"), asset("/destinations/hotel-b.jpg"), asset("/destinations/puzhehei.jpg")],
  },
  halong: {
    culture: L(
      "Ha Long Bay is limestone that went to sea — more than a thousand isles in the mist. Two nights so the cruise is a full day, and the town is not a same-day dash.",
      "下龙湾是走到海里的石灰岩，一千多座岛在雾里。连住两晚，游轮才是完整的一天，镇子不是当天赶路。",
    ),
    slides: [asset("/destinations/catba.jpg"), asset("/destinations/hotel-c.jpg"), asset("/destinations/hanoi.jpg")],
  },
  catba: {
    culture: L(
      "Cat Ba is limestone and harbour, not a cruise pier. The island still fishes. We arrive by ferry so the night is water, not a highway hotel.",
      "吉婆是石灰岩和渔港，不是邮轮码头。岛上还在打渔。坐轮渡过来，这一夜是水，不是高速边的酒店。",
    ),
    slides: [asset("/destinations/catba.jpg"), asset("/destinations/hotel-c.jpg"), asset("/destinations/mile.jpg")],
  },
  hanoi: {
    culture: L(
      "The Old Quarter is a living grid: trade streets, French shade, a lake the city walks around after dark. Two nights so it can be a city, not a transfer.",
      "古城是还在运转的网格：行业街、法式树荫、夜里绕着走的湖。连住两晚，它才是城，不是中转。",
    ),
    slides: [asset("/destinations/hanoi.jpg"), asset("/destinations/hotel-a.jpg"), asset("/destinations/sapa.jpg")],
  },
  sapa: {
    culture: L(
      "The terraces are a Hmong and Dao working landscape, not a viewpoint franchise. Cat Cat is a village you walk with someone who lives there.",
      "梯田是苗族、瑶族还在种的地，不是观景台连锁。猫猫村要跟住在这里的人一起走。",
    ),
    slides: [asset("/destinations/sapa.jpg"), asset("/destinations/hotel-b.jpg"), asset("/destinations/guantang.jpg")],
  },
  train: {
    culture: L(
      "The meter-gauge is a leftover of the Yunnan–Vietnam railway. Sleeping on it is the border in slow motion — not a gimmick, a way the geography still works.",
      "米轨是滇越铁路留下的。睡在上面，边境是慢动作，不是噱头，是地理还在运转的方式。",
    ),
    slides: [asset("/destinations/train.jpg"), asset("/destinations/hotel-c.jpg"), asset("/destinations/jianshui.jpg")],
  },
  jianshui: {
    culture: L(
      "Jianshui is a Confucian town that kept its wall and its tofu. After Hekou, Yunnan starts as lanes and a courtyard, not a highway plaza.",
      "建水是还留着城墙和豆腐的儒城。河口之后，云南先是巷子和院子，不是高速服务区。",
    ),
    slides: [asset("/destinations/jianshui.jpg"), asset("/destinations/hotel-d.jpg"), asset("/destinations/kunming.jpg")],
  },
  puzhehei: {
    culture: L(
      "Puzhehei is a lake that grew inside a karst forest. Lotus flowers between the peaks, bamboo raft threading between them — this is the kind of landscape that makes you question whether it's real. Trek with a Yi guide in the afternoon; they call this place 'where fish and shrimp overflow.'",
      "普者黑是长在喀斯特森林里的一湖水。峰丛之间开着荷花，竹筏从中间穿过去——这种风景会让人怀疑是不是真的。下午跟彝族向导进山；他们管这里叫「鱼虾满出来的地方」。",
    ),
    slides: [
      asset("/destinations/chongzuo.jpg"),
      asset("/destinations/catba.jpg"),
      asset("/destinations/puzhehei.jpg"),
    ],
  },
  mile: {
    culture: L(
      "Mile’s Dongfengyun is a painted set on red earth. We treat it as dusk theatre, then the hot spring as the actual night — Yunnan’s slower register.",
      "弥勒东风韵是红土上的布景。我们把它当黄昏剧场，温泉才是真正的夜——云南更慢的那个音区。",
    ),
    slides: [asset("/destinations/mile.jpg"), asset("/destinations/hotel-b.jpg"), asset("/destinations/puzhehei.jpg")],
  },
  kunming: {
    culture: L(
      "Kunming is the spring city: willows on Green Lake, a market if the flight is late. It is an exit, but it can still be a last walk.",
      "昆明是春城：翠湖的柳，航班晚就去花市。它是出口，但还可以是最后一走。",
    ),
    slides: [asset("/destinations/kunming.jpg"), asset("/destinations/hotel-c.jpg"), asset("/destinations/jianshui.jpg")],
  },
  guantang: {
    culture: L(
      "Longzhou and Guantang sit behind Friendship Pass. Tianqin is a living Zhuang music, not a stage show. Two nights so the cane sea is a morning, not a photo stop.",
      "龙州、观堂在友谊关背后。天琴是还在弹的壮族音乐，不是舞台。连住两晚，蔗海才是早晨，不是拍照站。",
    ),
    slides: [asset("/destinations/guantang.jpg"), asset("/destinations/hotel-d.jpg"), asset("/destinations/sapa.jpg")],
  },
};

export const animationStops: Record<
  RouteId,
  { id: string; x: number; y: number; label: Tx }[]
> = {
  r1: [
    { id: "nanning", x: 548.0, y: 247.4, label: L("Nanning", "南宁") },
    { id: "detian", x: 473.5, y: 245.8, label: L("Detian", "德天") },
    { id: "halong", x: 490.5, y: 328.0, label: L("Ha Long", "下龙") },
    { id: "catba", x: 488.9, y: 341.9, label: L("Cat Ba", "吉婆岛") },
    { id: "hanoi", x: 432.6, y: 328.3, label: L("Hanoi", "河内") },
    { id: "sapa", x: 340.3, y: 269.4, label: L("Sapa", "沙坝") },
    { id: "hekou", x: 344.7, y: 260.7, label: L("Hekou", "河口") },
    { id: "jianshui", x: 293.0, y: 210.8, label: L("Jianshui", "建水") },
    { id: "puzhehei", x: 360.0, y: 180.0, label: L("Puzhehei", "普者黑") },
    { id: "mile", x: 310.0, y: 165.0, label: L("Mile", "弥勒") },
    { id: "kunming", x: 293.4, y: 147.5, label: L("Kunming", "昆明") },
  ],
  r2: [
    { id: "nanning", x: 548.0, y: 247.4, label: L("Nanning", "南宁") },
    { id: "catba", x: 488.9, y: 341.9, label: L("Cat Ba", "吉婆岛") },
    { id: "hanoi", x: 432.6, y: 328.3, label: L("Hanoi", "河内") },
    { id: "sapa", x: 340.3, y: 269.4, label: L("Sapa", "沙坝") },
    { id: "longzhou", x: 479.9, y: 269.1, label: L("Longzhou", "龙州") },
    { id: "detian", x: 473.5, y: 245.8, label: L("Detian", "德天") },
    { id: "nanning-end", x: 548.0, y: 247.4, label: L("Nanning", "南宁") },
  ],
};
