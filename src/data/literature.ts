import type { Tx } from "@/types";
import { asset } from "@/lib/asset";

const L = (en: string, zh: string): Tx => ({ en, zh });

export type LitWork = {
  id: string;
  type: "book" | "film";
  cover: string;
  title: Tx;
  creator: Tx;
  year: string;
  location: Tx;
  desc: Tx;
  googleQuery: string;
};

export const literaryWorks: LitWork[] = [
  {
    id: "border-town",
    type: "book",
    cover: asset("/destinations/guantang.jpg"),
    title: L("Border Town", "边城"),
    creator: L("Shen Congwen", "沈从文"),
    year: "1934",
    location: L("China · Southwest Border", "中国 · 西南边境"),
    desc: L(
      "Shen Congwen's West Hunan is China's last pure human utopia — ferrymen, folk songs and a girl named Cuicui on the riverside. Read this before the trip and you will recognise its atmosphere everywhere along the border.",
      "沈从文笔下的湘西，是中国最后一片纯粹的人文乌托邦。渡口、摆渡人、翠翠和傩送，构成一幅边境少数民族生活的浓墨重彩。读这本书，再走南境，你会在路上认出里面的气息。",
    ),
    googleQuery: "沈从文 边城 小说",
  },
  {
    id: "liu-sanjie",
    type: "film",
    cover: asset("/destinations/chongzuo.jpg"),
    title: L("Liu Sanjie", "刘三姐"),
    creator: L("Dir. Su Li", "苏里 导演"),
    year: "1961",
    location: L("China · Guilin, Guangxi", "中国 · 广西桂林"),
    desc: L(
      "Filmed on location along the Li River, China's first colour musical features Zhuang folk-singer Liu Sanjie whose songs still echo across Guangxi. After watching, the mountains and water of Guilin will feel entirely different.",
      "实景拍摄于漓江与桂林山水之间，是中国第一部彩色山水歌舞片。壮族歌姬刘三姐的山歌至今仍在广西回响。看这部片，你会对桂林的山和水有完全不同的感受。",
    ),
    googleQuery: "刘三姐 1961 电影 桂林",
  },
  {
    id: "lost-horizon",
    type: "book",
    cover: asset("/destinations/mile.jpg"),
    title: L("Lost Horizon", "消失的地平线"),
    creator: L("James Hilton", "詹姆斯·希尔顿"),
    year: "1933",
    location: L("China · Yunnan", "中国 · 云南"),
    desc: L(
      "The origin of the word 'Shangri-La.' Hilton's hidden valley was modelled on Yunnan's Diqing region. Reading this explains why Yunnan exerts a near-mythological pull on travellers worldwide.",
      "「香格里拉」一词的来源。希尔顿笔下的隐秘山谷原型正是云南迪庆一带。读这本书你会理解为什么云南对全世界旅行者有近乎神话般的吸引力。",
    ),
    googleQuery: "Lost Horizon James Hilton Shangri-La Yunnan",
  },
  {
    id: "green-papaya",
    type: "film",
    cover: asset("/destinations/hanoi.jpg"),
    title: L("The Scent of Green Papaya", "青木瓜之味"),
    creator: L("Dir. Trần Anh Hùng", "陈英雄 导演"),
    year: "1993",
    location: L("Vietnam · Saigon", "越南 · 西贡"),
    desc: L(
      "A sensory poem about daily Vietnamese life — no war, no politics, just the sound of papaya sap, ants on floorboards, afternoon light. After watching, you will want to slow down and open every sense.",
      "一部关于越南日常生活气息的诗意电影。没有战争，没有政治，只有青木瓜汁液的声音，蚂蚁爬过地板，午后的光。看完之后你会想慢下来，把每一个感官都打开。",
    ),
    googleQuery: "The Scent of Green Papaya 1993 film Tran Anh Hung",
  },
  {
    id: "catfish-mandala",
    type: "book",
    cover: asset("/destinations/catba.jpg"),
    title: L("Catfish and Mandala", "鲶鱼与曼陀罗"),
    creator: L("Andrew X. Pham", "安德鲁·范"),
    year: "1999",
    location: L("Vietnam (full country)", "越南 全境"),
    desc: L(
      "A Vietnamese-American cycles the entire length of Vietnam — road literature written from both outsider and insider perspectives. Markets, roadside stalls, ferry crossings, memory and forgetting: Vietnam's most authentic texture.",
      "一个越南裔美国人骑自行车穿越越南全境的公路文学。他用一个外来者兼内部人的双重视角，写出了越南最真实的日常质感——市场、路边摊、渡口、记忆与遗忘。",
    ),
    googleQuery: "Catfish and Mandala Andrew X Pham book Vietnam",
  },
  {
    id: "quiet-american",
    type: "film",
    cover: asset("/destinations/nanning.jpg"),
    title: L("The Quiet American", "安静的美国人"),
    creator: L("Dir. Phillip Noyce", "菲利普·诺伊斯 导演"),
    year: "2002",
    location: L("Vietnam · Hanoi / Saigon", "越南 · 河内 / 西贡"),
    desc: L(
      "Based on Graham Greene's novel, filmed in Hanoi and Saigon. The dying days of the colonial era, the city's lantern-lit streets — an ineffable melancholy. Essential viewing before any Vietnam trip.",
      "根据格雷厄姆·格林同名小说改编，迈克尔·凯恩主演。殖民末期的越南、西贡的灯火、河内的街道，都透着一种无法言说的忧郁。是所有去越南前必看的电影之一。",
    ),
    googleQuery: "The Quiet American 2002 film Graham Greene Vietnam",
  },
  {
    id: "land-water-milk",
    type: "book",
    cover: asset("/destinations/sapa.jpg"),
    title: L("Land of Water and Milk", "水乳大地"),
    creator: L("Fan Wen", "范稳"),
    year: "2004",
    location: L("China · Yunnan", "中国 · 云南"),
    desc: L(
      "An epic novel of Yunnan where Catholicism, Tibetan Buddhism and animist faith collided and coexisted across centuries in the Hengduan Mountains. Read it to understand how many Yunnans exist within one province.",
      "云南藏区与多民族交汇的史诗小说，写天主教、藏传佛教与原始宗教在横断山脉的几百年碰撞与共存。走进云南之前，这本书会让你对这片土地的多元有全新的感知。",
    ),
    googleQuery: "范稳 水乳大地 云南小说",
  },
  {
    id: "still-life",
    type: "film",
    cover: asset("/destinations/jianshui.jpg"),
    title: L("Still Life", "三峡好人"),
    creator: L("Dir. Jia Zhangke", "贾樟柯 导演"),
    year: "2006",
    location: L("China · Chongqing / Southwest", "中国 · 重庆 / 西南"),
    desc: L(
      "Jia Zhangke's silent, powerful portrait of China's southwest waterways and their people. Not about Guangxi or Vietnam directly, but its atmosphere precisely matches the sense of deep time you will feel on this journey.",
      "贾樟柯镜头下的中国西南水域与人，静默中有巨大的力量。这部片不直接拍摄广西或越南，但它的气质与你将在南境旅途中感受到的「沧桑感」高度共鸣。",
    ),
    googleQuery: "贾樟柯 三峡好人 电影 2006",
  },
];
