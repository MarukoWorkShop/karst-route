import { parse } from "yaml";
import type { Tx } from "@/types";
import { asset } from "@/lib/asset";

/**
 * 管家联系方式（content/concierge.yaml）。
 * 只在「询单发送失败」时展示，作为兜底通道，避免客人线索丢失。
 * 文件缺失或字段留空 → 对应通道不显示。
 */
export type ConciergeContact = {
  wechatId: string;
  /** 二维码图片 URL（public/ 下相对路径 → asset 解析），留空则不显示 */
  wechatQr: string;
  /** 国家码+号码，不含 + 与空格 */
  whatsapp: string;
  email: string;
  note: Tx;
};

const EMPTY: ConciergeContact = {
  wechatId: "",
  wechatQr: "",
  whatsapp: "",
  email: "",
  note: { en: "", zh: "" },
};

const files = import.meta.glob("../../content/concierge.yaml", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function build(): ConciergeContact {
  try {
    const raw = Object.values(files)[0] ?? "";
    if (!raw) return EMPTY;
    const doc = (parse(raw) ?? {}) as Record<string, unknown>;
    const qr = str(doc.wechatQr);
    const noteRaw = doc.note as { en?: string; zh?: string } | undefined;
    return {
      wechatId: str(doc.wechatId),
      wechatQr: qr ? asset(`/${qr.replace(/^\//, "")}`) : "",
      whatsapp: str(doc.whatsapp),
      email: str(doc.email),
      note: {
        en: typeof noteRaw?.en === "string" ? noteRaw.en : "",
        zh: typeof noteRaw?.zh === "string" ? noteRaw.zh : "",
      },
    };
  } catch (err) {
    console.warn("[content] content/concierge.yaml 解析失败，已用空联系方式", err);
    return EMPTY;
  }
}

export const conciergeContact: ConciergeContact = build();

/** 是否配置了任一兜底通道 */
export function hasFallbackChannel(c: ConciergeContact = conciergeContact): boolean {
  return Boolean(c.wechatId || c.wechatQr || c.whatsapp || c.email);
}
