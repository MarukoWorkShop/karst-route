import type { Tx } from "@/types";
import { globYaml, strOf, txList, txOf } from "@/content/helpers";

export type AboutCred = Tx & { icon: string };

export type AboutContent = {
  /** 管家显示名，如 Summer / 夏夏 */
  conciergeName: Tx;
  /** public 下的相对路径，如 concierge/xiaxia.jpg */
  conciergeAvatar: string;
  /** 定制页问候语 */
  conciergeLead: Tx;
  /** 页脚核心标语 */
  brandSlogan: Tx;
  /** 浏览器标题 */
  siteTitle: Tx;
  /** 询单表单 Key。空则回退到构建环境变量 VITE_WEB3FORMS_ACCESS_KEY */
  web3formsAccessKey: string;
  /** 精品路线栏目导语 */
  toursIntro: Tx;
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

const blank: Tx = { en: "", zh: "" };

const files = import.meta.glob("../../content/about.yaml", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const aboutDoc = globYaml(files)[0];
const src = aboutDoc?.data;
const fileSrc = aboutDoc?.src ?? "zh";

function credsOf(value: unknown, defaultSrc: string): AboutCred[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const tx = txOf(o, blank, defaultSrc);
      if (!tx.en.trim() && !tx.zh.trim()) return null;
      return {
        icon: typeof o.icon === "string" ? o.icon : "",
        ...tx,
      };
    })
    .filter((item): item is AboutCred => Boolean(item));
}

export const about: AboutContent = {
  conciergeName: txOf(src?.conciergeName, blank, fileSrc),
  conciergeAvatar: strOf(src?.conciergeAvatar, "concierge/xiaxia.jpg"),
  conciergeLead: txOf(src?.conciergeLead, blank, fileSrc),
  brandSlogan: txOf(src?.brandSlogan, blank, fileSrc),
  siteTitle: txOf(src?.siteTitle, blank, fileSrc),
  web3formsAccessKey: strOf(src?.web3formsAccessKey),
  toursIntro: txOf(src?.toursIntro, blank, fileSrc),
  kicker: txOf(src?.kicker, blank, fileSrc),
  name: txOf(src?.name, blank, fileSrc),
  role: txOf(src?.role, blank, fileSrc),
  body1: txOf(src?.body1, blank, fileSrc),
  body2Lead: txOf(src?.body2Lead, blank, fileSrc),
  body2: txOf(src?.body2, blank, fileSrc),
  points: txList(src?.points, [], fileSrc),
  credsTitle: txOf(src?.credsTitle, blank, fileSrc),
  credsSub: txOf(src?.credsSub, blank, fileSrc),
  creds: credsOf(src?.creds, fileSrc),
};

/**
 * 工具箱、安装提示这类短句用的品牌名。
 * 英文法定名称里若带 International，只留前面的短名，避免一行塞进整段公司名。
 */
export function shortBrand(name: Tx = about.name): Tx {
  const en = name.en.replace(/\s+International\b[\s\S]*$/i, "").trim() || name.en;
  return { src: name.src, en, zh: name.zh };
}

/** 把文案里的 {brand} 换成当前客户名称（中英文各用各的）。 */
export function fillBrand(template: Tx, name: Tx = shortBrand()): Tx {
  return {
    src: template.src,
    en: template.en.replaceAll("{brand}", name.en),
    zh: template.zh.replaceAll("{brand}", name.zh),
  };
}
