import type { ThemeId, Tx } from "@/types";
import { asset } from "@/lib/asset";

const L = (en: string, zh: string): Tx => ({ en, zh });

export const experienceCover: Record<ThemeId, string> = {
  wild: asset("/destinations/chongzuo-mijing.jpg"),
  flavors: asset("/destinations/hanoi.jpg"),
  villages: asset("/destinations/sapa.jpg"),
  locals: asset("/destinations/guantang.jpg"),
};

export const experienceDetails: Record<
  ThemeId,
  { desc: Tx; highlights: Tx[]; stories: { title: Tx; body: Tx; by: Tx }[] }
> = {
  wild: {
    desc: L(
      "Nature here has never been tamed. Detian Falls spills across the China-Vietnam border, Cat Ba's emerald bay emerges through morning mist, and Sapa's terraces shift through greens with the seasons. These aren't backdrops — they're the protagonists. We take you in, not just up to the view.",
      "这片土地上，自然从未被驯化。德天瀑布倾泻于中越边境两侧，吉婆岛的翡翠海湾在晨雾中若隐若现，沙坝的梯田随季节换上深浅不一的绿——这些不是风景，而是旅途的主角。我们带你走进去，而不只是看。",
    ),
    highlights: [
      L("Detian Falls — a curtain of water spanning two nations", "德天跨国瀑布 — 边境两侧的水幕奇观"),
      L("Cat Ba Island — the last wild island of Ha Long Bay", "吉婆岛 — 哈龙湾最后的原始岛屿"),
      L("Fansipan — cloud trekking on Indochina's highest peak", "番西邦 — 印度支那最高峰的云端徒步"),
    ],
    stories: [
      {
        title: L("It rained at Detian. It was perfect.", "德天瀑布那天，下雨了"),
        body: L(
          "I was worried about the weather, but our guide said: \"Detian in the rain is the real Detian.\" He was right. The extra volume made the falls roar. We got soaked on the bamboo raft and didn't care at all. That feeling of being genuinely inside nature — you can't get it on a clear day.",
          "出发前有点担心天气，但向导说「下雨的德天才是真的德天」。雨水让瀑布的水量暴增，站在竹筏上，水雾打湿了衣服，完全不在乎。那种「人在自然里」的感觉，是晴天给不了的。",
        ),
        by: L("Lin Xiaoyan · Shanghai", "林晓燕 · 上海"),
      },
      {
        title: L("The kayak cave on Cat Ba", "吉婆岛的皮划艇穿洞"),
        body: L(
          "Our guide took us through a low opening that only exists at low tide. Inside was a completely enclosed emerald lagoon, surrounded by sheer cliffs. Just the four of us — no tour boats, no sound. For twenty minutes, time stopped.",
          "向导带我们穿过一个只有退潮时才能进去的低矮洞口，里面是一个完全封闭的翡翠湖，四周都是悬崖。只有我们四个人，没有游船，没有声音。那二十分钟，时间是停的。",
        ),
        by: L("James R. · London", "James R. · 伦敦"),
      },
      {
        title: L("That Sapa morning I walked out alone", "沙坝的那个清晨，我一个人走出去"),
        body: L(
          "I woke at 5am and pushed open the window — the clouds were just beginning to rise from the valley. I didn't wake anyone, just put on a jacket and walked down. A few Hmong women were working in the terraces. We exchanged a glance and a nod. It was the quietest and fullest moment of the whole trip.",
          "凌晨五点醒来，推开窗，云海刚开始在谷底涌动。我没有叫任何人，穿上外套走下山。梯田里有几个苗族女人在劳作，我们只是对视了一眼，各自点头。那是整趟旅程最安静、也最丰满的时刻。",
        ),
        by: L("Tanaka Misaki · Tokyo", "田中美咲 · 东京"),
      },
    ],
  },
  flavors: {
    desc: L(
      "The flavor of a place is the hardest memory to replicate. Vietnamese drip coffee wakes you at dawn, Hanoi pho stalls always have a queue, Jianshui tofu chars slowly over coals — we treat eating as real itinerary, not filler. It's how you actually understand a city.",
      "一个地方的味道，是最难被复制的记忆。越式滴漏咖啡在清晨唤醒你，河内小巷里的河粉摊子永远有人排队，建水豆腐在炭火上慢慢焦脆——我们把「吃」列为正式的行程内容，不是填饱肚子，是真正理解一座城市的方式。",
    ),
    highlights: [
      L("Drip coffee & bánh mì — the best thing colonialism left behind", "越式滴漏咖啡与法棍早餐 — 殖民地时代留下的最好遗产"),
      L("Hanoi Old Quarter night market — sharing a table with strangers", "河内老街夜市 — 在地摊上和陌生人共桌"),
      L("Jianshui tofu — Yunnan's most ordinary and unforgettable snack", "建水豆腐 — 云南最平凡也最难忘的小吃"),
    ],
    stories: [
      {
        title: L("The soup that wasn't on the menu", "河内那碗不在菜单上的汤"),
        body: L(
          "Our guide took us to a place with no sign and four tables. The owner ladled a bowl without asking what we wanted. Pork-bone broth vermicelli, with an herb I can't name. I spent three days afterwards searching for it across Hanoi. Never found it again.",
          "向导带我们去了一家连门牌都没有的小店，只有四张桌子。老板从锅里直接舀出一碗来，没问我们要什么。是猪骨汤底的米线，加了一种我说不出名字的香叶。我后来在全河内找了三天，再也没找到一样的味道。",
        ),
        by: L("Sarah K. · Melbourne", "Sarah K. · 墨尔本"),
      },
      {
        title: L("Jianshui tofu at six in the morning", "建水豆腐，凌晨六点"),
        body: L(
          "The itinerary included an \"early market experience\" — I expected to just walk around. Instead the stall owner pulled me to the charcoal grill and taught me to flip the tofu. Charred outside, silky inside, dipped in chili salt with a bowl of rice porridge. The happiest moment of that morning.",
          "行程安排了一个早市体验，我以为只是走走看看。没想到摊主直接把我拉到炭炉边，教我翻豆腐。烤焦了皮、还嫩的里，蘸上辣椒盐，配一碗白粥，是那个早晨最幸福的事。",
        ),
        by: L("Camille D. · Paris", "Camille D. · 巴黎"),
      },
    ],
  },
  villages: {
    desc: L(
      "The most affecting places aren't tourist sites — they're villages that haven't changed much in centuries. Black Hmong women in Cat Cat still hand-weave traditional patterns, Tianqin music drifts from Zhuang bamboo groves, Jianshui's morning market opens before dawn. These places don't need to be discovered. They need to be respected.",
      "最打动人的往往不是景点，而是那些几百年没怎么变过的村子。猫猫村的黑苗族妇女还在手织传统图案，天琴壮寨的天琴声从竹林里传来，建水城里的辟龙街清晨有早市——这些地方不需要被「发现」，只需要被用心对待。",
    ),
    highlights: [
      L("Cat Cat Village — rice wine with a Black Hmong family", "猫猫村 — 和黑苗族家庭一起喝米酒"),
      L("Tianqin Zhuang Village — live performance of ancient Zhuang music", "天琴壮寨 — 壮族古乐的现场演奏"),
      L("Jianshui Old Town — Ming-dynasty lanes and dawn tofu soup", "建水古城 — 临安府的街巷与早市豆腐脑"),
    ],
    stories: [
      {
        title: L("The weaver's hands in Cat Cat", "猫猫村，阿姐织布的手"),
        body: L(
          "We sat down at a Hmong woman's house and she didn't stop weaving. Our guide translated when I asked how long one apron takes. \"Seven days,\" she said without looking up. I watched for a long time and suddenly understood what \"intangible heritage\" means — not a museum exhibit, but a pair of hands doing something right now.",
          "我们在一个苗族阿姐家坐下，她没有停下手里的织机。向导帮忙翻译，问她织一条围裙要多少天。「七天」，她说，眼睛没有抬。我看了很久，突然明白什么叫「非遗」——不是博物馆里的展品，是一双手在当下正在做的事。",
        ),
        by: L("Michelle T. · Singapore", "Michelle T. · 新加坡"),
      },
      {
        title: L("One hour with the Tianqin in the bamboo grove", "龙州天琴，竹林里的一个小时"),
        body: L(
          "The performance wasn't on a stage — just by a bamboo grove in the village, about a dozen elders in a row. The sound was like strings, like wind. Afterwards, an elderly woman handed me her instrument and gestured for me to try. I couldn't play, but I felt the string vibrate.",
          "演出不在舞台上，就在村子里的竹林边上，十几个老人坐成一排。那种声音，像弦乐，又像风。表演结束后，一位老奶奶把乐器递给我，让我试着拨了几下。我不会，但我感觉到了弦的震动。",
        ),
        by: L("David & Laura · New York", "David & Laura · 纽约"),
      },
      {
        title: L("The last morning in Jianshui Old Town", "建水古城的最后一个早晨"),
        body: L(
          "Before leaving, our guide took us down a street with no tourists — just the people who live there, opening their doors, sweeping, having porridge. A cat in the sun on a doorstep. No sign on this street, no name we could find. That morning made me feel that real travel is about having respect for the ordinary life of a place.",
          "临走前，向导带我们去了一条没有游客的街，只有住在这里的人在开门、扫地、喝粥。一只猫在门槛上晒太阳。这条街没有名字，至少没有告示牌。那个早晨让我觉得，真正的旅行是对一个地方的日常生活怀有敬意。",
        ),
        by: L("Markus H. · Munich", "Markus H. · 慕尼黑"),
      },
    ],
  },
  locals: {
    desc: L(
      "What we're most proud of is knowing the people here. Our guides aren't translators — they're people who genuinely understand this place. They take you to spots that aren't in any guide, tell you what this street looked like thirty years ago, introduce you to the grandmother who still makes things by hand. Travel changes with people. That's the center of what we do.",
      "我们最引以为豪的，是认识这片土地上的人。向导不是翻译机器，是真正懂得这里的人。他们会带你去不在攻略上的地方，告诉你这条街在三十年前是什么样子，介绍你认识做手工的老太太。旅行因人而变，这是我们路线的核心。",
    ),
    highlights: [
      L("Dedicated local guide — not a translator, a real travel companion", "专属本地向导 — 不只是翻译，是真正的路途伙伴"),
      L("Artisan visits — into the workshops of weavers, batik-makers, embroiderers", "手艺人拜访 — 走进竹编、蜡染、刺绣的工作现场"),
      L("Shared village meal — at the table with a local family, not a performance", "村落共餐 — 和当地家庭同桌，不是表演，是真实"),
    ],
    stories: [
      {
        title: L("The place our guide Awei took us", "向导阿伟带我们去的那个地方"),
        body: L(
          "The day before, Awei messaged to say he wanted to take us somewhere \"not in the plan.\" The next day: a small village near the border, no tourists, just a family drying chillies in their courtyard. They offered rice wine. We sat for nearly two hours, doing nothing in particular. The most comfortable two hours of the whole trip.",
          "出行前一天，阿伟发消息说想带我们去一个「不在计划里」的地方。第二天是一个靠近边境的小村子，没有游客，只有一户在院子里晾干辣椒的人家。主人请我们喝了米酒，我们坐了将近两个小时，什么都没做，但那是整趟旅程最舒服的两小时。",
        ),
        by: L("Tanaka Misaki · Tokyo", "田中美咲 · 东京"),
      },
      {
        title: L("The meal with the local family", "和当地家庭吃的那顿饭"),
        body: L(
          "The itinerary said \"village communal meal experience.\" I expected a folksy tourist dinner. What I found was a family's table with a few extra bowls set out. The grandmother talked a lot — our guide translated between laughs, saying she was asking if we had children. At the end she pressed a packet of her own tea into my hands. I haven't finished it yet.",
          "行程单上写的是「村落共餐体验」，我以为是那种表演性质的民俗晚宴。但到了之后发现，就是一家人的饭桌，多摆了几副碗筷。奶奶话很多，向导一边笑一边翻译，说她在问我们家里有没有孩子。那顿饭结束后，她塞给我一包自家种的茶叶。我现在还没舍得喝完。",
        ),
        by: L("Camille D. · Paris", "Camille D. · 巴黎"),
      },
    ],
  },
};
