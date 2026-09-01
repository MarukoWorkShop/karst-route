import type { ThemeId, Tx } from "@/types";
import { asset } from "@/lib/asset";

const L = (en: string, zh: string): Tx => ({ en, zh });

/** COS / CDN root. Empty until VITE_HERO_MEDIA_BASE is set — posters still show. */
export function heroMedia(file: string): string {
  if (/^https?:\/\//i.test(file)) return file;
  const base = import.meta.env.VITE_HERO_MEDIA_BASE?.replace(/\/$/, "") ?? "";
  if (!base) return "";
  return `${base}/${file.replace(/^\//, "")}`;
}

export const heroBgm = heroMedia("hero/bgm.mp3");

const COS = "https://youxian-travel-1412422924.cos.ap-guangzhou.myqcloud.com";
const cosUrl = (file: string) =>
  `${import.meta.env.DEV ? "/hero-media" : COS}/${file.replace(/^\//, "")}`;

/** Full-bleed video slide. Poster holds the first paint; video URL comes from COS. */
export type HeroSlide = {
  id: ThemeId;
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
    id: "flavors",
    video: cosUrl("videos/2.mp4"),
    poster: asset("/destinations/hanoi.jpg"),
    pos: "center 55%",
    alt: L("Morning market and city streets", "早市与城市街巷"),
    themeId: "flavors",
    title: L("Explore the morning market", "走进南方早市"),
    intro: L(
      "Heritage travellers discover a living city through the sights, smells and stories of the market — not a museum corridor.",
      "在还在运转的早市里认一座城：声音、气味、摊主的一句话，比展柜更像故乡。",
    ),
  },
];
