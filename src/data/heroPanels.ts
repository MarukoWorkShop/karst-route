import type { ThemeId, Tx } from "@/types";
import { asset } from "@/lib/asset";

const L = (en: string, zh: string): Tx => ({ en, zh });

/**
 * 测试期开关：设 VITE_HERO_VIDEO_OFF=1 时停掉首页视频与 BGM，只显示 poster 静图，
 * 避免 COS 流量扣费。恢复播放时移除该环境变量即可，无需改动代码。
 * （无视频时 Hero 会自动走 POSTER_HOLD_MS 定时轮播 poster。）
 */
const videoOff = import.meta.env.VITE_HERO_VIDEO_OFF === "1";

/** COS / CDN root. Empty until VITE_HERO_MEDIA_BASE is set — posters still show. */
export function heroMedia(file: string): string {
  if (/^https?:\/\//i.test(file)) return file;
  const base = import.meta.env.VITE_HERO_MEDIA_BASE?.replace(/\/$/, "") ?? "";
  if (!base) return "";
  return `${base}/${file.replace(/^\//, "")}`;
}

export const heroBgm = videoOff ? "" : heroMedia("hero/bgm.mp3");

const COS = "https://youxian-travel-1412422924.cos.ap-guangzhou.myqcloud.com";
const cosUrl = (file: string) =>
  videoOff ? "" : `${import.meta.env.DEV ? "/hero-media" : COS}/${file.replace(/^\//, "")}`;

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

export const heroSlides: HeroSlide[] = [
  {
    id: "wild",
    video: cosUrl("videos/1.mp4"),
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
    video: cosUrl("videos/2-hero.mp4"),
    poster: asset("/destinations/hero-shot-2.jpg"),
    pos: "center 55%",
    alt: L("A bamboo raft drifting down the Li River", "竹筏顺漓江而下"),
    // 素材实为漓江竹筏（原 2.MOV），归 wild 纵情山野，而非 flavors 地道风味
    themeId: "wild",
    title: L("Drifting the Li River", "漓江竹筏"),
    intro: L(
      "A raft slips downstream between karst peaks — you don't have to find the way, the river already knows it.",
      "竹筏顺流而下，两岸峰丛替你指路。不用找路，水知道该怎么走。",
    ),
  },
  {
    id: "wild-air",
    video: cosUrl("videos/3.mp4"),
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
    video: cosUrl("videos/4.mp4"),
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
