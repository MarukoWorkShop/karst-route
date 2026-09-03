import type { ThemeId } from "@/types";
import type { HeroSlide } from "@/data/heroPanels";
import { asset } from "@/lib/asset";
import { globYaml, strOf, txOf } from "@/content/helpers";

const files = import.meta.glob("../../content/hero.yaml", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const THEMES: ThemeId[] = ["wild", "flavors", "villages", "locals"];
const COS = "https://youxian-travel-1412422924.cos.ap-guangzhou.myqcloud.com";
const videoOff = import.meta.env?.VITE_HERO_VIDEO_OFF === "1";

function videoUrl(file: string) {
  if (!file || videoOff) return "";
  if (/^https?:\/\//i.test(file)) return file;
  const path = file.replace(/^\//, "");
  return `${import.meta.env?.DEV ? "/hero-media" : COS}/${path}`;
}

export function overlayHeroSlides(fallback: HeroSlide[]): HeroSlide[] {
  const doc = globYaml(files)[0];
  const src = doc?.data;
  const fileSrc = doc?.src ?? "zh";
  const slides = src && Array.isArray(src.slides) ? src.slides : null;
  if (!slides || slides.length === 0) return fallback;

  return slides.map((item, i) => {
    const rec = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
    const fb = fallback[i] ?? fallback[0];
    const themeId = THEMES.includes(rec.themeId as ThemeId) ? (rec.themeId as ThemeId) : fb.themeId;
    const poster = strOf(rec.poster, "");
    return {
      id: strOf(rec.id, fb.id),
      video: videoUrl(strOf(rec.video, "")),
      poster: poster ? asset(`/${poster.replace(/^\//, "")}`) : fb.poster,
      pos: strOf(rec.pos, fb.pos),
      alt: txOf(rec.alt, fb.alt, fileSrc),
      themeId,
      title: txOf(rec.title, fb.title, fileSrc),
      intro: txOf(rec.intro, fb.intro, fileSrc),
    };
  });
}
