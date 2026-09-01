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
        "Zhongshan Road after dark is not a food court — it is the city's living room. Grills smoke under the lamps, durian carts hold their ground beside snail-noodle stalls, and families eat on low stools with the pavement as their table. We walk it slowly, stop where the queue is local, and finish on the Yong River bank where the humidity finally lifts.",
        "入夜的中山路不是美食街，是这座城的客厅。炭火在灯下冒烟，榴莲摊和螺蛳粉摊各占一方，一家人围着矮凳，把人行道当饭桌。我们慢慢走，哪里排着本地人就停哪里，最后走到邕江边——那里湿气终于散开，风是凉的。",
      ),
    },
    cuisine: {
      title: L("Luosifen, the honest bowl", "螺蛳粉，正经一碗"),
      body: L(
        "The broth is fermented and the smell announces itself three metres out, so the argument ends fast: you love it in three minutes, or you never forget it. Guangxi eats it for breakfast with pickled bamboo, peanuts, and chilli oil enough to make the morning honest. We skip the mall chains and sit where the steam has stained the walls.",
        "汤是发酵过的，气味在三米外就先打招呼，喜不喜欢很快见分晓：三分钟爱上，或者记一辈子。广西人拿它当早饭，配酸笋、花生，再淋一勺辣油，把清晨叫醒。我们不进商场连锁，只坐那种蒸汽把墙熏黄了的老店。",
      ),
    },
    hotel: {
      title: L("Riverside garden stay", "江景花园酒店"),
      body: L(
        "A quiet room by the Yong River, chosen so tomorrow's drive to Detian begins as a drive and not a scramble. Ask for the garden side.",
        "邕江边安静的房间，是为了让明天去德天的路是'出车'，不是'赶路'。要花园那一侧。",
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
        "Ban Gioc–Detian is Asia's largest transnational waterfall, and the border runs straight through it — Vietnam on one bank, China on the other, one curtain of white water shared by two countries. We take the raft close enough to feel the spray, then drive the Mingshi karst road while the light is still low, cycling a stretch between rice fields and peaks that stand up like green teeth.",
        "德天瀑布是亚洲最大的跨国瀑布，国境线从水幕中间穿过——一边越南，一边中国，同一帘白水两国共看。我们坐竹筏靠近，水花直接打在脸上；然后趁光线还低、还软，走明仕那段喀斯特路，在稻田和峰丛之间骑一段车，山立得像一排绿牙。",
      ),
    },
    cuisine: {
      title: L("River fish, sticky rice", "河鱼与糯米"),
      body: L(
        "Chongzuo's table is the river and the paddy: fish pulled from the same water we rafted through, steamed with sour pickles; glutinous rice steamed in bamboo; greens from the fields beside the karst road. It is Guangxi home cooking — sour, fresh, unhurried — not a hotel buffet pretending to be regional.",
        "崇左的饭桌就是河与田：鱼从我们刚漂过的水里捞起，配酸菜清蒸；糯米在竹筒里蒸熟；青菜来自喀斯特路边的地。这是广西的家常——酸、鲜、不赶时间，不是酒店自助装出来的'当地风味'。",
      ),
    },
    hotel: {
      title: L("Karst-view lodge", "看山的小住"),
      body: L(
        "A simple lodge facing the peaks, chosen so the window frames karst rather than a car park. We sleep where the road goes quiet, not on the tourist strip.",
        "对着峰丛的简单住宿，窗户框住的是山，不是停车场。我们住在路静下来的地方，不住游客街。",
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
        "Nearly two thousand limestone islands rise out of emerald water, worn into towers and arches over some five hundred million years. Most visitors see it from a day boat; we stay two nights, so the bay empties at dusk and returns at dawn. We kayak into lagoons the big boats cannot enter, step inside Sung Sot's chambers of stalactites, and drift past floating villages where families have lived on the water for generations — around 1,600 people still do.",
        "近两千座石灰岩岛从翡翠色的水里立起来，是五亿年雨水啃出来的塔和拱。多数人坐一日船看一眼就走，我们住两晚——黄昏时湾里空了，天亮时它又回来。我们划皮划艇进大船进不去的湖，钻进惊讶洞的钟乳石大厅，再从浮村旁漂过：那里的人家几代都住在水上，至今还有约一千六百人。",
      ),
    },
    cuisine: {
      title: L("Squid, lime, the harbour", "鱿鱼、青柠、港口"),
      body: L(
        "Lunch on deck is grilled squid, lime and salt; dinner in town is the one you remember. The seafood is the point — landed that morning, cooked that evening, and no sauce heavy enough to hide it.",
        "船上的午饭是炭烤鱿鱼配青柠和盐，简单；镇上的晚饭才是记得住的那一顿。海鲜是主角——早上捞的，晚上就下锅，没有任何酱料重到需要去盖住它。",
      ),
    },
    hotel: {
      title: L("Bay-facing room in Ha Long", "下龙看湾的房间"),
      body: L(
        "Two nights with the bay outside the window rather than a harbour car park. Ask for a high floor facing the islands — dawn light on the karst is the whole reason we stayed.",
        "两晚都把湾留在窗外，而不是港口停车场。要高楼层、面向群岛的房间——清晨打在喀斯特上的光，就是我们住下来的全部理由。",
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
        "Cat Ba is the largest island in the archipelago and it is what hides Lan Ha Bay — around 300 limestone islets with a fraction of Ha Long's boat traffic. We kayak the lagoons in the morning, walk part of the national park in the afternoon, and climb to Cannon Fort before sunset to look back over the water.",
        "吉婆岛是这片群岛里最大的一座，兰夏湾就藏在它身后——三百来座石灰岩小岛，船却只有下龙湾的零头。早上划皮划艇进湖，穿过只有一人高的溶洞；下午走一段国家公园，看猴子在林间过路；日落前爬上炮台，回头看那片水把天染红。",
      ),
    },
    cuisine: {
      title: L("Squid on the coals", "炭火鱿鱼"),
      body: L(
        "The island's evenings smell of charcoal and squid. Whole squid grilled over coals, dipped in salt, pepper and lime, eaten at plastic tables as the boats come in.",
        "岛上的傍晚是炭火和鱿鱼的味道。整只鱿鱼架上炭火，蘸盐、胡椒、青柠，在塑料桌边吃，看着船一条条回港。",
      ),
    },
    hotel: {
      title: L("Bay-facing room", "看湾的房间"),
      body: L(
        "A quiet room on the waterfront in Cat Ba Town. This is where the bay finally slows down.",
        "吉婆镇海边安静的房间。湾到这里，终于慢下来了。",
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
        "The Old Quarter is not a museum district frozen in time. It is a working neighbourhood where families have sold silk, silver and spices from the same narrow shopfronts for generations, and the streets still carry their trades: Hang Bac was silver, Hang Gai sold hemp then silk, Hang Ma fills with paper offerings before Tet. Behind the narrow façades the 'tube houses' run deep — built narrow to dodge a tax on street frontage, hiding courtyards and workshops behind. We go into Bach Ma Temple at incense hour, cross Dong Xuan's wholesale halls, and end on Long Bien Bridge, still carrying trains over the Red River.",
        "老城不是冻在玻璃柜里的博物馆，是还在运转的街区——几代人守着同一间窄铺面卖丝绸、银器、香料。街名还留着老行当：Hang Bac是银器街，Hang Gai卖丝，Hang Ma春节前挂满纸扎。窄门面后是'管子屋'，进深极长——当年按门面宽收税，只好往里长，把天井作坊藏进去。我们在香火最旺时进白马寺，穿过同春市场的批发大厅，最后上龙边桥。",
      ),
    },
    cuisine: {
      title: L("Lotus buffet and egg coffee", "莲花餐与蛋咖啡"),
      body: L(
        "Hanoi eats early and often. Pho bo before nine, at a stall where office workers queue; bun cha at midday — grilled pork, herbs, and a bowl of dipping sauce; banh mi as a walking snack. Egg coffee is its own ritual: whipped yolk, condensed milk, strong Vietnamese drip, in a small cup on a plastic stool.",
        "河内吃得早，也吃得勤。九点前来一碗牛肉河粉，找上班族排队的那种摊；中午吃烤肉米线——炭火猪肉、一把香草、一碗蘸水；法棍当走路的零嘴。蛋咖啡另有一套讲究：打发的蛋黄、炼乳、浓滴滤咖啡，装在小小的杯子里，配塑料矮凳。",
      ),
    },
    hotel: {
      title: L("French-quarter hide", "法租界小住"),
      body: L(
        "Two nights on the quiet edge of the French Quarter — tree-lined boulevards, five minutes from the lake, far enough from Ta Hien's beer noise to actually sleep.",
        "法租界边缘安静的两晚——林荫大道，离湖五分钟，又离Ta Hien的啤酒声足够远，能真的睡着。",
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
        "The terraces of Muong Hoa are not scenery — they are a water system carved by Hmong and Dao families over centuries, and they only make sense from the inside. We walk down into them instead of photographing from the road, passing Cat Cat village where indigo still stains the hands of women who weave and sell on the same threshold. When the mist comes, the valley disappears and the rice steps fade in and out like a drawing being erased and redrawn.",
        "芒花谷的梯田不是风景，是苗族和瑶族人家几百年刻出来的水系，只有走进去才看得懂。我们不下车拍照，而是走下去，穿过猫猫村——染缸里的靛蓝还染着织布女人的手，她们在自家门槛上织，也在自家门槛上卖。起雾的时候，山谷自己会变戏法：梯田一层层消失又浮现，像有人把画擦掉重画。",
      ),
    },
    cuisine: {
      title: L("Mountain herbs, hot pot", "山间热锅"),
      body: L(
        "Sapa's cold is answered with a pot on the table: local herbs, mountain pork, river fish, greens cut that morning. The broth runs sour and herbal rather than fiery — highland cooking built for damp evenings.",
        "沙坝的冷是用桌上一口锅来答的：山里的香草、土猪、河鱼，配当天早上摘的青菜。汤头是酸的、带草香，不靠辣——高原的菜，本来就是为潮湿的夜晚准备的。",
      ),
    },
    hotel: {
      title: L("Terrace-facing lodge", "看田的山居"),
      body: L(
        "A lodge facing the valley, terraces outside the window at breakfast. Mornings are the point here — the mist lifts off the rice around seven.",
        "对着山谷的山居，吃早饭时梯田就在窗外。这里的清晨才是正事——七点左右，雾从稻子上抬起来。",
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
        "We cable up Fansipan — 3,143 metres, the roof of Indochina — for the cloud line, then come back down to ride the metre-gauge line south. The track is a century old, the compartments are wood and brass, and the journey works precisely because it is slow: dinner on a station platform, tea from a flask, and the border arriving while you sleep.",
        "我们先坐缆车上番西邦——海拔3143米，中南半岛的屋顶，看云在脚下排成一线；再下来换乘南下的米轨。这条轨有一百年了，车厢是木头和黄铜的，慢就是它的道理：晚饭在站台吃，茶从保温瓶倒，国境线在你睡着的时候过去。",
      ),
    },
    cuisine: {
      title: L("Station supper, tea in a flask", "站上晚饭，瓶里的茶"),
      body: L(
        "There is no dining car worth the name. We eat on the platform — whatever the stall is cooking — and drink tea from a flask while the compartments rock. Part of the appeal is that nothing is served to you.",
        "这趟车没有像样的餐车。我们在站台吃——摊上在做什么就吃什么，茶从瓶里倒，车厢在脚下晃。有意思的地方正在于：没有人把东西端到面前。",
      ),
    },
    hotel: {
      title: L("Soft sleeper berth", "软卧铺"),
      body: L(
        "Four berths, clean linen, a window that opens. Tonight the train is the hotel — that is the whole idea.",
        "四个铺位，干净的床单，一扇能打开的窗。今晚火车就是酒店——这正是这趟车的意思。",
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
        "Jianshui kept what many old towns lost: the Confucian temple still stands, and the narrow-gauge train still runs. We ride out to Tuanshan, a walled clan village of grey brick and tiled courtyards standing since the Qing, then walk the Seventeen-Arch Bridge at low water, its arches doubling in the river. In town the old streets are lived in rather than staged.",
        "建水留下了许多古城弄丢的东西：文庙还在，米轨小火车还在开。我们坐小火车去团山——青砖灰瓦的宗族聚落，从清代立到今天，院墙围着一个个天井；再趁水位低时走十七孔桥，桥拱在河里成双。城里的老街是有人住的，不是布景。",
      ),
    },
    cuisine: {
      title: L("Steam-pot chicken", "汽锅鸡"),
      body: L(
        "Jianshui's signature is the steam pot: chicken sealed in clay with a central chimney, steamed until the broth condenses out of the bird itself — no water added, nothing but ginger and salt. It takes hours, and that patience is why the dish travelled.",
        "建水的招牌是汽锅鸡：鸡封在陶锅里，中间一根汽柱，全靠蒸汽把汤从鸡身上逼出来——不加一滴水，只有姜和盐。要炖上几个钟头，这份耐心也是它走出去的原因。",
      ),
    },
    hotel: {
      title: L("Courtyard inn", "院子里的客栈"),
      body: L(
        "A restored courtyard house inside the old town — tiled roof, wooden lattice, a tree in the middle. Evening is the hour to sit in it.",
        "老城里修过的院子客栈——瓦顶、木格窗、中间一棵树。傍晚正是该坐在里头的时辰。",
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
        "Puzhehei is karst turned into water: some three hundred peaks standing in a net of lakes and channels, and the only way through is a narrow wooden boat shaped like a willow leaf. We go out at first light, before the tour boats start, when the water is flat enough to hold the peaks twice. Lotus fills the channels in summer; Yi villages sit at the field edges; the hills look exactly as they did in the films that made this place famous.",
        "普者黑是喀斯特泡进水里的样子：三百来座孤峰立在一片湖泊水网中，进去只能靠那种窄窄的柳叶舟。我们天刚亮就出发，赶在游船之前——水面平得能把山影装两遍。夏天荷花把水道填满，彝族村子在田边，山和让它出名的那些电影里一模一样。",
      ),
    },
    cuisine: {
      title: L("Lake fish, sour greens", "湖鱼与酸菜"),
      body: L(
        "Fish from the lakes, two ways: steamed with pickled greens, or grilled whole at the water's edge. The sour note runs through everything here — Yi highland cooking, and it cuts the heat better than chilli does.",
        "湖里的鱼两种做法：配酸菜清蒸，或者在岸边整条炭烤。酸味贯穿这里所有的菜——彝家的山地做法，解暑比辣椒更管用。",
      ),
    },
    hotel: {
      title: L("Park lodge on the water", "水边的园区住宿"),
      body: L(
        "We sleep inside the park, not outside it. That is what buys you the empty water at dawn — the single best hour in Puzhehei, and the reason we stay.",
        "我们住在园子里，不住园子外。只有这样才买得到黎明那片没人的水——那是普者黑最好的一个钟头，也是我们住下来的理由。",
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
        "Dongfengyun is not old — it is a red-brick cluster built by the artist Luo Xu: bottle kilns and cone towers with no blueprints, only hand-drawn intuition, rising out of the vineyard fields outside Mile. It looks like a child's drawing built at full size. We arrive late, when the brick turns copper and the shadows do the rest — then the hot springs, because Mile sits on them.",
        "东风韵不老，它是艺术家罗旭用红砖造出来的一片建筑——酒瓶窑、锥形塔，没有蓝图，只凭手绘的直觉，从弥勒城外的葡萄田里长出来。像有人把孩子的画按原尺寸盖了出来。我们傍晚到，砖变成铜色，剩下的交给影子。之后泡温泉——弥勒就坐在温泉上。",
      ),
    },
    cuisine: {
      title: L("Yunnan rice, a cold beer", "云南米饭，凉啤酒"),
      body: L(
        "Simple and good: rice from the terraces, a plate of vegetables, grilled tofu, and a cold beer after the hot spring. Yunnan cooking is mostly about ingredients that travelled a short distance.",
        "简单，但好吃：梯田的米、一盘时蔬、烤豆腐，泡完温泉再来一瓶凉啤酒。云南菜的秘诀，多半不过是食材走得近。",
      ),
    },
    hotel: {
      title: L("Hot-spring room", "温泉房"),
      body: L(
        "A room with its own spring water. Two weeks of walking ends here — this is the night that repairs you.",
        "房间里就有自己的温泉水。走了两周的路在这里收尾——这一晚是用来把你修好的。",
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
        "Green Lake is where Kunming goes to be idle: willows, arched bridges, and from November the red-beaked gulls that fly in from Siberia and stay until March, thousands of them wheeling over the water for a scrap of bread. A few streets away the old quarter keeps Victory Hall and the wartime lanes of Xicangpo, where much of the city's intellectual history is written into the brick.",
        "翠湖是昆明用来发呆的地方：柳树、拱桥，还有十一月飞来、待到三月的红嘴鸥——成千上万只从西伯利亚来，在水面上盘旋，为一块面包屑翻跟头。几条街之外是老城区，胜利堂还在，西仓坡的战时小巷也在，这座城的文人往事就砌在砖里。",
      ),
    },
    cuisine: {
      title: L("Across-the-bridge noodles", "过桥米线"),
      body: L(
        "The story is better than the dish and the dish is still good: a scholar's wife carrying broth across a bridge, the oil on top keeping it hot. You assemble it yourself — raw slices cooked by the boiling broth, then greens and herbs, noodles last.",
        "故事比菜有名，菜也不差：秀才的妻子端着汤过桥去送饭，面上那层油替她保温。吃法要自己动手——滚汤把生肉片烫熟，再下青菜、香草，米线最后放。",
      ),
    },
    hotel: {
      title: L("Lake or airport, your call", "湖边或机场，你定"),
      body: L(
        "Last night in Yunnan. A room by Green Lake if your flight is tomorrow afternoon, near the airport if it leaves early — we will tell you honestly which one makes sense.",
        "云南最后一晚。明下午的飞机就住翠湖边，清早的飞机就住机场附近——哪种更合理，我们会老实说。",
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
        "The tianqin is a two-stringed Zhuang lute, plucked with a plectrum, used to carry antiphonal singing — call and response across a courtyard, older than the borders here. We sit in on a village performance rather than a staged show, then take bicycles into the cane that runs to the horizon: Guangxi's sugar country, shoulder-high and green, with karst standing in it like islands.",
        "天琴是壮族的弹拨乐器，两根弦，用拨子弹，为对歌伴奏——一问一答隔着天井来回，比这里的国境线更老。我们不是看商业演出，是坐在村里听一场。然后骑车钻进甘蔗田：那种绿一直铺到天边，齐肩高，广西的糖在这里长出来，喀斯特的山立在中间像一座座岛。",
      ),
    },
    cuisine: {
      title: L("Zhuang table, home rice", "壮家的饭"),
      body: L(
        "A Zhuang table is sticky rice dyed with plant colours, river snails, pickled vegetables, and a whole chicken cut at the table. It is served in the village, by the family — and because we stay two nights, you will be recognised by the second.",
        "壮家的饭桌是五色糯米、河螺、酸菜，还有一整只在桌上分好的鸡。就在村里、就在家里人手上端出来——因为住两晚，第二顿他们已经认得你了。",
      ),
    },
    hotel: {
      title: L("Guantang courtyard", "观堂的院子"),
      body: L(
        "Two nights in a courtyard house in the village. Slow mornings, cane at the door, and the tianqin rehearsal drifting over the wall.",
        "村里院子里的两晚。早晨很慢，甘蔗就在门口，天琴的排练声会翻过墙来。",
      ),
      photo: asset("/destinations/hotel-d.jpg"),
    },
  },
};

export const placeStories: Record<PlaceId, { culture: Tx; slides: string[] }> = {
  nanning: {
    culture: L(
      "Nanning is the south's quietest capital — green all year, sitting on the Yong River with Zhuang and Cantonese cooking on either side of the kitchen. Most travellers pass through; we use it as a soft first night by the river, slowing down before the long drive west.",
      "南宁是华南最安静的省会——一年常绿，邕江从城边流过，壮味和粤味隔着一口锅各做各的。多数旅客把它当中转，我们用它做第一晚：住在江边，把节奏放慢，第二天再往西开。",
    ),
    slides: [asset("/destinations/nanning.jpg"), asset("/destinations/hotel-a.jpg"), asset("/destinations/kunming.jpg")],
  },
  chongzuo: {
    culture: L(
      "Detian is the place where the map turns into spray: Vietnam and China on two banks of the same curtain of water. Mingshi is its quieter twin — karst, fields, a road so flat you forget the speed you built up to get here.",
      "德天是地图变成水花的地方：中越两国隔着一帘白水各站一边。明仕是它更安静的孪生——喀斯特、稻田、一条平到让你忘了来时赶路的公路。",
    ),
    slides: [asset("/destinations/chongzuo.jpg"), asset("/destinations/hotel-b.jpg"), asset("/destinations/puzhehei.jpg")],
  },
  halong: {
    culture: L(
      "Ha Long is limestone that walked into the sea and forgot to come back — a thousand-odd islands standing in water that never learned to settle. We stay two nights so the cruise is a full day, and the bay belongs to you at dusk.",
      "下龙湾是石灰岩走到海里忘了回头——一千多座岛立在水上，那水从来没学过平静。我们住两晚，让游轮变成一整天，让黄昏时整个湾都让给你。",
    ),
    slides: [asset("/destinations/catba.jpg"), asset("/destinations/hotel-c.jpg"), asset("/destinations/hanoi.jpg")],
  },
  catba: {
    culture: L(
      "Cat Ba is the bay's quieter side — same limestone, far fewer boats, an island that still goes to sea for fish at dawn. We come by ferry so the night is water rather than a highway hotel; the national park is the afternoon, Cannon Fort the last walk.",
      "吉婆岛是湾的另一半安静——同样的石灰岩，船少得多，清晨还有人出海打鱼。我们坐轮渡来，让这一夜也是水，而不是高速旁的酒店；国家公园是下午，炮台是最后一走。",
    ),
    slides: [asset("/destinations/catba.jpg"), asset("/destinations/hotel-c.jpg"), asset("/destinations/mile.jpg")],
  },
  hanoi: {
    culture: L(
      "Hanoi is a city that is still writing itself: 36 trade streets in the Old Quarter, French shade a few blocks over, a lake the city walks around after work. Two nights so the morning broth, the late coffee and the evening beer street can all be Hanoi's, not a transit stop.",
      "河内是一座还在写自己的城：老城三十六行街、几条街外的法式荫凉、下班后绕着走的湖。两晚，让早上的河粉、下午的咖啡、晚上的啤酒街都属于河内，不是中转站。",
    ),
    slides: [asset("/destinations/hanoi.jpg"), asset("/destinations/hotel-a.jpg"), asset("/destinations/sapa.jpg")],
  },
  sapa: {
    culture: L(
      "Sapa's terraces are not a viewpoint — they are a water system, hand-cut over centuries by Hmong and Dao families. We walk down into them with someone who farms there, because the rice tells different things at ankle height than at shoulder height.",
      "沙坝的梯田不是观景台——它是水系，是苗族和瑶族几代人用手刻出来的。我们跟在地里干活的本地人走下去，因为稻子在脚踝和肩膀的高度，说的是不同的故事。",
    ),
    slides: [asset("/destinations/sapa.jpg"), asset("/destinations/hotel-b.jpg"), asset("/destinations/guantang.jpg")],
  },
  train: {
    culture: L(
      "The metre-gauge is a leftover of the Yunnan–Vietnam railway. Sleeping on it is the border in slow motion — not a gimmick, a way the geography still works. Tea from a flask, dinner at a station platform, and the next morning somewhere else.",
      "米轨是滇越铁路剩下的。睡在上面，边境是慢动作——不是噱头，是地理还在用的方式。保温瓶里的茶，站台上的饭，第二天醒来已在另一处。",
    ),
    slides: [asset("/destinations/train.jpg"), asset("/destinations/hotel-c.jpg"), asset("/destinations/jianshui.jpg")],
  },
  jianshui: {
    culture: L(
      "Jianshui is one of the few Chinese old towns that still believes it's one: a Confucian temple still standing, courtyard houses still lived in, the narrow-gauge still running. The Yunnan after Hekou begins here as lanes and tofu, not as a highway plaza.",
      "建水是少数还信自己是古城的古城：文庙还立着，院子还住着，米轨小火车还在开。过了河口，云南就从巷子和豆腐开始了，不是高速服务区。",
    ),
    slides: [asset("/destinations/jianshui.jpg"), asset("/destinations/hotel-d.jpg"), asset("/destinations/kunming.jpg")],
  },
  puzhehei: {
    culture: L(
      "Puzhehei is a lake that grew inside a karst forest: lotus threading between the peaks, a bamboo raft the only way in. The local Yi call it 'where fish and shrimp overflow' — once you are there, the name stops sounding like poetry and starts sounding like fact.",
      "普者黑是长在喀斯特森林里的一湖水：荷花从峰丛之间穿过，进去了只能坐竹筏。当地彝族管这里叫'鱼虾满出来的地方'——到了之后，这名字就不像诗、像事实了。",
    ),
    slides: [
      asset("/destinations/chongzuo.jpg"),
      asset("/destinations/catba.jpg"),
      asset("/destinations/puzhehei.jpg"),
    ],
  },
  mile: {
    culture: L(
      "Mile's Dongfengyun is what an artist built when he stopped asking permission — red-brick kilns and cone towers with no blueprints, set among the vineyards. We come for the dusk light, then leave the hot springs to do what they do: return us to a body that still works.",
      "弥勒东风韵是位艺术家不要审批时盖出来的东西——没有图纸的红砖窑和锥形塔，立在葡萄田中间。我们来是为黄昏的光，然后把温泉的事留给温泉——把一具还能用的身体还给你。",
    ),
    slides: [asset("/destinations/mile.jpg"), asset("/destinations/hotel-b.jpg"), asset("/destinations/puzhehei.jpg")],
  },
  kunming: {
    culture: L(
      "Kunming is the spring city — year-round twenty degrees, willows on Green Lake, gulls from Siberia in November. Most trips end here as a flight home; we end here as a last walk, the city easy enough to still receive you.",
      "昆明是春城——常年二十度上下，翠湖的柳，十一月有从西伯利亚来的红嘴鸥。多数行程在这里结束于一趟回家的航班；我们在这里结束于最后一走，城市松到还接得住你。",
    ),
    slides: [asset("/destinations/kunming.jpg"), asset("/destinations/hotel-c.jpg"), asset("/destinations/jianshui.jpg")],
  },
  guantang: {
    culture: L(
      "Longzhou and Guantang sit behind Friendship Pass, where the border is a melody: the Zhuang tianqin, two strings and a question-and-answer song older than the line drawn on the map. Two nights so the cane sea becomes a morning you wake up to, not a window you frame.",
      "龙州、观堂在友谊关背后，国境线在这里是一支旋律：壮族天琴，两根弦，一首比地图上的界线更老的问歌答歌。连住两晚，让蔗海变成你醒来的早晨，而不是你取景的窗口。",
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
