import type { Tx } from "@/types";

const L = (en: string, zh: string): Tx => ({ en, zh });

export type PartnerLink = {
  label: Tx;
  url: string;
  type: "google" | "web";
};

export type Partner = {
  name: Tx;
  category: Tx;
  location: Tx;
  desc: Tx;
  emoji: string;
  color: string;
  links: PartnerLink[];
};

export const partners: Partner[] = [
  {
    name: L("Chaoyang Post Inn", "朝阳驿·建水"),
    category: L("Boutique Stay", "精品民宿"),
    location: L("Yunnan · Jianshui", "云南·建水"),
    desc: L(
      "A century-old courtyard within the ancient walls of Jianshui — cobblestone sky-wells and nightly tofu-and-rice-wine sessions.",
      "临安古城内的百年院落，青砖天井，每晚可在天井里喝建水烤豆腐配米酒。",
    ),
    emoji: "🏯",
    color: "#8F8458",
    links: [
      {
        label: L("View on Google Maps", "在 Google 地图查看"),
        url: "https://www.google.com/maps/search/?api=1&query=朝阳驿+建水",
        type: "google",
      },
    ],
  },
  {
    name: L("Topas Ecolodge", "Topas Ecolodge"),
    category: L("Eco Lodge", "生态度假村"),
    location: L("Vietnam · Sapa", "越南·沙坝"),
    desc: L(
      "Stone bungalows above the terraces, a private infinity pool over the valley — waking in the mist is uniquely yours.",
      "梯田之上的石砌小屋，私家无边际泳池俯瞰山谷，晨雾中醒来是每位住客的专属时刻。",
    ),
    emoji: "🌿",
    color: "#3D6B52",
    links: [
      {
        label: L("Visit website", "访问官网"),
        url: "https://topasecolodge.com",
        type: "web",
      },
      {
        label: L("Google Maps", "Google 地图"),
        url: "https://www.google.com/maps/search/?api=1&query=Topas+Ecolodge+Sapa",
        type: "google",
      },
    ],
  },
  {
    name: L("Detian Border Guesthouse", "德天边境人家"),
    category: L("Local Guesthouse", "当地民宿"),
    location: L("Guangxi · Daxin", "广西·大新"),
    desc: L(
      "Ten minutes' walk from Detian Falls — evenings on the terrace to the sound of water. The owner is Zhuang; bamboo rice every night.",
      "距德天瀑布步行 10 分钟，傍晚坐在露台听见流水声。老板是当地壮族人，每晚有竹筒饭。",
    ),
    emoji: "🌊",
    color: "#2F5344",
    links: [
      {
        label: L("Google Maps", "Google 地图"),
        url: "https://www.google.com/maps/search/?api=1&query=德天瀑布+民宿",
        type: "google",
      },
    ],
  },
  {
    name: L("Cat Ba Ventures", "Cat Ba Ventures"),
    category: L("Outdoor Activities", "户外活动"),
    location: L("Vietnam · Cat Ba Island", "越南·吉婆岛"),
    desc: L(
      "Professional kayak team for half-day and full-day cave-passage experiences; top-tier gear, internationally certified guides.",
      "专业皮划艇团队，提供穿越水上洞穴的半日及全日体验，设备一流，教练均持国际认证。",
    ),
    emoji: "🚣",
    color: "#4A7B8A",
    links: [
      {
        label: L("Visit website", "访问官网"),
        url: "https://catbaventures.com",
        type: "web",
      },
    ],
  },
  {
    name: L("Mile Dongfengyun Winery", "弥勒东风韵酒庄"),
    category: L("Winery", "酒庄体验"),
    location: L("Yunnan · Mile", "云南·弥勒"),
    desc: L(
      "One of Yunnan's finest boutique wineries — 1,300m vineyards, an art architecture park, tastings and stays available.",
      "云南最知名的精品酒庄之一，海拔 1300m 的葡萄园配上建筑艺术园区，可品鉴可住宿。",
    ),
    emoji: "🍷",
    color: "#7A3E4A",
    links: [
      {
        label: L("Visit website", "访问官网"),
        url: "https://www.google.com/maps/search/?api=1&query=弥勒东风韵酒庄",
        type: "web",
      },
      {
        label: L("Google Maps", "Google 地图"),
        url: "https://www.google.com/maps/search/?api=1&query=弥勒东风韵酒庄",
        type: "google",
      },
    ],
  },
  {
    name: L("Little Kitchen Hanoi", "河内·小厨越菜"),
    category: L("Restaurant", "特色餐厅"),
    location: L("Vietnam · Hanoi", "越南·河内"),
    desc: L(
      "A family restaurant tucked in an Old Quarter alley — Chef Chio's steamed shrimp-paste fish and Hanoi grilled pork bring locals back week after week.",
      "老街区藏身小巷的家庭餐厅，主厨阿娇的虾酱蒸鱼和河内烤肉是当地食客回头率最高的两道菜。",
    ),
    emoji: "🍜",
    color: "#C17F3A",
    links: [
      {
        label: L("Google Maps", "Google 地图"),
        url: "https://www.google.com/maps/search/?api=1&query=Little+Kitchen+Hanoi",
        type: "google",
      },
    ],
  },
];
