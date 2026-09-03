import type { Tx } from "@/types";
import { globYaml, txList, txOf } from "@/content/helpers";
import { copy } from "@/i18n/copy";

export type AboutCred = Tx & { icon: string };

export type AboutContent = {
  kicker: Tx;
  name: Tx;
  role: Tx;
  body1: Tx;
  body2Lead: Tx;
  body2: Tx;
  points: Tx[];
  credsTitle: Tx;
  credsSub: Tx;
  creds: AboutCred[];
};

const files = import.meta.glob("../../content/about.yaml", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const fb = copy.about as unknown as AboutContent;
const aboutDoc = globYaml(files)[0];
const src = aboutDoc?.data;
const fileSrc = aboutDoc?.src ?? "zh";

function credsOf(value: unknown, fallback: AboutCred[], defaultSrc: string): AboutCred[] {
  if (!Array.isArray(value)) return fallback;
  const list = value
    .map((item, i) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const credFb = fallback[i] ?? fallback[0];
      return {
        icon: typeof o.icon === "string" && o.icon ? o.icon : credFb.icon,
        ...txOf(o, credFb, defaultSrc),
      };
    })
    .filter((item): item is AboutCred => Boolean(item));
  return list.length > 0 ? list : fallback;
}

export const about: AboutContent = src
  ? {
      kicker: txOf(src.kicker, fb.kicker, fileSrc),
      name: txOf(src.name, fb.name, fileSrc),
      role: txOf(src.role, fb.role, fileSrc),
      body1: txOf(src.body1, fb.body1, fileSrc),
      body2Lead: txOf(src.body2Lead, fb.body2Lead, fileSrc),
      body2: txOf(src.body2, fb.body2, fileSrc),
      points: txList(src.points, fb.points, fileSrc),
      credsTitle: txOf(src.credsTitle, fb.credsTitle, fileSrc),
      credsSub: txOf(src.credsSub, fb.credsSub, fileSrc),
      creds: credsOf(src.creds, fb.creds, fileSrc),
    }
  : fb;
