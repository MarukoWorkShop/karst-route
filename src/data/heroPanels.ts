import type { ThemeId, Tx } from "@/types";
import { asset } from "@/lib/asset";

const L = (en: string, zh: string): Tx => ({ en, zh });

/** Full-bleed carousel slide. Tag + title + intro sit on the photo, Figma-style. */
export type HeroSlide = {
  id: string;
  src: string;
  pos: string;
  alt: Tx;
  themeId: ThemeId;
  tag: Tx;
  title: Tx;
  intro: Tx;
};

export const heroSlides: HeroSlide[] = [
  {
    id: "hanoi",
    src: asset("/destinations/hanoi.jpg"),
    pos: "center 55%",
    alt: L("Morning market and city streets", "早市与城市街巷"),
    themeId: "flavors",
    tag: L("CULTURAL STUDY TOUR", "人文研学"),
    title: L("Explore the morning market", "走进南方早市"),
    intro: L(
      "Heritage travellers discover a living city through the sights, smells and stories of the market — not a museum corridor.",
      "在还在运转的早市里认一座城：声音、气味、摊主的一句话，比展柜更像故乡。",
    ),
  },
  {
    id: "chongzuo",
    src: asset("/destinations/chongzuo.jpg"),
    pos: "center 40%",
    alt: L("Detian karst at the Guangxi border", "广西边境德天喀斯特"),
    themeId: "wild",
    tag: L("MOUNTAINS & RIVERS", "山河探险"),
    title: L("Explore the border falls", "走进德天边境瀑布"),
    intro: L(
      "Detian spills across two countries. We take the raft in, not just up to the viewpoint.",
      "德天倾泻在两国之间。坐竹筏进去，而不只是站在观景台。",
    ),
  },
  {
    id: "sapa",
    src: asset("/destinations/sapa.jpg"),
    pos: "center 50%",
    alt: L("Sapa rice terraces in mist", "沙坝云雾梯田"),
    themeId: "villages",
    tag: L("HERITAGE CRAFTS", "非遗手作"),
    title: L("Explore the terrace villages", "走进梯田与织布"),
    intro: L(
      "Black Hmong weaving in Cat Cat — heritage as hands at work, not a glass case.",
      "猫猫村的织布还在进行。非遗是一双手正在做的事。",
    ),
  },
  {
    id: "catba",
    src: asset("/destinations/catba.jpg"),
    pos: "center 55%",
    alt: L("Cat Ba limestone and harbour", "吉婆岛石灰岩与海湾"),
    themeId: "wild",
    tag: L("MOUNTAINS & RIVERS", "山河探险"),
    title: L("Explore Cat Ba's wild island", "走进吉婆岛"),
    intro: L(
      "The last wild island of Ha Long — kayak a cave that only opens at low tide.",
      "哈龙湾最后的原始岛。退潮时才能穿进那个洞。",
    ),
  },
  {
    id: "jianshui",
    src: asset("/destinations/jianshui.jpg"),
    pos: "center 45%",
    alt: L("Jianshui old town", "建水古城"),
    themeId: "villages",
    tag: L("HERITAGE CRAFTS", "非遗手作"),
    title: L("Explore Jianshui at dawn", "走进建水清晨"),
    intro: L(
      "Charcoal tofu before the tour buses. The old town is still a town.",
      "大巴到来前的炭炉豆腐。古城还是一座城。",
    ),
  },
  {
    id: "puzhehei",
    src: asset("/destinations/puzhehei.jpg"),
    pos: "center 50%",
    alt: L("Puzhehei karst water", "普者黑喀斯特水域"),
    themeId: "wild",
    tag: L("MOUNTAINS & RIVERS", "山河探险"),
    title: L("Explore the karst lakes", "走进普者黑峰丛"),
    intro: L(
      "A lake that grew inside a forest of peaks. Bamboo raft, then a Yi path.",
      "长在峰丛里的湖。先坐竹筏，再跟彝族向导进山。",
    ),
  },
  {
    id: "nanning",
    src: asset("/destinations/nanning.jpg"),
    pos: "center 45%",
    alt: L("Nanning at dusk", "南宁黄昏"),
    themeId: "flavors",
    tag: L("CITY WALKS", "城市漫步"),
    title: L("Explore the garden city", "走进绿城市井"),
    intro: L(
      "Zhongshan Road after dark: snail noodles, fruit stalls, a city not performing yet.",
      "中山路入夜：螺蛳粉、水果摊，一座还没为游客表演的城。",
    ),
  },
  {
    id: "mile",
    src: asset("/destinations/mile.jpg"),
    pos: "center top",
    alt: L("Highland dusk", "高原黄昏"),
    themeId: "locals",
    tag: L("LOCAL FRIENDS", "探访本地朋友"),
    title: L("Travel changes with people", "旅行因人而变"),
    intro: L(
      "Guides who remember the street from thirty years ago — and still take you there.",
      "向导记得三十年前的那条街，也还愿意带你去。",
    ),
  },
];
