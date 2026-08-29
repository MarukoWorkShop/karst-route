import type { Tx } from "@/types";
import { asset } from "@/lib/asset";

export const destinationVideos: {
  id: string;
  src: string;
  duration: string;
  location: Tx;
  title: Tx;
  desc: Tx;
}[] = [
  {
    id: "explore-culture",
    src: asset("/destinations/chongzuo.jpg"),
    duration: "4:32",
    location: { en: "Guangxi · Guilin", zh: "广西 · 桂林" },
    title: { en: "Li River Guilin — 4K Aerial", zh: "桂林漓江 — 4K 航拍" },
    desc: {
      en: "The karst peaks lining the Li River — the face of this land that the world knows best.",
      zh: "漓江沿岸的喀斯特峰林，是这片土地最被世界熟知的面孔。",
    },
  },
  {
    id: "explore-halong",
    src: asset("/destinations/catba.jpg"),
    duration: "6:18",
    location: { en: "Vietnam · Quảng Ninh", zh: "越南 · 广宁省" },
    title: { en: "Ha Long Bay — Dawn on Emerald Waters", zh: "下龙湾 — 翡翠海湾的清晨" },
    desc: {
      en: "Over 1,600 limestone islands emerge through morning mist — Vietnam's most iconic natural wonder.",
      zh: "1600余座石灰岩岛屿，在晨雾中浮现，这是越南最标志性的自然奇观。",
    },
  },
  {
    id: "explore-voices",
    src: asset("/destinations/sapa.jpg"),
    duration: "5:04",
    location: { en: "Vietnam · Sapa", zh: "越南 · 沙坝" },
    title: { en: "Sapa Terraces — Highland World of the H'mong", zh: "沙坝梯田 — 苗族与壮族的山地世界" },
    desc: {
      en: "Terraces that change color with the rice season at 1,500m — Cat Cat and Dragon's Backbone each tell their own story.",
      zh: "海拔1500米的梯田随稻季变色，猫猫村与龙脊梯田各有故事。",
    },
  },
  {
    id: "explore-guide",
    src: asset("/destinations/jianshui.jpg"),
    duration: "7:41",
    location: { en: "China · Yunnan", zh: "中国 · 云南" },
    title: { en: "Yunnan — Cultural Secrets South of the Plateau", zh: "云南 — 高原之南的人文秘境" },
    desc: {
      en: "Jianshui, Mile's wineries, Yuanyang terraces — Yunnan has never been just a nature province.",
      zh: "建水古城、弥勒酒庄、元阳梯田——云南从不只是一个「自然省」。",
    },
  },
  {
    id: "explore-ninhbinh",
    src: asset("/destinations/puzhehei.jpg"),
    duration: "3:55",
    location: { en: "Vietnam · Ninh Bình", zh: "越南 · 宁平" },
    title: { en: "Ninh Bình — Bamboo Boats Through the Inland Bay", zh: "宁平 — 陆上下龙湾的竹筏时光" },
    desc: {
      en: "Limestone peaks reflected in still water, seen from a bamboo boat — \"Ha Long Bay on land\" is exactly right.",
      zh: "从竹筏望出去，石灰岩山体倒影在水中——这里被称为「旱地下龙湾」，理所当然。",
    },
  },
  {
    id: "explore-hanoi",
    src: asset("/destinations/hanoi.jpg"),
    duration: "8:20",
    location: { en: "Vietnam · Hanoi", zh: "越南 · 河内" },
    title: { en: "Hanoi Old Quarter — A City's Slow Hours", zh: "河内老街区 — 一座城市的慢时光" },
    desc: {
      en: "Colonial facades, sidewalk coffee, the motorcycle tide at every corner — Hanoi's energy comes from its rhythm.",
      zh: "殖民地建筑、路边咖啡、街角的摩托洪流——河内的能量来自于它的节奏感。",
    },
  },
];
