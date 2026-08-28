import type { DayStop, RouteId, Tx } from "@/types";

const L = (en: string, zh: string): Tx => ({ en, zh });

const vietnamBlock: DayStop[] = [
  {
    day: 0,
    city: L("Cat Ba", "吉婆岛"),
    stay: L("Cat Ba", "吉婆岛"),
    stayKind: "hotel",
    placeId: "catba",
    bullets: [
      L("Mong Cai border", "芒街过关"),
      L("Ferry to Cat Ba Island", "轮渡过吉婆岛"),
      L("Night on the island", "住吉婆岛"),
    ],
    themes: ["wild"],
  },
  {
    day: 0,
    city: L("Hanoi", "河内"),
    stay: L("Hanoi", "河内"),
    stayKind: "hotel",
    placeId: "hanoi",
    bullets: [
      L("Cable car to Hai Phong — VN coffee while you wait", "缆车过海防，等候赠越南咖啡"),
      L("36 Streets + cyclo, Train Street", "三十六鼓街含三轮车，打卡火车街"),
      L("West Lake night bus", "观光巴士夜游西湖"),
    ],
    themes: ["flavors", "locals"],
  },
  {
    day: 0,
    city: L("Hanoi", "河内"),
    stay: L("Hanoi", "河内"),
    stayKind: "hotel",
    placeId: "hanoi",
    bullets: [
      L("Ho Chi Minh & Ba Dinh", "胡志明纪念堂、巴亭广场"),
      L("Lotus buffet", "莲花自助餐"),
      L("Free time or the market", "自由活动或逛河内菜市场"),
    ],
    themes: ["flavors"],
  },
  {
    day: 0,
    city: L("Sapa", "沙坝"),
    stay: L("Sapa", "沙坝"),
    stayKind: "hotel",
    placeId: "sapa",
    bullets: [
      L("Hanoi to Sapa", "河内前往沙坝"),
      L("Rice terraces", "沙坝梯田"),
      L("Cat Cat village", "猫猫村"),
    ],
    themes: ["villages"],
  },
  {
    day: 0,
    city: L("Overnight train", "米轨过夜"),
    stay: L("Meter-gauge overnight", "住米轨"),
    stayKind: "train",
    placeId: "train",
    bullets: [
      L("Fansipan cable + Muong Hoa train", "番西邦缆车 + 芒花小火车"),
      L("Evening meter-gauge departure", "晚上米轨发车"),
      L("Sleep on board", "住在车上"),
    ],
    themes: ["wild"],
  },
];

function stamp(block: DayStop[], startDay: number): DayStop[] {
  return block.map((d, i) => ({ ...d, day: startDay + i }));
}

export const routes: Record<
  RouteId,
  { id: RouteId; days: DayStop[] }
> = {
  r1: {
    id: "r1",
    days: [
      {
        day: 1,
        city: L("Nanning", "南宁"),
        stay: L("Nanning", "南宁"),
        stayKind: "hotel",
        placeId: "nanning",
        bullets: [
          L("Arrive Nanning", "抵达南宁"),
          L("City orientation", "城市适应"),
          L("Rest before the border", "过关前休息"),
        ],
        themes: ["locals"],
      },
      {
        day: 2,
        city: L("Chongzuo", "崇左"),
        stay: L("Chongzuo", "崇左"),
        stayKind: "hotel",
        placeId: "chongzuo",
        bullets: [
          L("Detian Waterfall", "德天瀑布"),
          L("Mingshi Pastoral", "名仕田园"),
          L("Stay Chongzuo", "住崇左"),
        ],
        themes: ["wild"],
      },
      ...stamp(vietnamBlock, 3),
      {
        day: 8,
        city: L("Jianshui", "建水"),
        stay: L("Jianshui", "建水"),
        stayKind: "hotel",
        placeId: "jianshui",
        drive: "3h",
        bullets: [
          L("Exit toward Hekou", "出境前往河口"),
          L("Enter China", "河口入境中国"),
          L("Hekou → Jianshui", "河口至建水"),
        ],
        themes: ["villages"],
      },
      {
        day: 9,
        city: L("Puzhehei", "普者黑"),
        stay: L("Inside the park", "景区内"),
        stayKind: "park",
        placeId: "puzhehei",
        drive: "4h",
        bullets: [
          L("Jianshui old town mini-train", "建水古城小火车"),
          L("Tuanshan residences", "团山民居"),
          L("On to Puzhehei", "前往普者黑"),
        ],
        themes: ["villages", "wild"],
      },
      {
        day: 10,
        city: L("Mile", "弥勒"),
        stay: L("Mile", "弥勒"),
        stayKind: "hotel",
        placeId: "mile",
        drive: "3h",
        bullets: [
          L("Willow-leaf boat", "柳叶舟游湖"),
          L("Dongfengyun", "东风韵"),
          L("Hot spring night", "晚上泡温泉"),
        ],
        themes: ["wild", "flavors"],
      },
      {
        day: 11,
        city: L("Kunming", "昆明"),
        stay: L("Kunming", "昆明"),
        stayKind: "hotel",
        placeId: "kunming",
        drive: "2h",
        bullets: [
          L("Mile → Kunming", "弥勒至昆明"),
          L("Green Lake", "翠湖公园"),
          L("Old street", "昆明老街"),
        ],
        themes: ["flavors", "locals"],
      },
      {
        day: 12,
        city: L("Depart", "送机"),
        stay: L("Airport", "机场"),
        stayKind: "hotel",
        bullets: [
          L("Airport transfer", "昆明送机"),
          L("Afternoon flight? Dounan flowers", "晚班机可加斗南花市"),
          L("End in Kunming", "行程结束"),
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
        stay: L("Nanning", "南宁"),
        stayKind: "hotel",
        placeId: "nanning",
        bullets: [
          L("Arrive Nanning", "抵达南宁"),
          L("Brief city night", "南宁夜"),
          L("Early border next day", "次日过关"),
        ],
        themes: ["locals"],
      },
      ...stamp(vietnamBlock, 2),
      {
        day: 7,
        city: L("Guantang", "观堂"),
        stay: L("Guantang", "观堂"),
        stayKind: "base",
        placeId: "guantang",
        bullets: [
          L("Lang Son & Dong Dang fair", "谅山、同登庙会"),
          L("Youyiguan (Friendship Pass)", "友谊关出境"),
          L("Longzhou, stay Guantang", "龙州，住观堂"),
        ],
        themes: ["locals", "villages"],
      },
      {
        day: 8,
        city: L("Guantang", "观堂"),
        stay: L("Guantang", "观堂"),
        stayKind: "base",
        placeId: "guantang",
        bullets: [
          L("Tianqin Zhuang village", "天琴壮寨"),
          L("Cycle the cane fields", "骑行蔗海"),
          L("Free walk", "自由散步"),
        ],
        themes: ["villages", "wild"],
      },
      {
        day: 9,
        city: L("Nanning", "南宁"),
        stay: L("Nanning", "南宁"),
        stayKind: "hotel",
        placeId: "chongzuo",
        bullets: [
          L("Detian Waterfall", "德天瀑布"),
          L("Mingshi Pastoral", "名仕田园"),
          L("Back to Nanning", "住南宁"),
        ],
        themes: ["wild"],
      },
      {
        day: 10,
        city: L("Depart", "结束"),
        stay: L("Nanning", "南宁"),
        stayKind: "hotel",
        bullets: [
          L("Return in Nanning", "返南宁"),
          L("Trip ends", "行程结束"),
          L("Ask us for extra night", "需要加住告诉我们"),
        ],
        themes: ["locals"],
      },
    ],
  },
};
