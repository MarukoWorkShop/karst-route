import type { ThemeId, Tx } from "@/types";
import { asset } from "@/lib/asset";
import { overlayHeroSlides } from "@/content/hero";
import { heroVideoUrl } from "@/lib/media";

const L = (en: string, zh: string): Tx => ({ en, zh });

/** Full-bleed video slide. Poster holds the first paint; video URL comes from COS. */
export type HeroSlide = {
  id: string;
  video: string;
  poster: string;
  pos: string;
  alt: Tx;
  themeId: ThemeId;
  title: Tx;
  intro: Tx;
};

const fallbackSlides: HeroSlide[] = [
  {
    id: "wild",
    video: heroVideoUrl("videos/1.mp4"),
    poster: asset("/destinations/chongzuo-mijing.jpg"),
    pos: "center 42%",
    alt: L("Karst peaks in mist", "云雾中的喀斯特峰丛"),
    themeId: "wild",
    title: L("Chongzuo's Hidden Realm", "崇左秘境"),
    intro: L(
      "Peaks half-lost in cloud; a river with no guidebook name. Raft the bank — Chongzuo as a hidden valley, not a viewpoint.",
      "峰丛藏进云里，江水绿得还没被写进路书。竹筏贴岸走，秘境才刚刚开始。",
    ),
  },
  {
    id: "wild-raft",
    // 首页轮播只播前 10 秒(CLIP_MAX_S)，用 12 秒精简版(9.3M)代替完整版(90.5M)，避免首页加载过慢
    video: heroVideoUrl("videos/2-hero.mp4"),
    poster: asset("/destinations/hero-shot-2.jpg"),
    pos: "center 55%",
    alt: L("A bamboo raft drifting down the Li River", "竹筏顺漓江而下"),
    themeId: "wild",
    title: L("Drifting the Li River", "漓江竹筏"),
    intro: L(
      "A raft slips downstream between karst peaks — you don't have to find the way, the river already knows it.",
      "竹筏顺流而下，两岸峰丛替你指路。不用找路，水知道该怎么走。",
    ),
  },
  {
    id: "wild-air",
    video: heroVideoUrl("videos/3.mp4"),
    poster: asset("/destinations/hero-shot-3.jpg"),
    pos: "center 50%",
    alt: L("Aerial view of karst peaks", "航拍喀斯特峰丛"),
    themeId: "wild",
    title: L("Above the Karst", "峰丛之上"),
    intro: L(
      "The drone climbs and the range opens up — fold after fold of green, and no road in sight.",
      "无人机拉高，山一层层展开：满眼是绿，看不见路。",
    ),
  },
  {
    id: "villages-living",
    video: heroVideoUrl("videos/4.mp4"),
    poster: asset("/destinations/hero-shot-4.jpg"),
    pos: "center 50%",
    alt: L("A village tucked among the hills", "山间的村落"),
    themeId: "villages",
    title: L("The Living Village", "村子还醒着"),
    intro: L(
      "Stone lanes, timber houses and kitchen smoke — the village still keeps its own hours.",
      "石头路、木楼、灶间的烟火。村子还按自己的时辰过日子。",
    ),
  },
];

export const heroSlides = overlayHeroSlides(fallbackSlides);
