import type { Tx } from "@/types";
import { asset } from "@/lib/asset";

export const destinationVideos: {
  id: string;
  youtubeId: string;
  /** YouTube channel display name, as shown on the original video. */
  channel?: string;
  /** Channel home, e.g. https://www.youtube.com/@NatGeo */
  channelUrl?: string;
  src: string;
  duration: string;
  location: Tx;
  title: Tx;
  desc: Tx;
}[] = [
  {
    id: "explore-culture",
    youtubeId: "clo3vXDJqCA",
    channel: "Blondie in China",
    channelUrl: "https://www.youtube.com/@BlondieinChina",
    src: asset("/destinations/guilin-mifen.jpg"),
    duration: "16:27",
    location: { en: "Guangxi · Guilin", zh: "广西 · 桂林" },
    title: {
      en: "Guilin Rice Noodles — First Taste of a Noodle Heaven",
      zh: "桂林米粉 — 第一次走进米粉天堂",
    },
    desc: {
      en: "A local-led crawl through Guilin's shops: brine rice noodles, sour bamboo soup, sticky rice. One bowl holds sour, spicy, salty and sweet.",
      zh: "跟着本地向导穿城找店：卤水米粉、酸笋汤粉、糯米饭。一碗里酸辣咸甜都有。",
    },
  },
  {
    id: "explore-halong",
    youtubeId: "SpOWgms2uto",
    channel: "National Geographic",
    channelUrl: "https://www.youtube.com/@NatGeo",
    src: asset("/destinations/halong-natgeo.jpg"),
    duration: "0:15",
    location: { en: "Vietnam · Quảng Ninh", zh: "越南 · 广宁省" },
    title: {
      en: "Vietnam's Ha Long Bay Is a Spectacular Garden of Islands",
      zh: "越南下龙湾：一座壮观的岛屿花园",
    },
    desc: {
      en: "Vietnam's Ha Long Bay, a maze of jewel-like islands, inspires wonder with its fantastical outcrops, caves, and coves.",
      zh: "越南下龙湾如珠宝般的岛屿迷宫，奇岩、溶洞与海湾令人心生惊叹。",
    },
  },
  {
    id: "explore-voices",
    youtubeId: "ak32T9nQ4zA",
    channel: "Rachel Meets China",
    channelUrl: "https://www.youtube.com/@rachelmeetschina7287",
    src: asset("/destinations/chongzuo-rachel.jpg"),
    duration: "12:04",
    location: { en: "Guangxi · Chongzuo", zh: "广西 · 崇左" },
    title: {
      en: "4 Days in Chongzuo, Guangxi, China | Detian Waterfalls & Mingshi Scenic Area",
      zh: "广西崇左四日 | 德天瀑布与明仕田园",
    },
    desc: {
      en: "A 4-day solo trip to southern Guangxi: karst mountains, bike trails, and Detian Waterfall on the China–Vietnam border.",
      zh: "独自走桂南崇左四日：喀斯特山、骑行小路，以及中越边境的德天瀑布。",
    },
  },
  {
    id: "explore-guide",
    youtubeId: "bn__1VktABg",
    channel: "Travel For Phoebe",
    channelUrl: "https://www.youtube.com/@travelforphoebe",
    src: asset("/destinations/halong-hanoi-phoebe.jpg"),
    duration: "22:31",
    location: { en: "Vietnam · Ha Long / Hanoi", zh: "越南 · 下龙 / 河内" },
    title: {
      en: "Exploring Ha Long Bay & Hanoi 🇻🇳 Is it worth visiting?!",
      zh: "探索下龙湾与河内 🇻🇳 真的值得去吗？",
    },
    desc: {
      en: "Is a Ha Long Bay cruise actually worth it? After 2 days and 1 night among the limestone islands, honest thoughts — then back to Hanoi for street food, Vietnamese coffee, and Ba Vi Eco Village.",
      zh: "下龙湾邮轮真的值得吗？在石灰岩群岛间航行两天一夜后的真实感受，再回到河内吃街头小吃、喝越南咖啡，并探访巴维生态村。",
    },
  },
  {
    id: "explore-ninhbinh",
    youtubeId: "2QokjoUxbKM",
    channel: "wanderlost",
    channelUrl: "https://www.youtube.com/@WanderlostWay",
    src: asset("/destinations/catba-wanderlost.jpg"),
    duration: "27:24",
    location: { en: "Vietnam · Cát Bà", zh: "越南 · 吉婆岛" },
    title: {
      en: "Cát Ba Island | A Better Ha Long Bay Experience",
      zh: "吉婆岛 | 更好的下龙湾体验",
    },
    desc: {
      en: "We came to Vietnam to see legendary Ha Long Bay — but without cruise crowds or rigid itineraries. Based on Cát Bà, the largest island in the archipelago, this is the wilder side of Ha Long you don't see on cruise brochures.",
      zh: "我们来越南看传说中的下龙湾，但不想要邮轮人潮和固定行程。以下龙湾群岛最大的吉婆岛为基地，找到更野、更自由的走法——邮轮手册上看不到的那一面。",
    },
  },
  {
    id: "explore-hanoi",
    youtubeId: "0ILezKK6sTs",
    channel: "噔噔去旅行 Dengdeng travel",
    channelUrl: "https://www.youtube.com/@Dengdengtravel",
    src: asset("/destinations/kunming-dengdeng.jpg"),
    duration: "13:49",
    location: { en: "China · Kunming", zh: "中国 · 昆明" },
    title: {
      en: "Visit Kunming, China｜Yunnan Province Travel Guide",
      zh: "中国昆明最好玩的10个地方｜Visit Kunming, China｜Yunnan Province Travel Guide",
    },
    desc: {
      en: "Today we explore Kunming in Yunnan Province. Though on China's southwestern frontier, it is emerging as a modern metropolis — 8.68 million people as of 2024. Stops include Dianchi Lake, Kunming Old Town, Haiyan Village, Shuangqiao Night Market, Cuihu Park, Daguan Park, Yunnan Military Academy, Dounan Flower Market and Laoyuhe Wetland Park.",
      zh: "今天带您走进云南省昆明市。虽地处中国西南边陲，昆明正崛起为现代化都市，截至2024年常住人口已突破868万。景点包括滇池、昆明老街、海晏村、双桥夜市、翠湖公园、大观公园、陆军讲武堂、斗南花卉市场、捞渔河湿地公园等。",
    },
  },
];
