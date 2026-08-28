import type { Theme } from "@/types";

export const themes: Theme[] = [
  {
    id: "wild",
    en: "Wild Fun",
    zh: "纵情山野・玩法够野",
    wash: "#14241f",
    materials: [
      { id: "w1", kind: "image", label: { en: "Wild Fun · 1", zh: "够野 · 1" }, caption: { en: "Detian", zh: "德天" } },
      { id: "w2", kind: "image", label: { en: "Wild Fun · 2", zh: "够野 · 2" }, caption: { en: "Cat Ba", zh: "吉婆岛" } },
      { id: "w3", kind: "video", label: { en: "Wild Fun · 3", zh: "够野 · 3" }, caption: { en: "Fansipan", zh: "番西邦" } },
    ],
  },
  {
    id: "flavors",
    en: "Great Flavors",
    zh: "地道风味・美食够味",
    wash: "#2a1c14",
    materials: [
      { id: "f1", kind: "image", label: { en: "Flavors · 1", zh: "够味 · 1" }, caption: { en: "VN coffee", zh: "越南咖啡" } },
      { id: "f2", kind: "image", label: { en: "Flavors · 2", zh: "够味 · 2" }, caption: { en: "Lotus lunch", zh: "莲花餐" } },
      { id: "f3", kind: "image", label: { en: "Flavors · 3", zh: "够味 · 3" }, caption: { en: "Night market", zh: "夜市" } },
    ],
  },
  {
    id: "villages",
    en: "Green Villages",
    zh: "村落生态・传统非遗",
    wash: "#1c2418",
    materials: [
      { id: "v1", kind: "image", label: { en: "Villages · 1", zh: "村落 · 1" }, caption: { en: "Cat Cat", zh: "猫猫村" } },
      { id: "v2", kind: "image", label: { en: "Villages · 2", zh: "村落 · 2" }, caption: { en: "Tianqin", zh: "天琴" } },
      { id: "v3", kind: "image", label: { en: "Villages · 3", zh: "村落 · 3" }, caption: { en: "Jianshui", zh: "建水" } },
    ],
  },
  {
    id: "locals",
    en: "Friendly Locals",
    zh: "够朋友・当地人",
    wash: "#241810",
    materials: [
      { id: "l1", kind: "image", label: { en: "Locals · 1", zh: "够朋友 · 1" }, caption: { en: "Guide", zh: "地陪" } },
      { id: "l2", kind: "image", label: { en: "Locals · 2", zh: "够朋友 · 2" }, caption: { en: "Craft", zh: "手作" } },
      { id: "l3", kind: "image", label: { en: "Locals · 3", zh: "够朋友 · 3" }, caption: { en: "Shared table", zh: "同桌" } },
    ],
  },
];
