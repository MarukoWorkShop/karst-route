import type { Theme } from "@/types";
import { asset } from "@/lib/asset";

export const themes: Theme[] = [
  {
    id: "wild",
    en: "Wild Fun",
    zh: "纵情山野・玩法够野",
    wash: "#14241f",
    cover: asset("/destinations/chongzuo.jpg"),
    materials: [
      {
        id: "w1",
        kind: "image",
        src: asset("/destinations/chongzuo.jpg"),
        label: { en: "Wild Fun · 1", zh: "够野 · 1" },
        caption: { en: "Detian", zh: "德天" },
      },
      {
        id: "w2",
        kind: "image",
        src: asset("/destinations/catba.jpg"),
        label: { en: "Wild Fun · 2", zh: "够野 · 2" },
        caption: { en: "Cat Ba", zh: "吉婆岛" },
      },
      {
        id: "w3",
        kind: "image",
        src: asset("/destinations/sapa.jpg"),
        label: { en: "Wild Fun · 3", zh: "够野 · 3" },
        caption: { en: "Sapa / Fansipan", zh: "沙坝 / 番西邦" },
      },
    ],
  },
  {
    id: "flavors",
    en: "Great Flavors",
    zh: "地道风味・美食够味",
    wash: "#2a1c14",
    cover: asset("/destinations/hanoi.jpg"),
    materials: [
      {
        id: "f1",
        kind: "image",
        src: asset("/destinations/nanning.jpg"),
        label: { en: "Flavors · 1", zh: "够味 · 1" },
        caption: { en: "Nanning night", zh: "南宁夜市" },
      },
      {
        id: "f2",
        kind: "image",
        src: asset("/destinations/hanoi.jpg"),
        label: { en: "Flavors · 2", zh: "够味 · 2" },
        caption: { en: "Hanoi table", zh: "河内的桌" },
      },
      {
        id: "f3",
        kind: "image",
        src: asset("/destinations/mile.jpg"),
        label: { en: "Flavors · 3", zh: "够味 · 3" },
        caption: { en: "Mile dusk", zh: "弥勒黄昏" },
      },
    ],
  },
  {
    id: "villages",
    en: "Green Villages",
    zh: "村落生态・传统非遗",
    wash: "#1c2418",
    cover: asset("/destinations/sapa.jpg"),
    materials: [
      {
        id: "v1",
        kind: "image",
        src: asset("/destinations/sapa.jpg"),
        label: { en: "Villages · 1", zh: "村落 · 1" },
        caption: { en: "Cat Cat", zh: "猫猫村" },
      },
      {
        id: "v2",
        kind: "image",
        src: asset("/destinations/guantang.jpg"),
        label: { en: "Villages · 2", zh: "村落 · 2" },
        caption: { en: "Tianqin", zh: "天琴" },
      },
      {
        id: "v3",
        kind: "image",
        src: asset("/destinations/jianshui.jpg"),
        label: { en: "Villages · 3", zh: "村落 · 3" },
        caption: { en: "Jianshui", zh: "建水" },
      },
    ],
  },
  {
    id: "locals",
    en: "Friendly Locals",
    zh: "够朋友・当地人",
    wash: "#241810",
    cover: asset("/destinations/guantang.jpg"),
    materials: [
      {
        id: "l1",
        kind: "image",
        src: asset("/destinations/guantang.jpg"),
        label: { en: "Locals · 1", zh: "够朋友 · 1" },
        caption: { en: "Guide", zh: "地陪" },
      },
      {
        id: "l2",
        kind: "image",
        src: asset("/destinations/jianshui.jpg"),
        label: { en: "Locals · 2", zh: "够朋友 · 2" },
        caption: { en: "Craft", zh: "手作" },
      },
      {
        id: "l3",
        kind: "image",
        src: asset("/destinations/nanning.jpg"),
        label: { en: "Locals · 3", zh: "够朋友 · 3" },
        caption: { en: "Shared table", zh: "同桌" },
      },
    ],
  },
];
