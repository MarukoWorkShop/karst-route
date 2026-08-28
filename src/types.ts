import type { Tx } from "@/i18n/copy";

export type { Tx };
export type ThemeId = "wild" | "flavors" | "villages" | "locals";
export type RouteId = "r1" | "r2";
export type StayKind = "hotel" | "train" | "park" | "base";

export type ThemeMaterial = {
  id: string;
  kind: "image" | "video";
  src?: string;
  caption: Tx;
  label: Tx;
};

export type Theme = {
  id: ThemeId;
  en: string;
  zh: string;
  wash: string;
  materials: ThemeMaterial[];
};

export type DayStop = {
  day: number;
  city: Tx;
  stay: Tx;
  stayKind: StayKind;
  placeId?: PlaceId;
  drive?: string;
  bullets: Tx[];
  themes: ThemeId[];
};

export type PlaceId =
  | "nanning"
  | "chongzuo"
  | "catba"
  | "hanoi"
  | "sapa"
  | "train"
  | "jianshui"
  | "puzhehei"
  | "mile"
  | "kunming"
  | "guantang";
