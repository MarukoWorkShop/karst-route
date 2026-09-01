import type { Tx } from "@/i18n/copy";

export type { Tx };
export type ThemeId = "wild" | "flavors" | "villages" | "locals";
export type RouteId = "r1" | "r2";
export type StayKind = "hotel" | "train" | "park" | "base";

export type Theme = {
  id: ThemeId;
  en: string;
  zh: string;
};

export type DayStop = {
  day: number;
  city: Tx;
  stay: Tx;
  stayKind: StayKind;
  placeId?: PlaceId;
  drive?: Tx;
  /** Longer place note shown with the gold rule when the day is open. */
  blurb?: Tx;
  photos?: string[];
  transport?: Tx;
  lodging?: Tx;
  dining?: Tx[];
  bullets: Tx[];
  themes: ThemeId[];
};

export type PlaceId =
  | "nanning"
  | "chongzuo"
  | "halong"
  | "catba"
  | "hanoi"
  | "sapa"
  | "train"
  | "jianshui"
  | "puzhehei"
  | "mile"
  | "kunming"
  | "guantang";
